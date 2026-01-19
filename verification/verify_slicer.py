
import os
from playwright.sync_api import sync_playwright, expect

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        # Absolute path to the file
        cwd = os.getcwd()
        filepath = f"file://{cwd}/slicer-einstellungen.html"

        print(f"Navigating to {filepath}")
        page.goto(filepath)

        # Ensure directory exists
        os.makedirs("verification", exist_ok=True)

        # Verify Page Header
        print("Verifying Page Header...")
        header = page.locator(".page-header")
        expect(header).to_be_visible()
        header.screenshot(path="verification/slicer_header.png")

        # Verify H1
        h1 = header.locator("h1")
        expect(h1).to_have_text("Beste Slicer-Einstellungen für Einsteiger")

        # Verify Section: Basics
        print("Verifying Basics Section...")
        basics_heading = page.locator("h2#basics")
        expect(basics_heading).to_be_visible()
        # Screenshot the area around the basics heading
        # Just screenshot the heading's parent (section-heading) and next sibling (card-grid) if possible
        # But for simplicity, just screenshot the viewport
        # basics_heading.scroll_into_view_if_needed()
        # page.screenshot(path="verification/slicer_basics.png")

        # Verify Section: Materials (Table)
        print("Verifying Materials Section...")
        materials_heading = page.locator("h2#materials")
        expect(materials_heading).to_be_visible()

        table = page.locator(".table-wrapper")
        if table.count() > 0:
             table.first.scroll_into_view_if_needed()
             table.first.screenshot(path="verification/slicer_table.png")
        else:
             print("Table wrapper not found")

        # Full page screenshot
        page.screenshot(path="verification/slicer_full.png", full_page=True)

        print("Verification complete!")
        browser.close()

if __name__ == "__main__":
    run()
