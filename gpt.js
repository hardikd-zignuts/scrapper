const express = require('express');
const cors = require('cors');
const app = express();
const puppeteer = require('puppeteer');

app.listen(5000, () => console.log('Listening on port http://localhost:5000'));
app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
    res.send('Hello World!');
})

app.post('/chat', async (req, res) => {
    if (!req.body.prompt) {
        return res.sendStatus(400);
    }

    const browser = await puppeteer.launch({
        headless: true,
        executablePath: 'https://drive.google.com/uc?export=download&id=1mmfNb44QroCrImR-2FHSIujjwamp9Lmy',
        
    });
    try {
        const page = await browser.newPage();
        await page.goto('https://chatgpt.com/', {
            waitUntil: 'networkidle2',
        });

        // Wait for the textarea to be ready and then type text into it
        await page.waitForSelector('#prompt-textarea');
        await page.type('#prompt-textarea', req.body.prompt);

        // Wait for the send button to be ready and then click it
        await page.waitForSelector('[data-testid="send-button"]');
        await page.click('[data-testid="send-button"]');

        // Wait for 1 second after clicking the button
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Wait for the send button to reappear
        await page.waitForSelector('[data-testid="send-button"]');

        // Extract the content of the specified div
        const messageContent = await page.evaluate(() => {
            const div = document.querySelector('[data-message-author-role="assistant"]');
            return div ? div.innerText : null;
        });

        // Close the browser
        await browser.close();

        // Sending the extracted content in the response
        res.send(messageContent ? messageContent : 'Content not found.');
    } catch (error) {
        console.error('Error:', error);
        await browser.close();
        res.status(500).send('Internal Server Error');
    }
});