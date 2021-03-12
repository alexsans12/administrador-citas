import { ui } from '../funciones.js';

export let DB;
class Database {
    constructor() {
        // Crear la base de datos en version 1.0
        const crearDB = window.indexedDB.open("citas", 1);
        
        // Si hay un error
        crearDB.onerror = () => {
            console.log("Hubo un error");
        };
        
        crearDB.onsuccess = () => {
            DB = crearDB.result;
            
            // Mostrar citas al cargar (Pero indexDB ya esta listo)
            ui.imprimirCitas();
        };
        
        // Definir el schema
        crearDB.onupgradeneeded = (e) => {
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
        }
    }
}

export default Database;

