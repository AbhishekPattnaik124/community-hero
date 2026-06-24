const fs = require('fs');
const { JSDOM } = require('jsdom');
const html = fs.readFileSync('dist/index.html', 'utf8');
const dom = new JSDOM(html, { runScripts: 'dangerously', resources: 'usable', url: 'http://localhost:5173/' });
dom.window.addEventListener('error', (e) => {
  console.log('JSDOM CAUGHT ERROR:', e.message, e.error);
});
dom.window.addEventListener('unhandledrejection', (e) => {
  console.log('JSDOM CAUGHT PROMISE ERROR:', e.reason);
});
setTimeout(() => {
  console.log('DOM Content after 5s:', dom.window.document.body.innerHTML.substring(0, 1000));
  process.exit(0);
}, 5000);
