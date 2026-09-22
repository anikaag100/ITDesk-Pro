from enum import Enum as PyEnum
from datetime import datetime
from typing import List, TYPE_CHECKING
from sqlalchemy import String, Boolean, DateTime, Enum, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base

if TYPE_CHECKING:
    from app.models.ticket import Ticket


class UserRole(str, PyEnum):
    EMPLOYEE = "EMPLOYEE"
    IT_SUPPORT = "IT_SUPPORT"
    ADMIN = "ADMIN"


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, index=True, autoincrement=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[UserRole] = mapped_column(Enum(UserRole, native_enum=False), default=UserRole.EMPLOYEE, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    created_tickets: Mapped[List["Ticket"]] = relationship(
        "Ticket", back_populates="created_by", foreign_keys="Ticket.created_by_id"
    )
    assigned_tickets: Mapped[List["Ticket"]] = relationship(
        "Ticket", back_populates="assigned_to", foreign_keys="Ticket.assigned_to_id"
    )
