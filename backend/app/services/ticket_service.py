from datetime import datetime, timedelta, timezone
from typing import Optional, List, Tuple
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import select, func, desc
from fastapi import HTTPException, status

from app.models.ticket import Ticket, TicketPriority, TicketStatus, TicketCategory
from app.models.audit_log import AuditLog, ActorType
from app.models.user import User
from app.schemas.ticket import TicketCreate, TicketStatusUpdate, TicketUpdate
from app.services.triage_service import SmartTriageService

SLA_MAPPING_HOURS = {
    TicketPriority.P1_CRITICAL: 2,
    TicketPriority.P2_HIGH: 8,
    TicketPriority.P3_MEDIUM: 24,
    TicketPriority.P4_LOW: 48,
}


def compute_sla_deadline(priority: TicketPriority, start_time: Optional[datetime] = None) -> datetime:
    """Calculate SLA deadline based on ticket priority."""
    if start_time is None:
        start_time = datetime.now(timezone.utc)
    hours = SLA_MAPPING_HOURS.get(priority, 48)
    return start_time + timedelta(hours=hours)


class TicketService:
    @staticmethod
    def create_ticket(db: Session, ticket_in: TicketCreate) -> Ticket:
        """Create a new incident ticket with Smart Triage, auto-calculated SLA, and initial audit log."""
        # Verify creator exists
        creator = db.get(User, ticket_in.created_by_id)
        if not creator:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"User with id {ticket_in.created_by_id} does not exist.",
            )

        # Verify assignee if provided
        if ticket_in.assigned_to_id:
            assignee = db.get(User, ticket_in.assigned_to_id)
            if not assignee:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Assignee user with id {ticket_in.assigned_to_id} does not exist.",
                )

        # Apply Smart Triage if fields are missing or auto_triage is requested
        triage_info = None
        priority = ticket_in.priority
        category = ticket_in.category

        if priority is None or category is None or ticket_in.auto_triage:
            triage_info = SmartTriageService.classify_incident(ticket_in.title, ticket_in.description)
            if priority is None:
                priority = triage_info["suggested_priority"]
            if category is None:
                category = triage_info["suggested_category"]

        now = datetime.now(timezone.utc)
        sla_deadline = compute_sla_deadline(priority, now)

        db_ticket = Ticket(
            title=ticket_in.title,
            description=ticket_in.description,
            priority=priority,
            status=TicketStatus.OPEN,
            category=category,
            created_by_id=ticket_in.created_by_id,
            assigned_to_id=ticket_in.assigned_to_id,
            sla_deadline=sla_deadline,
        )
        db.add(db_ticket)
        db.commit()
        db.refresh(db_ticket)

        # Initial Audit Log Entry with Smart Triage details
        audit_details = {
            "title": db_ticket.title,
            "priority": db_ticket.priority.value,
            "category": db_ticket.category.value,
            "status": db_ticket.status.value,
            "sla_deadline": db_ticket.sla_deadline.isoformat(),
        }
        if triage_info:
            audit_details["smart_triage"] = {
                "confidence_score": triage_info["confidence_score"],
                "detected_keywords": triage_info["detected_keywords"],
            }

        audit = AuditLog(
            ticket_id=db_ticket.id,
            action="CREATED",
            actor_type=ActorType.USER,
            actor_id=ticket_in.created_by_id,
            details=audit_details,
        )
        db.add(audit)
        db.commit()
        db.refresh(db_ticket)

        return db_ticket

    @staticmethod
    def list_tickets(
        db: Session,
        status_filter: Optional[TicketStatus] = None,
        priority_filter: Optional[TicketPriority] = None,
        category_filter: Optional[TicketCategory] = None,
        created_by_id: Optional[int] = None,
        assigned_to_id: Optional[int] = None,
        skip: int = 0,
        limit: int = 20,
    ) -> Tuple[int, List[Ticket]]:
        """List tickets with optional multi-filtering and pagination."""
        query = select(Ticket)

        if status_filter:
            query = query.where(Ticket.status == status_filter)
        if priority_filter:
            query = query.where(Ticket.priority == priority_filter)
        if category_filter:
            query = query.where(Ticket.category == category_filter)
        if created_by_id:
            query = query.where(Ticket.created_by_id == created_by_id)
        if assigned_to_id:
            query = query.where(Ticket.assigned_to_id == assigned_to_id)

        count_stmt = select(func.count()).select_from(query.subquery())
        total = db.scalar(count_stmt) or 0

        query = query.order_by(desc(Ticket.created_at)).offset(skip).limit(limit)
        items = db.scalars(query).all()

        return total, list(items)

    @staticmethod
    def get_ticket_by_id(db: Session, ticket_id: int) -> Ticket:
        """Fetch ticket by ID with complete relationship loading."""
        stmt = (
            select(Ticket)
            .options(
                joinedload(Ticket.created_by),
                joinedload(Ticket.assigned_to),
                joinedload(Ticket.audit_logs),
            )
            .where(Ticket.id == ticket_id)
        )
        ticket = db.scalars(stmt).unique().first()
        if not ticket:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Ticket with ID {ticket_id} not found.",
            )
        return ticket

    @staticmethod
    def update_ticket_status(
        db: Session,
        ticket_id: int,
        status_update: TicketStatusUpdate,
    ) -> Ticket:
        """Update ticket status and append an audit log entry."""
        ticket = TicketService.get_ticket_by_id(db, ticket_id)

        old_status = ticket.status
        new_status = status_update.status

        if old_status == new_status:
            return ticket

        ticket.status = new_status
        db.add(ticket)

        actor_id = status_update.actor_id or ticket.created_by_id
        actor_type = ActorType.USER if actor_id else ActorType.SYSTEM_BOT

        audit = AuditLog(
            ticket_id=ticket.id,
            action="STATUS_UPDATED",
            actor_type=actor_type,
            actor_id=actor_id,
            details={
                "previous_status": old_status.value,
                "new_status": new_status.value,
                "notes": status_update.notes,
            },
        )
        db.add(audit)
        db.commit()
        db.refresh(ticket)

        return ticket
