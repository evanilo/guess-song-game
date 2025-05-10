let playlistData = null;
let audio = null;

const BACKEND_URL = 'https://guess-song-game.onrender.com';

document.getElementById('choose-playlist-btn').addEventListener('click', async () => {
  const playlistUrl = document.getElementById('playlist-url').value;
  const response = await fetch(`${BACKEND_URL}/api/spotify-playlist`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ playlistUrl }),
  });
  if (!response.ok) {
    alert('Failed to fetch playlist. Check the URL and your backend token.');
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



  

document.getElementById('start-game-btn').addEventListener('click', startGame);

function startGame() {
  if (!playlistData || !playlistData.tracks || !playlistData.tracks.items) return;
  // Filter tracks with a preview_url
  const itemsWithPreview = playlistData.tracks.items.filter(item => item.track && item.track.preview_url);
  if (itemsWithPreview.length === 0) {
    document.getElementById('song-info').innerText = 'No songs with preview available in this playlist.';
    document.getElementById('choices').innerHTML = '';
    return;
  }
  const trackObj = itemsWithPreview[Math.floor(Math.random() * itemsWithPreview.length)].track;

  // Play 30s preview
  if (audio) {
    audio.pause();
    audio.remove();
  }
  audio = document.createElement('audio');
  audio.src = trackObj.preview_url;
  audio.controls = true;
  audio.autoplay = true;
  audio.style.display = 'block';
  document.getElementById('song-info').innerHTML = '';
  document.getElementById('song-info').appendChild(audio);

  // Add choices (improve this logic as needed)
  const choices = [trackObj.name, "Another Song", "Different Song", "Random Song"];
  const choicesDiv = document.getElementById('choices');
  choicesDiv.innerHTML = '';
  choices.forEach(choice => {
    const button = document.createElement('button');
    button.textContent = choice;
    button.addEventListener('click', () => checkAnswer(choice, trackObj.name));
    choicesDiv.appendChild(button);
  });
}

function checkAnswer(choice, correctAnswer) {
  if (choice === correctAnswer) {
    alert('Correct!');
  } else {
    alert('Incorrect, try again!');
  }
}