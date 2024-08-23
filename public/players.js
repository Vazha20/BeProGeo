import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.0/firebase-app.js';
import { getFirestore, collection, addDoc, getDocs, orderBy, query, doc, updateDoc, getDoc, deleteDoc } from 'https://www.gstatic.com/firebasejs/9.6.0/firebase-firestore.js';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'https://www.gstatic.com/firebasejs/9.6.0/firebase-storage.js';
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
    const loadingIcon = document.getElementById('loadingIcon');
    let playerList = [];
    let currentPhotoId = null;

    function renderPlayer(player) {
        const playerCard = createPlayerCard(player);
        playerContainer.appendChild(playerCard);
    }

    async function fetchPlayers() {
        const playerCollection = collection(db, 'players');
        const playerQuery = query(playerCollection, orderBy('dateAdded', 'desc'));
        const playerSnapshot = await getDocs(playerQuery);
        playerList = playerSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
        playerContainer.innerHTML = '';
        playerList.forEach(player => renderPlayer(player));
    }

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
                dateAdded: new Date()
            });

            playerForm.reset();
            displayPopup('Player added successfully!', true);

            setTimeout(() => {
                fetchPlayers();
            }, 1000);

        } catch (error) {
            console.error("Error adding player:", error);
            displayPopup('Error adding player. Please try again later.', false);
        }
    }

    playerForm.addEventListener('submit', handleSubmit);

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
                ${currentUser ? `
                    <button class="edit-btn" data-id="${player.id}">
                        <img width="50px" src="./src/img/edit-button.png">
                    </button>
                    <button class="delete-btn" data-id="${player.id}">
                        <img width="50px" src="./src/img/delete.png">
                    </button>
                ` : ''}
            </div>
        `;

        playerCard.querySelector('.edit-btn')?.addEventListener('click', () => openEditForm(player));
        playerCard.querySelector('.delete-btn')?.addEventListener('click', () => deletePlayer(player.id));
        return playerCard;
    }

    async function openEditForm(player) {
        editFormContainer.style.display = 'block';
        document.getElementById('editPlayerId').value = player.id;
        document.getElementById('editName').value = player.name;
        document.getElementById('editPosition').value = player.position;
        document.getElementById('editCurrentClub').value = player.currentClub;
    }

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

            const playerRef = doc(db, 'players', playerId);
            const playerDoc = await getDoc(playerRef);
            const currentPlayerData = playerDoc.data();
            const currentImageUrl = currentPlayerData.imageUrl;

            if (imageUrl && imageUrl !== currentImageUrl) {
                if (currentImageUrl) {
                    const oldImageRef = ref(storage, currentImageUrl);
                    await deleteObject(oldImageRef);
                }

                await updateDoc(playerRef, {
                    imageUrl: imageUrl,
                    name: name,
                    position: position,
                    currentClub: currentClub,
                    dateUpdated: new Date()
                });

                displayPopup('Player updated successfully!', true);
            } else {
                await updateDoc(playerRef, {
                    name: name,
                    position: position,
                    currentClub: currentClub,
                    dateUpdated: new Date()
                });

                displayPopup('Player updated successfully!', true);
            }

            setTimeout(() => {
                location.reload();
            }, 1000);

        } catch (error) {
            console.error("Error updating player:", error);
            displayPopup('Error updating player. Please try again later.', false);
        }
    });

    async function deletePlayer(playerId) {
        const confirmDelete = confirm('Are you sure you want to delete this player?');
        if (!confirmDelete) return;

        try {
            const playerDocRef = doc(db, 'players', playerId);
            const playerDoc = await getDoc(playerDocRef);
            const playerData = playerDoc.data();
            const imageUrl = playerData.imageUrl;

            await deleteDoc(playerDocRef);

            if (imageUrl) {
                const imageRef = ref(storage, imageUrl);
                try {
                    await getDownloadURL(imageRef);
                    await deleteObject(imageRef);
                } catch (err) {
                    if (err.code === 'storage/object-not-found') {
                        console.warn('File does not exist in storage:', imageUrl);
                    } else {
                        throw err;
                    }
                }
            }

            displayPopup('Player deleted successfully!', true);

            setTimeout(() => {
                location.reload();
            }, 1000);

        } catch (error) {
            console.error("Error deleting player:", error);
            displayPopup('Error deleting player. Please try again later.', false);
        }
    }

    document.getElementById('closeEditForm').addEventListener('click', () => {
        editFormContainer.style.display = 'none';
    });

    function displayPopup(message, isSuccess) {
        const popup = document.createElement('div');
        popup.classList.add('popup');
        popup.textContent = message;
        popup.classList.add(isSuccess ? 'success' : 'error');

        document.body.appendChild(popup);

        setTimeout(() => {
            popup.remove();
        }, 1000);
    }

    fetchPlayers();
});

function loadPlayers() {
    setTimeout(function () {
        const loadingIcon = document.getElementById("loadingIcon");
        if (loadingIcon) {
            loadingIcon.style.display = "none";
        }
        playerContainer.style.display = "block";
    }, 1000);
}

window.onload = function () {
    loadPlayers();
};