from typing import Optional, List
from pydantic import BaseModel


class RemediationRequest(BaseModel):
    runbook_id: Optional[str] = None


class RemediationResponse(BaseModel):
    ticket_id: int
    new_status: str
    runbook_executed: str
    execution_status: str
    execution_time_ms: float
    summary: str
    logs: List[str]


class RunbookInfo(BaseModel):
    id: str
    name: str
    description: str
    target_category: str
    keywords: List[str]
