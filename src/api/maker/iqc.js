const axios = require('axios');

async function getIqcImage(text) {
    const targetUrl = `https://api.nexray.eu.cc/maker/iqc?text=${encodeURIComponent(text)}`;

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
        const text = req.query.text || req.query.teks || req.query.q;

        if (!text) {
            return res.status(400).json({
                status: false,
                message: "Parameter 'text' wajib diisi!"
            });
        }

        const { buffer, contentType } = await getIqcImage(text);

        res.setHeader('Content-Type', contentType);
        return res.send(buffer);

    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message || "Gagal membuat gambar IQC"
        });
    }
};
