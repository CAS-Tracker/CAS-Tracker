document.addEventListener("DOMContentLoaded", () => {
  actualizarTotales();
  mostrarActividades();
  mostrarReflexiones();
  mostrarReflexionesPreview();
  cargarHorario();
  iniciarContadorReflexion();

  const formAct = document.getElementById("formActividad");
  if (formAct) formAct.addEventListener("submit", guardarActividad);

  const formRef = document.getElementById("formReflexion");
  if (formRef) formRef.addEventListener("submit", guardarReflexion);

  const guardarHorarioBtn = document.getElementById("guardarHorario");
  if (guardarHorarioBtn) guardarHorarioBtn.addEventListener("click", guardarHorario);

  const limpiarHorarioBtn = document.getElementById("limpiarHorario");
  if (limpiarHorarioBtn) limpiarHorarioBtn.addEventListener("click", limpiarHorario);
});

// === ACTIVIDADES ===
function guardarActividad(e) {
  e.preventDefault();
  const nombre = document.getElementById("nombre").value.trim();
  const categoria = document.getElementById("categoria").value;
  const horas = parseInt(document.getElementById("horas").value);
  const fecha = document.getElementById("fecha").value;
  const descripcion = document.getElementById("descripcion").value.trim();

  const actividades = JSON.parse(localStorage.getItem("actividadesCAS")) || [];
  actividades.push({ nombre, categoria, horas, fecha, descripcion });
  localStorage.setItem("actividadesCAS", JSON.stringify(actividades));
  e.target.reset();
  mostrarActividades();
  actualizarTotales();
}

