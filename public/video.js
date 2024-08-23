import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.0/firebase-app.js';
import { getFirestore, collection, addDoc, getDocs, orderBy, query, doc, updateDoc, deleteDoc } from 'https://www.gstatic.com/firebasejs/9.6.0/firebase-firestore.js';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'https://www.gstatic.com/firebasejs/9.6.0/firebase-storage.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.6.0/firebase-auth.js';

// Firebase configuration
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
const storage = getStorage(firebaseApp);
const auth = getAuth(firebaseApp);

let currentUser = null;

// Listen for auth state changes
onAuthStateChanged(auth, (user) => {
    currentUser = user || null;
});

document.addEventListener('DOMContentLoaded', async function () {
    const videoContainer = document.getElementById('videoContainer');
    const editFormContainer = document.getElementById('editFormContainer');
    let videoList = [];

    // Function to render a single video card
    function renderVideo(video) {
        const videoCard = createVideoCard(video);
        videoContainer.appendChild(videoCard);
    }

    // Function to fetch videos from Firestore
    async function fetchVideos() {
        const videoCollection = collection(db, 'video');
        const videoQuery = query(videoCollection, orderBy('dateAdded', 'desc'));
        const videoSnapshot = await getDocs(videoQuery);
        videoList = videoSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }

    // Function to handle video form submission
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
            } else if (videoFile) {
                // Handle file upload
                const videoRef = ref(storage, `videos/${videoFile.name}`);
                await uploadBytes(videoRef, videoFile);
                videoUrl = await getDownloadURL(videoRef);
            } else {
                throw new Error('No video file or YouTube link provided.');
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

    // Function to handle video edit
    async function handleEdit(video) {
        const editTitleInput = document.getElementById('editTitleVideo');
        const editTextArea = document.getElementById('editTextVideo');
        const editYoutubeLinkInput = document.getElementById('edityoutubeLink');

        editTitleInput.value = video.titleVideo;
        editTextArea.value = video.textVideo;
        editYoutubeLinkInput.value = video.videoUrl;

        // Store video ID in a hidden field in the edit form
        const editForm = document.getElementById('editvideoForm');
        editForm.setAttribute('data-video-id', video.id);

        editFormContainer.style.display = 'block'; // Show edit form
    }

    // Function to handle video update
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

    // Function to create video card element
    function createVideoCard(video) {
        const videoCard = document.createElement('div');
        videoCard.classList.add('video-card');

        const isYouTube = isYouTubeUrl(video.videoUrl);

        videoCard.innerHTML = `
            <div class="mt-3 borderColor">
                ${isYouTube ? 
                `<iframe width="264px" height="264px" src="${formatYouTubeUrl(video.videoUrl)}" frameborder="0" allowfullscreen></iframe>` :
                `<video width="264px" height="264px" controls>
                    <source src="${video.videoUrl}" type="video/mp4">
                    Your browser does not support the video tag.
                </video>`
                }
                <h4 class="p-1">${video.titleVideo}</h4>
                <hr class="line-yellow">
                <p class="fw-bold p-1">${video.textVideo}</p>
            </div>
        `;

        // Add edit and delete buttons only if currentUser is not null (i.e., user is signed in)
        if (currentUser !== null) {
            const editButton = document.createElement('div');
            editButton.classList.add('edit-btn');
            editButton.setAttribute('data-id', video.id);
            editButton.innerHTML = `<img width="50px" src="./src/img/edit-button.png">`;
            editButton.addEventListener('click', () => handleEdit(video));
            videoCard.querySelector('.borderColor').appendChild(editButton);

            // Add delete button
            const deleteButton = document.createElement('div');
            deleteButton.classList.add('delete-btn');
            deleteButton.setAttribute('data-id', video.id);
            deleteButton.innerHTML = ` <img width="50px" src="./src/img/delete.png">`;
            deleteButton.addEventListener('click', () => handleDelete(video));
            videoCard.querySelector('.borderColor').appendChild(deleteButton);
        }

        return videoCard;
    }

    // Function to display a popup message
    function displayPopup(message, isSuccess) {
        const popup = document.createElement('div');
        popup.classList.add('popup');
        popup.textContent = message;
        popup.classList.add(isSuccess ? 'success' : 'error');

        document.body.appendChild(popup);

        // Ensure popup is visible before removing
        setTimeout(() => {
            popup.remove();
        }, 1000); // Remove popup after 1 second
    }

    // Function to check if a URL is a YouTube URL
    function isYouTubeUrl(url) {
        return url.includes('youtube.com') || url.includes('youtu.be');
    }

    // Function to format a YouTube URL to embed URL
    function formatYouTubeUrl(url) {
        if (url.includes('youtube.com/watch')) {
            // Convert standard YouTube watch URL to embed URL
            const videoId = extractVideoIdFromWatchUrl(url);
            return `https://www.youtube.com/embed/${videoId}`;
        } else if (url.includes('youtu.be/')) {
            // Convert youtu.be URL to embed URL
            const videoId = extractVideoIdFromShortUrl(url);
            return `https://www.youtube.com/embed/${videoId}`;
        }
        return url; // Assume it's already an embed URL or other format
    }

    // Function to extract video ID from YouTube watch URL
    function extractVideoIdFromWatchUrl(url) {
        const regex = /[?&]v=([^&]+)/;
        const match = url.match(regex);
        return match && match[1] ? match[1] : null;
    }

    // Function to extract video ID from youtu.be URL
    function extractVideoIdFromShortUrl(url) {
        const regex = /youtu\.be\/([^?&]+)/;
        const match = url.match(regex);
        return match && match[1] ? match[1] : null;
    }

    // Function to handle video deletion
    async function handleDelete(video) {
        const confirmDelete = confirm('Are you sure you want to delete this video?');
        if (!confirmDelete) return;

        try {
            // Delete video from Firestore
            const videoDocRef = doc(db, 'video', video.id);
            await deleteDoc(videoDocRef);

            // Extract the file name from the URL
            const fileName = video.videoUrl.split('/').pop().split('?')[0];
            const videoRef = ref(storage, `videos/${fileName}`);

            // Check if the file exists before deleting
            try {
                await getDownloadURL(videoRef);
                // File exists, proceed to delete
                await deleteObject(videoRef);
            } catch (err) {
                if (err.code === 'storage/object-not-found') {
                    console.warn('File does not exist in storage:', fileName);
                } else {
                    throw err; // Re-throw unexpected errors
                }
            }

            // Display success popup
            displayPopup('Video deleted successfully!', true);

            // Refresh the page to update the video list
            setTimeout(() => {
                location.reload();
            }, 1000); // Refresh after 1 second

        } catch (error) {
            console.error("Error deleting video:", error);

            // Display error popup
            displayPopup('Error deleting video. Please try again later.', false);
        }
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

    // Fetch and render videos
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