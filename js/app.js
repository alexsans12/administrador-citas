let DB;

// Campos del formulario
const mascotaInput = document.querySelector("#mascota");
const propietarioInput = document.querySelector("#propietario");
const telefonoInput = document.querySelector("#telefono");
const fechaInput = document.querySelector("#fecha");
const horaInput = document.querySelector("#hora");
const sintomasInput = document.querySelector("#sintomas");

// User Interface UI
const formulario = document.querySelector("#nueva-cita");
const contenedorCitas = document.querySelector("#citas");

// Heading
const heading = document.querySelector("#administra");

const fragment = new DocumentFragment();

let editando;

class Citas {
    constructor() {
        this.citas = [];
    }

    agregarCita(cita) {
        this.citas = [...this.citas, cita];
    }

    eliminarCita(id) {
        this.citas = this.citas.filter((cita) => cita.id !== id);
    }

    editarCita(citaActualizada) {
        this.citas = this.citas.map((cita) =>
            cita.id === citaActualizada.id ? citaActualizada : cita
        );
    }
}

class UI {
    constructor({ citas }) {
        this.textoHeading(citas);
    }
    imprimirAlerta(mensaje, tipo) {
        // Crear el div
        const mensajeDiv = document.createElement("div");
        mensajeDiv.classList.add("text-center", "alert", "d-block", "col-12");

        // Agregar clase en base al tipo de error
        if (tipo === "error") {
            mensajeDiv.classList.add("alert-danger");
        } else {
            mensajeDiv.classList.add("alert-success");
        }

        if (document.querySelectorAll("div .alert").length >= 2) return;

        // Mensaje de la alerta
        mensajeDiv.textContent = mensaje;

        // Agregar al DOM
        fragment.appendChild(mensajeDiv);
        document
            .querySelector("#contenido")
            .insertBefore(fragment, document.querySelector(".agregar-cita"));

        setTimeout(() => {
            mensajeDiv.remove();
        }, 5000);
    }

    imprimirCitas() {
        this.limpiarHTML();

        // Leer el contenido de la base de datos
        const objectStore = DB.transaction("citas").objectStore("citas");

        const fnTextoHeading = this.textoHeading;

        const total = objectStore.count();
        total.onsuccess = function () {
            fnTextoHeading(total.result);
        };

        // Itera sobre cada elemento de la indexDB
        objectStore.openCursor().onsuccess = (e) => {
            const cursor = e.target.result;

            if (cursor) {
                // Extraer inforamación del objeto de cita
                const {
                    id,
                    mascota,
                    propietario,
                    telefono,
                    fecha,
                    hora,
                    sintomas,
                } = cursor.value;

                const divCita = document.createElement("div");
                divCita.classList.add("cita", "p-3");
                divCita.setAttribute("id", id);

                // Scripting de los elementos de la cita
                const mascotaParrafo = document.createElement("h2");
                mascotaParrafo.classList.add(
                    "card-title",
                    "font-weight-bolder"
                );
                mascotaParrafo.textContent = mascota;

                const propietarioParrafo = document.createElement("p");
                propietarioParrafo.innerHTML = `
                    <span class="font-weight-bolder">Propietario: </span>${propietario}
                `;

                const telefonoParrafo = document.createElement("p");
                telefonoParrafo.innerHTML = `
                    <span class="font-weight-bolder">Telefono: </span>${telefono}
                `;

                const fechaParrafo = document.createElement("p");
                fechaParrafo.innerHTML = `
                    <span class="font-weight-bolder">Fecha: </span>${fecha}
                `;

                const horaParrafo = document.createElement("p");
                horaParrafo.innerHTML = `
                    <span class="font-weight-bolder">Hora: </span>${hora}
                `;

                const sintomasParrafo = document.createElement("p");
                sintomasParrafo.innerHTML = `
                    <span class="font-weight-bolder">Síntomas: </span>${sintomas}
                `;

                // Boton para eliminar esta cita
                const btnEliminar = document.createElement("button");
                btnEliminar.classList.add("btn", "btn-danger", "mr-2");
                btnEliminar.innerHTML = `Eliminar <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>`;

                btnEliminar.onclick = () => eliminarCita(id);

                // Boton editar cita
                const btnEditar = document.createElement("button");
                btnEditar.classList.add("btn", "btn-info");
                btnEditar.innerHTML = `Editar <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>`;

                const cita = cursor.value;
                btnEditar.onclick = () => cargarEdicion(cita);

                // Agregar los parrafos al divCita
                divCita.appendChild(mascotaParrafo);
                divCita.appendChild(propietarioParrafo);
                divCita.appendChild(telefonoParrafo);
                divCita.appendChild(fechaParrafo);
                divCita.appendChild(horaParrafo);
                divCita.appendChild(sintomasParrafo);
                divCita.appendChild(btnEliminar);
                divCita.appendChild(btnEditar);

                // Agregar las citas al fragment
                fragment.appendChild(divCita);

                // Ve al siguiente elemento
                cursor.continue();
            }

            // Agregar las citas al html
            contenedorCitas.appendChild(fragment);
        };
    }

    textoHeading(resltado) {
        if (resltado > 0) {
            heading.textContent = "Administra tus Citas";
        } else {
            heading.textContent = "No hay Citas, comienza creando una";
        }
    }

    limpiarHTML() {
        while (contenedorCitas.firstChild) {
            contenedorCitas.removeChild(contenedorCitas.firstChild);
        }
    }
}

const administrarCitas = new Citas();
const ui = new UI(administrarCitas);

window.onload = () => {
    eventListeners();
    crearDB();
};

