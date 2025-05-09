async function getToken() {
  const clientId = 'YOUR_CLIENT_ID';
  const clientSecret = 'YOUR_CLIENT_SECRET';

  const result = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + btoa(clientId + ':' + clientSecret)
    },
    body: 'grant_type=client_credentials'
  });

  const data = await result.json();
  return data.access_token;
}

function extractPlaylistId(url) {
  const match = url.match(/playlist\/([a-zA-Z0-9]+)/);
  return match ? match[1] : null;
}

async function startGame() {
  const url = document.getElementById('playlist-url').value;
  const playlistId = extractPlaylistId(url);
  if (!playlistId) return alert('Invalid playlist URL.');

  const token = await getToken();
  const res = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=50`, {
    headers: { Authorization: 'Bearer ' + token }
  });
  const data = await res.json();
  const tracks = data.items.filter(item => item.track.preview_url);

  if (tracks.length < 4) {
    alert('Playlist must have at least 4 songs with previews!');
    return;
  }

  startRound(tracks);
}

function startRound(tracks) {
  const correct = tracks[Math.floor(Math.random() * tracks.length)];
  const choices = [correct];

  while (choices.length < 4) {
    const rand = tracks[Math.floor(Math.random() * tracks.length)];
    if (!choices.includes(rand)) choices.push(rand);
  }

  shuffle(choices);

  document.getElementById('audio-player').src = correct.track.preview_url;

  const container = document.getElementById('choices');
  container.innerHTML = '';

  choices.forEach(choice => {
    const btn = document.createElement('button');
    btn.textContent = `${choice.track.name} - ${choice.track.artists[0].name}`;
    btn.onclick = () => {
      alert(choice === correct ? 'Correct!' : 'Wrong!');
      startRound(tracks);
    };
    container.appendChild(btn);
  });
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}
