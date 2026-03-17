// Last modified: 2026-03-17.
// This file handles signup, login, and logout operations.

import axios from "axios";

// uses a proxy in vite.config.cjs to bypass JWT cookie issues
export const SERVER_URL = "/";

// makes REST requests
export const apiClient = axios.create({
  baseURL: SERVER_URL,
  withCredentials: true,
  headers: {"ngrok-skip-browser-warning": "true"}
});

// calls the signup API
async function callSignup(event) {
  event.preventDefault();
  const message = document.getElementById("error-message");
  message.style.display = "none";

  // gets input elements
  const emailInput = document.getElementById("signup-email");
  const passwordInput = document.getElementById("signup-password");

  // extracts values
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  // validates inputs
  if (!email || !password) {
    message.style.display = "block";
    message.textContent = "Email or password is missing. Please try again.";
    return;
  }

  try {
    // sends request using Axios
    const response = await apiClient.post(
      "/api/auth/signup",
      {email, password},
      {headers: {"Content-Type": "application/json"}}
    );

    console.log("Sign up successful:", response.data);
  } catch (error) {
    console.error("Signup error:", error);
    
    if (error.response?.status === 409) {
      message.style.display = "block";
      message.textContent = "Email is already in use. Please try again.";
    }
  }
}

// calls the login API
async function callLogin(event) {
  event.preventDefault();
  const message = document.getElementById("error-message");
  message.style.display = "none";

  // gets input elements
  const emailInput = document.getElementById("login-email");
  const passwordInput = document.getElementById("login-password");

  // extracts values
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  // validates inputs
  if (!email || !password) {
    message.style.display = "block";
    message.textContent = "Email or password is missing. Please try again.";
    return;
  }

  try {
    // sends request using Axios
    const response = await apiClient.post(
      "/api/auth/login",
      {email, password},
      {headers: {"Content-Type": "application/json"}}
    );

    console.log("Login successful:", response.data);
    // redirects to the homepage
    localStorage.setItem("authToken", JSON.stringify(response.data));
    window.location.href = "/homepage.html";
  } catch (error) {
    console.error("Signup error:", error);

    let status = error.response?.status;
    if (status === 400 || status === 404) {
      message.style.display = "block";
      message.textContent =
        "Email or password was incorrect. Please try again.";
    }
  }
}

// calls the logout API
async function callLogout() {
  try {
    // sends request using Axios
    const response = await apiClient.post(
      "/api/auth/logout"
    );

    localStorage.removeItem("authToken");
    window.location.replace("/login.html");
    console.log("Successfully logged out.");
  } catch (error) {
    console.error("Logout error:", error);
  }
}

// attaches function globally
window.callSignup = callSignup;
window.callLogin = callLogin;
window.callLogout = callLogout;