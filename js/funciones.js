import Citas from "./clases/Citas.js";
import UI from "./clases/UI.js";
import { DB } from "./clases/Database.js";

import { 
    mascotaInput, 
    propietarioInput, 
    telefonoInput, 
    fechaInput, 
    horaInput, 
    sintomasInput, 
    formulario
} from "./selectores.js";

let editando;

const administrarCitas = new Citas();
export const ui = new UI(administrarCitas);

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
export function datosCita(evt) {
    citaObj[evt.target.name] = evt.target.value;
}

// Valida y agrega una cita a la clase de citas
export function nuevaCita(evt) {
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

export function reiniarObjeto() {
    citaObj.mascota = "";
    citaObj.propietario = "";
    citaObj.telefono = "";
    citaObj.fecha = "";
    citaObj.hora = "";
    citaObj.sintomas = "";
}

export function eliminarCita(id) {
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
export function cargarEdicion(cita) {
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