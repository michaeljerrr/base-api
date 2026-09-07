const axios = require('axios');

module.exports = function(app) {
    async function getWaifuBuffer() {
        try {
            const { data } = await axios.get('https://api.waifu.im/images', {
                params: {
                    isNsfw: 'false',
                    isAnimated: 'false',
                    orderBy: 'random',
                    orientation: 'portrait',
                    pageSize: '1',
                    includedTags: 'waifu'
                },
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'Zaxius-API/1.0.0'
                }
            });

            if (!data.items || data.items.length === 0) {
                throw new Error('Gambar tidak ditemukan');
            }

            const imageUrl = data.items[0].url;
            const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
            
            return {
                buffer: Buffer.from(response.data),
                contentType: response.headers['content-type'] || 'image/jpeg'
            };
        } catch (error) {
            throw error;
        }
    }

    app.get('/image/waifu', async (req, res) => {
        try {
            const { buffer, contentType } = await getWaifuBuffer();
            res.writeHead(200, {
                'Content-Type': contentType,
                'Content-Length': buffer.length,
            });
            res.end(buffer);
        } catch (error) {
            res.status(500).send(`Error: ${error.message}`);
        }
    });
};
