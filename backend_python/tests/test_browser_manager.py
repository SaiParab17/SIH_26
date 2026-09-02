import os

from app.core.browser_manager import BrowserManager


def test_browser_manager_marks_camoufox_backend_when_enabled(monkeypatch):
    monkeypatch.setenv("USE_CAMOUFOX", "true")
    manager = BrowserManager(headless=True, use_camoufox=True)

    assert manager.use_camoufox is True
    assert manager.browser_backend == "camoufox"


def test_browser_manager_uses_chromium_when_camoufox_disabled(monkeypatch):
    monkeypatch.delenv("USE_CAMOUFOX", raising=False)
    manager = BrowserManager(headless=True, use_camoufox=False)

    assert manager.use_camoufox is False
    assert manager.browser_backend == "chromium"
