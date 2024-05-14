const app = require('express')();
const { default: axios } = require('axios');
const puppeteer = require('puppeteer');
const fs = require('fs').promises; // Import the fs module for file operations


app.listen(5000, () => console.log('Listening on port http://localhost:5000'));


app.get('/', async (req, res) => {

    const browser = await puppeteer.launch({
        defaultViewport: null,
        headless: true,
    });


    const page = await browser.newPage();
    await page.goto('https://www.instagram.com/deepakmdtg/', {
        waitUntil: 'networkidle2',
    });
    await new Promise(resolve => setTimeout(resolve, 5000));

    await page.screenshot({
        path: 'images/screenshot.png',
        fullPage: true
    });

    await browser.close();
    res.sendFile(__dirname + '/images/screenshot.png');
})

// Define a route for '/details'
app.get('/details', async (req, res) => {

    const username = 'akash'
    try {
        // Launch a headless browser using Puppeteer
        const browser = await puppeteer.launch({
            defaultViewport: null,
            headless: true,
        });

        // Create a new page in the browser
        const page = await browser.newPage();

        // Navigate to the Instagram profile
        await page.goto(`https://www.instagram.com/${username}/`, {
            waitUntil: 'networkidle2',
        });

        // Wait for the profile picture using the first alt tag
        await page.waitForSelector('img[alt="deepakmdtg\'s profile picture"]', { timeout: 5000 }).catch(() => { });

        // Extract the image URL using page.evaluate
        let imageUrl = await page.evaluate(() => {
            const imgElement = document.querySelector('img[alt="deepakmdtg\'s profile picture"]');
            if (imgElement) {
                return imgElement.src; // Return the image URL
            }
            return null; // Return null if image element is not found
        });

        // If image URL is not found, try with the second alt tag
        if (!imageUrl) {
            await page.waitForSelector('img[alt="Profile photo"]');
            imageUrl = await page.evaluate(() => {
                const imgElement = document.querySelector('img[alt="Profile photo"]');
                if (imgElement) {
                    return imgElement.src; // Return the image URL
                }
                return null; // Return null if image element is not found
            });
        }

        // Wait for the specified elements to be available on the page
        await page.waitForSelector('._acan._acao._acat._aj1-._ap30');
        // Use page.evaluate to interact with the DOM
        const elementsContent = await page.evaluate(() => {
            const elements = document.querySelectorAll('._acan._acao._acat._aj1-._ap30');
            if (elements.length > 0) {
                // Log the elements and their HTML content
                const contentArray = [];
                elements.forEach((element) => {
                    const nestedSpan = element.querySelector('span.html-span');
                    if (nestedSpan) {
                        const innerText = nestedSpan.innerText;
                        const number = innerText.match(/\d+/); // Extract numbers using regex
                        if (number) {
                            contentArray.push(number[0]); // Add extracted number to the array
                        }
                    }
                });
                return contentArray; // Return the array of extracted numbers
            }
            return null; // Return null if no elements are found
        });

        // Close the browser
        await browser.close();
        if (imageUrl) {
            // Get the image buffer using axios
            const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
            const buffer = Buffer.from(response.data, 'binary');

            // Save the buffer as an image file locally
            await fs.writeFile('profile-picture.jpg', buffer);
        } else {
            console.log('Image URL not found');
        }
        // Send the response with the extracted numbers as JSON
        res.json({ elementsContent, imageUrl } || { error: 'Numbers not found' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
});