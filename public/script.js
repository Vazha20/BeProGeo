// index.js
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.0/firebase-app.js';
import { getFirestore, collection, getDocs, orderBy, query } from 'https://www.gstatic.com/firebasejs/9.6.0/firebase-firestore.js';
import { getStorage } from 'https://www.gstatic.com/firebasejs/9.6.0/firebase-storage.js';

const firebaseConfig = {
    apiKey: "AIzaSyCVT2eUn2A3YDsFR3IFzQ4AxinF3YgW9o8",
    authDomain: "beprogeo000.firebaseapp.com",
    projectId: "beprogeo000",
    storageBucket: "beprogeo000.appspot.com",
    messagingSenderId: "295763562853",
    appId: "1:295763562853:web:0e3d102badce7e4ad9518c",
    measurementId: "G-6EPR2PT6FK"
  };
  
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);
const storage = getStorage(firebaseApp);

document.addEventListener('DOMContentLoaded', async function () {
    const playerContainer = document.getElementById('playerContainer');
    let playerList = [];

    async function fetchPlayers() {
        const playerCollection = collection(db, 'players');
        const playerQuery = query(playerCollection, orderBy('dateAdded', 'desc'));
        const playerSnapshot = await getDocs(playerQuery);
        playerList = playerSnapshot.docs.map(doc => doc.data());
    }

    function renderPlayers(players) {
        // Clear any existing players from the container
        playerContainer.innerHTML = '';

        // Iterate through the first four players in the array
        for (let i = 0; i < 4 && i < players.length; i++) {
            const player = players[i];
            const playerCard = createPlayerCard(player);
            playerContainer.appendChild(playerCard);
        }
    }

    await fetchPlayers(); // Fetch player data

    renderPlayers(playerList); // Render players
});

function createPlayerCard(player) {
    const playerCard = document.createElement('div');
    playerCard.classList.add('player-card');

    playerCard.innerHTML = `
        <div class="mt-3 border border-warning">
            <img width="300px" height="300px" src="${player.imageUrl}" alt="Player Image">
            <h2 class="mt-3">${player.name}</h2>
            <p class="fw-bold">Position: ${player.position}</p>
        </div>
    `;

    return playerCard;
}
