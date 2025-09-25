import { auth, db } from '/static/firebase-init.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
import { doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-storage.js";

const storage = getStorage();
const profilePic = document.getElementById("profilePic");
const profilePicInput = document.getElementById("profilePicInput");
const uploadPicBtn = document.getElementById("uploadPicBtn");

// Fields
const nameField = document.getElementById("nameField");
const usernameField = document.getElementById("usernameField");
const primaryEmailField = document.getElementById("primaryEmailField");
const secondaryEmailField = document.getElementById("secondaryEmailField");

const editNameBtn = document.getElementById("editNameBtn");
const editUsernameBtn = document.getElementById("editUsernameBtn");
const editSecondaryEmailBtn = document.getElementById("editSecondaryEmailBtn");

const primaryPhoneField = document.getElementById("primaryPhoneField");
const secondaryPhoneField = document.getElementById("secondaryPhoneField");
const editPrimaryPhoneBtn = document.getElementById("editPrimaryPhoneBtn");
const editSecondaryPhoneBtn = document.getElementById("editSecondaryPhoneBtn");

// Address fields
const houseField = document.getElementById("houseField");
const streetField = document.getElementById("streetField");
const cityField = document.getElementById("cityField");
const stateField = document.getElementById("stateField");
const pincodeField = document.getElementById("pincodeField");

const websiteField = document.getElementById("websiteField");

const editHouseBtn = document.getElementById("editHouseBtn");
const editStreetBtn = document.getElementById("editStreetBtn");
const editCityBtn = document.getElementById("editCityBtn");
const editStateBtn = document.getElementById("editStateBtn");
const editPincodeBtn = document.getElementById("editPincodeBtn");
const editWebsiteBtn = document.getElementById("editWebsiteBtn");

// Category
const defaultCategories = [
  "IT Services", "Construction", "Healthcare", "Education", 
  "Retail", "Hospitality", "Finance", "Transportation", "Manufacturing", "Other"
];
let selectedCategories = [];

let userRef;

// Helpers
function setupField(field, editBtn) {
  if (field.value.trim() !== "") {
    if (field.tagName === "SELECT") {
      field.disabled = true;
    } else {
      field.readOnly = true;
    }
    editBtn.disabled = false;
  } else {
    if (field.tagName === "SELECT") {
      field.disabled = false;
    } else {
      field.readOnly = false;
    }
    editBtn.disabled = true;
  }
}

function lockField(field, editBtn) {
  if (field.value.trim() !== "") {
    if (field.tagName === "SELECT") {
      field.disabled = true;
    } else {
      field.readOnly = true;
    }
    editBtn.disabled = false;
  } else {
    if (field.tagName === "SELECT") {
      field.disabled = false;
    } else {
      field.readOnly = false;
    }
    editBtn.disabled = true;
  }
}

// Categories chips
function renderCategories() {
  const container = document.getElementById("myCategoriesContainer");
  container.innerHTML = "";
  selectedCategories.forEach((cat, index) => {
    const chip = document.createElement("div");
    chip.className = "flex items-center bg-green-100 text-green-700 px-3 py-1 rounded-full";
    chip.innerHTML = `
      <span>${cat}</span>
      <button type="button" data-index="${index}" class="ml-2 text-red-500 hover:text-red-700">&times;</button>
    `;
    container.appendChild(chip);
  });

  // Chip removal
  container.querySelectorAll("button").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const idx = e.target.getAttribute("data-index");
      selectedCategories.splice(idx, 1);
      renderCategories();
    });
  });
}

function showCategoriesDropdown(filter = "") {
  const dropdown = document.getElementById("categoriesDropdown");
  dropdown.innerHTML = "";

  const filtered = defaultCategories.filter(cat =>
    cat.toLowerCase().includes(filter.toLowerCase()) &&
    !selectedCategories.includes(cat)
  );

  if (filtered.length === 0) {
    dropdown.classList.add("hidden");
    return;
  }

  filtered.forEach(cat => {
    const item = document.createElement("div");
    item.className = "flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer";
    item.innerHTML = `
      <input type="checkbox" value="${cat}" class="mr-2">
      <span>${cat}</span>
    `;
    dropdown.appendChild(item);
  });

  dropdown.classList.remove("hidden");
}

