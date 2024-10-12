const puppeteer = require('puppeteer');
const { execSync } = require('child_process');

// function findChromePath() {
//   let chromePath;
//   try {
//       // Esegui il comando per cercare chrome.exe
//       chromePath = execSync('where chrome', { encoding: 'utf8' }).trim();
//       console.log(`Chrome trovato in: ${chromePath}`);
//   } catch (error) {
//       console.error('Impossibile trovare chrome.exe. Assicurati che sia installato.');
//       process.exit(1); // Esci se chrome non è trovato
//   }
//   return chromePath;
// }

(async () => {
  // Credenziali di login
  const username = 'Braciolaoca';
  const password = '15marzo82';

 // const chromeExecutablePath = findChromePath();
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';


  const browser = await puppeteer.launch({
    headless: true,
    executablePath: chromePath,
    args: ['--start-maximized']
  });
  

  const [page] = await browser.pages();
  await page.setViewport({ width: 1920, height: 1080 });
  try {
    // Naviga alla pagina di login
    await page.goto('https://leghe.fantacalcio.it/login');
    console.log("Raggiungo il login")

    // Compila il modulo di login
    await page.waitForSelector('input[formcontrolname="username"]', { visible: true });
    await page.type('input[formcontrolname="username"]', username);
    await page.type('input[formcontrolname="password"]', password);

    // Invia il modulo
    await page.keyboard.press('Enter');
    await page.waitForNavigation();
    console.log("Completo il login")


    // Recupero link delle leghe
    const legheArrayHandle = await page.evaluateHandle(() => {
      const links = [];
      const dropdownItems = document.querySelectorAll('.dropdown-item a');
      console.log("Recupero la lista delle leghe")

      dropdownItems.forEach(item => {
        const baseLink = item.getAttribute('href');
        const dataId = item.getAttribute('data-id');
        
        if (baseLink && dataId) {
          let fullLink = `${baseLink.split('/dettaglio-competizione/')[0]}/classifica?id=${dataId}`;
          links.push(fullLink);
        }
      });

      return links;
    });

    const legheArray = await legheArrayHandle.jsonValue();
    await legheArrayHandle.dispose();  // Libera l'handle dopo l'uso

    console.log("Leghe trovate:", legheArray);

    let contatore = 0;
    for (const item of legheArray) {
      await page.goto(item);
      console.log("Navigazione alla lega: " + item);

      if (contatore === 0) {
        try {
          await page.click('button[id="pt-accept-all"]');
          contatore++;
        } catch (error) {
          console.log("Pulsante di accettazione non trovato, continuando...");
        }
      }

      // Ottieni link per ogni competizione
      const competitionArrayHandle = await page.evaluateHandle(() => {
        const competitionItems = document.querySelectorAll('.competition-current .dropdown-menu.competition-list .dropdown-item a');
        const links = [];

        if (competitionItems.length > 0) {
          const baseUrl = competitionItems[0].getAttribute('href').split("/dettaglio-competizione/")[0] + "/classifica";

          competitionItems.forEach((item) => {
            const dataId = item.getAttribute('data-id');
            if (dataId) {
              const fullLink = `${baseUrl}?id=${dataId}`;
              links.push(fullLink);
            }
          });
        }

        return links;
      });

      const competitionArray = await competitionArrayHandle.jsonValue();
      await competitionArrayHandle.dispose();  // Libera l'handle dopo l'uso

      console.log("Competizioni trovate per questa lega:", competitionArray);

      for (const competition of competitionArray) {
        await page.goto(competition);
        await wait(2000);

        try {
          await page.waitForSelector('a[id="toexcel"]', { visible: true, timeout: 5000 });
          await page.click('a[id="toexcel"]');
          await wait(2000);
        } catch (error) {
          console.log(`'toexcel' link non trovato per ${competition}. Continuo con l'elemento successivo.`);
          continue;
        }
      }
    }

  } catch (error) {
    console.error("Errore durante l'esecuzione dello script:", error);
  } finally {
    await browser.close();
  }
})();

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}