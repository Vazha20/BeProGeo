import { initializeApp } from "https://www.gstatic.com/firebasejs/9.2.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.2.0/firebase-auth.js";

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
const app = initializeApp(firebaseConfig);
const auth = getAuth(app); // Pass the app instance to getAuth

// Check if the user is already authenticated
onAuthStateChanged(auth, (user) => {
    if (user) {
        // Redirect to the admin page
        window.location.href = 'admin.html?uid=' + user.uid;
    }
});

// Validate email function
function validate_email(email) {
    // Implement your email validation logic
    return email && email.includes('@'); // Example validation
}

// Validate password function
function validate_password(password) {
    // Implement your password validation logic
    return password && password.length >= 6; // Example validation
}

// Event listener for the login form
document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('loginForm').addEventListener('submit', signIn);
});

function signIn(event) {
    event.preventDefault(); // Prevent form submission

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Validate email and password
    if (!validate_email(email) || !validate_password(password)) {
        alert('Invalid email or password format.');
        return;
    }

    // Check if loading element exists before modifying its style
    const loadingElement = document.getElementById('loading');
    if (loadingElement) {
        loadingElement.style.display = 'block'; // Show loading indicator
    }

    signInWithEmailAndPassword(auth, email, password)
        .then(function (userCredential) {
            const user = userCredential.user;

            // Hide loading indicator
            if (loadingElement) {
                loadingElement.style.display = 'none';
            }

            // Redirect to the admin page
            window.location.href = 'admin.html?uid=' + user.uid;

            alert('User signed in successfully.');
        })
        .catch(function (error) {
            // Hide loading indicator
            if (loadingElement) {
                loadingElement.style.display = 'none';
            }

            const errorCode = error.code;
            const errorMessage = error.message;
            alert(`Error: ${errorCode} - ${errorMessage}`);
        });
}

function loadNews() {
    setTimeout(function () {
        var playerContainer = document.getElementById("playerContainer");
        
        document.getElementById("loadingIcon").style.display = "none";
        playerContainer.style.display = "block";

        setTimeout(loadNews, 1000);
    }, 1000); 
}
window.onload = function () {
    loadNews();
};