// Registro de Eventos
function eventListeners() {
    mascotaInput.addEventListener("input", datosCita);
    propietarioInput.addEventListener("input", datosCita);
    telefonoInput.addEventListener("input", datosCita);
    fechaInput.addEventListener("input", datosCita);
    horaInput.addEventListener("input", datosCita);
    sintomasInput.addEventListener("input", datosCita);

    formulario.addEventListener("submit", nuevaCita);
}

// Objeto con la información de la cita
const citaObj = {
    mascota: "",
    propietario: "",
    telefono: "",
    fecha: "",
    hora: "",
    sintomas: "",
};

// Agrega datos al obj cita
function datosCita(evt) {
    citaObj[evt.target.name] = evt.target.value;
}

// Valida y agrega una cita a la clase de citas
function nuevaCita(evt) {
    evt.preventDefault();

    // Extraer inforamación del objeto de cita
    const { mascota, propietario, telefono, fecha, hora, sintomas } = citaObj;

    // Validar
    if (
        mascota === "" ||
        propietario === "" ||
        telefono === "" ||
        fecha === "" ||
        hora === "" ||
        sintomas === ""
    ) {
        ui.imprimirAlerta("Todos los campos son obligatorios", "error");
        return;
    }

    if (editando) {
        // Pasar el objeto de la cita a edicíon
        administrarCitas.editarCita({ ...citaObj });

        // Edita en indexDB
        const transaction = DB.transaction(["citas"], "readwrite");
        const objectStore = transaction.objectStore("citas");

        objectStore.put(citaObj);

        transaction.oncomplete = () => {
            // Mensaje de agregado correctamente
            ui.imprimirAlerta("La cita se edito correctamente");

            // Cambiar el texto del boton a su estado original
            formulario.querySelector('button[type="submit"]').textContent =
                "Crear Cita";

            // Quitar modo edición
            editando = false;
        };

        transaction.onerror = () => {
            // Mensaje de agregado correctamente
            ui.imprimirAlerta("Hubo un error al editar la cita", "error");
        };
    } else {
        // Generar un id único
        citaObj.id = Date.now();

        // Creando una nueva cita.
        administrarCitas.agregarCita({ ...citaObj });

        // Insertar en indexDB
        const transaction = DB.transaction(["citas"], "readwrite");

        // Habilitar el objectStore
        const objectStore = transaction.objectStore("citas");

        // Insertar en la base de datos
        objectStore.add({ ...citaObj });

        // Si se completo correctamente
        transaction.oncomplete = () => {
            console.log("Cita agregada");
            // Mensaje de agregado correctamente
            ui.imprimirAlerta("La cita se agrego correctamente");
        };
    }

    // Mostrar el HTML de las citas
    ui.imprimirCitas();

    // Reiniciar objeto
    reiniarObjeto();

    // Reiniciar el fomulario
    formulario.reset();
}

function reiniarObjeto() {
    citaObj.mascota = "";
    citaObj.propietario = "";
    citaObj.telefono = "";
    citaObj.fecha = "";
    citaObj.hora = "";
    citaObj.sintomas = "";
}

function eliminarCita(id) {
    // Eliminar cita
    const transaction = DB.transaction(["citas"], "readwrite");
    const objectStore = transaction.objectStore("citas");

    objectStore.delete(id);

    transaction.oncomplete = () => {
        // Muesta un mensaje
        ui.imprimirAlerta("La cita se eliminó correctamente");

        // Refrescar las citas
        ui.imprimirCitas();
    };

    transaction.onerror = () => {
        // Muesta un mensaje
        ui.imprimirAlerta("Ocurrio un error al eliminar la cita", "cita");
    };
}

// Carga los datos y el modo edición
function cargarEdicion(cita) {
    // Extraer inforamación del objeto de cita
    const { mascota, propietario, telefono, fecha, hora, sintomas, id } = cita;

    mascotaInput.value = mascota;
    propietarioInput.value = propietario;
    telefonoInput.value = telefono;
    fechaInput.value = fecha;
    horaInput.value = hora;
    sintomasInput.value = sintomas;

    // Llenar el objeto
    citaObj.mascota = mascota;
    citaObj.propietario = propietario;
    citaObj.telefono = telefono;
    citaObj.fecha = fecha;
    citaObj.hora = hora;
    citaObj.sintomas = sintomas;
    citaObj.id = id;

    // Cambiar el texto del boton
    formulario.querySelector('button[type="submit"]').textContent =
        "Guardar cambios";

    editando = true;
}

function crearDB() {
    // Crear la base de datos en version 1.0
    const crearDB = window.indexedDB.open("citas", 1);

    // Si hay un error
    crearDB.onerror = () => {
        console.log("Hubo un error");
    };

    crearDB.onsuccess = () => {
        console.log("La base de datos fue creada");
        DB = crearDB.result;

        // Mostrar citas al cargar (Pero indexDB ya esta listo)
        ui.imprimirCitas();
    };

    // Definir el schema
    crearDB.onupgradeneeded = function (e) {
        const db = e.target.result;

        const objectStore = db.createObjectStore("citas", {
            keyPath: "id",
            autoIncrement: true,
        });

        // Definir todas las columnas
        objectStore.createIndex("mascota", "mascota", { unique: false });
        objectStore.createIndex("propietario", "propietario", {
            unique: false,
        });
        objectStore.createIndex("telefono", "telefono", { unique: false });
        objectStore.createIndex("fecha", "fecha", { unique: false });
        objectStore.createIndex("hora", "hora", { unique: false });
        objectStore.createIndex("sintomas", "sintomas", { unique: false });
        objectStore.createIndex("id", "id", { unique: true });

        console.log("DB Creada y Lista");
    };
}
