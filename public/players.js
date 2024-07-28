import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.0/firebase-app.js';
import { getFirestore, collection, addDoc, getDocs, orderBy, query } from 'https://www.gstatic.com/firebasejs/9.6.0/firebase-firestore.js';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'https://www.gstatic.com/firebasejs/9.6.0/firebase-storage.js';

// Firebase project configuration
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
    const playerForm = document.getElementById('playerForm');
    const seeMoreButton = document.getElementById('seeMoreButton');
    let playerList = [];
    let nextPageStartIndex = 0;
    let remainingCards = 0;

    // Function to render player cards
    function renderPlayer(player) {
        const playerCard = createPlayerCard(player);
        playerContainer.appendChild(playerCard);
    }

    // Function to fetch player data from Firestore
    async function fetchPlayers() {
        const playerCollection = collection(db, 'players');
        const playerQuery = query(playerCollection, orderBy('dateAdded', 'desc')); // Order by dateAdded in descending order
        const playerSnapshot = await getDocs(playerQuery);
        playerList = playerSnapshot.docs.map(doc => doc.data());
        remainingCards = playerList.length;
    }

    // Function to handle form submission
    async function handleSubmit(event) {
        event.preventDefault();
        const name = document.getElementById('name').value;
        const position = document.getElementById('position').value;
        const imageFile = document.getElementById('image').files[0];

        try {
            const imageRef = ref(storage, `images/${imageFile.name}`);
            await uploadBytes(imageRef, imageFile);
            const imageUrl = await getDownloadURL(imageRef);

            await addDoc(collection(db, 'players'), {
                name: name,
                position: position,
                imageUrl: imageUrl,
                dateAdded: new Date() // Add current date as dateAdded
            });

            // Clear the form after submission
            playerForm.reset();

            // Display success popup
            displayPopup('Player added successfully!', true);

            // Reload the page after a short delay
            setTimeout(() => {
                location.reload();
            }, 1000); // 2 seconds

        } catch (error) {
            console.error("Error adding player:", error);
            // Display error popup
            displayPopup('Error adding player. Please try again later.', false);
        }
    }

    // Event listener for form submission
    playerForm.addEventListener('submit', handleSubmit);

    // Function to handle pagination
    function handlePagination() {
        const scrollPosition = window.innerHeight + window.pageYOffset;
        if (scrollPosition >= document.body.scrollHeight && remainingCards > 0) {
            const cardsToLoad = Math.min(remainingCards, 12); // Load either remaining cards or maximum 12 cards
            const nextPage = playerList.slice(nextPageStartIndex, nextPageStartIndex + cardsToLoad); 
            nextPage.forEach(player => renderPlayer(player));
            nextPageStartIndex += cardsToLoad;
            remainingCards -= cardsToLoad;
        }
    }

    window.addEventListener('scroll', handlePagination);

    seeMoreButton.addEventListener('click', function () {
        const cardsToLoad = Math.min(remainingCards, 12); // Load either remaining cards or maximum 12 cards
        const nextPage = playerList.slice(nextPageStartIndex, nextPageStartIndex + cardsToLoad); 
        nextPage.forEach(player => renderPlayer(player));
        nextPageStartIndex += cardsToLoad;
        remainingCards -= cardsToLoad;
    });

    // Fetch initial player data
    await fetchPlayers();

    // Render initial player items
    const initialCardsToLoad = Math.min(remainingCards, 12); // Load either remaining cards or maximum 12 cards initially
    const initialPlayers = playerList.slice(0, initialCardsToLoad);
    initialPlayers.forEach(player => renderPlayer(player));
});

// Function to create a player card element
function createPlayerCard(player) {
    const playerCard = document.createElement('div');
    playerCard.classList.add('player-card');

    // Add player details to the card
    playerCard.innerHTML = `
        <div class="mt-3 border border-warning">
            <img width="300px" height="300px" src="${player.imageUrl}" alt="Player Image">
            <h2 class="mt-3">${player.name}</h2>
            <p class="fw-bold">Position: ${player.position}</p>
        </div>
    `;

    return playerCard;
}

// Function to display a popup notification
function displayPopup(message, isSuccess) {
    const popup = document.createElement('div');
    popup.classList.add('popup');
    popup.textContent = message;
    popup.classList.add(isSuccess ? 'success' : 'error');

    document.body.appendChild(popup);

    // Remove the popup after a certain duration
    setTimeout(() => {
        popup.remove();
    }, 1000); // 2 seconds
}
