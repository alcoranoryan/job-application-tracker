document.addEventListener("DOMContentLoaded", () => {
  console.log("JS loaded and DOM ready"); // debug

  const container = document.querySelector('.container');
  const registerBtn = document.querySelector('.register-btn');
  const loginBtn = document.querySelector('.login-btn');

  registerBtn.addEventListener('click', () => container.classList.add('active'));
  loginBtn.addEventListener('click', () => container.classList.remove('active'));

  // LOGIN HANDLER
  document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = e.target.querySelector("input[placeholder='Username']").value;
    const password = e.target.querySelector("input[placeholder='Password']").value;

    const res = await fetch("http://localhost:3000/SignUp_LogIn_Form.html", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    console.log("Login response:", data);
    if (data.success) {
      window.location.href = "http://localhost:3000/index.html";
    } else {
      alert("Invalid credentials");
    }
  });

  // REGISTER HANDLER
  document.getElementById("registerForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    console.log("Register form submitted"); // debug

    const username = e.target.querySelector("input[placeholder='Username']").value;
    const email = e.target.querySelector("input[placeholder='Email']").value;
    const password = e.target.querySelector("input[placeholder='Password']").value;

    const res = await fetch("http://localhost:3000/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password })
    });

    const data = await res.json();
    if (data.id) {
      alert("Registration successful! Please log in.");
      loginBtn.click(); // switch to login view
    } else {
      alert("Registration failed. Try a different username or check server logs.");
    }
  });
});