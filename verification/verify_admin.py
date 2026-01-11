from playwright.sync_api import sync_playwright

def verify_admin_suite():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Use localhost server to avoid CORS issues and allow fetching sitemap.xml
        page.goto("http://localhost:8080/admin.html")

        # 1. Verify Quick Links
        print("Verifying Quick Links...")
        page.get_by_role("heading", name="Quick Links").wait_for()

        # 2. Verify SEO Tab UI
        print("Verifying SEO Tab...")
        # Force visibility of SEO tab if button click doesn't work well with animation
        page.evaluate("document.getElementById('seo').style.display = 'block'")
        page.get_by_role("button", name="🔍 SEO Scan").click()

        # Wait a bit
        page.wait_for_timeout(1000)

        # Check for new headers
        # Might need to wait for tab animation/display
        print("Checking for Robots header...")
        if page.get_by_role("columnheader", name="Robots").is_visible():
            print("Robots header visible")
        else:
             print("Robots header NOT visible. Dumping HTML:")
             # print(page.content())

        if page.get_by_role("columnheader", name="In Sitemap?").is_visible():
            print("In Sitemap? header visible")

        # Check for Download button
        download_btn = page.get_by_role("button", name="💾 Bericht speichern")
        if download_btn.is_visible():
            print("Download button visible")

        # Take screenshot of Dashboard
        page.get_by_role("button", name="📊 Dashboard").click()
        page.wait_for_timeout(500)
        page.screenshot(path="verification/dashboard_v2.png")

        # Take screenshot of SEO Tab
        page.get_by_role("button", name="🔍 SEO Scan").click()
        page.wait_for_timeout(500)
        page.screenshot(path="verification/seo_v2.png")

        browser.close()

if __name__ == "__main__":
    verify_admin_suite()
