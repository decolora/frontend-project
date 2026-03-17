# Frontend for a Chatroom Project
The frontend implementation for the chatroom project. This setup uses [Vite](https://vitejs.dev) for local development and [Node.js](https://nodejs.org) for managing logic and API requests. It includes several HTML pages and JavaScript files to call the backend endpoints from a remote backend URL using Axios for API requests. It uses [Socket.IO](https://socket.io/) for real-time communication.

# Table of Contents
- [Prerequisites](https://github.com/decolora/chatroom-project/new/main#prerequisites)
- [Project Structure](https://github.com/decolora/chatroom-project/new/main#project-structure)
- [Installation](https://github.com/decolora/chatroom-project/new/main#installation)
- [Usage](https://github.com/decolora/chatroom-project/new/main#usage)
- [Credits](https://github.com/decolora/chatroom-project/new/main#credits)

# Prerequisites
Please make sure you have the following installed:
- [Node.js](https://nodejs.org/)
   - [npm](https://www.npmjs.com/) (comes with Node.js)

# Project Structure
```
├── README.md
├── babel.config.cjs
├── homepage.html
├── index.html
├── login.html
├── package-lock.json
├── package.json
├── src
│   ├── client.js
│   ├── homepage.css
│   ├── homepage.jsx
│   ├── index.css
│   ├── main.jsx
│   └── server.js
└── vite.config.cjs
```
- `babel.config.cjs`: Configuration file for Babel, a React transpiler from JSX to JS.
- `client.js`: Contains the logic for the client in the socket communication.
- `homepage.css`: Styling for the homepage HTML page.
- `homepage.jsx`: Contains the logic for the homepage.
- `homepage.html`: A HTML page that renders the homepage.
- `index.css`: Styling for the signup and login pages.
- `index.html`: A HTML page with email/password inputs and a button to trigger the signup request.
- `login.html`: A HTML page similar to index.html, but with a button to trigger the login request.
- `main.jsx`: Contains the logic for signup, login, and logout requests.
- `package-lock.json`: Auto-generated file that locks dependency versions.
- `package.json`: Project metadata, scripts, and dependencies.
- `README.md`: Project documentation (this file).
- `server.js`: Contains the logic for the server in the socket communication.
- `vite.config.cjs`: Configuration file for Vite; contains proxies to bypass domain issues.

# Installation
1. **Clone** the repository or download the source code.
2. **Navigate** to the project directory in your terminal.
3. **Install** dependencies:

   ```
   npm install
   ```
# Usage
1. Start the development server:
   ```
   npm run dev
   ```
2. Open the URL provided by Vite (http://localhost:5173) in your browser.
3. In another terminal, start the server for the socket communication:
   ```
   node src/server.js
   ```
4. Enter your email and password in the form fields and click **Sign up**.
   - If you already have an account, click **Log in**.
- To chat with someone, click on a contact, type a message in the chat field and press Enter.
- To delete direct messages with someone, click on the close icon (X) when hovering over the contact and click **Confirm**.
- To edit your first name or last name, click the menu icon on the top left. Click **Edit Profile**, then enter your first name and last name in the form fields and click **Save**.
- To log out, click the menu icon on the top right. Click **Logout**.

# Credits
The remote backend URL,
```
https://pretorial-portliest-vertie.ngrok-free.dev
```
is provided by the [TA](https://github.com/dreamqin68).
