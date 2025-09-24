import { auth, db } from '/static/firebase-init.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

const seekerNameSpan = document.getElementById("seekerName");

onAuthStateChanged(auth, async (user) => {
  if (user) {
    const docRef = doc(db, "seekers", user.uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      seekerNameSpan.textContent = docSnap.data().name;
    } else {
      seekerNameSpan.textContent = "Seeker";
    }
  } else {
    window.location.href = "/seekerlogin"; // redirect if not logged in
  }
});
