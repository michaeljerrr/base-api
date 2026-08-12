const axios = require('axios');

async function analyzePinterestProfile(username) {
    const cleanUsername = username.replace('@', '').trim();
    const targetUrl = `https://pinout.in/api/profile-analyze?username=${encodeURIComponent(cleanUsername)}`;

    const headers = {
        'accept': '*/*',
        'accept-language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
        'cache-control': 'no-cache',
        'pragma': 'no-cache',
        'referer': `https://pinout.in/pinterest-profile-analyzer/${cleanUsername}`,
        'sec-ch-ua': '"Chromium";v="139", "Not;A=Brand";v="99"',
        'sec-ch-ua-mobile': '?1',
        'sec-ch-ua-platform': '"Android"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
        'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36'
    };

    const response = await axios.get(targetUrl, { headers });
    return response.data;
}

module.exports = async (req, res) => {
    try {
        const username = req.query.username || req.query.user || req.query.q;

        if (!username) {
            return res.status(400).json({
                status: false,
                message: "Parameter 'username' wajib diisi!"
            });
        }

        const data = await analyzePinterestProfile(username);

        return res.status(200).json({
            status: true,
            result: data
        });

    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.response?.data?.message || error.message || "Gagal mengambil profil Pinterest"
        });
    }
};
