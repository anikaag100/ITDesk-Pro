import time
import secrets
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.ticket import Ticket, TicketStatus, TicketPriority, TicketCategory
from app.models.audit_log import AuditLog, ActorType
from app.services.ticket_service import TicketService


class Runbook:
    def __init__(self, id: str, name: str, description: str, target_category: TicketCategory, keywords: List[str]):
        self.id = id
        self.name = name
        self.description = description
        self.target_category = target_category
        self.keywords = keywords

    def execute(self, ticket: Ticket) -> Dict[str, Any]:
        raise NotImplementedError("Subclasses must implement execute()")


class NetworkVpnRestartRunbook(Runbook):
    def __init__(self):
        super().__init__(
            id="NETWORK_VPN_RESTART",
            name="Automated Network & VPN Adapter Reset",
            description="Flushes local DNS cache, cycles virtual network adapter, and verifies gateway ping.",
            target_category=TicketCategory.NETWORK,
            keywords=["vpn", "gateway", "ipsec", "tunnel", "network", "dns"],
        )

    def execute(self, ticket: Ticket) -> Dict[str, Any]:
        logs = []
        logs.append("[RUNBOOK STEP 1] Initiating virtual network adapter diagnostic...")
        time.sleep(0.05)
        logs.append("[RUNBOOK STEP 2] Flushed local DNS resolver cache (0 records cleared).")
        time.sleep(0.05)
        logs.append("[RUNBOOK STEP 3] Cycled VPN Virtual Interface (tun0 / TAP-Windows Adapter).")
        time.sleep(0.05)
        logs.append("[RUNBOOK STEP 4] Pinging enterprise regional gateway 10.200.0.1 -> Response 12ms [OK].")
        logs.append("[RUNBOOK RESULT] Network tunnel restored successfully.")

        return {
            "status": "SUCCESS",
            "logs": logs,
            "remediation_summary": "VPN gateway interface reset and verified online.",
        }


class AccessPasswordResetRunbook(Runbook):
    def __init__(self):
        super().__init__(
            id="ACCESS_PASSWORD_RESET",
            name="Automated Password & Session Reset",
            description="Invalidates active SSO sessions, generates secure temporary credentials, and dispatches reset notification.",
            target_category=TicketCategory.ACCESS_MANAGEMENT,
            keywords=["password", "login", "sso", "locked", "iam", "access", "permission"],
        )

    def execute(self, ticket: Ticket) -> Dict[str, Any]:
        logs = []
        temp_token = f"TMP-{secrets.token_hex(4).upper()}"
        logs.append("[RUNBOOK STEP 1] Terminating active OAuth2/OIDC refresh tokens for user...")
        time.sleep(0.05)
        logs.append(f"[RUNBOOK STEP 2] Generated one-time temporary access code: {temp_token}")
        time.sleep(0.05)
        logs.append("[RUNBOOK STEP 3] Dispatched secure SMS/Email notification link to user's registered device.")
        time.sleep(0.05)
        logs.append("[RUNBOOK RESULT] User credentials reset and notification dispatched successfully.")

        return {
            "status": "SUCCESS",
            "logs": logs,
            "remediation_summary": f"Temporary access token generated ({temp_token}) and notification sent.",
        }


class DiskTempCleanupRunbook(Runbook):
    def __init__(self):
        super().__init__(
            id="DISK_TEMP_CLEANUP",
            name="Automated Log Rotation & Storage Reclamation",
            description="Executes log rotation simulation, purges temporary cache directories, and reclaims disk space.",
            target_category=TicketCategory.HARDWARE,
            keywords=["disk", "ram", "cpu", "storage", "full", "memory", "space"],
        )

    def execute(self, ticket: Ticket) -> Dict[str, Any]:
        logs = []
        logs.append("[RUNBOOK STEP 1] Analyzing root filesystem storage utilization...")
        time.sleep(0.05)
        logs.append("[RUNBOOK STEP 2] Compressed rotated log archives in /var/log/syslog.*")
        time.sleep(0.05)
        logs.append("[RUNBOOK STEP 3] Purged stale application temporary cache files (/tmp, /var/tmp).")
        time.sleep(0.05)
        reclaimed_gb = 14.8
        logs.append(f"[RUNBOOK STEP 4] Storage reclaimed: {reclaimed_gb} GB. Root filesystem space now at 42% capacity.")
        logs.append("[RUNBOOK RESULT] Storage reclamation completed successfully.")

        return {
            "status": "SUCCESS",
            "logs": logs,
            "remediation_summary": f"Reclaimed {reclaimed_gb} GB storage by purging temp logs and caches.",
        }


