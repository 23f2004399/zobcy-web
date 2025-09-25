import { auth, db } from '/static/firebase-init.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";
import { signOut } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";

const seekerNameSpan = document.getElementById("seekerName");
const logoutBtn = document.getElementById("logoutBtn");
const editProfileLink = document.getElementById("editProfileLink");


onAuthStateChanged(auth, async (user) => {
  if (user) {
    const docRef = doc(db, "seekers", user.uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      seekerNameSpan.textContent = docSnap.data().name;

      const username = docSnap.data().username;
      editProfileLink.href = `/${username}/profile`;
    } else {
      seekerNameSpan.textContent = "Seeker";
    }
  } else {
    window.location.href = "/seekerlogin"; // redirect if not logged in
  }
});


if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    signOut(auth)
      .then(() => {
        // Redirect to login page with logout success message
        window.location.href = "/seekerlogin?logout=success";
      })
      .catch((error) => {
        console.error("Error during logout:", error);
      });
  });
}
