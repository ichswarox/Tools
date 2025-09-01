
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

const bookmarksFilePath = './bookmarks.json';

// Helper function to read bookmarks from the file
const readBookmarks = () => {
  const bookmarksData = fs.readFileSync(bookmarksFilePath);
  return JSON.parse(bookmarksData);
};

// Helper function to write bookmarks to the file
const writeBookmarks = (bookmarks) => {
  fs.writeFileSync(bookmarksFilePath, JSON.stringify(bookmarks, null, 2));
};

// API endpoint to get all bookmarks
app.get('/api/bookmarks', (req, res) => {
  const bookmarks = readBookmarks();
  res.json(bookmarks);
});

// API endpoint to add a new bookmark
app.post('/api/bookmarks', (req, res) => {
  const bookmarks = readBookmarks();
  const newBookmark = {
    id: Date.now(),
    name: req.body.name,
    url: req.body.url,
  };
  bookmarks.push(newBookmark);
  writeBookmarks(bookmarks);
  res.json(newBookmark);
});

// API endpoint to delete a bookmark
app.delete('/api/bookmarks/:id', (req, res) => {
  const bookmarks = readBookmarks();
  const bookmarkId = parseInt(req.params.id, 10);
  const updatedBookmarks = bookmarks.filter((bookmark) => bookmark.id !== bookmarkId);
  writeBookmarks(updatedBookmarks);
  res.json({ message: 'Bookmark deleted successfully' });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
