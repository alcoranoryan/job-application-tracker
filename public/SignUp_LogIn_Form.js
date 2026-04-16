document.addEventListener("DOMContentLoaded", () => {
  console.log("JS loaded and DOM ready"); // debug

  const API_BASE = "http://localhost:3000"; //Define a single base URL for your backend API

  const container = document.querySelector('.container');
  const registerBtn = document.querySelector('.register-btn');
  const loginBtn = document.querySelector('.login-btn');

  registerBtn.addEventListener('click', () => container.classList.add('active'));
  loginBtn.addEventListener('click', () => container.classList.remove('active'));

  // LOGIN HANDLER
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = e.target.querySelector("input[name='username']").value;
  const password = e.target.querySelector("input[name='password']").value;

  const res = await fetch(`${API_BASE}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });

  const data = await res.json();
  console.log("Login response:", data);

  if (data.success) {
    window.location.href = `${API_BASE}/index.html`;  // redirect to tracker page
  } else {
    alert("Invalid credentials");
  }
});
 
// REGISTER HANDLER
document.getElementById("registerForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = e.target.querySelector("input[name='username']").value;
  const email = e.target.querySelector("input[name='email']").value;
  const password = e.target.querySelector("input[name='password']").value;

  const res = await fetch(`${API_BASE}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password })
  });

  const data = await res.json();
  if (data.id) {
    alert("Registration successful! Please log in.");
    document.querySelector(".login-btn").click(); // switch to login view
  } else {
    alert("Registration failed. Try again.");
  }
  });
});