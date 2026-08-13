const axios = require('axios');

async function getYoutubeInfo(youtubeUrl) {
  const response = await axios.post(
    'https://www.clipto.com/api/youtube',
    { url: youtubeUrl },
    {
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    }
  );

  return response.data;
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

    const data = await getYoutubeInfo(url);

    const videos = (data.medias || []).filter(m => m.type === 'video');
    const audios = (data.medias || []).filter(m => m.type === 'audio');

    return res.status(200).json({
      status: true,
      result: {
        title: data.title,
        duration: data.duration,
        thumbnail: data.thumbnail,
        videos,
        audios,
        raw: data
      }
    });

  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.response?.data?.message || error.message || "Gagal mengambil info YouTube"
    });
  }
};
