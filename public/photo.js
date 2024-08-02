import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.0/firebase-app.js';
import { getFirestore, collection, addDoc, getDocs, orderBy, query, doc, getDoc, updateDoc } from 'https://www.gstatic.com/firebasejs/9.6.0/firebase-firestore.js';
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
    currentUser = user || null;
});

document.addEventListener('DOMContentLoaded', async function () {
    const photoContainer = document.getElementById('photoContainer');
    const photoForm = document.getElementById('photoForm');
    const editFormContainer = document.getElementById('editFormContainer');
    const editPhotoForm = document.getElementById('editPhotoForm');
    const closeEditFormBtn = document.getElementById('closeEditForm');
    let photoList = [];
    let currentPhotoId = null;

    function renderPhoto(photo, id) {
        const photoCard = createPhotoCard(photo, id);
        photoContainer.appendChild(photoCard);
    }

    async function fetchPhotos() {
        const photoCollection = collection(db, 'photo');
        const photoQuery = query(photoCollection, orderBy('dateAdded', 'desc'));
        const photoSnapshot = await getDocs(photoQuery);
        photoList = photoSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
    }

    async function handleSubmit(event) {
        event.preventDefault();
        const title = document.getElementById('title').value.trim();
        const text = document.getElementById('text').value.trim();
        const imageFile = document.getElementById('photo').files[0];

        if (!title || !text || !imageFile) {
            displayPopup('Please fill in all fields and select an image.', false);
            return;
        }

        try {
            const imageRef = ref(storage, `images/${imageFile.name}`);
            await uploadBytes(imageRef, imageFile);
            const imageUrl = await getDownloadURL(imageRef);

            await addDoc(collection(db, 'photo'), {
                title: title,
                text: text,
                imageUrl: imageUrl,
                dateAdded: new Date()
            });

            photoForm.reset();
            displayPopup('Photo added successfully!', true);

            setTimeout(() => {
                location.reload();
            }, 1000); // Refresh after 1 second

        } catch (error) {
            console.error("Error adding photo:", error);
            displayPopup('Error adding photo. Please try again later.', false);
        }
    }

    photoForm.addEventListener('submit', handleSubmit);

    await fetchPhotos();
    photoList.forEach(photo => renderPhoto(photo, photo.id));

    photoContainer.addEventListener('click', function (event) {
        if (currentUser && event.target.closest('.edit-btn')) {
            currentPhotoId = event.target.closest('.edit-btn').getAttribute('data-id');
            openEditForm(currentPhotoId);
        }
    });

    async function openEditForm(id) {
        try {
            const photoDoc = doc(db, 'photo', id);
            const photoSnapshot = await getDoc(photoDoc);
            if (photoSnapshot.exists()) {
                const photoData = photoSnapshot.data();
                document.getElementById('editTitle').value = photoData.title;
                document.getElementById('editText').value = photoData.text;
                editFormContainer.style.display = 'block'; // Ensure this is being set
            } else {
                displayPopup('Photo not found.', false);
            }
        } catch (error) {
            console.error("Error fetching photo:", error);
            displayPopup('Error loading photo for editing. Please try again later.', false);
        }
    }

    editPhotoForm.addEventListener('submit', async function (event) {
        event.preventDefault();
        const title = document.getElementById('editTitle').value.trim();
        const text = document.getElementById('editText').value.trim();
        const imageFile = document.getElementById('editImage').files[0];

        if (!title || !text) {
            displayPopup('Please fill in all fields.', false);
            return;
        }

        try {
            const photoRef = doc(db, 'photo', currentPhotoId);
            let updates = { title, text };

            if (imageFile) {
                const imageRef = ref(storage, `images/${imageFile.name}`);
                await uploadBytes(imageRef, imageFile);
                const imageUrl = await getDownloadURL(imageRef);
                updates.imageUrl = imageUrl;
            }

            await updateDoc(photoRef, updates);
            displayPopup('Photo updated successfully!', true);
            editFormContainer.style.display = 'none'; // Hide the form
            photoContainer.innerHTML = '';
            await fetchPhotos();
            photoList.forEach(photo => renderPhoto(photo, photo.id));

        } catch (error) {
            console.error("Error updating photo:", error);
            displayPopup('Error updating photo. Please try again later.', false);
        }
    });

    closeEditFormBtn.onclick = function () {
        editFormContainer.style.display = 'none'; // Hide the form
    };
});

function createPhotoCard(photo, id) {
    const photoCard = document.createElement('div');
    photoCard.classList.add('photo-card');

    let editButton = '';
    if (currentUser) {
        editButton = `<div class="edit-btn" data-id="${id}"><img width="50px" src="./src/img/edit-button.png"></div>`;
    }

    photoCard.innerHTML = `
        <div class="mt-3 borderColor">
            <img width="264px" height="264px" src="${photo.imageUrl}" alt="${photo.title}">
            <h4 class="p-1">${photo.title}</h4>
            <hr class="line-yellow">
            <p class="fw-bold p-1">${photo.text}</p>
            ${editButton}
        </div>
    `;

    return photoCard;
}

function displayPopup(message, isSuccess) {
    const popup = document.createElement('div');
    popup.classList.add('popup');
    popup.textContent = message;
    popup.classList.add(isSuccess ? 'success' : 'error');

    document.body.appendChild(popup);

    setTimeout(() => {
        popup.remove();
    }, 2000);
}

function loadPhoto() {
    setTimeout(function () {
        const photoContainer = document.getElementById("photoContainer");
        const loadingIcon = document.getElementById("loadingIcon");
        if (loadingIcon) {
            loadingIcon.style.display = "none";
        }
        photoContainer.style.display = "block";
    }, 1000); 
}

window.onload = function () {
    loadPhoto();
};
