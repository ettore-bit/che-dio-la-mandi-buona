const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 8080;

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    next();
});

// ================= MANIFEST =================
app.get('/manifest.json', (req, res) => {
    res.json({
        "id": "community.astemio.debug",
        "version": "3.0.0",
        "name": "DEBUG Proxy",
        "resources": ["stream"],
        "types": ["movie", "series"]
    });
});

// ================= DEBUG STREAM HANDLER =================
app.get('/stream/:type/:id/:extra?.json', async (req, res) => {
    const { type, id } = req.params;
    
    console.log(`\n=== DEBUG START per ${id} ===`);
    console.log(`1. Ricevuta richiesta: ${type}/${id}`);
    
    const allStreams = [];
    const errors = [];
    
    // 1. PROVA TORRENTIO CON LOG DETTAGLIATO
    console.log(`2. Provando Torrentio...`);
    try {
        const torrentioUrl = `https://torrentio.strem.fun/stream/${type}/${id}.json`;
        console.log(`   URL: ${torrentioUrl}`);
        
        const startTime = Date.now();
        const response = await axios.get(torrentioUrl, {
            timeout: 15000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Stremio Proxy)'
            }
        });
        const endTime = Date.now();
        
        console.log(`   ✅ Torrentio risponde in ${endTime - startTime}ms`);
        console.log(`   Status: ${response.status}`);
        console.log(`   Content-Type: ${response.headers['content-type']}`);
        
        if (response.data && response.data.streams) {
            console.log(`   Stream trovati: ${response.data.streams.length}`);
            
            // Prendi solo i primi 5 stream per debug
            const torrentioStreams = response.data.streams.slice(0, 5).map((s, i) => ({
                "name": `Torrentio ${i+1}: ${s.name || s.title || 'Stream'}`,
                "title": `${s.title || `Stream ${i+1}`} (${s.seeds || 0} seeds)`,
                "url": s.url,
                "source": "Torrentio",
                "behaviorHints": s.behaviorHints || {}
            }));
            
            allStreams.push(...torrentioStreams);
            
            // Log dettagliato di ogni stream
            torrentioStreams.forEach((s, i) => {
                console.log(`     ${i+1}. ${s.name}`);
                console.log(`        URL: ${s.url.substring(0, 60)}...`);
            });
            
        } else {
            console.log(`   ⚠️  Torrentio: data.streams non esistente`);
            errors.push('Torrentio: struttura dati inattesa');
        }
        
    } catch (error) {
        console.log(`   ❌ Torrentio errore: ${error.code || error.message}`);
        console.log(`   Dettaglio: ${error.response?.status || 'N/A'}`);
        errors.push(`Torrentio: ${error.message}`);
    }
    
    // 2. ARCHIVE.ORG (solo per film specifici)
    console.log(`3. Provando Archive.org...`);
    const archiveFilms = {
        "tt0013442": "Nosferatu (1922)",
        "tt0017136": "Metropolis (1927)",
        "tt0033467": "Citizen Kane (1941)"
    };
    
    if (archiveFilms[id]) {
        console.log(`   ✅ Film trovato in Archive.org: ${archiveFilms[id]}`);
        allStreams.push({
            "name": `Archive: ${archiveFilms[id]}`,
            "title": `${archiveFilms[id]} - Pubblico Dominio`,
            "url": `https://archive.org/download/${archiveFilms[id].replace(/[^a-zA-Z0-9]/g, '')}`,
            "source": "Archive.org"
        });
    } else {
        console.log(`   ⏭️  Film ${id} non in Archive.org database`);
    }
    
    // 3. RISULTATO FINALE
    console.log(`\n=== RISULTATO FINALE ===`);
    console.log(`Stream totali: ${allStreams.length}`);
    console.log(`Errori: ${errors.length > 0 ? errors.join(', ') : 'Nessuno'}`);
    
    if (allStreams.length === 0) {
        console.log(`⚠️  NESSUNO STREAM TROVATO, uso emergency fallback`);
        console.log(`   Film cercato: ${id}`);
        console.log(`   Suggerimento: prova tt0111161 (The Shawshank Redemption)`);
        
        // FALLBACK INTELLIGENTE - non Big Buck Bunny!
        const suggestions = {
            "tt0068646": "Prova anche tt0071562 (The Godfather Part II)",
            "tt0133093": "Prova anche tt0234215 (The Matrix Reloaded)",
            "default": "Prova: tt0111161 (Shawshank), tt0076759 (Star Wars)"
        };
        
        allStreams.push({
            "name": "DEBUG: Nessuno stream trovato",
            "title": `Per ${id} - ${suggestions[id] || suggestions.default}`,
            "url": "",
            "source": "Debug Info",
            "behaviorHints": { "notWebReady": true }
        });
    }
    
    console.log(`=== DEBUG END ===\n`);
    
    res.json({ streams: allStreams });
});

// ================= HEALTH CHECK =================
app.get('/', (req, res) => {
    res.json({
        status: 'online',
        proxy: 'DEBUG Mode',
        test_urls: [
            "/stream/movie/tt0068646.json → The Godfather",
            "/stream/movie/tt0111161.json → Shawshank Redemption", 
            "/stream/movie/tt0013442.json → Nosferatu (Archive.org)"
        ]
    });
});

// ================= START =================
app.listen(PORT, '0.0.0.0', () => {
    console.log(`
🔍 DEBUG PROXY ATTIVO
📍 Porta: ${PORT}
📊 Log dettagliati abilitati
🎬 Test consigliati:
   - tt0111161 (Shawshank) - dovrebbe funzionare
   - tt0068646 (Godfather) - debug dettagliato
   - tt0013442 (Nosferatu) - Archive.org
    `);
});
