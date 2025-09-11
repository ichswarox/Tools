const express = require('express');
const cors = require('cors');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');
const path = require('path');

puppeteer.use(StealthPlugin());

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Create downloads directory if it doesn't exist
const downloadsDir = process.env.DOWNLOADS_DIR || path.resolve(__dirname, '..', '..', 'downloads');
if (!fs.existsSync(downloadsDir)) {
  fs.mkdirSync(downloadsDir, { recursive: true });
}

// Serve static files from the downloads directory
app.use('/downloads', express.static(downloadsDir));

app.get('/api/fetch-html', async (req, res) => {
  const { url } = req.query;

  if (!url) {
    return res.status(400).send('URL is required');
  }

  let browser;
  try {
    browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });
    const content = await page.content();

    // Generate filename from URL
    const urlObject = new URL(url);
    let filename = urlObject.hostname + urlObject.pathname;
    filename = filename.replace(/[^a-zA-Z0-9]/g, '_');
    filename = filename.replace(/_+/g, '_');
    filename = filename.replace(/^_|_$/g, '');
    if (filename === '') {
      filename = 'index';
    }
    filename = filename + '.html';

    // Save to downloads directory
    const outputPath = path.join(downloadsDir, filename);
    console.log(`Saving file to: ${outputPath}`);
    fs.writeFileSync(outputPath, content);

    res.send({ 
      content: content,
      filename: filename,
      path: outputPath,
      downloadUrl: `/downloads/${filename}`
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching URL with Stealth Puppeteer');
  } finally {
    if (browser) {
      await browser.close();
    }
  }
});

app.post('/api/fetch-html-batch', async (req, res) => {
  const { urls } = req.body;

  if (!urls || !Array.isArray(urls) || urls.length === 0) {
    return res.status(400).send('URLs array is required');
  }

  let browser;
  const results = [];
  
  try {
    browser = await puppeteer.launch({ headless: true });
    
    for (const url of urls) {
      try {
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: 'networkidle2' });
        const content = await page.content();

        // Generate filename from URL
        const urlObject = new URL(url);
        let filename = urlObject.hostname + urlObject.pathname;
        filename = filename.replace(/[^a-zA-Z0-9]/g, '_');
        filename = filename.replace(/_+/g, '_');
        filename = filename.replace(/^_|_$/g, '');
        if (filename === '') {
          filename = 'index';
        }
        filename = filename + '.html';

        // Save to downloads directory
        const outputPath = path.join(downloadsDir, filename);
        console.log(`Saving file to: ${outputPath}`);
        fs.writeFileSync(outputPath, content);
        
        results.push({
          url: url,
          filename: filename,
          path: outputPath,
          downloadUrl: `/downloads/${filename}`,
          status: 'success'
        });
      } catch (error) {
        console.error(`Error fetching ${url}:`, error);
        results.push({
          url: url,
          error: error.message,
          status: 'error'
        });
      }
    }

    res.send({ results });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching URLs with Stealth Puppeteer');
  } finally {
    if (browser) {
      await browser.close();
    }
  }
});

app.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
});