module.exports = async (req, res) => {
  try {
    const { url } = req.query || {};

    if (!url) {
      if (res && res.status) {
        return res.status(400).json({
          status: false,
          message: "Parameter 'url' wajib diisi!"
        });
      }
      return { status: false, message: "Parameter 'url' wajib diisi!" };
    }

    const result = await vidsSaveApi.download(url);

    if (res && res.status) {
      return res.status(200).json({
        status: true,
        creator: "febry.is-a.dev",
        result
      });
    }
    return { status: true, creator: "febry.is-a.dev", result };

  } catch (error) {
    if (res && res.status) {
      return res.status(500).json({
        status: false,
        message: error.message || "Internal Server Error"
      });
    }
    throw error;
  }
};
