// index.js
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.0/firebase-app.js';
import { getFirestore, collection, getDocs, orderBy, query } from 'https://www.gstatic.com/firebasejs/9.6.0/firebase-firestore.js';

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

document.addEventListener('DOMContentLoaded', async function () {
    const playerContainer = document.getElementById('playerContainer');
    const photoContainer = document.getElementById('photoContainer');
    const videoContainer = document.getElementById('videoContainer');

    async function fetchData(collectionName) {
        const dataCollection = collection(db, collectionName);
        const dataQuery = query(dataCollection, orderBy('dateAdded', 'desc'));
        const dataSnapshot = await getDocs(dataQuery);
        return dataSnapshot.docs.map(doc => doc.data());
    }

    function renderData(container, data, createCardFunction) {
        container.innerHTML = '';
        for (let i = 0; i < 4 && i < data.length; i++) {
            const item = data[i];
            const card = createCardFunction(item);
            container.appendChild(card);
        }
    }

    async function loadPlayers() {
        const playerList = await fetchData('players');
        renderData(playerContainer, playerList, createPlayerCard);
    }

    function createPlayerCard(player) {
        const playerCard = document.createElement('div');
        playerCard.classList.add('player-card');

        playerCard.innerHTML = `
            <div class="mt-3 borderColor">
                <img width="264px" height="264px" src="${player.imageUrl}" alt="${player.name} Image">
                <h4 class="p-1 ">${player.name}</h4>
                  <hr class="line-yellow">
                <p class="fw-bold p-1">Position: ${player.position}</p>
                <p class="fw-bold p-1">Current Club: ${player.currentClub}</p>
            </div>
        `;

        return playerCard;
    }

    async function loadPhotos() {
        const photoList = await fetchData('photo');
        renderData(photoContainer, photoList, createPhotoCard);
    }

    function createPhotoCard(photo) {
        const photoCard = document.createElement('div');
        photoCard.classList.add('photo-card');

        photoCard.innerHTML = `
            <div class="mt-3 borderColor">
                <img width="264px" height="264px" src="${photo.imageUrl}" alt="photo">
                <h4 class="p-1">${photo.title}</h4>
                <hr class="line-yellow">
                <p class="fw-bold p-1">${photo.text}</p>
            </div>
        `;

        return photoCard;
    }

    async function loadVideos() {
        const videoList = await fetchData('video');
        renderData(videoContainer, videoList, createVideoCard);
    }
    
    function createVideoCard(video) {
        const videoCard = document.createElement('div');
        videoCard.classList.add('video-card');
    
        let videoContent;
    
        if (video.videoUrl.includes('youtube.com') || video.videoUrl.includes('youtu.be')) {
            // Embed YouTube video
            const videoId = extractYouTubeVideoId(video.videoUrl);
            videoContent = `
                <div class="mt-3 borderColor">
                    <iframe width="264px" height="264px" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>
                    <h4 class="p-1">${video.titleVideo}</h4>
                    <hr class="line-yellow">
                    <p class="fw-bold p-1">${video.textVideo}</p>
                </div>
            `;
        } else {
            // Use a direct video URL
            videoContent = `
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
    
        videoCard.innerHTML = videoContent;
        return videoCard;
    }
    
    function extractYouTubeVideoId(url) {
        // Extract video ID from YouTube URL
        const regExp = /^.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        if (match && match[1].length === 11) {
            return match[1];
        } else {
            throw new Error('Invalid YouTube URL');
        }
    }
    

    await loadPlayers();
    await loadPhotos();
    await loadVideos();
});