// Auth + Load Data
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "/providerlogin";
    return;
  }

  userRef = doc(db, "providers", user.uid);
  const docSnap = await getDoc(userRef);

  if (docSnap.exists()) {
    const data = docSnap.data();

    // Primary
    nameField.value = data.name || "";
    usernameField.value = data.username || "";
    primaryEmailField.value = data.email || "";
    secondaryEmailField.value = data.secondaryEmail || "";

    // Phone
    primaryPhoneField.value = data.primaryPhone || "";
    secondaryPhoneField.value = data.secondaryPhone || "";
    setupField(primaryPhoneField, editPrimaryPhoneBtn);
    setupField(secondaryPhoneField, editSecondaryPhoneBtn);

    // Address
    houseField.value = data.house || "";
    streetField.value = data.street || "";
    cityField.value = data.city || "";
    stateField.value = data.state || "";
    pincodeField.value = data.pincode || "";
    websiteField.value = data.website || "";

    setupField(houseField, editHouseBtn);
    setupField(streetField, editStreetBtn);
    setupField(cityField, editCityBtn);
    setupField(stateField, editStateBtn);
    setupField(pincodeField, editPincodeBtn);
    setupField(websiteField, editWebsiteBtn);

    // Categories
    selectedCategories = data.categories || [];
    renderCategories();

    if (data.profilePicture) {
      profilePic.src = `${data.profilePicture}?t=${Date.now()}`;
      profilePic.classList.remove("hidden");
      document.getElementById("defaultAvatar").classList.add("hidden");
    } else {
      profilePic.classList.add("hidden");
      document.getElementById("defaultAvatar").classList.remove("hidden");
    }
  }
});

// Edit buttons
editNameBtn.addEventListener("click", () => { nameField.readOnly = false; nameField.focus(); });
editUsernameBtn.addEventListener("click", () => { usernameField.readOnly = false; usernameField.focus(); });
editSecondaryEmailBtn.addEventListener("click", () => { secondaryEmailField.readOnly = false; secondaryEmailField.focus(); });

editPrimaryPhoneBtn.addEventListener("click", () => { if (!editPrimaryPhoneBtn.disabled) { primaryPhoneField.readOnly = false; primaryPhoneField.focus(); }});
editSecondaryPhoneBtn.addEventListener("click", () => { if (!editSecondaryPhoneBtn.disabled) { secondaryPhoneField.readOnly = false; secondaryPhoneField.focus(); }});

// Address edit buttons
editHouseBtn?.addEventListener("click", () => { houseField.readOnly = false; houseField.focus(); });
editStreetBtn?.addEventListener("click", () => { streetField.readOnly = false; streetField.focus(); });
editCityBtn?.addEventListener("click", () => { cityField.readOnly = false; cityField.focus(); });
editStateBtn?.addEventListener("click", () => { stateField.disabled = false; stateField.focus(); });
editPincodeBtn?.addEventListener("click", () => { pincodeField.readOnly = false; pincodeField.focus(); });
editWebsiteBtn?.addEventListener("click", () => {
  websiteField.readOnly = false;
  websiteField.focus();
});

// Open file picker
uploadPicBtn.addEventListener("click", () => {
  profilePicInput.click();
});

profilePicInput.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  if (!userRef) {
    alert("User not loaded yet. Please wait a moment and try again.");
    return;
  }

  try {
    console.log("File selected:", e.target.files[0]);
    const storageRef = ref(storage, `profilePictures/${auth.currentUser.uid}`);
    await uploadBytes(storageRef, file);

    const downloadURL = await getDownloadURL(storageRef);

    await updateDoc(userRef, { profilePicture: downloadURL });

    profilePic.src = `${downloadURL}?t=${Date.now()}`;
    profilePic.classList.remove("hidden");
    document.getElementById("defaultAvatar").classList.add("hidden");

    alert("Profile picture updated successfully!");
  } catch (err) {
    console.error("Error uploading profile picture:", err);
    alert("Failed to update profile picture.");
  }
});

