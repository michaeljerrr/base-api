const axios = require('axios');

async function getRandomLoImage() {
    const targetUrl = 'https://api.nexray.eu.cc/random/loli';

    const response = await axios.get(targetUrl, {
        responseType: 'arraybuffer',
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
    });

    return {
        buffer: Buffer.from(response.data),
        contentType: response.headers['content-type'] || 'image/png'
    };
}

module.exports = async (req, res) => {
    try {
        const { buffer, contentType } = await getRandomLoImage();

        res.setHeader('Content-Type', contentType);
        return res.send(buffer);

    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message || "Gagal mengambil gambar random"
        });
    }
};
