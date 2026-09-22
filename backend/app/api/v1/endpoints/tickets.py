from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.ticket import TicketPriority, TicketStatus, TicketCategory
from app.schemas.ticket import (
    TicketCreate,
    TicketRead,
    TicketDetailRead,
    TicketStatusUpdate,
    TicketPaginationResponse,
)
from app.schemas.remediation import RemediationRequest, RemediationResponse
from app.services.ticket_service import TicketService
from app.services.remediation_service import AutoRemediationService

router = APIRouter()


@router.post(
    "/",
    response_model=TicketRead,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new IT incident ticket with Smart Triage",
)
def create_ticket(
    ticket_in: TicketCreate,
    db: Session = Depends(get_db),
):
    """
    Create a new incident ticket.
    - Features **Smart Triage**: Automatically determines priority and category if omitted or auto_triage is True.
    - Default status: **OPEN**
    - SLA deadline auto-computed based on priority:
      - **P1_CRITICAL**: 2 hours
      - **P2_HIGH**: 8 hours
      - **P3_MEDIUM**: 24 hours
      - **P4_LOW**: 48 hours
    - Writes an initial AuditLog entry upon creation.
    """
    return TicketService.create_ticket(db=db, ticket_in=ticket_in)


@router.get(
    "/",
    response_model=TicketPaginationResponse,
    summary="List tickets with filtering and pagination",
)
def list_tickets(
    status_filter: Optional[TicketStatus] = Query(None, alias="status", description="Filter by status"),
    priority_filter: Optional[TicketPriority] = Query(None, alias="priority", description="Filter by priority"),
    category_filter: Optional[TicketCategory] = Query(None, alias="category", description="Filter by category"),
    created_by_id: Optional[int] = Query(None, description="Filter by creator user ID"),
    assigned_to_id: Optional[int] = Query(None, description="Filter by assignee user ID"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=100, description="Max records to return"),
    db: Session = Depends(get_db),
):
    """List incident tickets with optional multi-attribute filters and pagination."""
    total, items = TicketService.list_tickets(
        db=db,
        status_filter=status_filter,
        priority_filter=priority_filter,
        category_filter=category_filter,
        created_by_id=created_by_id,
        assigned_to_id=assigned_to_id,
        skip=skip,
        limit=limit,
    )
    return TicketPaginationResponse(
        total=total,
        skip=skip,
        limit=limit,
        items=items,
    )


@router.get(
    "/{ticket_id}",
    response_model=TicketDetailRead,
    summary="Fetch ticket details with full audit log history",
)
def get_ticket(
    ticket_id: int,
    db: Session = Depends(get_db),
):
    """Retrieve detailed information for a specific ticket, including user details and complete audit logs."""
    return TicketService.get_ticket_by_id(db=db, ticket_id=ticket_id)


@router.patch(
    "/{ticket_id}/status",
    response_model=TicketDetailRead,
    summary="Update ticket status and append audit record",
)
def update_ticket_status(
    ticket_id: int,
    status_update: TicketStatusUpdate,
    db: Session = Depends(get_db),
):
    """Update ticket status (e.g. to IN_PROGRESS, RESOLVED, CLOSED) and append an audit log entry."""
    return TicketService.update_ticket_status(db=db, ticket_id=ticket_id, status_update=status_update)


@router.post(
    "/{ticket_id}/remediate",
    response_model=RemediationResponse,
    summary="Trigger auto-remediation runbook on ticket",
)
def trigger_ticket_remediation(
    ticket_id: int,
    request: Optional[RemediationRequest] = None,
    db: Session = Depends(get_db),
):
    """Trigger automated self-healing remediation runbook for the ticket."""
    runbook_id = request.runbook_id if request else None
    return AutoRemediationService.execute_remediation(db=db, ticket_id=ticket_id, runbook_id=runbook_id)
