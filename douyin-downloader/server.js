const express = require('express');
const cors = require('cors');
const path = require('path');
const axios = require('axios');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// 分析抖音分享链接，提取广告视频链接
app.post('/api/extract', async (req, res) => {
    const { shareInfo } = req.body;
    if (!shareInfo) {
        return res.status(400).json({ error: '请提供分享信息' });
    }

    try {
        console.log('收到的分享信息:', shareInfo);

        // 提取抖音链接 - 支持更多格式
        const urlRegex = /https?:\/\/(?:v\.douyin\.com|www\.douyin\.com|douyin\.com)\/[A-Za-z0-9]+\/?/;
        const urlMatch = shareInfo.match(urlRegex);
        
        if (!urlMatch) {
            return res.status(400).json({ error: '未检测到抖音链接' });
        }
        
        const douyinUrl = urlMatch[0];
        console.log('提取到的抖音链接:', douyinUrl);

        // 调用 douyin.wtf API
        const apiUrl = `https://douyin.wtf/api?url=${encodeURIComponent(douyinUrl)}`;
        console.log('请求API:', apiUrl);
        
        // 添加超时和请求头
        console.log('开始请求 API...');
        const response = await axios.get(apiUrl, {
            timeout: 15000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36',
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'en-US,en;q=0.9',
                'Referer': 'https://douyin.wtf/',
                'Origin': 'https://douyin.wtf',
                'Connection': 'keep-alive'
            },
            validateStatus: function (status) {
                return status >= 200 && status < 500; // Resolve only if status is between 200-499
            }
        });
        console.log('API 响应状态码:', response.status);
        if (response.status !== 200) {
            console.log('API 错误响应:', response.data);
            throw new Error(`API 返回错误状态码: ${response.status}`);
        }
        console.log('API返回数据:', JSON.stringify(response.data, null, 2));

        if (response.data) {
            // 返回所有可用的视频链接
            const videoInfo = {
                message: '解析成功',
                title: response.data.title || '',
                author: response.data.author || '',
                videoPlatform: response.data.platform || 'douyin',
                links: []
            };

            // 收集所有可用的视频链接
            if (response.data.nwm_video_url) videoInfo.links.push(response.data.nwm_video_url);
            if (response.data.wm_video_url) videoInfo.links.push(response.data.wm_video_url);
            if (response.data.video_url) videoInfo.links.push(response.data.video_url);

            if (videoInfo.links.length > 0) {
                res.json(videoInfo);
            } else {
                res.status(500).json({ error: '未找到可用的视频链接' });
            }
        } else {
            res.status(500).json({ error: `API 返回数据格式错误: ${response.status} - ${response.statusText}` });
        }

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: '处理失败: ' + (error?.response?.data?.message || error.message || error) });
    }
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
