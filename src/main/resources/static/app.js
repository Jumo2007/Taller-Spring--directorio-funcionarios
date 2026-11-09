const API = "/api/v1/funcionarios";

const el = {
  mensaje: document.getElementById("mensaje"),
  titulo: document.getElementById("tituloFormulario"),
  form: document.getElementById("formulario"),
  id: document.getElementById("id"),
  nombre: document.getElementById("nombre"),
  cargo: document.getElementById("cargo"),
  departamento: document.getElementById("departamento"),
  telefono: document.getElementById("telefono"),
  buscarId: document.getElementById("buscarId"),
  buscarNombre: document.getElementById("buscarNombre"),
  buscarDepto: document.getElementById("buscarDepto"),
  tbody: document.getElementById("cuerpoTabla"),
};

/* ---------- Mensajes ---------- */
function mostrarMensaje(texto, tipo) {
  el.mensaje.textContent = texto;
  el.mensaje.className = "mensaje " + tipo;
}

/* ---------- Tabla ---------- */
function pintarTabla(lista) {
  el.tbody.innerHTML = "";
  lista.forEach((f) => {
    const tr = document.createElement("tr");

    [f.id, f.nombre, f.cargo, f.departamento, f.telefono ?? ""].forEach((valor) => {
      const td = document.createElement("td");
      td.textContent = valor; // textContent evita inyección de HTML
      tr.appendChild(td);
    });

    const tdAcc = document.createElement("td");

    const btnEditar = document.createElement("button");
    btnEditar.textContent = "Editar";
    btnEditar.className = "btn-fila";
    btnEditar.addEventListener("click", () => cargarParaEditar(f.id));

    const btnEliminar = document.createElement("button");
    btnEliminar.textContent = "Eliminar";
    btnEliminar.className = "btn-fila peligro";
    btnEliminar.addEventListener("click", () => eliminar(f.id, f.nombre));

    tdAcc.append(btnEditar, btnEliminar);
    tr.appendChild(tdAcc);
    el.tbody.appendChild(tr);
  });
}

/* ---------- Listar y búsquedas ---------- */
async function cargarLista(url, textoSinResultados, textoExito) {
  try {
    const resp = await fetch(url);
    if (resp.status === 204) {
      pintarTabla([]);
      mostrarMensaje(textoSinResultados, "info");
      return;
    }
    if (!resp.ok) throw new Error("Error " + resp.status);
    const datos = await resp.json();
    pintarTabla(datos);
    if (textoExito) mostrarMensaje(textoExito, "exito");
  } catch (e) {
    mostrarMensaje("No se pudo completar la operación: " + e.message, "error");
  }
}

function verTodos(mostrarExito = false) {
  return cargarLista(
    API,
    "El directorio está vacío.",
    mostrarExito ? "Listado completo cargado." : null
  );
}

async function consultarPorId() {
  const id = el.buscarId.value.trim();
  if (!id) {
    mostrarMensaje("Escribe un ID para consultar.", "error");
    return;
  }
  try {
    const resp = await fetch(`${API}/${encodeURIComponent(id)}`);
    if (resp.status === 404) {
      pintarTabla([]);
      mostrarMensaje(`No existe un funcionario con ID ${id}.`, "info");
      return;
    }
    if (!resp.ok) throw new Error("Error " + resp.status);
    pintarTabla([await resp.json()]);
    mostrarMensaje("Funcionario encontrado.", "exito");
  } catch (e) {
    mostrarMensaje("No se pudo completar la operación: " + e.message, "error");
  }
}

function buscarPorNombre() {
  const q = el.buscarNombre.value.trim();
  if (!q) {
    mostrarMensaje("Escribe parte del nombre para buscar.", "error");
    return;
  }
  cargarLista(
    `${API}?nombre=${encodeURIComponent(q)}`,
    `No hay funcionarios cuyo nombre contenga "${q}".`,
    "Búsqueda por nombre completada."
  );
}

