
const express = require('express');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());

app.get('/getThumbnail', (req, res) => {
  const youtubeUrl = req.query.url;
  if (!youtubeUrl) {
    return res.status(400).send('URL is required');
  }

  let videoId;
  try {
    const url = new URL(youtubeUrl);
    if (url.hostname === 'youtu.be') {
      videoId = url.pathname.slice(1);
    } else {
      videoId = url.searchParams.get('v');
    }
  } catch (error) {
    return res.status(400).send('Invalid URL');
  }


  if (!videoId) {
    return res.status(400).send('Invalid YouTube URL');
  }

  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  res.send({ thumbnailUrl });
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
