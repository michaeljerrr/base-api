const axios = require("axios");
const cheerio = require("cheerio");

async function searchLyrics(query) {
    const url = `https://www.lyrics.com/lyrics/${encodeURIComponent(query)}`;

    const { data } = await axios.get(url, {
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
    });

    const $ = cheerio.load(data);
    const results = [];

    $(".sec-lyric.clearfix").each((_, el) => {
        const title = $(el).find(".lyric-meta-title a").text().trim();
        const artist = $(el)
            .find(".lyric-meta-artists a, .lyric-meta-album-artist a")
            .first()
            .text()
            .trim();
        const path = $(el).find(".lyric-meta-title a").attr("href");
        const lyrics = $(el)
            .find(".lyric-body")
            .text()
            .replace(/\s+\n/g, "\n")
            .trim();

        if (title) {
            results.push({
                title,
                artist,
                url: path ? `https://www.lyrics.com${path}` : null,
                snippet: lyrics
            });
        }
    });

    return results;
}

module.exports = async (req, res) => {
    try {
        const query = req.query.q || req.query.query;

        if (!query) {
            return res.status(400).json({
                status: false,
                message: "Parameter 'q' atau 'query' wajib diisi!"
            });
        }

        const result = await searchLyrics(query);

        return res.status(200).json({
            status: true,
            total: result.length,
            result
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message || "Gagal mengambil data lirik"
        });
    }
};
