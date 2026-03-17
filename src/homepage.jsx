// Last modified: 2026-03-17.
// This file handles homepage rendering and operations.

import { apiClient } from "./main";
import { getMessages, selectDelete } from "./client.js";

// if the user enters input in the search bar
const searchInput = document.getElementById("search-input");
searchInput.addEventListener("keyup", (event) => {
  // const matches = searchContacts();
  if (event.key === "Enter") {
    event.preventDefault();
    searchContacts();
  }
});

// gets the user's ID
export async function getUserId() {
  try {
    const user = await getUserInfo();
    return user.id;
  } catch (error) {
    console.error("Error with getting user ID.");
  }
}

// gets the user's first name and last name
export async function getUserName() {
  try {
    const user = await getUserInfo();
    return `${user.firstName} ${user.lastName}`;
  } catch (error) {
    console.error("Error with getting user name.");
  }
}

// updates profile with the user's first name and last name
async function updateUserName() {
  const userName = document.getElementById("user-info-name-display");
  const fullName = await getUserName();
  userName.textContent = fullName;
}

// creates the contact list
async function createContactList() {
  const contactList = await getAllContacts();

  if (contactList.length == 0) {
    console.log("Contact list is empty.");
    return;
  }
  createContact(contactList);
}

// populates the contact list with contacts
function createContact(contactList) {
  const list = document.getElementById("contact-list");
  list.innerHTML = "";

  if (!contactList.length) {
    console.log("Contact list is empty.");
    return;
  }

  // creates a contact
  contactList.forEach(i => {
    if (i.label != "undefined undefined") {
      const li = document.createElement("li");
      li.classList.add("contact");
      li.classList.add("unselectable");

      // stores the ID invisibly
      li.dataset.id = i.value;

      const picture = document.createElement("div");
      picture.classList.add("profile-picture");
      picture.style.backgroundColor = getRandomColor();

      const name = document.createElement("p");
      name.classList.add("contact-name");
      name.textContent = i.label;

      const icon = document.createElement("span");
      icon.classList.add("material-symbols-outlined");
      icon.textContent = "close";
      icon.onclick = () => selectDelete(li);

      li.appendChild(picture);
      li.appendChild(name);
      li.appendChild(icon);
      li.addEventListener("click", () => selectContact(li));
      list.appendChild(li);
    }
  });
}

// selects a contact
function selectContact(li) {
  if (window.currentRecipient === li.dataset.id) {
    return;
  }

  document.querySelectorAll(".contact").forEach(
    c => c.classList.remove("active")
  );
  li.classList.add("active");

  window.currentRecipient = li.dataset.id;

  console.log("Currently chatting with ID:", window.currentRecipient);
  document.getElementById("messages").innerHTML = "";
  getMessages();
  getContactsForList();
}

// generates a random profile color
function getRandomColor() {
  const h = Math.random() * 360;
  const s = (Math.random() * 40) + 60;
  const l = (Math.random() * 25) + 45;
  return `hsl(${h}, ${s}%, ${l}%)`;
}

// toggles the menu in the sidebar
function toggleMenu(menuId) {
  const menu = document.getElementById(menuId);
  menu.classList.toggle("open-menu");
}

// calls the get user info API, returns the user object
export async function getUserInfo() {
  // sends request using Axios
  try {
    const response = await apiClient.get(
      "/api/auth/userinfo"
    );

    return {id: response.data.id,
            email: response.data.email,
            firstName: response.data.firstName,
            lastName: response.data.lastName
    };
  } catch (error) {
    console.error("Error getting user info:", error);
  }
}

// calls the update profile API
async function editProfile(event) {
  event.preventDefault();
  const message = document.getElementById("error-message");
  message.style.display = "none";
  message.classList.remove("success");

  // gets input elements
  const firstNameInput = document.getElementById("first-name");
  const lastNameInput = document.getElementById("last-name");

  // extracts values
  const firstName = firstNameInput.value.trim();
  const lastName = lastNameInput.value.trim();

  // validates inputs
  if (!firstName || !lastName) {
    message.style.display = "block";
    message.textContent =
      "First or last name is missing. Please try again.";
    return;
  }

  const user = await getUserInfo();
  const first = user.firstName;
  const last = user.lastName;

  // checks if the updated name is the same as the previous name
  if (first == firstName && last == lastName) {
    message.style.display = "block";
    message.textContent =
      "The updated name is the same as the previous name.\n" + 
      "Please try again.";
    return;
  }

  try {
    // sends request using Axios
    const response = await apiClient.post(
      "/api/auth/update-profile",
      {firstName, lastName},
      {headers: {"Content-Type": "application/json"}}
    );

    message.classList.add("success");
    message.style.display = "block";
    message.textContent = "Profile updated. Now reloading.";
    window.setTimeout(() => {
      window.location.reload();
    }, 800);
  } catch (error) {
    console.error("Error updating profile:", error);
  }
}

// calls the search contacts API, returns array with matches
async function searchContacts() {
  const searchTerm = searchInput.value.trim();
  const allContacts = await getAllContacts();

  if (!searchTerm) {
    createContactList(allContacts);
    return;
  }

  try {
    // sends request using Axios
    const response = await apiClient.post(
      "/api/contacts/search",
      {searchTerm: searchTerm}
    );

    const matches = response.data.contacts;

    // filters all contacts to get the first & last names
    const matchesIds = new Set(matches.map(item => item._id));

    const filtered = allContacts.filter(item =>
      matchesIds.has(item.value)).map(item => ({
        value: item.value, label:item.label
      }));

    createContact(filtered);
    return filtered;
  } catch (error) {
      console.log("Error with search:", error);
  }
}

// calls the get all contacts API, returns a contacts array
export async function getAllContacts() {
  try {
    // sends request using Axios
    const response = await apiClient.get(
      "/api/contacts/all-contacts"
    );
    return response.data.contacts;
  } catch (error) {
    console.error("Error getting all contacts:", error);
  }
}

// calls the get contacts for list API,
// returns a contacts array sorted by timestamp
export async function getContactsForList() {
  try {
    // sends request using Axios
    const response = await apiClient.get(
      "/local/contacts/get-contacts-for-list"
    );
    console.log("getContactsForList:", response.data.contacts);
    return response.data.contacts;
  } catch (error) {
    console.error("Error getting contacts sorted by timestamp:", error);

    let status = error.response?.status;
    if (status === 400) {
      console.log("400 Error: no user ID is found in the token.");
    }
  }
}

// attaches function globally
updateUserName();
createContactList();

window.toggleMenu = toggleMenu;
window.editProfile = editProfile;