const { chromium } = require('playwright');
// الاستخدام: python3 -m http.server 8000 & ثم  node tools/e2e.js . 8000  (يتطلب playwright)
const dir = process.argv[2] || '.', port = process.argv[3] || '8000';
(async () => {
  const b = await chromium.launch();
  const out = {};
  for (const [name, vp] of [['mobile', { width: 390, height: 844 }], ['desktop', { width: 1366, height: 768 }]]) {
    const p = await (await b.newContext({ viewport: vp })).newPage();
    const errs = [];
    p.on('pageerror', e => errs.push(e.message.slice(0, 160)));
    p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource|offline/.test(m.text())) errs.push(m.text().slice(0, 160)); });
    await p.route(/^https?:\/\/(?!localhost)/, r => r.abort());
    await p.goto('http://localhost:' + port + '/index.html'); await p.waitForTimeout(5000);
    // try opening the tools launcher and a few apps
    const apps = await p.evaluate(() => typeof window.openApp);
    out[name] = { errs: [...new Set(errs)], openApp: apps, nodes: await p.evaluate(() => document.querySelectorAll('*').length), welcome: await p.evaluate(() => !!document.querySelector('[id*=welcome i],[class*=welcome i]')) };
    await p.screenshot({ path: dir + '/e2e_' + name + '.png' });
  }
  console.log(JSON.stringify(out, null, 1));
  await b.close();
})();
