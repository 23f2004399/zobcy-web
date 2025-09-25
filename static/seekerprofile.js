import { auth, db } from '/static/firebase-init.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
import { doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-storage.js";

const storage = getStorage();
const profilePic = document.getElementById("profilePic");
const profilePicInput = document.getElementById("profilePicInput");
const uploadPicBtn = document.getElementById("uploadPicBtn");

const nameField = document.getElementById("nameField");
const usernameField = document.getElementById("usernameField");
const primaryEmailField = document.getElementById("primaryEmailField");
const secondaryEmailField = document.getElementById("secondaryEmailField");
const dobField = document.getElementById("dobField");
const genderField = document.getElementById("genderField");

const editNameBtn = document.getElementById("editNameBtn");
const editUsernameBtn = document.getElementById("editUsernameBtn");
const editSecondaryEmailBtn = document.getElementById("editSecondaryEmailBtn");
const dobPickerBtn = document.getElementById("dobPickerBtn");
const saveBtn = document.getElementById("saveBtn");

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

const editHouseBtn = document.getElementById("editHouseBtn");
const editStreetBtn = document.getElementById("editStreetBtn");
const editCityBtn = document.getElementById("editCityBtn");
const editStateBtn = document.getElementById("editStateBtn");
const editPincodeBtn = document.getElementById("editPincodeBtn");

const defaultSkills = [
  "Cooking", "Driving", "Plumbing", "Carpentry", "Gardening", 
  "Cleaning", "Electrician", "Babysitting", "Teaching", "Painting", "Programming"
];
let selectedSkills = [];
const defaultHobbies = [
  "Reading", "Traveling", "Photography", "Music", "Dancing",
  "Cooking", "Sports", "Gaming", "Fishing", "Yoga"
];
let selectedHobbies = [];


let userRef; // Firestore doc reference


// Helper: lock/unlock setup
function setupField(field, editBtn) {
  if (field.value) {
    // Lock field if value exists
    if (field.tagName === "SELECT") {
      field.disabled = true;
    } else {
      field.readOnly = true;
    }
    editBtn.disabled = false;
  } else {
    // Allow typing if no value from DB
    if (field.tagName === "SELECT") {
      field.disabled = false;
    } else {
      field.readOnly = false;
    }
    editBtn.disabled = true;
  }
}

// Helper: lock after save
function lockField(field, editBtn) {
  if (field.value.trim()) {
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

function renderSkills() {
  const container = document.getElementById("mySkillsContainer");
  container.innerHTML = "";
  selectedSkills.forEach((skill, index) => {
    const chip = document.createElement("div");
    chip.className = "flex items-center bg-green-100 text-green-700 px-3 py-1 rounded-full";
    chip.innerHTML = `
      <span>${skill}</span>
      <button type="button" data-index="${index}" class="ml-2 text-red-500 hover:text-red-700">&times;</button>
    `;
    container.appendChild(chip);
  });

  // Handle chip removal
  container.querySelectorAll("button").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const idx = e.target.getAttribute("data-index");
      selectedSkills.splice(idx, 1);
      renderSkills();
    });
  });
}

function renderHobbies() {
  const container = document.getElementById("myHobbiesContainer");
  container.innerHTML = "";
  selectedHobbies.forEach((hobby, index) => {
    const chip = document.createElement("div");
    chip.className = "flex items-center bg-green-100 text-green-700 px-3 py-1 rounded-full";
    chip.innerHTML = `
      <span>${hobby}</span>
      <button type="button" data-index="${index}" class="ml-2 text-red-500 hover:text-red-700">&times;</button>
    `;
    container.appendChild(chip);
  });

  // Handle chip removal
  container.querySelectorAll("button").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const idx = e.target.getAttribute("data-index");
      selectedHobbies.splice(idx, 1);
      renderHobbies();
    });
  });
}


function showDropdown(filter = "") {
  const dropdown = document.getElementById("skillsDropdown");
  dropdown.innerHTML = "";

  const filtered = defaultSkills.filter(skill =>
    skill.toLowerCase().includes(filter.toLowerCase()) &&
    !selectedSkills.includes(skill)
  );

  if (filtered.length === 0) {
    dropdown.classList.add("hidden");
    return;
  }

  filtered.forEach(skill => {
    const item = document.createElement("div");
    item.className = "flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer";
    item.innerHTML = `
      <input type="checkbox" value="${skill}" class="mr-2">
      <span>${skill}</span>
    `;
    dropdown.appendChild(item);
  });

  dropdown.classList.remove("hidden");
}

