const puppeteer = require('puppeteer');


(async () => {
  const username = 'Braciolaoca';
  const password = '15marzo82';

  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: chromePath,
    args: ['--start-maximized']
  });

  const [page] = await browser.pages();
  await page.setViewport({ width: 1920, height: 1080 });

  // Inizio timer
  const startTime = Date.now();

  try {
    // Naviga alla pagina di login
    await page.goto('https://leghe.fantacalcio.it/login');
    console.log("Raggiungo il login");

    // Compila il modulo di login
    await page.waitForSelector('input[formcontrolname="username"]', { visible: true });
    await page.type('input[formcontrolname="username"]', username);
    await page.type('input[formcontrolname="password"]', password);

    // Invia il modulo
    await page.keyboard.press('Enter');
    await page.waitForNavigation();
    console.log("Completo il login");

    // Recupero link delle leghe
    const legheArray = await page.evaluate(() => {
      const links = [];
      const dropdownItems = document.querySelectorAll('.dropdown-item a');

      dropdownItems.forEach(item => {
        const baseLink = item.getAttribute('href');
        const dataId = item.getAttribute('data-id');

        if (baseLink && dataId) {
          const fullLink = `${baseLink.split('/dettaglio-competizione/')[0]}/classifica?id=${dataId}`;
          links.push(fullLink);
        }
      });

      return links;
    });

    console.log("Leghe trovate:", legheArray);

    for (const item of legheArray) {
      await page.goto(item);
      console.log("Navigazione alla lega: " + item);

      // Accetta i cookie se il pulsante è presente
      try {
        await page.waitForSelector('button[id="pt-accept-all"]', { visible: true, timeout: 5000 });
        await page.click('button[id="pt-accept-all"]');
      } catch (error) {
        console.log("Pulsante di accettazione non trovato, continuando...");
      }

      // Ottieni link per ogni competizione
      const competitionArray = await page.evaluate(() => {
        const links = [];
        const competitionItems = document.querySelectorAll('.competition-current .dropdown-menu.competition-list .dropdown-item a');

        competitionItems.forEach(item => {
          const dataId = item.getAttribute('data-id');
          const href = item.href; // Ottieni il link completo

          if (dataId) {
            const fullLink = `${href.replace(/\/[^\/]*$/, '/')}classifica?id=${dataId}`;
            links.push(fullLink);
          }
        });

        return links;
      });

      console.log("Competizioni trovate per questa lega:", competitionArray);

      for (const competition of competitionArray) {
        await page.goto(competition);
        await wait(2000);

        // Clicca sul link per scaricare l'excel
        try {
          await page.waitForSelector('a[id="toexcel"]', { visible: true, timeout: 5000 });
          await page.click('a[id="toexcel"]');
          await wait(2000);
        } catch (error) {
          console.log(`'toexcel' link non trovato per ${competition}. Continuo con l'elemento successivo.`);
        }
      }
    }

    // ROSEEEEEEEEEEEEEEE

    // Recupero link delle leghe per rose
    const legheRoseArray = await page.evaluate(() => {
      const links = [];
      const dropdownItems = document.querySelectorAll('.dropdown-item a');

      dropdownItems.forEach(item => {
        const baseLink = item.getAttribute('href');
        const dataId = item.getAttribute('data-id');
        

        if (baseLink && dataId) {
          const fullLink = `${baseLink.replace('/classifica', '/')}rose?id=${dataId}`;
          links.push(fullLink);
        }
      });

      return links;
    });

    console.log("Rose trovate:", legheRoseArray);

    for (const item of legheRoseArray) {
      await page.goto(item);
      console.log("Navigazione alla rosa: " + item);

      // Accetta i cookie se il pulsante è presente
      try {
        await page.waitForSelector('button[id="pt-accept-all"]', { visible: true, timeout: 5000 });
        await page.click('button[id="pt-accept-all"]');
      } catch (error) {
        console.log("Pulsante di accettazione non trovato, continuando...");
      }

      // Ottieni link per ogni competizione
      const competitionArray = await page.evaluate(() => {
        const links = [];
        const competitionItems = document.querySelectorAll('.competition-current .dropdown-menu.competition-list .dropdown-item a');

        competitionItems.forEach(item => {
          const dataId = item.getAttribute('data-id'); // Ottieni data-id
          const href = item.href; // Ottieni il link completo

          if (dataId) {
            // Crea il link completo
            const fullLink = `${href.replace(/\/[^\/]*$/, '/')}rose?id=${dataId}`;
            links.push(fullLink);
          }
        });

        return links;
      });

      console.log("Competizioni trovate per questa lega:", competitionArray);

      for (const competition of competitionArray) {
        await page.goto(competition);
        await wait(2000);

        // Clicca sul link per scaricare l'excel
        try {
          await page.waitForSelector('a[id="toexcel"]', { visible: true, timeout: 5000 });
          await page.click('a[id="toexcel"]');
          await wait(2000);
          await page.waitForSelector('a[id="tocsv"]', { visible: true, timeout: 5000 });
          await page.click('a[id="tocsv"]');
          await wait(2000);
        } catch (error) {
          console.log(`'toexcel' link non trovato per ${competition}. Continuo con l'elemento successivo.`);
        }
      }
    }

  } catch (error) {
    console.error("Errore durante l'esecuzione dello script:", error);
  } finally {
    await browser.close();

    // Calcola il tempo impiegato e lo stampa
    const endTime = Date.now();
    const timeTaken = endTime - startTime; // in millisecondi
    const seconds = Math.floor((timeTaken / 1000) % 60);
    const minutes = Math.floor((timeTaken / 1000 / 60) % 60);
    const hours = Math.floor((timeTaken / 1000 / 3600) % 24);
    
    console.log(`Tempo impiegato: ${hours} ore, ${minutes} minuti e ${seconds} secondi.`);
  }
})();

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
