import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.0/firebase-app.js';
import { getFirestore, collection, addDoc, getDocs, orderBy, query, doc, updateDoc, getDoc } from 'https://www.gstatic.com/firebasejs/9.6.0/firebase-firestore.js';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'https://www.gstatic.com/firebasejs/9.6.0/firebase-storage.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.6.0/firebase-auth.js';

// Firebase project configuration
const firebaseConfig = {
    apiKey: "AIzaSyD3Y5hZ7STv-ku8swbiIal2BbiVg2NL9Mo",
    authDomain: "beprogeo0000.firebaseapp.com",
    projectId: "beprogeo0000",
    storageBucket: "beprogeo0000.appspot.com",
    messagingSenderId: "1035485616827",
    appId: "1:1035485616827:web:120ab8f45ef1da7e97a79e",
    measurementId: "G-J87E24LTGG"
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);
const storage = getStorage(firebaseApp);
const auth = getAuth(firebaseApp);

let currentUser = null;

onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
    } else {
        currentUser = null;
    }
});

document.addEventListener('DOMContentLoaded', async function () {
    const playerContainer = document.getElementById('playerContainer');
    const playerForm = document.getElementById('playerForm');
    const editFormContainer = document.getElementById('editFormContainer');
    const loadingIcon = document.getElementById('loadingIcon'); // Add reference to loading icon
    let playerList = [];
    let currentPhotoId = null;

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
        playerList = playerSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
    }

    // Function to handle form submission
    async function handleSubmit(event) {
        event.preventDefault();
        const name = document.getElementById('name').value;
        const position = document.getElementById('position').value;
        const currentClub = document.getElementById('currentClub').value;
        const imageFile = document.getElementById('image').files[0];

        try {
            const imageRef = ref(storage, `images/${imageFile.name}`);
            await uploadBytes(imageRef, imageFile);
            const imageUrl = await getDownloadURL(imageRef);

            await addDoc(collection(db, 'players'), {
                name: name,
                position: position,
                currentClub: currentClub,
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
            }, 1000); // 1 second

        } catch (error) {
            console.error("Error adding player:", error);
            // Display error popup
            displayPopup('Error adding player. Please try again later.', false);
        }
    }

    // Event listener for form submission
    playerForm.addEventListener('submit', handleSubmit);

    // Function to create a player card element
    function createPlayerCard(player) {
        const playerCard = document.createElement('div');
        playerCard.classList.add('player-card');

        playerCard.innerHTML = `
            <div class="mt-3 borderColor">
                <img width="264px" height="264px" src="${player.imageUrl}" alt="Player Image">
                <h4 class="p-1">${player.name}</h4>
                <hr class="line-yellow">
                <p class="fw-bold p-1">Position: ${player.position}</p>
                <p class="fw-bold p-1">Current Club: ${player.currentClub}</p>
                ${currentUser ? `<button class="edit-btn" data-id="${player.id}"><img width="50px" src="./src/img/edit-button.png"></button>` : ''}
            </div>
        `;

        playerCard.querySelector('.edit-btn')?.addEventListener('click', () => openEditForm(player));
        return playerCard;
    }

    document.getElementById('closeEditForm').addEventListener('click', () => {
        editFormContainer.style.display = 'none';
    });

    // Function to open the edit form with player data
    async function openEditForm(player) {
        editFormContainer.style.display = 'block';
        document.getElementById('editPlayerId').value = player.id;
        document.getElementById('editName').value = player.name;
        document.getElementById('editPosition').value = player.position;
        document.getElementById('editCurrentClub').value = player.currentClub;
    }

    // Function to handle edit form submission
    document.getElementById('editPlayerForm').addEventListener('submit', async function (event) {
        event.preventDefault();

        const playerId = document.getElementById('editPlayerId').value;
        const name = document.getElementById('editName').value;
        const position = document.getElementById('editPosition').value;
        const currentClub = document.getElementById('editCurrentClub').value;
        const imageFile = document.getElementById('editImage').files[0];

        try {
            let imageUrl = null;

            if (imageFile) {
                const imageRef = ref(storage, `images/${imageFile.name}`);
                await uploadBytes(imageRef, imageFile);
                imageUrl = await getDownloadURL(imageRef);
            }

            // Fetch current player data to check existing imageUrl
            const playerRef = doc(db, 'players', playerId);
            const playerDoc = await getDoc(playerRef);
            const currentPlayerData = playerDoc.data();

            // Ensure we don't delete the current photo before changing it
            const currentImageUrl = currentPlayerData.imageUrl;

            // If a new image is uploaded and it's different from the current one, proceed
            if (imageUrl && imageUrl !== currentImageUrl) {
                // Upload new image and update player document
                await updateDoc(playerRef, {
                    imageUrl: imageUrl,
                    name: name,
                    position: position,
                    currentClub: currentClub,
                    dateUpdated: new Date() // Optional: track when the player profile was updated
                });

                displayPopup('Player updated successfully!', true);
            } else {
                // No new image uploaded or same image, just update other fields
                await updateDoc(playerRef, {
                    name: name,
                    position: position,
                    currentClub: currentClub,
                    dateUpdated: new Date() // Optional: track when the player profile was updated
                });

                displayPopup('Player updated successfully!', true);
            }

            setTimeout(() => {
                location.reload();
            }, 1000); // 1 second

        } catch (error) {
            console.error("Error updating player:", error);
            displayPopup('Error updating player. Please try again later.', false);
        }
    });

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
        }, 1000); // 1 second
    }

    // Fetch initial player data and render all cards
    loadingIcon.style.display = 'block'; // Show loading icon
    await fetchPlayers();
    playerList.forEach(player => renderPlayer(player));
    loadingIcon.style.display = 'none'; // Hide loading icon when done

    // Event listener to close the edit form
    document.getElementById('closeEditForm').addEventListener('click', () => {
        editFormContainer.style.display = 'none';
    });
});
