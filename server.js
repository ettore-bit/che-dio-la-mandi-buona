const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080;

// CORS headers ESSENZIALI per Stremio
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// ================= MANIFEST =================
const manifest = {
    "id": "community.astemio.proxy",
    "version": "1.0.0",
    "name": "Astemio Proxy",
    "description": "Proxy Stremio su Koyeb",
    "resources": ["stream"],
    "types": ["movie", "series"],
    "catalogs": [],
    "idPrefixes": ["tt"]
};

app.get('/manifest.json', (req, res) => {
    console.log('📄 Manifest request from:', req.ip);
    res.json(manifest);
});

// ================= STREAM =================
app.get('/stream/:type/:id/:extra?.json', (req, res) => {
    const { type, id } = req.params;
    console.log(`🎬 Stream request - Type: ${type}, ID: ${id}`);
    
    // STREAM DI PROVA - Big Buck Bunny
    res.json({
        streams: [{
            "name": "Big Buck Bunny (Prova Proxy)",
            "title": "Video di prova - 720p",
            "url": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
        }]
    });
});

// ================= ROOT - DEVE RESTITUIRE JSON =================
app.get('/', (req, res) => {
    res.json({
        status: 'online',
        service: 'Stremio Proxy',
        version: manifest.version,
        timestamp: new Date().toISOString(),
        endpoints: {
            manifest: '/manifest.json',
            streamPattern: '/stream/:type/:id/:extra?.json',
            example: '/stream/movie/tt12345.json'
        }
    });
});

// ================= AVVIO =================
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Proxy attivo su porta ${PORT}`);
    console.log(`📄 Manifest: http://localhost:${PORT}/manifest.json`);
    console.log(`🌐 URL pubblico: https://rotten-willow-vamenos-d581f563.koyeb.app/`);
});
