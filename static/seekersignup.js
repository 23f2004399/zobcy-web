// Import our initialized services from our init file
import { auth, db } from '/static/firebase-init.js';

// Import the specific functions we need from the Firebase SDK
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

// Get the form and a div for displaying messages
const signupForm = document.getElementById('signup-form');
const messageDiv = document.getElementById('message');

// Add a listener to the form for when the user clicks "Sign Up"
signupForm.addEventListener('submit', (e) => {
    // Prevent the form from submitting the traditional way (which would refresh the page)
    e.preventDefault();

    // Get the values the user entered into the form
    const name = signupForm.name.value;
    const username = signupForm.username.value;
    const email = signupForm.email.value;
    const password = signupForm.password.value;

    // Use Firebase's function to create a new user with email and password
    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // If sign up is successful, this part runs
            const user = userCredential.user;

            // Now, we save the user's extra details (name, username) to the Firestore database.
            // We will create a collection called "seekers" to store all seeker data.
            // The user's unique ID (user.uid) from Authentication is used as the document ID.
            return setDoc(doc(db, "seekers", user.uid), {
                name: name,
                username: username,
                email: email
            });
        })
        .then(() => {
            // This part runs after the data has been successfully saved to Firestore
            messageDiv.textContent = "Sign up successful! You will be redirected to the login page.";
            messageDiv.style.color = "green";

            // Wait 2 seconds, then redirect the user to the seeker login page
            setTimeout(() => {
                window.location.href = '/seekerlogin?signup=success';
            }, 2000);
        })
        .catch((error) => {
            // If any error happened during sign-up or saving data, this part runs
            console.error("Error during sign up:", error);
            messageDiv.textContent = error.message; // Display the error message to the user
            messageDiv.style.color = "red";
        });
});

