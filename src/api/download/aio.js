const path = require('path');
const fs = require('fs');

class VidsSave {
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
}

const vidsSaveApi = new VidsSave();

module.exports = async (req, res) => {
  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({
        status: false,
        message: "Parameter 'url' wajib diisi!"
      });
    }

    const result = await vidsSaveApi.download(url);

    return res.status(200).json({
      status: true,
      creator: "febry.is-a.dev",
      result
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Server Error"
    });
  }
};
