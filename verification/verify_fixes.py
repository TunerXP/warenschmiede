import os
from playwright.sync_api import sync_playwright

def verify_fixes():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        # 1. Verify Mobile Menu Scroll Lock
        # Emulate Pixel 5
        device = p.devices['Pixel 5']
        context = browser.new_context(**device)
        page = context.new_page()

        # Load local index.html
        cwd = os.getcwd()
        page.goto(f"file://{cwd}/index.html")

        # Open menu
        page.locator(".nav-toggle").click()
        # Wait for menu to open (class is-open added)
        page.wait_for_selector(".nav-menu.is-open")

        # Take screenshot of open menu
        page.screenshot(path="verification/mobile_menu_open.png")

        # Check computed styles for nav-menu
        menu = page.locator(".nav-menu.is-open")
        # position: fixed, top: 80px, bottom: 0, width: 100%, overflow-y: auto, overscroll-behavior: contain
        position = menu.evaluate("el => getComputedStyle(el).position")
        top = menu.evaluate("el => getComputedStyle(el).top")
        bottom = menu.evaluate("el => getComputedStyle(el).bottom")
        overflow_y = menu.evaluate("el => getComputedStyle(el).overflowY")
        overscroll = menu.evaluate("el => getComputedStyle(el).overscrollBehavior")

        print(f"Mobile Menu Styles: position={position}, top={top}, bottom={bottom}, overflow-y={overflow_y}, overscroll={overscroll}")

        context.close()

        # 2. Verify Online Tools Hover Effect
        # Desktop view
        context_desktop = browser.new_context(viewport={"width": 1920, "height": 1080})
        page_desktop = context_desktop.new_page()
        page_desktop.goto(f"file://{cwd}/index.html")

        # Hover over "Online Tools"
        tools_btn = page_desktop.locator(".nav-tools .nav-more-btn")
        tools_btn.hover()
        page_desktop.screenshot(path="verification/online_tools_hover.png")

        # Let's check 3D Druck hover too for comparison
        print_3d_btn = page_desktop.locator(".nav-3d .nav-more-btn")
        print_3d_btn.hover()
        page_desktop.screenshot(path="verification/3d_print_hover.png")

        context_desktop.close()
        browser.close()

if __name__ == "__main__":
    verify_fixes()
