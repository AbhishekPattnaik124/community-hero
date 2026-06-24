import puppeteer from 'puppeteer';

(async () => {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
    page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));
    
    console.log("Navigating to http://localhost:5173/showcase...");
    await page.goto('http://localhost:5173/showcase', { waitUntil: 'networkidle2' });
    
    const html = await page.content();
    console.log("HTML length:", html.length);
    console.log("Has ErrorBoundary output?:", html.includes("Something went wrong"));
    
    await browser.close();
  } catch (err) {
    console.error("Script error:", err);
  }
})();
