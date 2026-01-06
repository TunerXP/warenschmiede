from playwright.sync_api import sync_playwright, expect
import os

def test_tools_page():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Load the file directly since it is a static site
        file_path = os.path.abspath("ki/tools.html")
        page.goto(f"file://{file_path}")

        # 1. Verify GitHub Callout
        callout = page.locator("#ki-coding .callout.note")
        expect(callout).to_be_visible()
        expect(callout).to_contain_text("GitHub: Die Kommandozentrale")

        # 2. Verify Codex Link
        codex_link = page.locator("#tool-codex a")
        expect(codex_link).to_have_attribute("href", "https://openai.com/index/introducing-codex/")

        # 3. Verify GitHub Copilot Position (Second in grid)
        # We check the second article in the grid within ki-coding
        copilot_card = page.locator("#ki-coding .ki-tool-card-grid > article:nth-child(2)")
        expect(copilot_card).to_contain_text("GitHub Copilot")

        # 4. Verify Sora Text
        sora_text = page.locator("#tool-sora + .ki-tool-card__lede")
        expect(sora_text).to_contain_text("schrittweise öffentlich verfügbar")

        # 5. Verify Jules Link
        jules_link = page.locator("#tool-jules a")
        expect(jules_link).to_have_attribute("href", "https://jules.google")

        # Take screenshot of the Coding section
        coding_section = page.locator("section#ki-coding")
        coding_section.screenshot(path="verification/verification_coding.png")

        # Take screenshot of the Video section for Sora
        video_section = page.locator("section#ki-video")
        video_section.screenshot(path="verification/verification_video.png")

        browser.close()

if __name__ == "__main__":
    test_tools_page()
