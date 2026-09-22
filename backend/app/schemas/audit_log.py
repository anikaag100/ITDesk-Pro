from datetime import datetime
from typing import Optional, Any
from pydantic import BaseModel, ConfigDict
from app.models.audit_log import ActorType


class AuditLogBase(BaseModel):
    action: str
    actor_type: ActorType
    actor_id: Optional[int] = None
    details: Optional[Any] = None


class AuditLogCreate(AuditLogBase):
    ticket_id: int


class AuditLogRead(AuditLogBase):
    id: int
    ticket_id: int
    timestamp: datetime

    model_config = ConfigDict(from_attributes=True)
