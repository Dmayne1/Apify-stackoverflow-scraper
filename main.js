const { Actor } = require('apify');
const { PuppeteerCrawler } = require('crawlee');

Actor.main(async () => {
    console.log('Starting scraper...');
    
    const input = await Actor.getInput() || {};
    const { startUrls = [], maxItems = 10 } = input;
    
    if (!startUrls.length) {
        console.log('No URLs provided, using default');
        await Actor.pushData([{
            message: 'No URLs provided in input',
            timestamp: new Date().toISOString(),
            status: 'completed'
        }]);
        return;
    }
    
    const crawler = new PuppeteerCrawler({
        maxRequestsPerCrawl: maxItems,
        requestHandler: async ({ page, request }) => {
            console.log(`Processing: ${request.url}`);
            
            const title = await page.title();
            
            await Actor.pushData({
                url: request.url,
                title: title,
                timestamp: new Date().toISOString()
            });
        },
        failedRequestHandler: async ({ request }) => {
            console.log(`Request failed: ${request.url}`);
        }
    });

    await crawler.addRequests(startUrls.map(url => ({ url })));
    await crawler.run();
    
    console.log('Scraper completed!');
});