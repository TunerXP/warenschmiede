from playwright.sync_api import sync_playwright

def verify_receipt_header():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        # Since the file is static HTML, we can load it directly via file://
        # Note: relative links might not work perfectly with file:// but visual structure should render.
        # We need absolute path for file://
        import os
        cwd = os.getcwd()
        file_path = f"file://{cwd}/tools/quittungs_generator.html"

        print(f"Loading {file_path}")
        page.goto(file_path)

        # Verify Title
        h1 = page.locator("h1")
        print(f"H1 Text: {h1.inner_text()}")

        # Verify Link
        link = page.locator(".header-back-link")
        print(f"Link Text: {link.inner_text()}")

        # Verify Mobile view (resize viewport)
        page.set_viewport_size({"width": 375, "height": 667})
        # Check if text is hidden
        desktop_text = page.locator(".desktop-only-text")

        # Take screenshot of mobile view
        page.screenshot(path="verification_mobile.png")

        # Verify Desktop view
        page.set_viewport_size({"width": 1280, "height": 800})
        page.screenshot(path="verification_desktop.png")

        browser.close()

if __name__ == "__main__":
    verify_receipt_header()
