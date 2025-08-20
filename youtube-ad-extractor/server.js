const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware to parse JSON bodies and serve static files
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

/**
 * 核心提取逻辑
 * @param {string} debugText - 从 YouTube "Stats for nerds" 复制的完整文本
 * @returns {string[]} - 提取到的广告视频链接数组
 */
function extractAdLinks(debugText) {
    if (!debugText || typeof debugText !== 'string') {
        return [];
    }

    const adLinks = [];
    const foundIds = new Set(); // 使用Set避免重复

    // 多种可能的广告相关字段模式
    const patterns = [
        /"addocid":\s*"([^"]+)"/g,            // "addocid": "VIDEO_ID"
        /"adcontent_v":\s*"([^"]+)"/g,        // "adcontent_v": "VIDEO_ID"
        /"addebug_videoId":\s*"([^"]+)"/g,    // "addebug_videoId": "VIDEO_ID"
        /"ad_docid":\s*"([^"]+)"/g,           // "ad_docid": "VIDEO_ID"
        /"ad_video_id":\s*"([^"]+)"/g,        // "ad_video_id": "VIDEO_ID"
        /"advertisingVideoId":\s*"([^"]+)"/g, // "advertisingVideoId": "VIDEO_ID"
        /"adVideoId":\s*"([^"]+)"/g,          // "adVideoId": "VIDEO_ID"
        /Ad video ID:\s*([A-Za-z0-9_-]{11})/g, // Ad video ID: VIDEO_ID (纯文本格式)
        /广告视频 ID[：:]\s*([A-Za-z0-9_-]{11})/g, // 中文格式
        /"videoId":\s*"([A-Za-z0-9_-]{11})"[^}]*"isAd":\s*true/g, // videoId配合isAd标志
    ];

    // 通用YouTube视频ID模式 (11位字符)
    const youtubeIdPattern = /([A-Za-z0-9_-]{11})/g;

    patterns.forEach(pattern => {
        let match;
        while ((match = pattern.exec(debugText)) !== null) {
            const videoIds = match[1].split(',');
            videoIds.forEach(id => {
                const trimmedId = id.trim();
                if (trimmedId && trimmedId.length === 11 && !foundIds.has(trimmedId)) {
                    foundIds.add(trimmedId);
                    adLinks.push(`https://www.youtube.com/watch?v=${trimmedId}`);
                }
            });
        }
    });

    // 如果上面的特定模式都没找到，尝试查找所有可能的YouTube视频ID
    // 然后根据上下文判断是否为广告
    if (adLinks.length === 0) {
        let match;
        while ((match = youtubeIdPattern.exec(debugText)) !== null) {
            const videoId = match[1];
            // 检查这个ID周围是否有广告相关的关键词
            const contextStart = Math.max(0, match.index - 100);
            const contextEnd = Math.min(debugText.length, match.index + 100);
            const context = debugText.substring(contextStart, contextEnd).toLowerCase();
            
            if (context.includes('ad') || context.includes('广告') || 
                context.includes('advertisement') || context.includes('promoted')) {
                if (!foundIds.has(videoId)) {
                    foundIds.add(videoId);
                    adLinks.push(`https://www.youtube.com/watch?v=${videoId}`);
                }
            }
        }
    }

    return adLinks;
}

// API endpoint to handle the extraction request
app.post('/extract', (req, res) => {
    const { debugText } = req.body;

    if (!debugText) {
        return res.status(400).json({ error: 'Debug information cannot be empty.' });
    }

    const links = extractAdLinks(debugText);
    res.json({ links });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});