const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080;

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

const manifest = {
    "id": "community.astemio.proxy",
    "version": "1.0.0",
    "name": "Astemio Proxy V3",
    "description": "Proxy Stremio su Koyeb",
    "resources": ["stream"],
    "types": ["movie", "series"],
    "catalogs": [],
    "idPrefixes": ["tt"]
};

app.get('/manifest.json', (req, res) => {
    res.json(manifest);
});

app.get('/stream/:type/:id/:extra?.json', (req, res) => {
    res.json({
        streams: [{
            "title": "Prova Proxy",
            "url": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
        }]
    });
});

app.get('/', (req, res) => {
    res.send('✅ Proxy Online');
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server on port ${PORT}`);
});
