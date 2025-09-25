// adminseeker.js
import { db } from "./firebase-init.js";
import { collection, onSnapshot } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

const seekersTable = document.getElementById("seekersTable");
const seekerModal = document.getElementById("seekerModal");
const seekerDetails = document.getElementById("seekerDetails");
const closeSeekerModal = document.getElementById("closeSeekerModal");

function openSeekerModal(data) {
  seekerDetails.innerHTML = "";

  for (const [key, value] of Object.entries(data)) {
    const row = document.createElement("div");

    if (typeof value === "string" && (value.startsWith("http://") || value.startsWith("https://"))) {
      row.innerHTML = `<strong>${key}:</strong> <a href="${value}" target="_blank" class="text-blue-600 hover:underline">${value}</a>`;
    } else {
      row.innerHTML = `<strong>${key}:</strong> ${value}`;
    }

    seekerDetails.appendChild(row);
  }

  seekerModal.classList.remove("hidden");
}

// Close modal
closeSeekerModal.addEventListener("click", () => {
  seekerModal.classList.add("hidden");
});
seekerModal.addEventListener("click", (e) => {
  if (e.target === seekerModal) {
    seekerModal.classList.add("hidden");
  }
});

function renderSeekers(snapshot) {
  seekersTable.innerHTML = "";
  let count = 1;

  snapshot.forEach(doc => {
    const data = doc.data();
    const row = document.createElement("tr");

    row.innerHTML = `
      <td class="py-2 px-4 border-b">${count++}</td>
      <td class="py-2 px-4 border-b">
        <img src="${data.profilePicture || ''}" alt="Profile" class="w-10 h-10 rounded-full object-cover">
      </td>
      <td class="py-2 px-4 border-b">${data.name || ''}</td>
      <td class="py-2 px-4 border-b">${data.username || ''}</td>
      <td class="py-2 px-4 border-b">${data.primaryPhone || ''}</td>
      <td class="py-2 px-4 border-b">${data.email || ''}</td>
      <td class="py-2 px-4 border-b">
        <button class="text-blue-600 hover:underline">Click</button>
      </td>
    `;

    row.querySelector("button").addEventListener("click", () => openSeekerModal(data));

    seekersTable.appendChild(row);
  });
}

// Listen to seekers collection in Firestore
const seekersRef = collection(db, "seekers");
onSnapshot(seekersRef, renderSeekers);
