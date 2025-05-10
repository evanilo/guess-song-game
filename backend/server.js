require('dotenv').config();
const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());



function extractPlaylistId(url) {
  const match = url.match(/playlist\/([a-zA-Z0-9]+)/);
  return match ? match[1] : null;
}

const cors = require('cors');
app.use(cors({
  origin: 'https://yourusername.github.io' // Replace with your GitHub Pages URL
}));

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function getSpotifyToken() {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + Buffer.from(clientId + ':' + clientSecret).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'grant_type=client_credentials'
  });
  const data = await response.json();
  return data.access_token;
}

app.post('/api/spotify-playlist', async (req, res) => {
  const { playlistUrl } = req.body;
  const playlistId = extractPlaylistId(playlistUrl);
  if (!playlistId) return res.status(400).json({ error: 'Invalid playlist URL' });

  try {
    const token = await getSpotifyToken();
    const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching data from Spotify');
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});