const axios = require('axios'); // AGGIUNGI QUESTA RIGA IN ALTO

// ================= STREAM HANDLER PER STREAMVIX =================
app.get('/stream/:type/:id/:extra?.json', async (req, res) => {
    const { type, id } = req.params;
    console.log(`🎬 StreamVix request - Type: ${type}, ID: ${id}`);
    
    try {
        // 1. CERCA SU STREAMVIX (esempio con TMDB ID)
        const searchResponse = await axios.get(
            `https://streamvix.vercel.app/api/search?q=${id}&type=${type}`
        );
        
        // 2. PRENDI IL PRIMO RISULTATO
        const streamvixData = searchResponse.data;
        if (!streamvixData || streamvixData.length === 0) {
            return res.json({ streams: [] });
        }
        
        const firstResult = streamvixData[0];
        
        // 3. OTTIENI GLI STREAM DA STREAMVIX
        const streamResponse = await axios.get(
            `https://streamvix.vercel.app/api/streams/${firstResult.id}?type=${type}`
        );
        
        // 4. TRASFORMA IN FORMATO STREMIO
        const stremioStreams = streamResponse.data.streams.map((stream, index) => ({
            "name": `StreamVix ${stream.quality || 'HD'}`,
            "title": `${stream.title || 'Stream'} - ${stream.quality || 'Unknown'}`,
            "url": stream.url,
            "behaviorHints": {
                "notWebReady": true,
                "bingeGroup": `streamvix-${id}-${index}`
            }
        }));
        
        // 5. RESTITUISCI A STREMIO
        res.json({ streams: stremioStreams });
        
    } catch (error) {
        console.error('❌ StreamVix error:', error.message);
        // Fallback al video di prova
        res.json({
            streams: [{
                "name": "Big Buck Bunny (Fallback)",
                "title": "Video di prova - 720p",
                "url": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
            }]
        });
    }
});
