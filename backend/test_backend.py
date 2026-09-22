import sys
from fastapi.testclient import TestClient
from main import app

def run_tests():
    print("--- Starting Phase 1 & Phase 2 Integration Tests ---")

    with TestClient(app) as client:
        # 1. Health Check
        res = client.get("/api/v1/health")
        assert res.status_code == 200, f"Health check failed: {res.text}"
        health_data = res.json()
        print("[PASS] Health Check Passed:", health_data["status"], "| DB:", health_data["database_status"])

        # 2. Register Users
        user1_payload = {
            "email": "employee@enterprise.com",
            "full_name": "Jane Employee",
            "password": "SecurePassword123!",
            "role": "EMPLOYEE"
        }
        user2_payload = {
            "email": "itsupport@enterprise.com",
            "full_name": "Bob IT Support",
            "password": "SecurePassword123!",
            "role": "IT_SUPPORT"
        }

        res1 = client.post("/api/v1/auth/register", json=user1_payload)
        assert res1.status_code == 201, f"User 1 registration failed: {res1.text}"
        user1 = res1.json()

        res2 = client.post("/api/v1/auth/register", json=user2_payload)
        assert res2.status_code == 201, f"User 2 registration failed: {res2.text}"
        user2 = res2.json()
        print("[PASS] Users Registered Successfully -> User 1 ID:", user1["id"], "| User 2 ID:", user2["id"])

        # 3. Smart Triage Classification Test (Unit Check)
        from app.services.triage_service import SmartTriageService
        triage = SmartTriageService.classify_incident(
            title="Production down and database leak detected",
            description="High latency and postgres deadlock in cluster"
        )
        print("[PASS] Direct Smart Triage Analysis:")
        print("       Priority:", triage["suggested_priority"].value)
        print("       Category:", triage["suggested_category"].value)
        print("       Confidence:", triage["confidence_score"])
        assert triage["suggested_priority"] == "P1_CRITICAL"
        assert triage["suggested_category"] == "DATABASE"

        # 4. Ticket Creation with Smart Auto-Triage (Omitting priority and category)
        auto_triage_ticket_payload = {
            "title": "VPN gateway unreachable in EU region",
            "description": "Remote engineering staff cannot establish IPsec tunnels to gateway.",
            "created_by_id": user1["id"]
        }
        res_triage_tkt = client.post("/api/v1/tickets/", json=auto_triage_ticket_payload)
        assert res_triage_tkt.status_code == 201, f"Smart Triage ticket creation failed: {res_triage_tkt.text}"
        tkt_data = res_triage_tkt.json()
        print("[PASS] Smart Triage Ticket Created:")
        print("       Auto-Assigned Priority:", tkt_data["priority"])
        print("       Auto-Assigned Category:", tkt_data["category"])
        print("       SLA Deadline:", tkt_data["sla_deadline"])
        assert tkt_data["category"] == "NETWORK"
        assert tkt_data["priority"] == "P2_HIGH"

        tkt_id = tkt_data["id"]

        # 5. List Registered Remediation Runbooks
        res_runbooks = client.get("/api/v1/remediation/runbooks")
        assert res_runbooks.status_code == 200, f"List runbooks failed: {res_runbooks.text}"
        runbooks = res_runbooks.json()
        print("[PASS] Runbooks Registry Retrieved. Count:", len(runbooks))
        for rb in runbooks:
            print(f"       - [{rb['id']}] {rb['name']} (Target: {rb['target_category']})")
        assert len(runbooks) >= 4

        # 6. Execute Auto-Remediation Runbook on Ticket
        res_remedy = client.post(f"/api/v1/tickets/{tkt_id}/remediate")
        assert res_remedy.status_code == 200, f"Remediation execution failed: {res_remedy.text}"
        remedy_data = res_remedy.json()
        print("[PASS] Auto-Remediation Executed Successfully:")
        print("       Runbook:", remedy_data["runbook_executed"])
        print("       Execution Status:", remedy_data["execution_status"])
        print("       Execution Time:", remedy_data["execution_time_ms"], "ms")
        print("       New Ticket Status:", remedy_data["new_status"])
        assert remedy_data["execution_status"] == "SUCCESS"
        assert remedy_data["new_status"] == "RESOLVED"

        # 7. Fetch Ticket Details to Verify SYSTEM_BOT Audit Log
        res_detail = client.get(f"/api/v1/tickets/{tkt_id}")
        assert res_detail.status_code == 200, f"Fetch ticket detail failed: {res_detail.text}"
        detail = res_detail.json()
        print("[PASS] Ticket Details & Audit History Validated:")
        print("       Total Audit Log Entries:", len(detail["audit_logs"]))
        bot_logs = [log for log in detail["audit_logs"] if log["actor_type"] == "SYSTEM_BOT"]
        print("       SYSTEM_BOT Audit Entries:", len(bot_logs))
        assert len(bot_logs) >= 1
        assert bot_logs[0]["action"] == "AUTO_REMEDIATION_SUCCESS"
        print("       Latest Bot Log Output:", bot_logs[0]["details"]["summary"])

        print("\n========================================================")
        print(" ALL PHASE 1 & PHASE 2 AUTOMATED TESTS PASSED!")
        print("========================================================\n")

if __name__ == "__main__":
    run_tests()
