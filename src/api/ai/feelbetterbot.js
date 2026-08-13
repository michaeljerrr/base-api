const axios = require("axios");

async function feelBetterChat(userPrompt, systemPrompt) {
  const defaultSystem = "Hi, I'm FeelBetterBot — I'm here to listen and help you through whatever's on your mind, drawing on real tools that can make a difference. I’m not here to judge or rush you; just to be present with whatever you bring, one step at a time. How are you doing today?";

  const { data } = await axios.post(
    "https://feelbetterbot.com/",
    {
      messages: [
        {
          role: "assistant",
          content: systemPrompt || defaultSystem
        },
        {
          role: "user",
          content: userPrompt
        }
      ]
    },
    {
      headers: {
        "Content-Type": "application/json",
        Accept: "text/event-stream",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"
      },
      responseType: "text"
    }
  );

  return data.trim();
}

module.exports = async (req, res) => {
  try {
    const message = req.query.message || req.query.q || req.query.text;
    const system = req.query.system || req.query.context || req.query.prompt;

    if (!message) {
      return res.status(400).json({
        status: false,
        message: "Parameter 'message' atau 'text' wajib diisi!"
      });
    }

    const resultMessage = await feelBetterChat(message, system);

    return res.status(200).json({
      status: true,
      result: {
        message: resultMessage
      }
    });

  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.response?.data || error.message || "Gagal memproses request ke FeelBetterBot AI"
    });
  }
};
