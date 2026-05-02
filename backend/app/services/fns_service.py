import json
import urllib.parse
import urllib.request

from app.core.config import settings


class FnsService:
    @staticmethod
    def check_company_by_inn(inn: str) -> dict:
        params = urllib.parse.urlencode({
            "req": inn,
            "key": settings.API_FNS_KEY,
        })

        url = f"{settings.API_FNS_BASE_URL}?{params}"

        try:
            request = urllib.request.Request(
                url,
                headers={
                    "User-Agent": "Mozilla/5.0"
                }
            )

            with urllib.request.urlopen(request, timeout=10) as response:
                raw_data = response.read().decode("utf-8")
                return json.loads(raw_data)

        except Exception as exc:
            return {
                "error": True,
                "message": str(exc),
            }

    @staticmethod
    @staticmethod
    def extract_company_name(data: dict) -> str | None:
        if not data or data.get("error"):
            return None

        items = data.get("items")
        if isinstance(items, list) and items:
            first_item = items[0]

            if isinstance(first_item, dict):
                ul_data = first_item.get("ЮЛ")
                if isinstance(ul_data, dict):
                    return (
                            ul_data.get("НаимСокрЮЛ")
                            or ul_data.get("НаимПолнЮЛ")
                    )

                ip_data = first_item.get("ИП")
                if isinstance(ip_data, dict):
                    return (
                            ip_data.get("ФИОПолн")
                            or ip_data.get("НаимВидИП")
                    )

        return None