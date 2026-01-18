
import os
from playwright.sync_api import sync_playwright

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

        # Screenshot Hero
        print("Taking screenshot of Hero section...")
        hero = page.locator(".ki-hero")
        if hero.count() > 0:
            hero.screenshot(path="verification/slicer_hero.png")
        else:
            print("Hero section not found!")

        # Screenshot Section 1
        print("Taking screenshot of Section 1...")
        section1 = page.locator("section[aria-labelledby='basics']")
        if section1.count() > 0:
            section1.screenshot(path="verification/slicer_section1.png")
        else:
            print("Section 1 not found!")

        # Screenshot Table
        print("Taking screenshot of Materials Table...")
        section5 = page.locator("section[aria-labelledby='materials']")
        if section5.count() > 0:
            section5.screenshot(path="verification/slicer_table.png")
        else:
            print("Section 5 not found!")

        # Screenshot full page for good measure (scaled down maybe?)
        # page.screenshot(path="verification/slicer_full.png", full_page=True)

        browser.close()

if __name__ == "__main__":
    run()