function filtrarPorDepartamento() {
  const d = el.buscarDepto.value.trim();
  if (!d) {
    mostrarMensaje("Escribe un departamento para filtrar.", "error");
    return;
  }
  cargarLista(
    `${API}?departamento=${encodeURIComponent(d)}`,
    `No hay funcionarios en el departamento "${d}".`,
    "Filtro por departamento completado."
  );
}

/* ---------- Formulario ---------- */
function limpiarFormulario() {
  el.form.reset();
  el.id.value = "";
  el.titulo.textContent = "Registrar funcionario";
}

async function cargarParaEditar(id) {
  try {
    const resp = await fetch(`${API}/${id}`);
    if (resp.status === 404) {
      mostrarMensaje("El funcionario ya no existe.", "error");
      verTodos();
      return;
    }
    if (!resp.ok) throw new Error("Error " + resp.status);
    const f = await resp.json();
    el.id.value = f.id;
    el.nombre.value = f.nombre;
    el.cargo.value = f.cargo;
    el.departamento.value = f.departamento;
    el.telefono.value = f.telefono ?? "";
    el.titulo.textContent = `Editar funcionario #${f.id}`;
    window.scrollTo({ top: 0, behavior: "smooth" });
  } catch (e) {
    mostrarMensaje("No se pudo cargar el funcionario: " + e.message, "error");
  }
}

async function guardar(evento) {
  evento.preventDefault();

  const datos = {
    nombre: el.nombre.value.trim(),
    cargo: el.cargo.value.trim(),
    departamento: el.departamento.value.trim(),
    telefono: el.telefono.value.trim(),
  };

  if (!datos.nombre || !datos.cargo || !datos.departamento) {
    mostrarMensaje("Nombre, cargo y departamento son obligatorios.", "error");
    return;
  }

  const editando = el.id.value !== "";
  const url = editando ? `${API}/${el.id.value}` : API;
  const metodo = editando ? "PUT" : "POST";

  try {
    const resp = await fetch(url, {
      method: metodo,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos),
    });

    if (resp.status === 404) {
      mostrarMensaje("El funcionario no existe; no se pudo actualizar.", "error");
      return;
    }
    if (resp.status === 400) {
      mostrarMensaje("Datos inválidos: revisa los campos obligatorios.", "error");
      return;
    }
    if (!resp.ok) throw new Error("Error " + resp.status);

    mostrarMensaje(
      editando ? "Funcionario actualizado correctamente." : "Funcionario registrado correctamente.",
      "exito"
    );
    limpiarFormulario();
    await verTodos();
  } catch (e) {
    mostrarMensaje("No se pudo guardar: " + e.message, "error");
  }
}

/* ---------- Eliminar ---------- */
async function eliminar(id, nombre) {
  if (!confirm(`¿Eliminar a "${nombre}"? Esta acción no se puede deshacer.`)) {
    return; // Si cancela, el registro se conserva
  }
  try {
    const resp = await fetch(`${API}/${id}`, { method: "DELETE" });
    if (resp.status === 404) {
      mostrarMensaje("El funcionario ya no existe.", "error");
    } else if (resp.status === 204) {
      mostrarMensaje("Funcionario eliminado correctamente.", "exito");
      if (el.id.value === String(id)) limpiarFormulario();
    } else {
      throw new Error("Error " + resp.status);
    }
    await verTodos();
  } catch (e) {
    mostrarMensaje("No se pudo eliminar: " + e.message, "error");
  }
}

/* ---------- Eventos e inicio ---------- */
el.form.addEventListener("submit", guardar);
document.getElementById("btnLimpiar").addEventListener("click", limpiarFormulario);
document.getElementById("btnBuscarId").addEventListener("click", consultarPorId);
document.getElementById("btnBuscarNombre").addEventListener("click", buscarPorNombre);
document.getElementById("btnBuscarDepto").addEventListener("click", filtrarPorDepartamento);
document.getElementById("btnVerTodos").addEventListener("click", () => verTodos(true));

verTodos();