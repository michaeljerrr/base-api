const axios = require('axios');
const cheerio = require('cheerio');
const qs = require('qs');

const baseUrl = 'https://spotidown.app';
const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

async function getSession() {
  const res = await axios.get(`${baseUrl}/en3`, {
    headers: {
      'User-Agent': userAgent,
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9'
    }
  });

  const cookie = (res.headers['set-cookie'] || [])
    .map(v => v.split(';')[0])
    .join('; ');

  const $ = cheerio.load(res.data);
  let dynamicName = '';
  let dynamicValue = '';

  $('form[name="spotifyurl"] input[type="hidden"]').each((_, el) => {
    const name = $(el).attr('name');
    const value = $(el).attr('value');
    if (name && name !== 'g-recaptcha-response') {
      dynamicName = name;
      dynamicValue = value;
    }
  });

  return { cookie, dynamicName, dynamicValue };
}

async function searchSpotify(query) {
  const { cookie, dynamicName, dynamicValue } = await getSession();
  const payload = { url: query, 'g-recaptcha-response': '' };
  if (dynamicName) payload[dynamicName] = dynamicValue;

  const res = await axios.post(`${baseUrl}/action`, qs.stringify(payload), {
    headers: {
      'User-Agent': userAgent,
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'Origin': baseUrl,
      'Referer': `${baseUrl}/en3`,
      'X-Requested-With': 'XMLHttpRequest',
      'Cookie': cookie
    }
  });

  if (res.data?.error) throw new Error(res.data.message || 'Search Spotify gagal');

  const $ = cheerio.load(res.data?.data || '');
  const results = [];

  $('form[name="submitspurl"]').each((_, el) => {
    const data = $(el).find('input[name="data"]').val();
    if (!data) return;

    try {
      const meta = JSON.parse(Buffer.from(data, 'base64').toString());
      results.push({
        title: meta.name || null,
        artist: meta.artist || null,
        album: meta.album || null,
        duration: meta.duration || null,
        cover: meta.cover || null,
        date: meta.date || null,
        tid: meta.tid || null,
        spotifyUrl: meta.tid ? `https://open.spotify.com/track/${meta.tid}` : null
      });
    } catch {}
  });

  return results;
}

async function downloadSpotify(url) {
  const { cookie, dynamicName, dynamicValue } = await getSession();
  const payload = { url, 'g-recaptcha-response': '' };
  if (dynamicName) payload[dynamicName] = dynamicValue;

  const search = await axios.post(`${baseUrl}/action`, qs.stringify(payload), {
    headers: {
      'User-Agent': userAgent,
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'Origin': baseUrl,
      'Referer': `${baseUrl}/en3`,
      'Cookie': cookie,
      'X-Requested-With': 'XMLHttpRequest'
    }
  });

  if (search.data?.error) throw new Error(search.data.message || 'Gagal mengambil lagu');

  const $ = cheerio.load(search.data?.data || '');
  const form = {
    data: $('input[name="data"]').val(),
    base: $('input[name="base"]').val(),
    token: $('input[name="token"]').val()
  };

  if (!form.data) throw new Error('Gagal mengambil data lagu');

  let metadata;
  try {
    metadata = JSON.parse(Buffer.from(form.data, 'base64').toString());
  } catch {
    throw new Error('Gagal membaca metadata lagu');
  }

  const dl = await axios.post(`${baseUrl}/action/track`, qs.stringify(form), {
    headers: {
      'User-Agent': userAgent,
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'Origin': baseUrl,
      'Referer': `${baseUrl}/en3`,
      'Cookie': cookie,
      'X-Requested-With': 'XMLHttpRequest'
    }
  });

  if (dl.data?.error) throw new Error(dl.data.message || 'Download lagu gagal');

  const $$ = cheerio.load(dl.data?.data || '');
  let mp3 = null;
  let cover = null;

  $$('a').each((_, el) => {
    const href = $$(el).attr('href');
    const text = $$(el).text().trim().toLowerCase();

    if (text.includes('download mp3') || text.includes('download audio')) mp3 = href;
    if (text.includes('download cover')) cover = href;
  });

  return {
    title: metadata.name || null,
    artist: metadata.artist || null,
    album: metadata.album || null,
    duration: metadata.duration || null,
    cover: cover || metadata.cover || null,
    date: metadata.date || null,
    spotify: metadata.tid ? `https://open.spotify.com/track/${metadata.tid}` : url,
    download: mp3
  };
}

module.exports = function(app) {
  app.get('/search/spotify', async (req, res) => {
    try {
      const { query, url } = req.query;

      if (!query && !url) {
        return res.status(400).json({
          status: 400,
          creator: "OnlyzsMichael",
          success: false,
          message: "Parameter 'query' atau 'url' wajib diisi."
        });
      }

      let spotifyUrl = url;
      let searchData = null;

      if (!spotifyUrl) {
        const searchResults = await searchSpotify(query);
        if (!searchResults.length) {
          return res.status(404).json({
            status: 404,
            creator: "OnlyzsMichael",
            success: false,
            message: "Lagu tidak ditemukan."
          });
        }
        searchData = searchResults[0];
        spotifyUrl = searchData.spotifyUrl;
      }

      const downloadResult = await downloadSpotify(spotifyUrl);

      res.status(200).json({
        status: 200,
        creator: "Michael",
        success: true,
        results: {
          search: searchData,
          download: downloadResult
        }
      });
    } catch (error) {
      res.status(500).json({
        status: 500,
        creator: "OnlyzsMichael",
        success: false,
        message: error.message || "Terjadi kesalahan pada server."
      });
    }
  });
};