function showHobbiesDropdown(filter = "") {
  const dropdown = document.getElementById("hobbiesDropdown");
  dropdown.innerHTML = "";

  const filtered = defaultHobbies.filter(hobby =>
    hobby.toLowerCase().includes(filter.toLowerCase()) &&
    !selectedHobbies.includes(hobby)
  );

  if (filtered.length === 0) {
    dropdown.classList.add("hidden");
    return;
  }

  filtered.forEach(hobby => {
    const item = document.createElement("div");
    item.className = "flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer";
    item.innerHTML = `
      <input type="checkbox" value="${hobby}" class="mr-2">
      <span>${hobby}</span>
    `;
    dropdown.appendChild(item);
  });

  dropdown.classList.remove("hidden");
}


// Auth + Load Data
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "/seekerlogin";
    return;
  }

  userRef = doc(db, "seekers", user.uid);
  const docSnap = await getDoc(userRef);

  if (docSnap.exists()) {
    const data = docSnap.data();

    // Personal
    nameField.value = data.name || "";
    usernameField.value = data.username || "";
    primaryEmailField.value = data.email || "";
    secondaryEmailField.value = data.secondaryEmail || "";
    dobField.value = data.dob || "";
    genderField.value = data.gender || "";

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

    setupField(houseField, editHouseBtn);
    setupField(streetField, editStreetBtn);
    setupField(cityField, editCityBtn);
    setupField(stateField, editStateBtn);
    setupField(pincodeField, editPincodeBtn);

    selectedSkills = data.skills || [];
    renderSkills();

    selectedHobbies = data.hobbies || [];
    renderHobbies();

    
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
dobPickerBtn.addEventListener("click", () => { dobField.type = "date"; dobField.readOnly = false; dobField.focus(); });

editPrimaryPhoneBtn.addEventListener("click", () => { if (!editPrimaryPhoneBtn.disabled) { primaryPhoneField.readOnly = false; primaryPhoneField.focus(); }});
editSecondaryPhoneBtn.addEventListener("click", () => { if (!editSecondaryPhoneBtn.disabled) { secondaryPhoneField.readOnly = false; secondaryPhoneField.focus(); }});

// Address edit buttons
editHouseBtn.addEventListener("click", () => { houseField.readOnly = false; houseField.focus(); });
editStreetBtn.addEventListener("click", () => { streetField.readOnly = false; streetField.focus(); });
editCityBtn.addEventListener("click", () => { cityField.readOnly = false; cityField.focus(); });
editStateBtn.addEventListener("click", () => { stateField.disabled = false; stateField.focus(); });
editPincodeBtn.addEventListener("click", () => { pincodeField.readOnly = false; pincodeField.focus(); });

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


// Skills input + dropdown
const skillInput = document.getElementById("skillInput");
const addSkillBtn = document.getElementById("addSkillBtn");
const skillsError = document.getElementById("skillsError");

// Typing in skill box filters dropdown
skillInput.addEventListener("input", () => {
  const val = skillInput.value.trim();
  showDropdown(val);  // <-- always call showDropdown
});

skillInput.addEventListener("focus", () => {
  showDropdown(""); // <-- empty filter means show all
});

// Add button
addSkillBtn.addEventListener("click", () => {
  const dropdown = document.getElementById("skillsDropdown");
  const checked = [...dropdown.querySelectorAll("input:checked")].map(i => i.value);

  if (checked.length > 0) {
    selectedSkills.push(...checked);
  } else if (skillInput.value.trim() && !selectedSkills.includes(skillInput.value.trim())) {
    selectedSkills.push(skillInput.value.trim());
  }

  skillInput.value = "";
  dropdown.classList.add("hidden");
  renderSkills();
});


// Hobbies input + dropdown
const hobbyInput = document.getElementById("hobbyInput");
const addHobbyBtn = document.getElementById("addHobbyBtn");
const hobbiesError = document.getElementById("hobbiesError");

// Typing filters hobby dropdown
hobbyInput.addEventListener("input", () => {
  const val = hobbyInput.value.trim();
  showHobbiesDropdown(val);
});

// Show all hobbies when input focused
hobbyInput.addEventListener("focus", () => {
  showHobbiesDropdown("");
});

// Add button
addHobbyBtn.addEventListener("click", () => {
  const dropdown = document.getElementById("hobbiesDropdown");
  const checked = [...dropdown.querySelectorAll("input:checked")].map(i => i.value);

  if (checked.length > 0) {
    selectedHobbies.push(...checked);
  } else if (hobbyInput.value.trim() && !selectedHobbies.includes(hobbyInput.value.trim())) {
    selectedHobbies.push(hobbyInput.value.trim());
  }

  hobbyInput.value = "";
  dropdown.classList.add("hidden");
  renderHobbies();
});

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
saveBtn.addEventListener("click", async () => {
  if (!userRef) return;

    if (!nameField.value.trim()) {
    showError(nameField, "nameError");
    return;
    } else {
    clearError(nameField, "nameError");
    }

    if (!usernameField.value.trim()) {
    showError(usernameField, "usernameError");
    return;
    } else {
    clearError(usernameField, "usernameError");
    }

    if (!dobField.value.trim()) {
    showError(dobField, "dobError");
    return;
    } else {
    clearError(dobField, "dobError");
    }

    if (!genderField.value.trim()) {
    showError(genderField, "genderError");
    return;
    } else {
    clearError(genderField, "genderError");
    }

    if (!primaryPhoneField.value.trim()) {
    showError(primaryPhoneField, "primaryPhoneError");
    return;
    } else {
    clearError(primaryPhoneField, "primaryPhoneError");
    }


  // Address validation
  if (!houseField.value.trim()) { showError(houseField, "houseError"); return; } else { clearError(houseField, "houseError"); }
  if (!streetField.value.trim()) { showError(streetField, "streetError"); return; } else { clearError(streetField, "streetError"); }
  if (!cityField.value.trim()) { showError(cityField, "cityError"); return; } else { clearError(cityField, "cityError"); }
  if (!stateField.value.trim()) { showError(stateField, "stateError"); return; } else { clearError(stateField, "stateError"); }
  if (!pincodeField.value.trim()) { showError(pincodeField, "pincodeError"); return; } else { clearError(pincodeField, "pincodeError"); }

  // Skills validation
    if (selectedSkills.length === 0) {
    document.getElementById("skillsSection").scrollIntoView({ behavior: "smooth" });
    skillsError.classList.remove("hidden");
    return;
    }
    skillsError.classList.add("hidden");

    // Hobbies validation
    if (selectedHobbies.length === 0) {
    document.getElementById("hobbiesSection").scrollIntoView({ behavior: "smooth" });
    hobbiesError.classList.remove("hidden");
    return;
    }
    hobbiesError.classList.add("hidden");




  // Save to Firestore
  await updateDoc(userRef, {
    name: nameField.value.trim(),
    username: usernameField.value.trim(),
    secondaryEmail: secondaryEmailField.value.trim() || "",
    dob: dobField.value || "",
    gender: genderField.value || "",
    primaryPhone: primaryPhoneField.value.trim(),
    secondaryPhone: secondaryPhoneField.value.trim() || "",
    house: houseField.value.trim(),
    street: streetField.value.trim(),
    city: cityField.value.trim(),
    state: stateField.value.trim(),
    pincode: pincodeField.value.trim(),
    skills: selectedSkills,
    hobbies: selectedHobbies,

  });

  // Lock fields again
  nameField.readOnly = true;
  usernameField.readOnly = true;
  secondaryEmailField.readOnly = true;
  dobField.type = "text";
  primaryPhoneField.readOnly = true;
  secondaryPhoneField.readOnly = true;

  lockField(houseField, editHouseBtn);
  lockField(streetField, editStreetBtn);
  lockField(cityField, editCityBtn);
  lockField(stateField, editStateBtn);
  lockField(pincodeField, editPincodeBtn);

  alert("Profile updated successfully!");
});
