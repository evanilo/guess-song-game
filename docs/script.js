let playlistData = null;
let player = null;
let deviceId = null;
let userAccessToken = null;

const BACKEND_URL = 'https://guess-song-game.onrender.com';

const clientId = '541189a56c27485e8b5178568f346eba';
const redirectUri = 'https://evanilo.github.io/guess-song-game/';

const scopes = [
  'streaming',
  'user-read-email',
  'user-read-private',
  'user-modify-playback-state',
  'user-read-playback-state'
];

// --- Spotify Login ---
document.getElementById('login-btn').addEventListener('click', () => {
  const authUrl =
    'https://accounts.spotify.com/authorize' +
    '?response_type=token' +
    '&client_id=' + encodeURIComponent(clientId) +
    '&scope=' + encodeURIComponent(scopes.join(' ')) +
    '&redirect_uri=' + encodeURIComponent(redirectUri);
  window.location = authUrl;
});
// --- Parse access token from URL after redirect ---
function getTokenFromUrl() {
  const hash = window.location.hash.substring(1);
  const params = {};
  hash.split('&').forEach(param => {
    const [key, value] = param.split('=');
    params[key] = value;
  });
  return params.access_token;
}

function loadSpotifySDK() {
  if (window.Spotify) {
    window.onSpotifyWebPlaybackSDKReady();
    return;
  }
  window.onSpotifyWebPlaybackSDKReady = () => {
    player = new Spotify.Player({
      name: 'Guess the Song Game',
      getOAuthToken: cb => { cb(userAccessToken); },
      volume: 0.5
    });

    player.addListener('ready', ({ device_id }) => {
      deviceId = device_id;
      console.log('Ready with Device ID', device_id);
    });

    player.addListener('initialization_error', ({ message }) => { console.error(message); });
    player.addListener('authentication_error', ({ message }) => { console.error(message); });
    player.addListener('account_error', ({ message }) => { console.error(message); });
    player.addListener('playback_error', ({ message }) => { console.error(message); });

    player.connect();
  };
  const script = document.createElement('script');
  script.src = 'https://sdk.scdn.co/spotify-player.js';
  script.async = true;
  document.body.appendChild(script);
}

// --- Handle login state and load SDK only after login ---
userAccessToken = getTokenFromUrl();
if (userAccessToken) {
  window.localStorage.setItem('spotify_access_token', userAccessToken);
  document.getElementById('login-btn').style.display = 'none';
  document.getElementById('song-container').style.display = 'block';
  window.location.hash = ''; // Clean up URL
  loadSpotifySDK();
} else {
  userAccessToken = window.localStorage.getItem('spotify_access_token');
  if (userAccessToken) {
    document.getElementById('login-btn').style.display = 'none';
    document.getElementById('song-container').style.display = 'block';
    loadSpotifySDK();
  } else {
    document.getElementById('login-btn').style.display = 'inline-block';
    document.getElementById('song-container').style.display = 'none';
  }
}

// --- Fetch playlist from backend ---
document.getElementById('choose-playlist-btn').addEventListener('click', async () => {
  const playlistUrl = document.getElementById('playlist-url').value;
  if (!playlistUrl) {
    alert('Please enter a playlist URL.');
    return;
  }
  const response = await fetch(`${BACKEND_URL}/api/spotify-playlist`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ playlistUrl }),
  });

  if (!response.ok) {
    alert('Failed to fetch playlist. Check the URL and your backend.');
    return;
  }
  playlistData = await response.json();

  // Show cover image
  const coverDiv = document.getElementById('playlist-cover');
  coverDiv.innerHTML = '';
  if (playlistData.images && playlistData.images.length > 0) {
    const img = document.createElement('img');
    img.src = playlistData.images[0].url;
    img.style.maxWidth = '200px';
    coverDiv.appendChild(img);
  }

  document.getElementById('start-game-btn').style.display = 'inline-block';
});

// --- Start Game ---
document.getElementById('start-game-btn').addEventListener('click', startGame);

async function startGame() {
  if (!playlistData || !playlistData.tracks || !playlistData.tracks.items) return;

  // Filter tracks with a Spotify URI (all tracks should have this)
  const itemsWithUri = playlistData.tracks.items.filter(item => item.track && item.track.uri);
  if (itemsWithUri.length === 0) {
    document.getElementById('song-info').innerText = 'No playable songs available in this playlist.';
    document.getElementById('choices').innerHTML = '';
    return;
  }
  // Pick a random track
  const trackObj = itemsWithUri[Math.floor(Math.random() * itemsWithUri.length)].track;

  // Play the track using Spotify SDK
  await playTrack(trackObj.uri);

  // Show album cover for the song
  const songInfoDiv = document.getElementById('song-info');
  songInfoDiv.innerHTML = '';
  if (trackObj.album && trackObj.album.images && trackObj.album.images.length > 0) {
    const img = document.createElement('img');
    img.src = trackObj.album.images[0].url;
    img.style.maxWidth = '150px';
    songInfoDiv.appendChild(img);
  }

  // Add choices (1 correct + 3 random)
  const allTracks = itemsWithUri.map(item => item.track.name);
  const choicesSet = new Set([trackObj.name]);
  while (choicesSet.size < 4 && allTracks.length > 1) {
    const random = allTracks[Math.floor(Math.random() * allTracks.length)];
    choicesSet.add(random);
  }
  const choices = Array.from(choicesSet).sort(() => Math.random() - 0.5);

  const choicesDiv = document.getElementById('choices');
  choicesDiv.innerHTML = '';
  choices.forEach(choice => {
    const button = document.createElement('button');
    button.textContent = choice;
    button.addEventListener('click', () => checkAnswer(choice, trackObj.name));
    choicesDiv.appendChild(button);
  });
}

// --- Play track using Spotify Web Playback SDK ---
async function playTrack(trackUri) {
  if (!userAccessToken || !deviceId) {
    alert('Spotify player not ready or user not logged in.');
    return;
  }
  await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
    method: 'PUT',
    body: JSON.stringify({ uris: [trackUri] }),
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${userAccessToken}`
    }
  });
}

// --- Check answer ---
function checkAnswer(choice, correctAnswer) {
  if (choice === correctAnswer) {
    alert('Correct!');
  } else {
    alert('Incorrect, try again!');
  }
}
