const Apify = require('apify');
const { PuppeteerCrawler } = require('crawlee');

Apify.main(async () => {
    const input = await Apify.getInput();
    const { startUrls = [], maxPages = 10, proxyConfiguration } = input;

    console.log('Starting Stackoverflow scraper...');
    const proxyConfig = await Apify.createProxyConfiguration(proxyConfiguration);
    
    const crawler = new PuppeteerCrawler({
        proxyConfiguration: proxyConfig,
        requestHandler: async ({ page, request }) => {
            await page.waitForTimeout(3000);
            
            const data = await page.evaluate(() => ({
                url: window.location.href,
                title: document.title,
                content: document.body.innerText.substring(0, 1000),
                scraped_at: new Date().toISOString()
            }));
            
            await Apify.pushData(data);
        }
    });

    await crawler.addRequests(startUrls.map(url => ({ url })));
    await crawler.run();
});