const axios = require('axios');

(async () => {
    try {
        await axios.get('https://www.google.com');
        console.log('Google is reachable');
    } catch (e) {
        console.error('Google failed:', e.message);
    }

    try {
        await axios.get('https://logo.clearbit.com/google.com');
        console.log('Clearbit is reachable');
    } catch (e) {
        console.error('Clearbit failed:', e.message);
    }
})();
