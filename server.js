const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const youtubedl = require('yt-dlp-exec');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.post('/api/download', async (req, res) => {
  const { url, format } = req.body;

  if (!url) return res.status(400).send('Missing URL');
  if (!['mp3', 'mp4'].includes(format)) return res.status(400).send('Invalid format');

  try {
    const filename = `video-${Date.now()}.${format}`;
    const filepath = path.join(__dirname, 'downloads', filename);

    const options = {
      output: filepath,
      format: format === 'mp3' ? 'bestaudio' : 'bestvideo+bestaudio/best',
      mergeOutputFormat: format === 'mp4' ? 'mp4' : undefined,
      extractAudio: format === 'mp3',
      audioFormat: format === 'mp3' ? 'mp3' : undefined,
    };

    console.log('Downloading:', url);
    await youtubedl(url, options);

    res.download(filepath, filename, err => {
      fs.unlink(filepath, () => {});
      if (err) console.error('Download error:', err);
    });

  } catch (error) {
    console.error(error);
    res.status(500).send('Failed to download');
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
