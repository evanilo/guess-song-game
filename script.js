
function extractPlaylistId(url) {
  const match = url.match(/playlist\/([a-zA-Z0-9]+)/);
  return match ? match[1] : null;
}

async function startGame() {
  const url = document.getElementById('playlist-url').value;
  const playlistId = extractPlaylistId(url);
  if (!playlistId) return alert('Invalid playlist URL.');


 async function getToken() {
  const res = await fetch('https://bcc66d9c-8741-4fa2-8b14-2d697d4b4ff8-00-3q179tat5johm.janeway.replit.dev/'); 
  const data = await res.json();
  return data.access_token;
}

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
