from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict
from app.models.ticket import TicketPriority, TicketStatus, TicketCategory
from app.schemas.user import UserRead
from app.schemas.audit_log import AuditLogRead


class TicketBase(BaseModel):
    title: str
    description: str


class TicketCreate(TicketBase):
    priority: Optional[TicketPriority] = None
    category: Optional[TicketCategory] = None
    created_by_id: int
    assigned_to_id: Optional[int] = None
    auto_triage: bool = True


class TicketUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[TicketPriority] = None
    status: Optional[TicketStatus] = None
    category: Optional[TicketCategory] = None
    assigned_to_id: Optional[int] = None


class TicketStatusUpdate(BaseModel):
    status: TicketStatus
    notes: Optional[str] = None
    actor_id: Optional[int] = None


class TicketRead(TicketBase):
    id: int
    priority: TicketPriority
    status: TicketStatus
    category: TicketCategory
    created_by_id: int
    assigned_to_id: Optional[int]
    sla_deadline: datetime
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TicketDetailRead(TicketRead):
    created_by: Optional[UserRead] = None
    assigned_to: Optional[UserRead] = None
    audit_logs: List[AuditLogRead] = []

    model_config = ConfigDict(from_attributes=True)


class TicketPaginationResponse(BaseModel):
    total: int
    skip: int
    limit: int
    items: List[TicketRead]
