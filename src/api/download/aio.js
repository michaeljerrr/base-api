const axios = require('axios');

class VidsSave {
  constructor() {
    this.baseUrl = "https://api.vidssave.com/api/contentsite_api";
    this.auth = "20250901majwlqo";
    this.domain = "api-ak.vidssave.com";
  }

  async unshortenUrl(url) {
    try {
      if (url.includes('vt.tiktok.com') || url.includes('vm.tiktok.com')) {
        const res = await axios.get(url, {
          maxRedirects: 5,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36'
          }
        });
        return res.request.res.responseUrl || url;
      }
      return url;
    } catch (e) {
      return url;
    }
  }

  async download(rawUrl) {
    if (!rawUrl) throw new Error("URL is required");

    const fullUrl = await this.unshortenUrl(rawUrl);

    const payload = new URLSearchParams({
      auth: this.auth,
      domain: this.domain,
      origin: "source",
      link: fullUrl
    });

    const res = await fetch(`${this.baseUrl}/media/parse`, {
      method: "POST",
      headers: {
        "accept": "*/*",
        "accept-language": "en-US,en;q=0.9,id;q=0.8",
        "cache-control": "no-cache",
        "content-type": "application/x-www-form-urlencoded",
        "origin": "https://vidssave.com",
        "pragma": "no-cache",
        "referer": "https://vidssave.com/",
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36",
        "sec-ch-ua": '"Not)A;Brand";v="99", "Google Chrome";v="127", "Chromium";v="127"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-site"
      },
      body: payload.toString()
    });

    const data = await res.json();
    const resultData = data?.data || data;

    if (resultData?.status_code === "analyze_risk") {
      throw new Error("Server terdeteksi risk/bot oleh provider. Coba gunakan URL lengkap video (bukan shortlink).");
    }

    return resultData;
  }
}

const api = new VidsSave();

module.exports = function(app) {
  app.get('/downloader/aio', async (req, res) => {
    try {
      const { url } = req.query;

      if (!url) {
        return res.status(400).json({
          status: 400,
          creator: "Michael",
          success: false,
          message: "Parameter 'url' wajib diisi."
        });
      }

      const result = await api.download(url);

      res.status(200).json({
        status: 200,
        creator: "OnlyzsMichael",
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
};const VidsSave = class {
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
