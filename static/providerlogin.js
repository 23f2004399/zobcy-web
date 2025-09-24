// Import our initialized auth service from our init file
import { auth } from '/static/firebase-init.js';

// Import the specific function we need from the Firebase SDK
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";

// Get the form and a div for displaying messages
const loginForm = document.getElementById('login-form');
const messageDiv = document.getElementById('message');
const params = new URLSearchParams(window.location.search);

if (params.get("signup") === "success") {
    messageDiv.textContent = "Account Created Successfully!";
    messageDiv.style.color = "green";

    messageDiv.classList.add("fade-out");  // enable transition

    setTimeout(() => {
        messageDiv.classList.add("hidden"); // start fading after 2s
    }, 2000);

    setTimeout(() => {
        messageDiv.textContent = "";
        messageDiv.classList.remove("fade-out", "hidden"); // reset for future messages
    }, 3000);
}


// Add a listener to the form for when the user clicks "Login"
loginForm.addEventListener('submit', (e) => {
    // Prevent the form from submitting the traditional way (which would refresh the page)
    e.preventDefault();

    // Get the values the user entered into the form
    const email = loginForm.email.value;
    const password = loginForm.password.value;

    // Use Firebase's function to sign in a user with their email and password
    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // If login is successful, this part runs
            const user = userCredential.user;
            messageDiv.textContent = "Login successful! Redirecting...";
            messageDiv.style.color = "green";

            setTimeout(() => {
                window.location.href = '/providerdash';
            }, 1500);
        })
        .catch((error) => {
            // If any error happened during login, this part runs
            console.error("Error during login:", error);
            // Provide a user-friendly error message
            if (error.code === 'auth/invalid-credential') {
                messageDiv.textContent = 'Error: Invalid email or password.';
            } else {
                messageDiv.textContent = 'Error: ' + error.message;
            }
            messageDiv.style.color = "red";
        });
});
