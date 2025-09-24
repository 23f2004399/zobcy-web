import { auth, db } from '/static/firebase-init.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";
import { signOut } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";

const providerNameSpan = document.getElementById("providerName");
const logoutBtn = document.getElementById("logoutBtn");

onAuthStateChanged(auth, async (user) => {
  if (user) {
    const docRef = doc(db, "providers", user.uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      providerNameSpan.textContent = docSnap.data().name;
    } else {
      providerNameSpan.textContent = "Provider";
    }
  } else {
    window.location.href = "/providerlogin"; // redirect if not logged in
  }
});



if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    signOut(auth)
      .then(() => {
        // Successfully signed out
        window.location.href = "/providerlogin?logout=success";
      })
      .catch((error) => {
        console.error("Error during logout:", error);
      });
  });
}

