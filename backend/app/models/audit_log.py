from enum import Enum as PyEnum
from datetime import datetime
from typing import Optional, Any, TYPE_CHECKING
from sqlalchemy import String, DateTime, Enum, ForeignKey, JSON, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base

if TYPE_CHECKING:
    from app.models.ticket import Ticket


class ActorType(str, PyEnum):
    SYSTEM_BOT = "SYSTEM_BOT"
    USER = "USER"


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id: Mapped[int] = mapped_column(primary_key=True, index=True, autoincrement=True)
    ticket_id: Mapped[int] = mapped_column(
        ForeignKey("tickets.id", ondelete="CASCADE"), nullable=False, index=True
    )
    action: Mapped[str] = mapped_column(String(100), nullable=False)
    actor_type: Mapped[ActorType] = mapped_column(
        Enum(ActorType, native_enum=False), nullable=False
    )
    actor_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    details: Mapped[Optional[Any]] = mapped_column(JSON, nullable=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    ticket: Mapped["Ticket"] = relationship("Ticket", back_populates="audit_logs")
