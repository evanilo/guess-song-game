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

userAccessToken = getTokenFromUrl();
if (userAccessToken) {
  window.localStorage.setItem('spotify_access_token', userAccessToken);
  document.getElementById('login-btn').style.display = 'none';
  document.getElementById('song-container').style.display = 'block';
  window.location.hash = ''; // Clean up URL

  // Now that we have a token, load the SDK
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

// --- Dynamically load the Spotify Web Playback SDK ---
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