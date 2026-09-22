from typing import List, Optional
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.remediation import RemediationRequest, RemediationResponse, RunbookInfo
from app.services.remediation_service import AutoRemediationService

router = APIRouter()


@router.get("/runbooks", response_model=List[RunbookInfo], summary="List registered automated runbooks")
def list_runbooks():
    """Retrieve all registered self-healing automated remediation runbooks."""
    return AutoRemediationService.get_registered_runbooks()


@router.post("/remediate/{ticket_id}", response_model=RemediationResponse, summary="Execute automated remediation")
def execute_remediation(
    ticket_id: int,
    request: Optional[RemediationRequest] = None,
    db: Session = Depends(get_db),
):
    """
    Trigger automated self-healing remediation for a specific ticket.
    - If `runbook_id` is specified, executes that runbook.
    - Otherwise, automatically selects the best runbook based on ticket category and keywords.
    - Updates ticket status to **RESOLVED** on success.
    - Records an audit log with `actor_type="SYSTEM_BOT"`.
    """
    runbook_id = request.runbook_id if request else None
    return AutoRemediationService.execute_remediation(db=db, ticket_id=ticket_id, runbook_id=runbook_id)
