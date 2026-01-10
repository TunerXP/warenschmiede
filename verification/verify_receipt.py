from playwright.sync_api import sync_playwright

def verify_receipt_gen(page):
    # Load the local file
    page.goto("file:///app/tools/quittungs_generator.html")

    # Check title
    print(page.title())

    # 1. Check Header elements
    assert page.is_visible("h1:has-text(\"Quittungs-Schmied\")")
    assert page.is_visible("#darkModeBtn")
    assert page.is_visible("button[title=\"Einstellungen\"]")

    # 2. Check Dark Mode Toggle
    # Default is light (from my understanding, but lets check)
    # Actually I made default light.
    # Take screenshot of light mode
    page.screenshot(path="verification/receipt_light.png")

    # Click toggle
    page.click("#darkModeBtn")
    # Check if body has dark-mode class
    assert "dark-mode" in page.eval_on_selector("body", "e => e.className")
    # Take screenshot of dark mode
    page.screenshot(path="verification/receipt_dark.png")

    # 3. Check Settings Button Text
    settings_btn = page.query_selector("button[title=\"Einstellungen\"]")
    print(settings_btn.inner_text())
    assert "Einstellungen & QR-Code" in settings_btn.inner_text()

    # 4. Check Footer
    assert page.is_visible("a[href=\"../index.html\"]")
    assert page.is_visible("a[href=\"../impressum.html\"]")

    # 5. Check Share Button
    assert page.is_visible(".btn-share")
    assert "Teilen" in page.inner_text(".btn-share")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        verify_receipt_gen(page)
        browser.close()
