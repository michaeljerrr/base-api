const axios = require('axios');

async function igExportScrape(targetUrl) {
  const encodedUrl = encodeURIComponent(targetUrl);
  const apiUrl = `https://igexport.com/api/ig-reels/?url=${encodedUrl}`;

  const headers = {
    'User-Agent': 'Mozilla/5.0 (Android 14; Mobile; rv:153.0) Gecko/153.0 Firefox/153.0',
    'Referer': 'https://igexport.com/id/video-download/',
    'Accept': 'application/json, text/plain, */*'
  };

  const { data } = await axios.get(apiUrl, { headers });
  return data;
}

module.exports = async (req, res) => {
  try {
    const url = req.query.url || req.query.q;

    if (!url) {
      return res.status(400).json({
        status: false,
        message: "Parameter 'url' wajib diisi!"
      });
    }

    const data = await igExportScrape(url);

    if (data && data.ok && data.media) {
      return res.status(200).json({
        status: true,
        result: {
          video: data.media.videoUrl,
          thumbnail: data.media.thumbnailUrl,
          filename: data.media.filename,
          raw: data
        }
      });
    }

    return res.status(400).json({
      status: false,
      message: "Gagal mengambil media Instagram."
    });

  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.response?.data?.message || error.message || "Gagal memproses request"
    });
  }
};
