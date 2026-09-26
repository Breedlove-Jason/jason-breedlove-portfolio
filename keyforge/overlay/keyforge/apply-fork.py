#!/usr/bin/env python3
"""Checked, readable modifications for pinned Keybr e9c11fea284b8c861547173639580fe1442621b7."""
from pathlib import Path
import json
import re
ROOT = Path(__file__).resolve().parents[1]
def replace(path, old, new):
    p = ROOT / path
    text = p.read_text()
    if old not in text:
        raise SystemExit(f'Patch anchor not found in {path}; refusing a blind edit.')
    p.write_text(text.replace(old, new, 1))
marker = ROOT / 'KEYFORGE_PATCHED'
if marker.exists():
    print('KeyForge integration is already applied.')
    raise SystemExit(0)
replace('packages/keybr-pages-shared/lib/pages.ts', '  mdiCarSide,', '  mdiCarSide,\n  mdiCodeBraces,')
replace('packages/keybr-pages-shared/lib/pages.ts', '  export const account = {', '''  export const codeLab = {
    path: "/code-lab",
    title: defineMessage({ id: "keyforge.codeLab", defaultMessage: "Code Lab" }),
    link: {
      label: defineMessage({ id: "keyforge.codeLab", defaultMessage: "Code Lab" }),
      icon: mdiCodeBraces,
    },
    meta: [{ name: "description", content: "Developer typing practice: code, symbols, indentation, and separate progress." }],
  } satisfies PageInfo;

  export const account = {''')
replace('packages/keybr-pages-shared/lib/pages.ts', 'https://www.keybr.com/', 'https://typing.jasonbreedlove.dev/')
replace('packages/keybr-pages-browser/lib/App.tsx', 'const AccountPage =', 'const CodeLabPage = lazy(() => import("./pages/code-lab.tsx"));\nconst AccountPage =')
replace('packages/keybr-pages-browser/lib/App.tsx', '      <Routes>', '''      <Routes>
        <Route path={Pages.codeLab.path} element={
          <Template path={Pages.codeLab.path}>
            <Title page={Pages.codeLab} />
            <Suspense fallback={<LoadingProgress />}><CodeLabPage /></Suspense>
          </Template>
        } />''')
(ROOT / 'packages/keybr-pages-browser/lib/pages/code-lab.tsx').write_text('''/** Isolated keyboard handling leaves ordinary lessons unchanged. */
export default function Page() {
  return <iframe title="KeyForge Code Lab: developer typing practice"
    src="/code-lab/index.html?embedded=1"
    style={{ display: "block", width: "100%", height: "100dvh", border: 0 }} />;
}
''')
replace('packages/keybr-pages-browser/lib/NavMenu.tsx', '        <MenuItemLink page={Pages.multiplayer} />\n      </MenuItem>', '        <MenuItemLink page={Pages.multiplayer} />\n      </MenuItem>\n\n      <MenuItem><MenuItemLink page={Pages.codeLab} /></MenuItem>')
replace('packages/keybr-pages-browser/lib/Title.tsx', 'document.title = title;', 'document.title = `${title} · KeyForge`;')
replace('packages/keybr-pages-browser/lib/NavMenu.tsx', '<div className={styles.root}>', '<div className={styles.root}>\n      <a href="/" style={{ display: "block", fontWeight: 700, padding: "0.5rem 0" }}>KeyForge</a>')
replace('packages/server/lib/app/page/controller.tsx', '  @http.GET(`${Pages.account.path}`)', '''  @http.GET(`${Pages.codeLab.path}`)
  async ["code-lab"](ctx: Context<RouterState & AuthState>) {
    return this.renderPage(ctx, Pages.codeLab);
  }

  @http.GET(`/{locale:${localePattern}}${Pages.codeLab.path}`)
  async ["code-lab-i18n"](ctx: Context<RouterState & AuthState>, @pathParam("locale", pIntl) intl: IntlShape) {
    return this.renderPage(ctx, Pages.codeLab, intl);
  }

  @http.GET("/source")
  async ["keyforge-source"](ctx: Context<RouterState & AuthState>) {
    ctx.response.status = 302;
    ctx.response.headers.set("Location", "https://github.com/Breedlove-Jason/jason-breedlove-portfolio/tree/feature/keyforge-typing/keyforge");
  }

  @http.GET(`${Pages.account.path}`)''')
replace('packages/server/lib/app/sitemap/controller.ts', '    Pages.multiplayer,', '    Pages.multiplayer,\n    Pages.codeLab,')
p = ROOT / 'packages/keybr-pages-server/lib/Shell.tsx'
s = p.read_text()
s = re.sub(r'        \{isPremiumUser\(publicUser\) \|\| \([\s\S]*?        \)\}', '', s, count=1)
s = s.replace('<title>{formatMessage(page.title)}</title>', '<title>{formatMessage(page.title)} · KeyForge</title>')
s = s.replace('            Pages.multiplayer,', '            Pages.multiplayer,\n            Pages.codeLab,')
p.write_text(s)
(ROOT / 'packages/keybr-pages-browser/lib/Template.tsx').write_text('''import { PortalContainer, Toaster } from "@keybr/widget";
import { type ReactNode } from "react";
import { NavMenu } from "./NavMenu.tsx";
import * as styles from "./Template.module.less";
export function Template({ path, children }: { readonly path: string; readonly children: ReactNode }) {
  return <div className={styles.bodyAlt}>
    <main className={styles.mainAlt}>{children}<PortalContainer /><Toaster /></main>
    <nav className={styles.navAlt}><NavMenu currentPath={path} /></nav>
  </div>;
}
''')
p = ROOT / 'packages/keybr-pages-browser/lib/Template.module.less'
s = p.read_text().replace('grid-template-columns: 12rem 1fr auto;', 'grid-template-columns: minmax(1rem, 3vw) minmax(0, 1fr) auto;')
s += '\n@media (max-width: 700px) {\n  .bodyAlt { display: flex; flex-direction: column-reverse; }\n  .navAlt { overflow-x: auto; }\n}\n'
p.write_text(s)
p = ROOT / 'packages/keybr-pages-browser/lib/SubMenu.tsx'
s = p.read_text().replace('      <MailLink />\n      <DiscordLink />\n      <GithubLink />', '''      <a href="/source">KeyForge source (AGPLv3)</a>
      <a href="https://github.com/aradzie/keybr.com">Based on Keybr</a>
      <a href="/code-lab/policy.html">KeyForge privacy &amp; usage</a>''')