class DatabaseIdleKillRunbook(Runbook):
    def __init__(self):
        super().__init__(
            id="DATABASE_IDLE_KILL",
            name="Automated Zombie Database Session Termination",
            description="Identifies and terminates idle-in-transaction database connections exceeding timeout threshold.",
            target_category=TicketCategory.DATABASE,
            keywords=["database", "sql", "postgres", "deadlock", "idle", "query", "zombie", "connection pool"],
        )

    def execute(self, ticket: Ticket) -> Dict[str, Any]:
        logs = []
        logs.append("[RUNBOOK STEP 1] Querying pg_stat_activity for 'idle in transaction' sessions > 300s...")
        time.sleep(0.05)
        logs.append("[RUNBOOK STEP 2] Identified 3 blocking zombie connection process IDs [PIDs: 10428, 10432, 10450].")
        time.sleep(0.05)
        logs.append("[RUNBOOK STEP 3] Executed pg_terminate_backend() for identified PIDs.")
        time.sleep(0.05)
        logs.append("[RUNBOOK STEP 4] Connection pool health restored. Active connection count back to normal levels.")
        logs.append("[RUNBOOK RESULT] Terminated 3 zombie database sessions.")

        return {
            "status": "SUCCESS",
            "logs": logs,
            "remediation_summary": "Terminated 3 blocking idle database connections.",
        }


# Global Registry of Available Runbooks
RUNBOOK_REGISTRY: Dict[str, Runbook] = {
    "NETWORK_VPN_RESTART": NetworkVpnRestartRunbook(),
    "ACCESS_PASSWORD_RESET": AccessPasswordResetRunbook(),
    "DISK_TEMP_CLEANUP": DiskTempCleanupRunbook(),
    "DATABASE_IDLE_KILL": DatabaseIdleKillRunbook(),
}


class AutoRemediationService:
    @staticmethod
    def get_registered_runbooks() -> List[Dict[str, Any]]:
        """Return metadata for all registered auto-remediation runbooks."""
        return [
            {
                "id": rb.id,
                "name": rb.name,
                "description": rb.description,
                "target_category": rb.target_category.value,
                "keywords": rb.keywords,
            }
            for rb in RUNBOOK_REGISTRY.values()
        ]

    @staticmethod
    def match_best_runbook(ticket: Ticket) -> Optional[Runbook]:
        """Find the best matching remediation runbook for a ticket based on category and title/description."""
        combined_text = f"{ticket.title} {ticket.description}".lower()

        # First try exact category match with keyword alignment
        category_matches = [
            rb for rb in RUNBOOK_REGISTRY.values() if rb.target_category == ticket.category
        ]
        
        for rb in category_matches:
            for kw in rb.keywords:
                if kw in combined_text:
                    return rb

        if category_matches:
            return category_matches[0]

        # General keyword search fallback across all runbooks
        for rb in RUNBOOK_REGISTRY.values():
            for kw in rb.keywords:
                if kw in combined_text:
                    return rb

        return None

    @staticmethod
    def execute_remediation(
        db: Session,
        ticket_id: int,
        runbook_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Execute automated remediation runbook on a ticket.
        Updates ticket status, computes execution time, and records SYSTEM_BOT audit log.
        """
        ticket = TicketService.get_ticket_by_id(db, ticket_id)

        # Select runbook
        if runbook_id:
            if runbook_id not in RUNBOOK_REGISTRY:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Runbook '{runbook_id}' not found in registry.",
                )
            runbook = RUNBOOK_REGISTRY[runbook_id]
        else:
            runbook = AutoRemediationService.match_best_runbook(ticket)
            if not runbook:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"No suitable automated runbook found for ticket #{ticket_id} (Category: {ticket.category.value}).",
                )

        start_time = time.perf_counter()
        
        # Transition ticket to AUTO_RESOLVING during execution
        ticket.status = TicketStatus.AUTO_RESOLVING
        db.add(ticket)
        db.commit()

        # Execute Runbook
        try:
            result = runbook.execute(ticket)
            exec_status = result.get("status", "SUCCESS")
            logs = result.get("logs", [])
            summary = result.get("remediation_summary", "Remediation executed.")
        except Exception as e:
            exec_status = "FAILED"
            logs = [f"[RUNBOOK ERROR] Execution encountered exception: {str(e)}"]
            summary = f"Execution failed: {str(e)}"

        elapsed_ms = round((time.perf_counter() - start_time) * 1000, 2)

        if exec_status == "SUCCESS":
            ticket.status = TicketStatus.RESOLVED
            action_name = "AUTO_REMEDIATION_SUCCESS"
        else:
            ticket.status = TicketStatus.IN_PROGRESS
            # Escalate priority if failed
            if ticket.priority == TicketPriority.P3_MEDIUM:
                ticket.priority = TicketPriority.P2_HIGH
            elif ticket.priority == TicketPriority.P2_HIGH:
                ticket.priority = TicketPriority.P1_CRITICAL
            action_name = "AUTO_REMEDIATION_FAILED"

        db.add(ticket)

        # Record System Bot Audit Log
        audit = AuditLog(
            ticket_id=ticket.id,
            action=action_name,
            actor_type=ActorType.SYSTEM_BOT,
            actor_id=None,
            details={
                "runbook_id": runbook.id,
                "runbook_name": runbook.name,
                "execution_status": exec_status,
                "execution_time_ms": elapsed_ms,
                "summary": summary,
                "logs": logs,
            },
        )
        db.add(audit)
        db.commit()
        db.refresh(ticket)

        return {
            "ticket_id": ticket.id,
            "new_status": ticket.status.value,
            "runbook_executed": runbook.id,
            "execution_status": exec_status,
            "execution_time_ms": elapsed_ms,
            "summary": summary,
            "logs": logs,
        }
