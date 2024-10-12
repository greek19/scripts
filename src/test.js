const puppeteer = require('puppeteer');
const pLimit = require('p-limit'); // Assicurati di installare p-limit
//const { default: pLimit } = await import('p-limit');

const limit = pLimit(5); // Limita il numero di operazioni concorrenti

(async () => {
 

  const username = 'Braciolaoca';
    const password = '15marzo82';
    const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

    const browser = await puppeteer.launch({
        headless: false,
        executablePath: chromePath,
        args: ['--start-maximized']
    });

    const [page] = await browser.pages();
    await page.setViewport({ width: 1920, height: 1080 });

    try {
        await page.goto('https://leghe.fantacalcio.it/login');
        console.log("Raggiungo il login");
        await page.type('input[formcontrolname="username"]', username);
        await page.type('input[formcontrolname="password"]', password);
        await page.keyboard.press('Enter');
        await page.waitForNavigation();
        console.log("Completo il login");

        const legheArray = await page.evaluate(() => {
            const links = [];
            document.querySelectorAll('.dropdown-item a').forEach(item => {
                const baseLink = item.getAttribute('href');
                const dataId = item.getAttribute('data-id');
                if (baseLink && dataId) {
                    const fullLink = `${baseLink.split('/dettaglio-competizione/')[0]}/classifica?id=${dataId}`;
                    links.push(fullLink);
                }
            });
            return links;
        });

        for (const item of legheArray) {
            await page.goto(item);
            console.log("Navigazione alla lega: " + item);

            // Gestisci i download in parallelo
            const competitionArray = await page.evaluate(() => {
                const links = [];
                document.querySelectorAll('.competition-current .dropdown-menu.competition-list .dropdown-item a').forEach(item => {
                    const dataId = item.getAttribute('data-id');
                    const href = item.href;
                    if (dataId) {
                        const fullLink = `${href.replace(/\/[^\/]*$/, '/')}classifica?id=${dataId}`;
                        links.push(fullLink);
                    }
                });
                return links;
            });

            await Promise.all(competitionArray.map((competition) => limit(async () => {
                await page.goto(competition);
                await waitForSelectorWithTimeout(page, 'a[id="toexcel"]', 1000); // Timeout ridotto
                await page.click('a[id="toexcel"]');
            })));
        }
    } catch (error) {
        console.error("Errore durante l'esecuzione dello script:", error);
    } finally {
        await browser.close();
        const timeTaken = (Date.now() - startTime) / 1000;
        console.log(`Tempo impiegato: ${Math.floor(timeTaken / 60)} minuti e ${Math.floor(timeTaken % 60)} secondi.`);
    }
})();

async function waitForSelectorWithTimeout(page, selector, timeout = 2000) {
    try {
        await Promise.race([
            page.waitForSelector(selector, { visible: true }),
            new Promise(resolve => setTimeout(resolve, timeout))
        ]);
    } catch {
        console.log(`Selector ${selector} non trovato in tempo.`);
    }
}