s = re.sub(r'      <RouterLink to=\{Pages.termsOfService.path\}>[\s\S]*?</RouterLink>', '', s, count=1)
s = re.sub(r'      <RouterLink to=\{Pages.privacyPolicy.path\}>[\s\S]*?</RouterLink>', '', s, count=1)
s = s.replace('      <TranslateLink />\n      <RemoveAdsLink />', '')
p.write_text(s)
replace('packages/keybr-pages-shared/lib/types.ts', 'export type PageData = {', 'export type PageData = {\n  readonly keyforgeAccountsEnabled?: boolean;')
replace('packages/server/lib/app/page/controller.tsx', '      base: this.canonicalUrl,', '      keyforgeAccountsEnabled: process.env.KEYFORGE_ACCOUNTS_ENABLED === "true",\n      base: this.canonicalUrl,')
replace('packages/page-account/lib/AccountPage.tsx', '  const { user, publicUser } = usePageData();', '''  const { user, publicUser, keyforgeAccountsEnabled } = usePageData();
  if (keyforgeAccountsEnabled === false) {
    return <section style={{ padding: "3rem", maxWidth: "48rem", margin: "auto" }}>
      <h1>Practice without an account.</h1>
      <p>All typing lessons, tests, and Code Lab work locally. Hosted sign-in and ordinary-profile cloud synchronization require the operator to configure an authentication provider.</p>
      <p>Code Lab has its own local history and JSON backups. It does not sync to the ordinary typing account.</p>
      <a href="/">Continue practicing</a>
    </section>;
  }''')
p = ROOT / 'packages/page-account/lib/SignInSection.tsx'
s = p.read_text()
start = s.index('      <Header level={2}>')
end = s.index('      <Header level={2}>', s.index('      <AccountPricePreview />', start))
p.write_text(s[:start] + s[end:])
p = ROOT / 'packages/page-account/lib/AccountSection.tsx'
s = p.read_text()
start = s.index('      <FieldSet\n        legend={formatMessage({\n          id: "t_Premium_account"')
end = s.index('      <FieldSet', start + 15)
p.write_text(s[:start] + s[end:])
replace('packages/server/lib/app/routes.ts', '        AuthController,\n        CheckoutController,', '        ...(process.env.KEYFORGE_ACCOUNTS_ENABLED === "true" ? [AuthController] : []),')
(ROOT / 'packages/devenv/lib/initdb-production.ts').write_text('''import { Container } from "@fastr/invert";
import { ConfigModule, Env } from "@keybr/config";
import { createSchema } from "@keybr/database";
import Knex from "knex";
Env.probeFilesSync();
const container = new Container();
container.load(new ConfigModule());
const knex = container.get(Knex);
try {
  await createSchema(knex);
  console.info("KeyForge database schema ready. No demo account or token was created.");
} catch (error) {
  console.error(error);
  process.exitCode = 1;
} finally {
  await knex.destroy();
}
''')
p = ROOT / 'package.json'
data = json.loads(p.read_text())
data['license'] = 'AGPL-3.0-or-later'
data['scripts']['test:code-lab'] = 'node --test tests-keyforge/engine.test.mjs'
data['scripts']['db:init'] = 'tsnode ./packages/devenv/lib/initdb-production.ts'
data['scripts']['start:production'] = 'npm run db:init && node --enable-source-maps ./root/index.js'
data['scripts']['start-docker'] = 'npm run start:production'
p.write_text(json.dumps(data, indent=2) + '\n')
# Tell the truth when browser storage is unavailable. Keep results exportable in memory.
p = ROOT / 'root/public/code-lab/app.mjs'
s = p.read_text()
s = s.replace('localStorage.setItem(HISTORY_KEY, JSON.stringify({ version: VERSION, history })); }', 'localStorage.setItem(HISTORY_KEY, JSON.stringify({ version: VERSION, history })); return true; }')
s = s.replace('toast(storageWarning); }\n}', 'toast(storageWarning); return false; }\n}', 1)
s = s.replace('history = mergeHistory(history, [row]); persist();', 'history = mergeHistory(history, [row]); const stored = persist();')
s = s.replace('Your result is saved in this browser.', "${stored ? 'Your result is saved in this browser.' : 'This result is in memory only. Export a backup before closing this tab.'}")
p.write_text(s)
marker.write_text('KeyForge integration applied to upstream e9c11fea284b8c861547173639580fe1442621b7\n')
print('KeyForge routes, navigation, identity, ad-free shell, and safe startup applied.')
