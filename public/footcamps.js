import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.0/firebase-app.js';
import { getFirestore, collection, addDoc, getDocs, query, orderBy } from 'https://www.gstatic.com/firebasejs/9.6.0/firebase-firestore.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.6.0/firebase-auth.js';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'https://www.gstatic.com/firebasejs/9.6.0/firebase-storage.js';

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

// Handle form submission
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
        // Get the camps sorted by 'createdAt' in descending order
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
    if (currentUser) {
        editButton = `<div class="edit-btn" data-id="${id}"><img width="50px" src="./src/img/edit-button.png" alt="Edit"></div>`;
    }

    campCard.innerHTML = `
 <section class="desktop-only">
    <div class="mt-5 gap-3 d-flex">
        <div>
            <img width="500px" height="400px" src="${campData.imageURL}" alt="${campData.nameCamp}">
        </div>
        <div>
            <h3>${campData.nameCamp}</h3>
            <div class="d-flex">
            <p><img width="30px" src="./src/img/icons8-date-48.png"> ${campData.date}</p>
            <p><img width="30px" src="./src/img/icons8-date-48.png">  ${campData.location}</p>
            </div>
            <p> ${campData.description}</p>
            ${editButton}
        </div>
    </div>
</section>
        <section class="response-only">
        <div class="d-flex flex-wrap justify-content-center mt-3">
        <div>
            <img width="264px" height="264px" src="${campData.imageURL}" alt="${campData.nameCamp}">
            <h3>${campData.nameCamp}</h3>
            <p class="p-1"><strong><img src="./src/img/icons8-date-48.png"></strong> ${campData.date}</p>
            <p class="p-1"><strong>Location:</strong> ${campData.location}</p>
            <p class="p-1"><strong>Description:</strong> ${campData.description}</p>
            ${editButton}
        </div> 
        </div> 
        </section>  
        
    `;

    return campCard;
}

// Display camps on page load
document.addEventListener('DOMContentLoaded', displayCamps);

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

