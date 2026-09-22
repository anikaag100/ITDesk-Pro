from fastapi import APIRouter
from app.api.v1.endpoints import health, auth, tickets, remediation

api_router = APIRouter()

api_router.include_router(health.router, tags=["Health Checks"])
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication & Users"])
api_router.include_router(tickets.router, prefix="/tickets", tags=["Incident Tickets"])
api_router.include_router(remediation.router, prefix="/remediation", tags=["Auto-Remediation Runbooks"])
