import re
from typing import Dict, Any, List, Optional
from app.models.ticket import TicketPriority, TicketCategory


CRITICAL_KEYWORDS = [
    "outage",
    "production down",
    "prod down",
    "database leak",
    "ransomware",
    "data loss",
    "system crash",
    "security breach",
]

HIGH_KEYWORDS = [
    "unreachable",
    "high latency",
    "service degraded",
    "deadlock",
    "cannot login",
    "auth failure",
]

CATEGORY_KEYWORD_MAP = {
    TicketCategory.NETWORK: ["vpn", "gateway", "dns", "firewall", "subnets", "router", "network", "bandwidth", "ipsec"],
    TicketCategory.ACCESS_MANAGEMENT: ["login", "sso", "password", "iam", "permission", "mfa", "access", "account locked", "active directory"],
    TicketCategory.HARDWARE: ["disk", "ram", "cpu", "laptop", "monitor", "server hardware", "overheating", "memory leak"],
    TicketCategory.DATABASE: ["sql", "postgres", "deadlock", "query slow", "database", "pg_", "mysql", "tablespace"],
}


class SmartTriageService:
    @staticmethod
    def classify_incident(title: str, description: str) -> Dict[str, Any]:
        """
        Analyze incident title and description using heuristic rule-based triage.
        Returns suggested priority, suggested category, confidence score, and detected keywords.
        """
        combined_text = f"{title} {description}".lower()
        detected_keywords: List[str] = []

        # 1. Determine Priority
        suggested_priority = TicketPriority.P3_MEDIUM
        confidence = 0.70

        for keyword in CRITICAL_KEYWORDS:
            if re.search(r'\b' + re.escape(keyword) + r'\b', combined_text):
                suggested_priority = TicketPriority.P1_CRITICAL
                detected_keywords.append(keyword)
                confidence = 0.95
                break

        if suggested_priority != TicketPriority.P1_CRITICAL:
            for keyword in HIGH_KEYWORDS:
                if re.search(r'\b' + re.escape(keyword) + r'\b', combined_text):
                    suggested_priority = TicketPriority.P2_HIGH
                    detected_keywords.append(keyword)
                    confidence = 0.85
                    break

        # 2. Determine Category
        suggested_category = TicketCategory.GENERAL_IT
        category_scores: Dict[TicketCategory, int] = {}

        for cat, keywords in CATEGORY_KEYWORD_MAP.items():
            matches = 0
            for kw in keywords:
                if re.search(r'\b' + re.escape(kw) + r'\b', combined_text):
                    matches += 1
                    detected_keywords.append(kw)
            if matches > 0:
                category_scores[cat] = matches

        if category_scores:
            best_cat = max(category_scores, key=category_scores.get)
            suggested_category = best_cat
            confidence = min(0.99, confidence + 0.10)

        return {
            "suggested_priority": suggested_priority,
            "suggested_category": suggested_category,
            "confidence_score": round(confidence, 2),
            "detected_keywords": list(set(detected_keywords)),
        }
