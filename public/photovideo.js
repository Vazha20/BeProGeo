import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.0/firebase-app.js';
import { getFirestore, collection, addDoc, getDocs } from 'https://www.gstatic.com/firebasejs/9.6.0/firebase-firestore.js';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'https://www.gstatic.com/firebasejs/9.6.0/firebase-storage.js';

// Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyCALcgnrAT96DdZVmxroSe3lPe5rxwnewA",
  authDomain: "beprogeo-5b650.firebaseapp.com",
  databaseURL: "https://beprogeo-5b650-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "beprogeo-5b650",
  storageBucket: "beprogeo-5b650.appspot.com",
  messagingSenderId: "311927512328",
  appId: "1:311927512328:web:e522cf2acf48afb052a0bd",
  measurementId: "G-BXT2E91K62"
};


const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);
const storage = getStorage(firebaseApp);

document.addEventListener('DOMContentLoaded', async function () {
  const newsContainer = document.getElementById('newsContainer');
  const newsForm = document.getElementById('newsForm');
  const newsList = [];

  // Function to render news cards
  function renderNews(news) {
    const newsCard = createNewsCard(news);
    newsContainer.appendChild(newsCard);
  }

  // Function to fetch news data from Firestore
  async function fetchNews() {
    const newsCollection = collection(db, 'news');
    const newsSnapshot = await getDocs(newsCollection);
    newsSnapshot.forEach(doc => {
      newsList.push(doc.data());
    });
  }

  // Function to handle form submission
  async function handleSubmit(event) {
    event.preventDefault();
    const title = document.getElementById('title').value;
    const text = document.getElementById('text').value;
    const imageFile = document.getElementById('image').files[0];

    try {
      const imageRef = ref(storage, `images/${imageFile.name}`);
      await uploadBytes(imageRef, imageFile);
      const imageUrl = await getDownloadURL(imageRef);

      await addDoc(collection(db, 'news'), {
        title: title,
        text: text,
        imageUrl: imageUrl
      });

      // Clear the form after submission
      newsForm.reset();
    } catch (error) {
      console.error("Error adding news:", error);
    }
  }

  // Event listener for form submission
  newsForm.addEventListener('submit', handleSubmit);

  // Function to handle pagination
  function handlePagination() {
    const scrollPosition = window.innerHeight + window.pageYOffset;
    if (scrollPosition >= document.body.scrollHeight) {
      const nextPage = newsList.splice(0, 5); // Load 5 news items per page
      nextPage.forEach(news => renderNews(news));
    }
  }

  // Event listener for scroll to trigger pagination
  window.addEventListener('scroll', handlePagination);

  // Fetch initial news data
  await fetchNews();

  // Render initial news items
  const initialNews = newsList.splice(0, 5); // Load 5 news items initially
  initialNews.forEach(news => renderNews(news));
});

// Function to create a news card element
function createNewsCard(news) {
  const newsCard = document.createElement('div');
  newsCard.classList.add('news-card');

  // Add news details to the card
  newsCard.innerHTML = `
   <div>
      <h2 class="mt-5">${news.title}</h2>
      <img width="350px" src="${news.imageUrl}" alt="News Image">
      <p>${news.text}</p>
   </div>
  `;

  return newsCard;
}
