const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = 3009;

// 添加基本身份验证中间件
const auth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    res.set('WWW-Authenticate', 'Basic realm="Protected Area"');
    return res.status(401).send('Authentication required.');
  }
  
  const [authType, encodedCredentials] = authHeader.split(' ');
  if (authType !== 'Basic') {
    return res.status(401).send('Unsupported authentication type.');
  }
  
  const [username, password] = Buffer.from(encodedCredentials, 'base64')
    .toString()
    .split(':');
  
  // 设置您的用户名和密码
  const validUsername = 'neoxu';
  const validPassword = 'ADy8Y';
  
  if (username === validUsername && password === validPassword) {
    next();
  } else {
    res.set('WWW-Authenticate', 'Basic realm="Protected Area"');
    return res.status(401).send('Invalid credentials.');
  }
};

let currentPassword = '';
let lastPasswordChange = Date.now();

// Function to generate a random alphanumeric password
function generatePassword() {
    const length = 3;
    const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    for (let i = length; i > 0; --i) {
        result += chars[Math.floor(Math.random() * chars.length)];
    }
    console.log(`New password generated: ${result}`);
    return result;
}

// Generate a new password every 30 seconds
setInterval(() => {
    currentPassword = generatePassword();
    lastPasswordChange = Date.now();
}, 30000);

// Initial password generation
currentPassword = generatePassword();
lastPasswordChange = Date.now();

// API endpoint to get the current password as JSON
app.get('/api/password', (req, res) => {
    // Return the current password and next refresh time
    const nextRefresh = lastPasswordChange + 30000;
    res.json({ 
        password: currentPassword,
        nextRefresh: nextRefresh
    });
});

// Endpoint to serve the password as a downloadable text file
app.get('/auth/auth.txt', (req, res) => {
    res.setHeader('Content-disposition', 'attachment; filename=auth.txt');
    res.setHeader('Content-type', 'text/plain');
    res.charset = 'UTF-8';
    res.write(currentPassword);
    res.end();
});

// API endpoint to list available downloads
app.get('/api/downloads', (req, res) => {
    const downloadsDir = path.join(__dirname, 'downloads');
    
    fs.readdir(downloadsDir, (err, files) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to list downloads' });
        }
        
        // Filter out directories, only include files
        const fileDetails = files.filter(file => {
            return fs.statSync(path.join(downloadsDir, file)).isFile();
        }).map(file => {
            const filePath = path.join(downloadsDir, file);
            const stats = fs.statSync(filePath);
            return {
                name: file,
                size: stats.size,
                modified: stats.mtime
            };
        });
        
        res.json({ files: fileDetails });
    });
});

// Serve static files from the downloads directory (publicly accessible)
app.use('/downloads', express.static(path.join(__dirname, 'downloads')));

// Apply authentication middleware to all routes except API endpoints and downloads
app.use((req, res, next) => {
    // Skip authentication for API endpoints and downloads
    if (req.path.startsWith('/api/') || req.path.startsWith('/auth/') || req.path.startsWith('/downloads/')) {
        return next();
    }
    // Apply authentication to all other routes
    return auth(req, res, next);
});

// Serve static files from the Vue app's 'dist' directory
app.use(express.static(path.join(__dirname, 'frontend', 'dist')));

// Handle all other routes by serving the Vue app's index.html
app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'dist', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
