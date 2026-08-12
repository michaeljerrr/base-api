const axios = require("axios");

async function urlboxRender(url) {
  const { data } = await axios.post(
    "https://urlbox.com/api/render",
    {
      url,
      width: 1440,
      height: 1024,
      full_page: true,
      selector: "",
      dark_mode: true,
      hide_cookie_banners: true,
      format: "png"
    },
    {
      headers: {
        "Content-Type": "application/json"
      }
    }
  );

  return data;
}

module.exports = async (req, res) => {
  try {
    const targetUrl = req.query.url || req.query.q;

    if (!targetUrl) {
      return res.status(400).json({
        status: false,
        message: "Parameter 'url' wajib diisi!"
      });
    }

    const result = await urlboxRender(targetUrl);

    if (result && result.renderUrl) {
      const imageResponse = await axios.get(result.renderUrl, {
        responseType: "arraybuffer"
      });

      res.setHeader("Content-Type", "image/png");
      return res.send(Buffer.from(imageResponse.data));
    }

    return res.status(200).json({
      status: true,
      result
    });

  } catch (err) {
    return res.status(500).json({
      status: false,
      message: err.response?.data?.message || err.message || "Gagal mengambil screenshot website"
    });
  }
};
