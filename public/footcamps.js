import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.0/firebase-app.js';
import { getFirestore, collection, addDoc, getDocs, query, orderBy, doc, updateDoc, deleteDoc, getDoc } from 'https://www.gstatic.com/firebasejs/9.6.0/firebase-firestore.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.6.0/firebase-auth.js';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'https://www.gstatic.com/firebasejs/9.6.0/firebase-storage.js';

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

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp);
const storage = getStorage(firebaseApp);

let currentUser = null;

onAuthStateChanged(auth, (user) => {
    currentUser = user || null;
});

// Handle form submission for new camp
document.getElementById('campForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const nameCamp = document.getElementById('nameCamp').value;
    const date = document.getElementById('date').value;
    const location = document.getElementById('location').value;
    const description = document.getElementById('description').value;
    const imageFile = document.getElementById('imageCamp').files[0];

    if (imageFile) {
        const imageRef = ref(storage, `images/${imageFile.name}`);
        try {
            // Upload image
            await uploadBytes(imageRef, imageFile);
            const imageURL = await getDownloadURL(imageRef);

            // Add document to Firestore
            await addDoc(collection(db, 'football_camps'), {
                nameCamp: nameCamp,
                date: date,
                location: location,
                description: description,
                imageURL: imageURL,
                createdAt: new Date()
            });

            campForm.reset();
            displayPopup('Football Camp added successfully!', true);

            setTimeout(() => {
                location.reload();
            }, 1000); // Refresh after 1 second

        } catch (error) {
            console.error("Error adding football camp", error);
            displayPopup('Error adding football camp. Please try again later.', false);
        }
    }
});

// Function to display football camps
async function displayCamps() {
    const campsList = document.getElementById('campsList');
    campsList.innerHTML = ''; // Clear existing camps

    try {
        const campsCollection = collection(db, 'football_camps');
        const FootballCamps = query(campsCollection, orderBy('createdAt', 'desc'));
        const campsSnapshot = await getDocs(FootballCamps);

        if (campsSnapshot.empty) {
            console.log('No football camps found.');
        }

        campsSnapshot.forEach((doc) => {
            const campData = doc.data();
            console.log('Camp Data:', campData);
            const campCard = createCampCard(campData, doc.id);
            campsList.appendChild(campCard);
        });
    } catch (error) {
        console.error('Error fetching football camps:', error);
    }
}

function createCampCard(campData, id) {
    const campCard = document.createElement('div');
    campCard.classList.add('camp-card');

    let editButton = '';
    let editButtonTwo = '';
    let deleteButton = '';
    let deleteButtonTwo = '';

    if (currentUser) {
        // Unique IDs for each edit and delete button
        editButton = `<div class="edit-btn" data-id="${id}" id="edit-btn-${id}"><img width="50px" src="./src/img/edit-button.png" alt="Edit"></div>`;
        editButtonTwo = `<div class="edit-btn" data-id="${id}" id="edit-btn-two-${id}"><img width="50px" src="./src/img/edit-button.png" alt="Edit"></div>`;
        deleteButton = `<div class="delete-btn" data-id="${id}" id="delete-btn-${id}"><img width="50px" src="./src/img/delete.png"></div>`;
        deleteButtonTwo = `<div class="delete-btn" data-id="${id}" id="delete-btn-two-${id}"><img width="50px" src="./src/img/delete.png"></div>`;  
    }

    campCard.innerHTML = `
        <section class="desktop-only">
            <div class="mt-5 gap-5 d-flex posRelative">
                <div>
                    <img width="500px" height="400px" src="${campData.imageURL}" alt="${campData.nameCamp}">
                </div>
                <div>
                    <h3>${campData.nameCamp}</h3>
                    <div class="d-flex align-items-center">
                        <p><img width="30px" src="./src/img/icons8-date-48.png"> ${campData.date}</p>
                        <p><img width="40px" src="./src/img/location.png">${campData.location}</p>
                    </div>
                    <p>${campData.description}</p>
                </div>
                ${editButton}
                ${deleteButton}
            </div>
        </section>
        <section class="response-only posRelative">
            <div class="text-center mt-3">
                <div>
                    <img width="264px" height="264px" src="${campData.imageURL}" alt="${campData.nameCamp}">
                    ${editButtonTwo}
                    ${deleteButtonTwo}
                </div>
                <h3 class="mt-3">${campData.nameCamp}</h3>
                <div class="d-flex align-items-center justify-content-center">
                    <p><img width="30px" src="./src/img/icons8-date-48.png"> ${campData.date}</p>
                    <p><img width="40px" src="./src/img/location.png">${campData.location}</p>
                </div>
                <div class="justify-content-center d-flex">
                    <p class="col-10">${campData.description}</p>
                </div>
            </div>
        </section>
    `;

    // Attach event listener to the first edit button
    if (currentUser) {
        const editBtn = campCard.querySelector('#edit-btn-' + id);
        if (editBtn) {
            editBtn.addEventListener('click', () => {
                showEditForm(campData, id);
            });
        }

        // Attach event listener to the second edit button
        const editBtnTwo = campCard.querySelector('#edit-btn-two-' + id);
        if (editBtnTwo) {
            editBtnTwo.addEventListener('click', () => {
                showEditForm(campData, id);
            });
        }

        // Attach event listener to the delete button
        const deleteBtn = campCard.querySelector('#delete-btn-' + id);
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => {
                deleteCamp(id);
            });
        }

        // Attach event listener to the second delete button
        const deleteBtnTwo = campCard.querySelector('#delete-btn-two-' + id);
        if (deleteBtnTwo) {
            deleteBtnTwo.addEventListener('click', () => {
                deleteCamp(id);
            });
        }
    }

    return campCard;
}

