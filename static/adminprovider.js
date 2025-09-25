// adminprovider.js
import { db } from "./firebase-init.js";
import { collection, onSnapshot } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

const providersTable = document.getElementById("providersTable");
const providerModal = document.getElementById("providerModal");
const providerDetails = document.getElementById("providerDetails");
const closeModal = document.getElementById("closeModal");

function openModal(data) {
  providerDetails.innerHTML = ""; // Clear old content

  for (const [key, value] of Object.entries(data)) {
    const row = document.createElement("div");

    // If value looks like a URL, make it clickable
    if (typeof value === "string" && (value.startsWith("http://") || value.startsWith("https://"))) {
      row.innerHTML = `<strong>${key}:</strong> <a href="${value}" target="_blank" class="text-blue-600 hover:underline">${value}</a>`;
    } else {
      row.innerHTML = `<strong>${key}:</strong> ${value}`;
    }

    providerDetails.appendChild(row);
  }

  providerModal.classList.remove("hidden");
}

// Close modal
closeModal.addEventListener("click", () => {
  providerModal.classList.add("hidden");
});

// Close modal if background clicked
providerModal.addEventListener("click", (e) => {
  if (e.target === providerModal) {
    providerModal.classList.add("hidden");
  }
});

function renderProviders(snapshot) {
  providersTable.innerHTML = "";
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

    // Add click handler for modal
    row.querySelector("button").addEventListener("click", () => openModal(data));

    providersTable.appendChild(row);
  });
}

const providersRef = collection(db, "providers");
onSnapshot(providersRef, renderProviders);
