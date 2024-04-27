
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
        const file = document.getElementById('file').files[0];
        const youtubeLink = document.getElementById('youtubeLink').value;

        try {
          if (file) {
            const fileType = file.type.split('/')[0]; // Get file type (image or video)
            const fileRef = ref(storage, `${fileType}s/${file.name}`);
            await uploadBytes(fileRef, file);
            const fileUrl = await getDownloadURL(fileRef);

            await addDoc(collection(db, 'news'), {
              title: title,
              text: text,
              fileType: fileType,
              fileUrl: fileUrl
            });
          } else if (youtubeLink) {
            const videoId = getYoutubeVideoId(youtubeLink);
            if (videoId) {
              await addDoc(collection(db, 'news'), {
                title: title,
                text: text,
                fileType: 'youtube',
                fileUrl: videoId // Assuming videoId is the YouTube video ID
              });
            } else {
              console.error('Invalid YouTube URL');
            }
          } else {
            console.error('No file or YouTube link provided');
          }

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
          const nextPage = newsList.splice(0, 10); // Load 10 news items per page
          nextPage.forEach(news => renderNews(news));
        }
      }

      // Event listener for scroll to trigger pagination
      window.addEventListener('scroll', handlePagination);

      // Fetch initial news data
      await fetchNews();

      // Render initial news items
      const initialNews = newsList.splice(0, 10); // Load 10 news items initially
      initialNews.forEach(news => renderNews(news));
    });

    // Function to create a news card element
    function createNewsCard(news) {
      const newsCard = document.createElement('div');
      newsCard.classList.add('news-card');

      // Add news details to the card
      if (news.fileType === 'image') {
        newsCard.innerHTML = `
          <div class="mt-5 border border-warning">
            <img width="300px" height="300px" src="${news.fileUrl}" alt="News Image">
            <h2 class="mt-3">${news.title}</h2>
            <p>${news.text}</p> 
          </div>
        `;
      } else if (news.fileType === 'video') {
        newsCard.innerHTML = `
          <div class="mt-5 border border-warning">
            <video width="300px" height="300px" controls>
              <source src="${news.fileUrl}" type="video/mp4">
              Your browser does not support the video tag.
            </video>
            <h2 class="mt-3">${news.title}</h2>
            <p>${news.text}</p>
          </div>
        `;
      } else if (news.fileType === 'youtube') {
        newsCard.innerHTML = `
          <div class="mt-5 border border-warning">
            <iframe width="300" height="300" src="https://www.youtube.com/embed/${news.fileUrl}" frameborder="0" allowfullscreen></iframe>
            <h2 class="mt-3">${news.title}</h2>
            <p>${news.text}</p>
          </div>
        `;
      }

      return newsCard;
    }

    // Function to extract YouTube video ID from URL
    function getYoutubeVideoId(url) {
      const regExp = /^(?:(?:https?:)?\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
      const match = url.match(regExp);
      if (match && match[1]) {
        return match[1];
      } else {
        return null;
      }
    }
    