// Show edit form with existing data
function showEditForm(campData, id) {
    document.getElementById('editCampId').value = id;
    document.getElementById('editName').value = campData.nameCamp;
    document.getElementById('editDate').value = campData.date;
    document.getElementById('editLocation').value = campData.location;
    document.getElementById('editDescription').value = campData.description;

    // Show the edit form container
    document.getElementById('editFormContainer').style.display = 'block';
}

// Handle form submission for editing
document.getElementById('editCampForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const id = document.getElementById('editCampId').value;
    const nameCamp = document.getElementById('editName').value;
    const date = document.getElementById('editDate').value;
    const location = document.getElementById('editLocation').value;
    const description = document.getElementById('editDescription').value;
    const imageFile = document.getElementById('editImage').files[0];

    try {
        let imageURL = null;
        if (imageFile) {
            const imageRef = ref(storage, `images/${imageFile.name}`);
            await uploadBytes(imageRef, imageFile);
            imageURL = await getDownloadURL(imageRef);
        }

        const campRef = doc(db, 'football_camps', id);
        await updateDoc(campRef, {
            nameCamp: nameCamp,
            date: date,
            location: location,
            description: description,
            ...(imageURL && { imageURL: imageURL })
        });

        document.getElementById('editCampForm').reset();
        document.getElementById('editFormContainer').style.display = 'none';
        displayPopup('Football Camp updated successfully!', true);

        // Reload the entire page after a short delay
        setTimeout(() => {
            window.location.reload(); // Full page reload
        }, 1000); // 1 second

    } catch (error) {
        console.error("Error updating football camp", error);
        displayPopup('Error updating football camp. Please try again later.', false);
    }
});

// Close edit form
document.getElementById('closeEditFormBtn').addEventListener('click', () => {
    document.getElementById('editCampForm').reset();
    document.getElementById('editFormContainer').style.display = 'none';
});

// Delete camp function
async function deleteCamp(id) {
    const confirmation = confirm('Are you sure you want to delete this camp?');
    if (!confirmation) return;

    try {
        // Delete the document from Firestore
        const campRef = doc(db, 'football_camps', id);
        await deleteDoc(campRef);

        // Optionally, delete the image from Firebase Storage
        const campSnapshot = await getDoc(campRef);
        const campData = campSnapshot.data();
        if (campData && campData.imageURL) {
            const imageRef = ref(storage, `images/${campData.imageURL.split('/').pop()}`);
            await deleteObject(imageRef);
        }

        displayPopup('Football Camp deleted successfully!', true);
        setTimeout(() => {
            location.reload();
        }, 1000);

    } catch (error) {
        console.error('Error deleting football camp:', error);
        displayPopup('Error deleting football camp. Please try again later.', false);
    }
}

// Display popup message
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

// Display camps on page load
document.addEventListener('DOMContentLoaded', displayCamps);

function loadCamps() {
    setTimeout(function () {
        const campsList = document.getElementById("campsList");
        const loadingIcon = document.getElementById("loadingIcon");
        if (loadingIcon) {
            loadingIcon.style.display = "none";
        }
        campsList.style.display = "block";
    }, 1000);
}

window.onload = function () {
    loadCamps();
};
