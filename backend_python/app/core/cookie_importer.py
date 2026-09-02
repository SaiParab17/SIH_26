"""
Camoufox to Chromium Cookie Importer.
Extracts authenticated Facebook & Instagram session cookies from Camoufox's cookies.sqlite
and injects them directly into Playwright Chromium browser contexts.
"""

import os
import sqlite3
import logging
from typing import List, Dict, Any
from playwright.async_api import BrowserContext

logger = logging.getLogger("cookie_importer")

CAMOUFOX_COOKIES_DB = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
    "user_data",
    "instagram",
    "cookies.sqlite",
)

def extract_camoufox_cookies() -> List[Dict[str, Any]]:
    """Extract Facebook & Instagram cookies from Camoufox cookies.sqlite database."""
    if not os.path.exists(CAMOUFOX_COOKIES_DB):
        logger.warning(f"Camoufox cookies database not found at {CAMOUFOX_COOKIES_DB}")
        return []

    cookies = []
    try:
        conn = sqlite3.connect(CAMOUFOX_COOKIES_DB)
        cursor = conn.cursor()
        cursor.execute(
            "SELECT host, name, value, path, expiry, isSecure, isHttpOnly FROM moz_cookies "
            "WHERE host LIKE '%facebook%' OR host LIKE '%instagram%'"
        )
        rows = cursor.fetchall()

        for host, name, value, path, expiry, is_secure, is_http_only in rows:
            # Ensure domain starts with a dot for Playwright
            domain = host if host.startswith(".") else f".{host}"
            
            cookie = {
                "name": name,
                "value": value,
                "domain": domain,
                "path": path or "/",
                "secure": bool(is_secure),
                "httpOnly": bool(is_http_only),
            }
            if expiry and int(expiry) > 0:
                cookie["expires"] = int(expiry)

            cookies.append(cookie)

        conn.close()
        logger.info(f"Successfully extracted {len(cookies)} Facebook & Instagram cookies from Camoufox DB.")
    except Exception as err:
        logger.error(f"Error extracting cookies from Camoufox sqlite: {err}")

    return cookies


async def inject_camoufox_cookies_into_context(context: BrowserContext) -> int:
    """Inject Camoufox authenticated cookies into active Playwright Chromium context."""
    cookies = extract_camoufox_cookies()
    if not cookies:
        return 0

    try:
        await context.add_cookies(cookies)
        logger.info(f"Injected {len(cookies)} Camoufox cookies into Playwright Chromium context!")
        return len(cookies)
    except Exception as err:
        logger.error(f"Error injecting cookies into Chromium context: {err}")
        return 0
