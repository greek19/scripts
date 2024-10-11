const { log } = require('console');
const puppeteer = require('puppeteer');

(async () => {
  // Imposta le tue credenziali
  const username = 'Braciolaoca'
  const password = '15marzo82'

  // Avvia il browser
  const browser = await puppeteer.launch({ headless: false })
  const page = await browser.newPage()

  // Naviga alla pagina della classifica
  // await page.goto('https://leghe.fantacalcio.it/fantamanager-italia/classifica');
  await page.goto('https://leghe.fantacalcio.it/login')

  // Attendi il caricamento e clicca su "Accedi"
 // await page.waitForSelector('a[href*="login"]', { visible: true });
  // await page.click('a[href*="login"]');

  // Compila il modulo di login
  await page.waitForSelector('input[formcontrolname="username"]', { visible: true })
  await page.type('input[formcontrolname="username"]', username)
  await page.type('input[formcontrolname="password"]', password)

  // Invia il modulo
  await page.keyboard.press('Enter')
  await page.waitForNavigation()


  let lista = [
    'https://leghe.fantacalcio.it/fantamanager-italia/classifica',
    'https://leghe.fantacalcio.it/fantamanager-italia/classifica?id=47',
    'https://leghe.fantacalcio.it/fantamanager-italia/classifica?id=60',
    'https://leghe.fantacalcio.it/fantamanager-italia/classifica?id=69',
    'https://leghe.fantacalcio.it/fantamanager-italia/classifica?id=143667',
    'https://leghe.fantacalcio.it/fantamanager-italia/classifica?id=143716',
    'https://leghe.fantacalcio.it/fantamanager-italia/classifica?id=143690'
  ]

  let contatore = 0
  for (const item of lista) {
    await page.goto(item);
    
    if(contatore === 0){
      await page.click('button[id="pt-accept-all"]')
    }
    await page.waitForSelector('a[id="toexcel"]', { visible: true });
    await page.click('a[id="toexcel"]');
    contatore =1 
    await wait(4000);
  }


})();

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
