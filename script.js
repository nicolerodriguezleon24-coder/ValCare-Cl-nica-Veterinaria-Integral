// --- Cambiar entre LOGIN y REGISTRO ---
const tabs = document.querySelectorAll(".auth-tab");
const forms = document.querySelectorAll(".auth-form");
const message = document.getElementById("auth-message");

tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    tabs.forEach(t => t.classList.remove("active"));
    forms.forEach(f => f.classList.remove("active"));

    tab.classList.add("active");
    document.getElementById(`${tab.dataset.form}-form`).classList.add("active");
    message.textContent = "";
  });
});

// --- REGISTRO DE NUEVO USUARIO ---
document.getElementById("register-form").addEventListener("submit", e => {
  e.preventDefault();
  const fullName = document.getElementById("fullName").value.trim();
  const email = document.getElementById("register-email").value.trim();
  const password = document.getElementById("register-password").value;
  const confirm = document.getElementById("confirmPassword").value;

  if (password !== confirm) {
    showMessage("Las contraseñas no coinciden", "error");
    return;
  }

  let users = JSON.parse(localStorage.getItem("users")) || [];

  // Verificar si el usuario ya existe
  if (users.find(u => u.email === email)) {
    showMessage("Este correo ya está registrado", "error");
    return;
  }

  users.push({ fullName, email, password });
  localStorage.setItem("users", JSON.stringify(users));

  showMessage("Cuenta creada con éxito 🎉", "success");
  e.target.reset();
});

// --- INICIO DE SESIÓN ---
document.getElementById("login-form").addEventListener("submit", e => {
  e.preventDefault();
  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value;

  const users = JSON.parse(localStorage.getItem("users")) || [];
  const user = users.find(u => u.email === email && u.password === password);

  if (user) {
    showMessage(`¡Bienvenido, ${user.fullName}! 🐾`, "success");
  } else {
    showMessage("Credenciales incorrectas", "error");
  }
});

// --- FUNCIONES AUXILIARES ---
function showMessage(text, type) {
  message.textContent = text;
  message.style.color = type === "success" ? "#4ecdc4" : "red";
}
