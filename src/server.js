// Last modified: 2026-03-17.
// This file handles the server side for socket communication.

import express from "express";
import cors from "cors";
import { Server as SocketServer } from "socket.io";

const app = express();
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));
app.use(express.json());

let messages = [];
const userMap = {};

// calls the get messages API
app.post("/api/messages/get-messages", (req, res) => {
  const {id} = req.body;

  if (!id) {
    return res.status(400).json({error: "Missing contactorId."});
  }

  // filters messages for the user
  const history = messages.filter(m =>
    m.sender === id || m.recipient === id
  );
  console.log(`History for ${id}. Found ${history.length} messages.`);
  return res.status(200).json({messages: history});
});

// calls the get contacts for list API
app.get("/local/contacts/get-contacts-for-list", (req, res) => {
  const contactMap = new Map();

  // maps the contacts
  messages.forEach(m => {
    const participants = [m.sender, m.recipient];

    participants.forEach(id => {
      contactMap.set(id, {
        value: id,
        lastMessageTime: m.timestamp
      });
    });
  });

  // sorts the contacts by timestamp
  const sortedContacts = Array.from(contactMap.values())
    .sort((a, b) => new Date(b.lastMessageTime) -
                    new Date(a.lastMessageTime));
  return res.status(200).json({contacts: sortedContacts });
});

// starts the server
const PORT = 8747;
const server = app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

// attaches Socket.IO to the server
const io = new SocketServer(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  }
});

// handles socket connections
io.on("connection", (socket) => {
  const user = socket.handshake.query.user;
  userMap[user] = socket.id;

  console.log(`Client connected: socketId=${socket.id}, user="${user}"`);

  // sends a new message
  socket.on("sendMessage", (data) => {
    const {recipient, content} = data;

    // creates a message
    const newMessage = {
      sender: user,
      recipient: recipient,
      content: content,
      timestamp: new Date().toISOString()
    };

    console.log("newMessage in server.js connection:", newMessage);
    messages.push(newMessage);

    // determines the recipient
    const senderSocketId = userMap[user];
    const recipientSocketId = userMap[recipient];

    if (senderSocketId) {
      io.to(senderSocketId).emit("newMessage", newMessage);
    }
    if (recipientSocketId) {
      io.to(recipientSocketId).emit("newMessage", newMessage);
    }
  });

  // deletes messages
  socket.on("deleteDM", ({contact}) => {
    messages = messages.filter(m =>
      !((m.sender === user && m.recipient === contact) ||
      (m.sender === contact && m.recipient === user))
    );

    // determines the recipient
    const senderSocketId = userMap[user];
    const recipientSocketId = userMap[contact];

    if (senderSocketId) {
      io.to(senderSocketId).emit("dmDeleted", {contact});
    }
    if (recipientSocketId) {
      io.to(recipientSocketId).emit("dmDeleted", {contact});
    }

    console.log(`Deleted messages between ${user} and ${contact}`);
  });

  // if client disconnected
  socket.on("disconnect", () => {
    console.log("Client disconnected: " +
      `socketId=${socket.id}, user=${user}`);
    delete userMap[user];
  });
});