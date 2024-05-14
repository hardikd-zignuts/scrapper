const app = require('express')();
const puppeteer = require('puppeteer');


app.listen(5000, () => console.log('Listening on port http://localhost:5000'));


app.get('/profile', async (req, res) => {

    const browser = await puppeteer.launch();

    try {
        const page = await browser.newPage();
        await page.goto('https://medium.com/@anisurrahmanbup/about', {
            waitUntil: 'networkidle2',
        });
        await page.waitForSelector('.pw-follower-count');

        // Extracting the text content
        const followerCountElement = await page.$('.pw-follower-count');
        const followerCountText = await page.evaluate(element => element.textContent, followerCountElement);

        await browser.close();

        // Sending the extracted text in the response
        res.send(followerCountText);
    } catch (error) {
        console.error('Error:', error);
        await browser.close();
        res.status(500).send('Internal Server Error');
    }
})