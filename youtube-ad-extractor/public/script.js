document.addEventListener('DOMContentLoaded', () => {
    const extractBtn = document.getElementById('extract-btn');
    const debugInput = document.getElementById('debug-input');
    const resultsContainer = document.getElementById('results-container');

    extractBtn.addEventListener('click', async () => {
        const debugText = debugInput.value;
        if (!debugText.trim()) {
            resultsContainer.innerHTML = '<p class="message">输入框不能为空。</p>';
            return;
        }

        try {
            const response = await fetch('/extract', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ debugText })
            });

            if (!response.ok) {
                throw new Error('Server returned an error.');
            }

            const data = await response.json();
            displayResults(data.links);

        } catch (error) {
            console.error('Error:', error);
            resultsContainer.innerHTML = '<p class="message" style="color: red;">提取失败，请检查网络连接或服务器状态。</p>';
        }
    });

    function displayResults(links) {
        resultsContainer.innerHTML = ''; // 清空之前的结果

        if (links && links.length > 0) {
            const title = document.createElement('h3');
            title.textContent = '提取到的广告链接：';
            
            const list = document.createElement('ul');
            links.forEach(link => {
                const listItem = document.createElement('li');
                const anchor = document.createElement('a');
                anchor.href = link;
                anchor.textContent = link;
                anchor.target = '_blank'; // 在新标签页打开链接
                anchor.rel = 'noopener noreferrer';
                listItem.appendChild(anchor);
                list.appendChild(listItem);
            });

            resultsContainer.appendChild(title);
            resultsContainer.appendChild(list);
        } else {
            resultsContainer.innerHTML = '<p class="message">未在提供的信息中找到广告视频链接。</p>';
        }
    }
});