function mostrarActividades() {
  const tabla = document.querySelector("#tablaActividades tbody");
  if (!tabla) return;
  const actividades = JSON.parse(localStorage.getItem("actividadesCAS")) || [];
  tabla.innerHTML = "";
  actividades.forEach((act, i) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${act.nombre}</td>
      <td>${act.categoria}</td>
      <td>${act.horas}</td>
      <td>${act.fecha}</td>
      <td>${act.descripcion}</td>
      <td><button onclick="eliminarActividad(${i})">🗑️</button></td>`;
    tabla.appendChild(tr);
  });
}

function eliminarActividad(index) {
  const confirmar = confirm("¿Estás seguro de que quieres eliminar esta actividad?");
  if (!confirmar) return;

  const actividades = JSON.parse(localStorage.getItem("actividadesCAS")) || [];
  actividades.splice(index, 1);
  localStorage.setItem("actividadesCAS", JSON.stringify(actividades));
  mostrarActividades();
  actualizarTotales();
}

function actualizarTotales() {
  const actividades = JSON.parse(localStorage.getItem("actividadesCAS")) || [];
  let totalC = 0, totalA = 0, totalS = 0;
  actividades.forEach(a => {
    if (a.categoria === "C") totalC += a.horas;
    if (a.categoria === "A") totalA += a.horas;
    if (a.categoria === "S") totalS += a.horas;
  });
  const elC = document.getElementById("totalC");
  if (elC) elC.textContent = `${totalC} horas`;
  const elA = document.getElementById("totalA");
  if (elA) elA.textContent = `${totalA} horas`;
  const elS = document.getElementById("totalS");
  if (elS) elS.textContent = `${totalS} horas`;

  const totalGeneral = totalC + totalA + totalS;
const elG = document.getElementById("totalGeneral");
if (elG) elG.textContent = `${totalGeneral} horas`;
}

// === REFLEXIONES ===
function guardarReflexion(e) {
  e.preventDefault();
  const titulo = document.getElementById("tituloReflexion").value.trim();
  const texto = document.getElementById("textoReflexion").value.trim();
  const fecha = new Date().toLocaleDateString("es-ES");

  let reflexiones = JSON.parse(localStorage.getItem("reflexionesCAS")) || [];

  if (window.reflexionEditando) {
    // Editar reflexión existente
    reflexiones = reflexiones.map(r =>
      r.id === window.reflexionEditando ? { ...r, titulo, texto } : r
    );
    window.reflexionEditando = null;
  } else {
    // Crear nueva reflexión
    reflexiones.push({ id: Date.now(), titulo, texto, fecha });
  }

  localStorage.setItem("reflexionesCAS", JSON.stringify(reflexiones));
  e.target.reset();
  mostrarReflexiones();
}

function mostrarReflexiones() {
  const cont = document.getElementById("listaReflexiones");
  if (!cont) return;

  const reflexiones = JSON.parse(localStorage.getItem("reflexionesCAS")) || [];
  cont.innerHTML = "";

  reflexiones.slice().reverse().forEach(ref => {
    const div = document.createElement("div");
    div.className = "reflexion";

    // contenido textual
    const titulo = document.createElement("h3");
    titulo.textContent = ref.titulo;

    const fecha = document.createElement("small");
    fecha.textContent = ref.fecha;

    const texto = document.createElement("p");
    texto.textContent = ref.texto;

    // botón eliminar
    const btnEliminar = document.createElement("button");
    btnEliminar.textContent = "🗑️ Eliminar";
    btnEliminar.addEventListener("click", () => eliminarReflexion(ref.id));
    
    // botón editar
    const btnEditar = document.createElement("button");
    btnEditar.textContent = "✏️ Editar";
    btnEditar.addEventListener("click", () => editarReflexion(ref.id));

    // botón exportar
    const btnExportar = document.createElement("button");
    btnExportar.textContent = "📄 Exportar a Word";
    btnExportar.addEventListener("click", () => exportarReflexionWord(ref));
        
    // ensamblar todo
    div.appendChild(titulo);
    div.appendChild(fecha);
    div.appendChild(texto);
    div.appendChild(btnEditar);
    div.appendChild(btnEliminar);
    div.appendChild(btnExportar);

    cont.appendChild(div);
  });
}

function eliminarReflexion(id) {
  const confirmar = confirm("¿Seguro que quieres eliminar esta reflexión?");
  if (!confirmar) return;

  let reflexiones = JSON.parse(localStorage.getItem("reflexionesCAS")) || [];

  // Aseguramos que todas las reflexiones tengan un id
  reflexiones = reflexiones.map((r, i) => ({
    ...r,
    id: r.id || i + 1
  }));

  // Filtramos correctamente
  const nuevas = reflexiones.filter(r => r.id !== id);
  localStorage.setItem("reflexionesCAS", JSON.stringify(nuevas));
  mostrarReflexiones();
  mostrarReflexionesPreview(); // 🔹 refresca también el preview
}

function editarReflexion(id) {
  const reflexiones = JSON.parse(localStorage.getItem("reflexionesCAS")) || [];
  const reflexion = reflexiones.find(r => r.id === id);
  if (!reflexion) return;

  document.getElementById("tituloReflexion").value = reflexion.titulo;
  document.getElementById("textoReflexion").value = reflexion.texto;
  // actualizar el contador porque el valor se cambió por código
document.getElementById("textoReflexion").dispatchEvent(new Event('input', { bubbles: true }));

  // Guardamos el id temporalmente
  window.reflexionEditando = id;
}

function mostrarReflexionesPreview() {
  const cont = document.getElementById("previewReflexiones");
  if (!cont) return;
  const reflexiones = JSON.parse(localStorage.getItem("reflexionesCAS")) || [];
  cont.innerHTML = "";
  reflexiones.slice(-2).reverse().forEach(ref => {
    const div = document.createElement("div");
    div.className = "reflexion";
    div.innerHTML = `<strong>${ref.titulo}</strong><br><small>${ref.fecha}</small><p>${ref.texto.substring(0,100)}...</p>`;
    cont.appendChild(div);
  });
}

// === HORARIO ===
function guardarHorario() {
  const filas = document.querySelectorAll("#tablaHorario tbody tr");
  const horario = [];
  filas.forEach(row => {
    const dia = row.children[0].textContent;
    const actividad = row.children[1].textContent.trim();
    horario.push({ dia, actividad });
  });
  localStorage.setItem("horarioCAS", JSON.stringify(horario));
  alert("Horario guardado ✅");
}

function cargarHorario() {
  const horario = JSON.parse(localStorage.getItem("horarioCAS")) || [];
  const filas = document.querySelectorAll("#tablaHorario tbody tr");
  if (!filas.length) return;
  horario.forEach((h, i) => {
    if (filas[i]) filas[i].children[1].textContent = h.actividad;
  });
}

function limpiarHorario() {
  localStorage.removeItem("horarioCAS");
  document.querySelectorAll("#tablaHorario tbody tr td:nth-child(2)").forEach(td => td.textContent = "");
  alert("Horario limpiado 🧹");
}

// === CONTADOR DE PALABRAS (robusto) ===
function contarPalabras(text) {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function actualizarContador(textarea) {
  const counter = document.getElementById('wordCount');
  if (!textarea || !counter) return;
  const n = contarPalabras(textarea.value);
  const MAX = 400, WARN = 350;
  counter.textContent = `${n} palabra${n === 1 ? '' : 's'}`;
  counter.classList.toggle('warning', n >= WARN && n <= MAX);
  counter.classList.toggle('exceeded', n > MAX);
}

function iniciarContadorReflexion() {
  const counter = document.getElementById('wordCount');
  if (!counter) return;

  function conectarTextarea() {
    const textarea = document.getElementById('textoReflexion');
    if (!textarea) return false;

    const actualizar = () => actualizarContador(textarea);
    // Escuchar varios eventos por compatibilidad móvil
    ['input', 'keyup', 'change', 'paste'].forEach(evt => {
      textarea.addEventListener(evt, actualizar);
    });
    actualizar(); // actualizar inmediatamente
    return true;
  }

  if (!conectarTextarea()) {
    // si el textarea no existe aún, observar hasta que aparezca
    const obs = new MutationObserver(() => {
      if (conectarTextarea()) obs.disconnect();
    });
    obs.observe(document.body, { childList: true, subtree: true });
  }
}

function exportarDatos() {
  const data = {
    actividades: JSON.parse(localStorage.getItem("actividadesCAS")) || [],
    reflexiones: JSON.parse(localStorage.getItem("reflexionesCAS")) || [],
    horario: JSON.parse(localStorage.getItem("horarioCAS")) || []
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "cas_backup.json";
  a.click();
}

////
function exportarReflexionWord(ref) {
  const { titulo, texto, fecha } = ref;
  const { Document, Packer, Paragraph, TextRun, HeadingLevel } = window.docx;

  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph({
          text: titulo,
          heading: HeadingLevel.HEADING_1,
          spacing: { after: 200 },
        }),
        new Paragraph({
          text: `Fecha: ${fecha}`,
          spacing: { after: 200 },
          style: "SubtleEmphasis",
        }),
        new Paragraph({
          children: [new TextRun({ text: texto, size: 24 })],
          spacing: { line: 360 },
        }),
      ],
    }],
  });

  Packer.toBlob(doc).then(blob => {
    saveAs(blob, `${titulo}.docx`);
  });
}

////

document.getElementById("exportWord").addEventListener("click", async () => {
  // Importamos lo necesario desde la librería docx
  const { Document, Packer, Paragraph, TextRun } = window.docx;

  // Obtenemos todas las reflexiones
  const reflexiones = document.querySelectorAll(".reflexion");
  if (reflexiones.length === 0) {
    alert("No hay reflexiones para exportar.");
    return;
  }

  // Creamos un nuevo documento
  const doc = new Document();

  // Agregamos cada reflexión al documento
  reflexiones.forEach((r, index) => {
    const titulo = r.querySelector("h3")?.innerText || `Reflexión ${index + 1}`;
    const texto = r.querySelector("p")?.innerText || "";

    // Título en negrita y tamaño mayor
    doc.addSection({
      children: [
        new Paragraph({
          children: [
            new TextRun({
              text: titulo,
              bold: true,
              size: 28, // tamaño del texto en puntos (1/2 pt)
            }),
          ],
          spacing: { after: 200 }, // espacio después del párrafo
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: texto,
              size: 24, // tamaño normal
            }),
          ],
          spacing: { after: 300 }, // espacio después del párrafo
        }),
      ],
    });
  });

  // Generamos el archivo y lo descargamos
  const blob = await Packer.toBlob(doc);
  saveAs(blob, "Reflexiones.docx");
});

