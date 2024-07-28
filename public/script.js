// index.js
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.0/firebase-app.js';
import { getFirestore, collection, getDocs, orderBy, query } from 'https://www.gstatic.com/firebasejs/9.6.0/firebase-firestore.js';
import { getStorage } from 'https://www.gstatic.com/firebasejs/9.6.0/firebase-storage.js';

const firebaseConfig = {
    apiKey: "AIzaSyCCx0pKzt3VsZucnm6aVvqNoKiypo7JHhs",
    authDomain: "beprogeo-4d59a.firebaseapp.com",
    databaseURL: "https://beprogeo-4d59a-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "beprogeo-4d59a",
    storageBucket: "beprogeo-4d59a.appspot.com",
    messagingSenderId: "1099323304654",
    appId: "1:1099323304654:web:f257908db4e0585fc4fe9f",
    measurementId: "G-8TLZTTLN5E"
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
