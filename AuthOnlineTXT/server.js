const express = require('express');
const path = require('path');
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
  const validUsername = 'admin';
  const validPassword = 'password123';
  
  if (username === validUsername && password === validPassword) {
    next();
  } else {
    res.set('WWW-Authenticate', 'Basic realm="Protected Area"');
    return res.status(401).send('Invalid credentials.');
  }
};

let currentPassword = '';

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

// Generate a new password every 20 seconds
setInterval(() => {
    currentPassword = generatePassword();
}, 20000);

// Initial password generation
currentPassword = generatePassword();

// API endpoint to get the current password as JSON
app.get('/api/password', (req, res) => {
    // Generate a new password when this endpoint is called
    currentPassword = generatePassword();
    res.json({ password: currentPassword });
});

// Endpoint to serve the password as a downloadable text file
app.get('/auth/auth.txt', (req, res) => {
    res.setHeader('Content-disposition', 'attachment; filename=auth.txt');
    res.setHeader('Content-type', 'text/plain');
    res.charset = 'UTF-8';
    res.write(currentPassword);
    res.end();
});

// Apply authentication middleware to all routes except API endpoints
app.use((req, res, next) => {
    // Skip authentication for API endpoints
    if (req.path.startsWith('/api/') || req.path.startsWith('/auth/')) {
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
