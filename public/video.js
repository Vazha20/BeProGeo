import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.0/firebase-app.js';
import { getFirestore, collection, addDoc, getDocs, orderBy, query, doc, updateDoc } from 'https://www.gstatic.com/firebasejs/9.6.0/firebase-firestore.js';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'https://www.gstatic.com/firebasejs/9.6.0/firebase-storage.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.6.0/firebase-auth.js';

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
    const videoContainer = document.getElementById('videoContainer');
    const editFormContainer = document.getElementById('editFormContainer');
    let videoList = [];

    function renderVideo(video) {
        const videoCard = createVideoCard(video);
        videoContainer.appendChild(videoCard);
    }

    async function fetchVideos() {
        const videoCollection = collection(db, 'video');
        const videoQuery = query(videoCollection, orderBy('dateAdded', 'desc'));
        const videoSnapshot = await getDocs(videoQuery);
        videoList = videoSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }

    async function handleSubmit(event) {
        event.preventDefault();
        const titleVideo = document.getElementById('titleVideo').value;
        const textVideo = document.getElementById('textVideo').value;
        const youtubeLink = document.getElementById('youtubeLink').value;
        const videoFile = document.getElementById('video').files[0];

        try {
            let videoUrl;

            if (youtubeLink.trim() !== '') {
                // Use YouTube link if provided
                videoUrl = formatYouTubeUrl(youtubeLink);
            } else {
                // Handle file upload
                const videoRef = ref(storage, `videos/${videoFile.name}`);
                await uploadBytes(videoRef, videoFile);
                videoUrl = await getDownloadURL(videoRef);
            }

            await addDoc(collection(db, 'video'), {
                titleVideo: titleVideo,
                textVideo: textVideo,
                videoUrl: videoUrl,
                dateAdded: new Date()
            });

            videoForm.reset();
            displayPopup('Video added successfully!', true);

            setTimeout(() => {
                location.reload();
            }, 1000); // Refresh after 1 second

        } catch (error) {
            console.error("Error adding video:", error);
            displayPopup('Error adding video. Please try again later.', false);
        }
    }

    async function handleEdit(video) {
        const editTitleInput = document.getElementById('editTitleVideo');
        const editTextArea = document.getElementById('editTextVideo');

        editTitleInput.value = video.titleVideo;
        editTextArea.value = video.textVideo;

        // Store video ID in a hidden field in the edit form
        const editForm = document.getElementById('editvideoForm');
        editForm.setAttribute('data-video-id', video.id);

        editFormContainer.style.display = 'block'; // Show edit form
    }

    async function handleUpdate(event) {
        event.preventDefault();
        const videoId = event.target.getAttribute('data-video-id');
        const editTitleVideo = document.getElementById('editTitleVideo').value;
        const editTextVideo = document.getElementById('editTextVideo').value;
        const editYoutubeLink = document.getElementById('edityoutubeLink').value;
        const editVideoFile = document.getElementById('editVideo').files[0];

        try {
            let videoDataToUpdate = {
                titleVideo: editTitleVideo,
                textVideo: editTextVideo,
            };

            if (editYoutubeLink.trim() !== '') {
                videoDataToUpdate.videoUrl = formatYouTubeUrl(editYoutubeLink);
            } else if (editVideoFile) {
                const videoRef = ref(storage, `videos/${editVideoFile.name}`);
                await uploadBytes(videoRef, editVideoFile);
                const videoUrl = await getDownloadURL(videoRef);
                videoDataToUpdate.videoUrl = videoUrl;
            }

            const videoDocRef = doc(db, 'video', videoId);
            await updateDoc(videoDocRef, videoDataToUpdate);

            editFormContainer.style.display = 'none'; // Hide edit form
            displayPopup('Video updated successfully!', true);

            setTimeout(() => {
                location.reload();
            }, 1000); // Refresh after 1 second

        } catch (error) {
            console.error("Error updating video:", error);
            displayPopup('Error updating video. Please try again later.', false);
        }
    }

    function createVideoCard(video) {
        const videoCard = document.createElement('div');
        videoCard.classList.add('video-card');

        if (isYouTubeUrl(video.videoUrl)) {
            // If YouTube video
            const embedUrl = formatYouTubeUrl(video.videoUrl);
            videoCard.innerHTML = `
                <div class="mt-3 borderColor">
                    <iframe width="264px" height="264px" src="${embedUrl}" frameborder="0" allowfullscreen></iframe>
                    <h4 class="p-1">${video.titleVideo}</h4>
                    <hr class="line-yellow">
                    <p class="fw-bold p-1">${video.textVideo}</p>
                </div>
            `;
        } else {
            // If uploaded video
            videoCard.innerHTML = `
                <div class="mt-3 borderColor">
                    <video width="264px" height="264px" controls>
                        <source src="${video.videoUrl}" type="video/mp4">
                        Your browser does not support the video tag.
                    </video>
                    <h4 class="p-1">${video.titleVideo}</h4>
                    <hr class="line-yellow">
                    <p class="fw-bold p-1">${video.textVideo}</p>
                </div>
            `;
        }

        // Add edit button only if currentUser is not null (i.e., user is signed in)
        if (currentUser !== null) {
            const editButton = document.createElement('div');
            editButton.classList.add('edit-btn');
            editButton.setAttribute('data-id', video.id);
            editButton.innerHTML = `<img width="50px" src="./src/img/edit-button.png">`;

            editButton.addEventListener('click', () => handleEdit(video));

            videoCard.querySelector('.borderColor').appendChild(editButton);
        }

        return videoCard;
    }

    function displayPopup(message, isSuccess) {
        const popup = document.createElement('div');
        popup.classList.add('popup');
        popup.textContent = message;
        popup.classList.add(isSuccess ? 'success' : 'error');

        document.body.appendChild(popup);

        setTimeout(() => {
            popup.remove();
        }, 1000); // Remove popup after 1 second
    }

    function isYouTubeUrl(url) {
        return url.includes('youtube.com');
    }

    function formatYouTubeUrl(url) {
        // If the URL is a YouTube watch URL, convert it to embed URL
        if (url.includes('youtube.com/watch')) {
            const videoId = extractVideoId(url);
            return `https://www.youtube.com/embed/${videoId}`;
        }
        return url; // Assume it's already an embed URL
    }

    function extractVideoId(url) {
        const regex = /[?&]v=([^&]+)/;
        const match = url.match(regex);
        return match && match[1] ? match[1] : null;
    }

    // Event listener for submit event on videoForm
    const videoForm = document.getElementById('videoForm');
    videoForm.addEventListener('submit', handleSubmit);

    // Event listener for submit event on editForm
    const editForm = document.getElementById('editvideoForm');
    editForm.addEventListener('submit', handleUpdate);

    // Event listener for close button in edit form
    const closeEditFormButton = document.getElementById('closeEditForm');
    if (closeEditFormButton) {
        closeEditFormButton.addEventListener('click', function () {
            editFormContainer.style.display = 'none';
        });
    }

    await fetchVideos();
    videoList.forEach(video => renderVideo(video));
});

function loadVideos() {
    setTimeout(function () {
        const loadingIcon = document.getElementById("loadingIcon");
        if (loadingIcon) {
            loadingIcon.style.display = "none";
        }
        videoContainer.style.display = "block";
    }, 1000);
}

window.onload = function () {
    loadVideos();
};