// Category input
const categoryInput = document.getElementById("categoryInput");
const addCategoryBtn = document.getElementById("addCategoryBtn");
const categoriesError = document.getElementById("categoriesError");

categoryInput.addEventListener("input", () => {
  const val = categoryInput.value.trim();
  showCategoriesDropdown(val);
});

categoryInput.addEventListener("focus", () => {
  showCategoriesDropdown("");
});

addCategoryBtn.addEventListener("click", () => {
  const dropdown = document.getElementById("categoriesDropdown");
  const checked = [...dropdown.querySelectorAll("input:checked")].map(i => i.value);

  if (checked.length > 0) {
    selectedCategories.push(...checked);
  } else if (categoryInput.value.trim() && !selectedCategories.includes(categoryInput.value.trim())) {
    selectedCategories.push(categoryInput.value.trim());
  }

  categoryInput.value = "";
  dropdown.classList.add("hidden");
  renderCategories();
});

// Validation helpers
function showError(field, errorId) {
  field.classList.add("border-red-500");
  document.getElementById(errorId).classList.remove("hidden");
  field.scrollIntoView({ behavior: "smooth", block: "center" });
  field.focus();
}

function clearError(field, errorId) {
  field.classList.remove("border-red-500");
  document.getElementById(errorId).classList.add("hidden");
}

// Save
const saveBtn = document.getElementById("saveBtn");
saveBtn.addEventListener("click", async () => {
  if (!userRef) return;

  // Validate
  if (!nameField.value.trim()) { showError(nameField, "nameError"); return; } else { clearError(nameField, "nameError"); }
  if (!usernameField.value.trim()) { showError(usernameField, "usernameError"); return; } else { clearError(usernameField, "usernameError"); }
  if (!primaryPhoneField.value.trim()) { showError(primaryPhoneField, "primaryPhoneError"); return; } else { clearError(primaryPhoneField, "primaryPhoneError"); }
  if (!houseField.value.trim()) { showError(houseField, "houseError"); return; } else { clearError(houseField, "houseError"); }
  if (!streetField.value.trim()) { showError(streetField, "streetError"); return; } else { clearError(streetField, "streetError"); }
  if (!cityField.value.trim()) { showError(cityField, "cityError"); return; } else { clearError(cityField, "cityError"); }
  if (!stateField.value.trim()) { showError(stateField, "stateError"); return; } else { clearError(stateField, "stateError"); }
  if (!pincodeField.value.trim()) { showError(pincodeField, "pincodeError"); return; } else { clearError(pincodeField, "pincodeError"); }

  // Categories required
  if (selectedCategories.length === 0) {
    document.getElementById("categorySection").scrollIntoView({ behavior: "smooth" });
    categoriesError.classList.remove("hidden");
    return;
  }
  categoriesError.classList.add("hidden");

  // Save
  await updateDoc(userRef, {
    name: nameField.value.trim(),
    username: usernameField.value.trim(),
    secondaryEmail: secondaryEmailField.value.trim() || "",
    primaryPhone: primaryPhoneField.value.trim(),
    secondaryPhone: secondaryPhoneField.value.trim() || "",
    house: houseField.value.trim(),
    street: streetField.value.trim(),
    city: cityField.value.trim(),
    state: stateField.value.trim(),
    pincode: pincodeField.value.trim(),
    website: websiteField.value.trim() || "",
    categories: selectedCategories,
  });

  // Lock fields again
  nameField.readOnly = true;
  usernameField.readOnly = true;
  secondaryEmailField.readOnly = true;
  primaryPhoneField.readOnly = true;
  secondaryPhoneField.readOnly = true;
  lockField(houseField, editHouseBtn);
  lockField(streetField, editStreetBtn);
  lockField(cityField, editCityBtn);
  lockField(stateField, editStateBtn);
  lockField(pincodeField, editPincodeBtn);
  lockField(websiteField, editWebsiteBtn);

  alert("Profile updated successfully!");
});
