// Last modified: 2026-03-17.
// This file handles the client side for socket communication.

import { apiClient } from "./main";
import { getUserId, getAllContacts, getUserName } from "./homepage";
import { io } from "socket.io-client";

let socket = null;
let currentSender = "me";
let selectedContact = null;

const SERVER_URL = "http://localhost:8747";

// connects to the socket
async function connectSocket() {
  currentSender = await getUserId();

  // connects to the socket via proxy (vite.config.cjs)
  socket = io(SERVER_URL, {
    withCredentials: true,
    extraHeaders: {"ngrok-skip-browser-warning": "true"},
    transports: ["websocket"],
    query: {user: currentSender},
    reconnectionAttempts: 3
  });

  // connects to the socket
  socket.on("connect", () => {
    console.log("Socket connected:", socket.id, "as role:", currentSender);
  })

  // receives and displays a new message
  socket.on("newMessage", async (data) => {
    const timeString = new Date(data.timestamp).toLocaleString();

    if (data.sender === window.currentRecipient ||
        data.sender === currentSender) {
      await displayMessage(data.sender, data.content, timeString);
    }
  });

  // deletes direct messages
  socket.on("dmDeleted", ({contact}) => {
    if (contact == window.currentRecipient) {
      document.getElementById("messages").innerHTML = "";
    }
    console.log("DMs deleted with:", contact);
  });
};

// calls the get messages API
export async function getMessages(event) {
  if (event) event.preventDefault();

  if (!socket) {
    console.log("Error with the socket.");
    return;
  }

  if (!window.currentRecipient) {
    console.log("Choose someone to message first.");
    return;
  }

  const input = document.getElementById("message-input");
  const text = input ? input.value.trim() : "";

  if (!text) {
    try {
      // sends a request to Axios
      const response = await apiClient.post(
        `${SERVER_URL}/api/messages/get-messages`,
        {id: window.currentRecipient}
      );

      if (response.data.messages) {
        const list = document.getElementById("messages");
        list.innerHTML = "";

        const filtered = response.data.messages.filter(
          m => m.sender === currentSender || m.recipient === currentSender
        )
        .sort((a, b) =>
          new Date(a.timestamp).getTime() -
          new Date(b.timestamp).getTime());

        filtered.forEach(i => {
          const timeString = new Date(i.timestamp).toLocaleString();
          displayMessage(i.sender, i.content, timeString);
        });
      }
    } catch (error) {
      console.error("Error getting message:", error);
    }
  }
  else {
    if (socket && window.currentRecipient) {
      socket.emit("sendMessage", {
        recipient: window.currentRecipient,
        content: text,
        timestamp: new Date().toISOString()
      });
      input.value = "";
    }
  }
}

// displays the message
async function displayMessage(sender, text, time) {
  const list = document.getElementById("messages");
  const isMe = sender === currentSender;

  // converts user ID to name
  let name = "";
  if (isMe) {
    name = await getUserName();
  }
  else {
    const allContacts = await getAllContacts();
    const match = allContacts.find(item => item.value == sender);
    name = match.label;

    if (!match) {
      console.log("No match.");
      return;
    }
  }

  const messageClass = isMe ? "message-me" : "message-them";

  list.innerHTML += `
    <li class="message-row ${isMe ? 'row-me' : 'row-them'}">
      <div class="message-bubble ${messageClass}">
        <b class="message-sender">${name}</b>
        <span class="message-text">${text}</span>
        <div class="message-time">${time}</div>
      </div>
    </li>
  `;

  autoScrollMessages();
}

/* ****************************** DELETE ****************************** */

// selects the option to delete direct messages
export function selectDelete(li) {
  selectedContact = li;
  toggleMenu("delete-sub-menu");
}

// calls the delete direct messages API
async function deleteDirectMessages(event) {
  event.preventDefault();

  if (!selectedContact) return;

  const contactId = selectedContact.dataset.id;

  try {
    // sends request using Axios
    const response = await apiClient.delete(
      `/api/contacts/delete-dm/${contactId}`
    );

    console.log(`Direct messages from ${contactId} were deleted.`);
  } catch (error) {
    console.error("Error deleting DMs:", error);

    let status = error.response?.status;
    if (status === 400) {
      console.log("400 Error: The user ID is missing or invalid.");
    }
  }

  socket.emit("deleteDM", {contact: contactId});
  toggleMenu("delete-sub-menu");
  selectedContact = null;
  return;
}

// auto-scrolls to the last message
function autoScrollMessages() {
  const container = document.getElementById("messages");
  if (!container) return;

  const visibleHeight = container.offsetHeight;
  const totalHeight = container.scrollHeight;
  const scrollOffset = container.scrollTop + visibleHeight;

  if (totalHeight <= scrollOffset + 100) {
    // container.scrollTop = container.scrollHeight;
    container.scrollTo({
      top: container.scrollHeight,
      behavior: "smooth"
    });
  }
}

// attaches function globally
window.connectSocket = connectSocket;
window.getMessages = getMessages;
window.deleteDirectMessages = deleteDirectMessages;

window.addEventListener("DOMContentLoaded", async () => {
  await connectSocket();

  const form = document.getElementById("chatroom-form");
  if (form) {
    form.addEventListener("submit", (e) => getMessages(e));
  }
});