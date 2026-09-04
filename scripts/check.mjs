import { readFile, stat } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const required = ['index.html', 'styles.css', 'app.js', 'favicon.svg', 'data/case.json', 'robots.txt', '.nojekyll'];
const errors = [];

for (const file of required) {
  try {
    const info = await stat(resolve(root, file));
    if (!info.isFile()) errors.push(`${file} is not a file`);
  } catch {
    errors.push(`${file} is missing`);
  }
}

const html = await readFile(resolve(root, 'index.html'), 'utf8');
const css = await readFile(resolve(root, 'styles.css'), 'utf8');
const js = await readFile(resolve(root, 'app.js'), 'utf8');
const evidence = JSON.parse(await readFile(resolve(root, 'data/case.json'), 'utf8'));

if ((html.match(/<h1\b/g) || []).length !== 1) errors.push('index.html must contain exactly one h1');
if (!html.includes('<html lang="en">')) errors.push('default document language is missing');
if (!html.includes('class="skip-link"')) errors.push('skip link is missing');
if (!html.includes('prefers-reduced-motion') && !css.includes('prefers-reduced-motion')) errors.push('reduced-motion handling is missing');
if (!html.includes('Content-Security-Policy')) errors.push('CSP meta policy is missing');
if (html.includes('frame-ancestors')) errors.push('frame-ancestors cannot be enforced from a meta policy');
if (!html.includes('rel="icon"')) errors.push('favicon link is missing');
if (!html.includes('rel="canonical"')) errors.push('canonical URL is missing');
if (!html.includes('property="og:title"')) errors.push('social share metadata is missing');
if (!html.includes('alt="Session Range Desk')) errors.push('evidence image alt text is missing');
if (!html.includes('alt="Erdem Mümin Kaynak profile portrait"')) errors.push('profile portrait alt text is missing');
if (!html.includes('mailto:pskerdemkaynak@gmail.com')) errors.push('email contact path is missing');
if (!html.includes('id="contact"')) errors.push('profile contact anchor is missing');
if (!html.includes('SYNTHETIC EXPLAINER')) errors.push('synthetic demo label is missing');
if (/TODO|PLACEHOLDER|lorem ipsum/i.test(`${html}\n${css}\n${js}`)) errors.push('unfinished placeholder text found');
if (!js.includes("document.querySelectorAll('[data-regime]')")) errors.push('regime interaction is missing');
if (!js.includes("languageSwitch.addEventListener")) errors.push('language interaction is missing');
if (!js.includes('MQL5 Signal account')) errors.push('future MQL5 Signal direction is missing');
if (js.includes('.innerHTML =')) errors.push('dynamic copy must not rely on HTML string injection');
if (!js.includes('element.replaceChildren(fragment)')) errors.push('safe rich-copy renderer is missing');
if (evidence.id !== 'session-range-desk-v4-02') errors.push('unexpected evidence id');
if (!Array.isArray(evidence.does_not_prove) || evidence.does_not_prove.length < 4) errors.push('evidence boundary is incomplete');
if (evidence.redaction_reviewed !== true) errors.push('redaction review is not recorded');
for (const key of ['claim', 'market_url', 'profile_url', 'image_url', 'last_verified']) {
  if (!evidence[key]) errors.push(`evidence field ${key} is missing`);
}

if (errors.length) {
  console.error(errors.map(error => `FAIL: ${error}`).join('\n'));
  process.exit(1);
}

console.log(`PASS: ${required.length} required files, semantic checks, interactions, and evidence boundary verified.`);
