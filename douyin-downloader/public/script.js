document.getElementById('extractBtn').onclick = async function() {
    const shareInfo = document.getElementById('shareInfo').value;
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = '正在提取...';
    try {
        const res = await fetch('/api/extract', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ shareInfo })
        });
        const data = await res.json();
        if (data.links && data.links.length > 0) {
            resultDiv.innerHTML = '<b>提取到的链接：</b><br>' + data.links.map(l => `<a href="${l}" target="_blank">${l}</a>`).join('<br>');
        } else {
            resultDiv.innerHTML = '未提取到广告视频链接。';
        }
    } catch (err) {
        resultDiv.innerHTML = '提取失败，请重试。';
    }
};
