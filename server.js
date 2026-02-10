const express = require('express');
const app = express();
const PORT = 8080;

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    next();
});

app.get('/manifest.json', (req, res) => {
    res.json({
        "id": "community.proxy",
        "version": "1.0.0",
        "name": "Proxy Base",
        "resources": ["stream"],
        "types": ["movie", "series"]
    });
});

app.get('/stream/:type/:id/:extra?.json', (req, res) => {
    res.json({
        streams: [{
            "name": "Test Stream",
            "url": "https://example.com/video.mp4"
        }]
    });
});

app.get('/', (req, res) => {
    res.json({ status: 'OK' });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server on port ${PORT}`);
});
