const axios = require('axios');
const fs = require('fs');

async function debug() {
    try {
        const res = await axios.get('https://duckduckgo.com/html/?q=test', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        console.log(res.data.substring(0, 5000));
        fs.writeFileSync('ddg_debug.html', res.data);
    } catch (e) {
        console.error(e.message);
    }
}
debug();
