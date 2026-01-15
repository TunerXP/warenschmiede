import os
from playwright.sync_api import sync_playwright

def verify_material_page():
    cwd = os.getcwd()
    file_path = f"file://{cwd}/material.html"

    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.goto(file_path)

        # Click on the PLA summary to expand it
        # The first summary should be PLA.
        # But let's be specific.
        # We can select by the text in h3 inside summary

        page.locator("summary.mat-summary").first.click()

        # Wait a bit for transition
        page.wait_for_timeout(500)

        # Take a screenshot
        page.screenshot(path="verification_material.png", full_page=True)
        browser.close()

if __name__ == "__main__":
    verify_material_page()
