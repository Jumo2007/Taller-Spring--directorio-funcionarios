const API = "/api/v1/usuarios";
const cajaMensaje = document.getElementById("mensaje");

function mostrar(texto, tipo) {
  cajaMensaje.textContent = texto;
  cajaMensaje.className = "mensaje " + tipo;
}

async function leerMensaje(resp) {
  try {
    const datos = await resp.json();
    return datos.mensaje || "";
  } catch {
    return "";
  }
}

/* ---------- Registro ---------- */
document.getElementById("formRegistro").addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("regUsuario").value.trim();
  const password = document.getElementById("regClave").value;
  const confirmar = document.getElementById("regClave2").value;

  if (username.length < 4 || username.length > 30) {
    mostrar("El usuario debe tener entre 4 y 30 caracteres.", "error");
    return;
  }
  if (password.length < 6) {
    mostrar("La contraseña debe tener al menos 6 caracteres.", "error");
    return;
  }
  if (password !== confirmar) {
    mostrar("Las contraseñas no coinciden.", "error");
    return;
  }

  try {
    const resp = await fetch(`${API}/registro`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (resp.status === 201) {
      mostrar("Cuenta creada correctamente. Ya puedes iniciar sesión.", "exito");
      e.target.reset();
    } else if (resp.status === 409) {
      mostrar(await leerMensaje(resp) || "Ese usuario ya existe.", "error");
    } else if (resp.status === 400) {
      mostrar("Datos inválidos: revisa el usuario y la contraseña.", "error");
    } else {
      throw new Error("Error " + resp.status);
    }
  } catch (err) {
    mostrar("No se pudo registrar: " + err.message, "error");
  }
});

/* ---------- Inicio de sesión ---------- */
document.getElementById("formLogin").addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("logUsuario").value.trim();
  const password = document.getElementById("logClave").value;

  if (!username || !password) {
    mostrar("Escribe tu usuario y tu contraseña.", "error");
    return;
  }

  try {
    const resp = await fetch(`${API}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (resp.ok) {
      mostrar(`Bienvenido, ${username}.`, "exito");
      e.target.reset();
    } else if (resp.status === 401) {
      mostrar(await leerMensaje(resp) || "Usuario o contraseña incorrectos.", "error");
    } else {
      throw new Error("Error " + resp.status);
    }
  } catch (err) {
    mostrar("No se pudo iniciar sesión: " + err.message, "error");
  }
});