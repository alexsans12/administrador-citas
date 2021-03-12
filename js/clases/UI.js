import { eliminarCita, cargarEdicion } from "../funciones.js";
import { contenedorCitas, heading, fragment } from "../selectores.js";
import { DB } from './Database.js';

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
        total.onsuccess = () => {
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

                btnEliminar.addEventListener('click', () => eliminarCita(id));

                // Boton editar cita
                const btnEditar = document.createElement("button");
                btnEditar.classList.add("btn", "btn-info");
                btnEditar.innerHTML = `Editar <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>`;

                const cita = cursor.value;
                btnEditar.addEventListener('click', () => cargarEdicion(cita));

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
        contenedorCitas.textContent = '';
    }
}

export default UI;