const app = require('express')();
const puppeteer = require('puppeteer');


app.listen(5000, () => console.log('Listening on port http://localhost:5000'));


app.get('/page-screenshot', async (req, res) => {

    const browser = await puppeteer.launch();

    const page = await browser.newPage();
    await page.goto('https://medium.com/', {
        waitUntil: 'networkidle2',
    });

    await page.screenshot({
        path: 'images/screenshot.png',
        fullPage: true
    });

    await browser.close();
    res.sendFile(__dirname + '/images/screenshot.png');
})