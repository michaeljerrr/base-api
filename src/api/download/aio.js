const VidsSave = class {
  constructor() {
    this.baseUrl = "https://api.vidssave.com/api/contentsite_api";
    this.auth = "20250901majwlqo";
    this.domain = "api-ak.vidssave.com";
  }

  async download(url) {
    if (!url) throw new Error("URL is required");

    const payload = new URLSearchParams({
      auth: this.auth,
      domain: this.domain,
      origin: "source",
      link: url
    });

    const res = await fetch(`${this.baseUrl}/media/parse`, {
      method: "POST",
      headers: {
        accept: "*/*",
        "accept-language": "id-ID",
        "cache-control": "no-cache",
        "content-type": "application/x-www-form-urlencoded",
        origin: "https://vidssave.com",
        pragma: "no-cache",
        referer: "https://vidssave.com/",
        "user-agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Mobile Safari/537.36"
      },
      body: payload.toString()
    });

    const data = await res.json();
    return data?.data || data;
  }
};

const api = new VidsSave();

module.exports = function(app) {
  app.get('/downloader/aio', async (req, res) => {
    try {
      const { url } = req.query;

      if (!url) {
        return res.status(400).json({
          status: 400,
          creator: "OnlyzsMichael",
          success: false,
          message: "Parameter 'url' wajib diisi."
        });
      }

      const result = await api.download(url);

      res.status(200).json({
        status: 200,
        creator: "Michael",
        success: true,
        results: result
      });
    } catch (error) {
      res.status(500).json({
        status: 500,
        creator: "OnlyzsMichael",
        success: false,
        message: error.message || "Gagal mengunduh media."
      });
    }
  });
};
