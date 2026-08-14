const { generateIQC } = require('iqc-canvas');

async function IQCMaker(teks, waktu, options = {}) {
  if (!teks) throw new Error('Teks wajib diisi');

  const result = await generateIQC(teks, waktu || '21:22', {
    reply: options.replyText ? {
      sender: options.replySender || 'Anda',
      text: options.replyText
    } : undefined,
    reactionEmojis: options.reactionEmojis || ['👍', '❤️', '😂', '😮', '😢', '🙏', '🤦'],
    showPlusBtn: options.showPlusBtn !== false
  });

  return result.image;
}

module.exports = async (req, res) => {
  try {
    const teks = req.query.teks || req.query.text || req.query.q;
    const waktu = req.query.waktu || req.query.time;
    const replysender = req.query.replysender || req.query.replySender;
    const replytext = req.query.replytext || req.query.replyText;

    if (!teks) {
      return res.status(400).json({
        status: false,
        message: "Parameter 'teks' wajib diisi!"
      });
    }

    const imageBuffer = await IQCMaker(teks, waktu, {
      replySender: replysender,
      replyText: replytext
    });

    res.setHeader("Content-Type", "image/png");
    return res.send(imageBuffer);

  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message || "Gagal membuat gambar IQC"
    });
  }
};
