"""Continuous refinement browser checks. All scores are automated test input, not human benchmarks."""
import json
import os
from pathlib import Path
from playwright.sync_api import sync_playwright
BASE = os.environ.get('KEYFORGE_BASE_URL', 'http://127.0.0.1:3000')
OUT = Path('verification')
OUT.mkdir(exist_ok=True)
checks = []
errors = []
def check(name, value):
    assert value, name
    checks.append(name)
with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 1440, 'height': 1100})
    page.on('pageerror', lambda e: errors.append(str(e)))
    page.goto(BASE + '/code-lab/index.html', wait_until='networkidle')
    page.locator('[data-drill="weak"]').click()
    check('continuous refinement is separately selectable', 'Continuous refinement' in page.locator('[data-drill="weak"]').inner_text())
    check('fresh profile calibrates instead of inventing speed', 'calibrating' in page.locator('#coach-title').inner_text())
    page.locator('#goal').fill('250')
    page.locator('#goal').press('Tab')
    check('pace goal has no 200 WPM ceiling', page.locator('#goal').input_value() == '250')
    page.locator('#level').select_option('fluent')
    check('fluent depth still produces a lesson', page.locator('#source .char').count() > 40)
    text = page.locator('#source .char').evaluate_all("els => els.map(el => el.classList.contains('newline') ? '\\n' : el.classList.contains('whitespace') ? ' ' : el.textContent).join('')")
    page.locator('#typing-input').focus()
    for line_no, line in enumerate(text.split('\n')):
        if line_no: page.keyboard.press('Enter')
        page.keyboard.type(line, delay=2)
    page.locator('#result').wait_for(state='visible')
    row = page.evaluate("JSON.parse(localStorage.getItem('keyforge.code-lab.history.v1')).history[0]")
    check('completed refinement saves actual key and fragment aggregates', row['drill'] == 'weak' and bool(row['keys']) and bool(row['fragments']))
    page.locator('#next').click()
    check('a new lesson remains available after completion', page.locator('#source .char').count() > 40 and 'Keys never retire' in page.locator('#coach-text').inner_text())
    page.reload(wait_until='networkidle')
    reloaded = page.evaluate("JSON.parse(localStorage.getItem('keyforge.code-lab.history.v1')).history[0]")
    check('extended telemetry survives a real browser reload', reloaded['fragments'] == row['fragments'])
    check('goal above 200 survives settings reload', page.locator('#goal').input_value() == '250')
    page.locator('[data-view="insights"]').click()
    check('insights exposes fragment skills and review explanation', 'Mastered does not mean retired.' in page.locator('body').inner_text())
    page.screenshot(path=str(OUT / 'refinement-insights.png'), full_page=True)
    page.locator('[data-view="practice"]').click()
    page.locator('#language').select_option('Python')
    check('new language calibrates separately', 'calibrating' in page.locator('#coach-title').inner_text())
    page.screenshot(path=str(OUT / 'refinement-desktop.png'), full_page=True)
    page.set_viewport_size({'width': 390, 'height': 844})
    check('continuous refinement has no mobile horizontal overflow', page.evaluate('document.documentElement.scrollWidth <= innerWidth'))
    check('no uncaught JavaScript errors during refinement', not errors)
    browser.close()
(OUT / 'refinement-browser-results.json').write_text(json.dumps({'mode': 'live-origin', 'score_source': 'automated input; not a human typing benchmark', 'passed': len(checks), 'checks': checks, 'console_errors': errors}, indent=2))
print(json.dumps({'refinement_passed': len(checks), 'mode': 'live-origin'}, indent=2))
