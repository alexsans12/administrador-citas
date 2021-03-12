import { datosCita, nuevaCita } from "../funciones.js";
import { formulario } from "../selectores.js";
import Database from './Database.js';

class App {
    constructor() {
        this.initApp();
    }

    initApp() {

        formulario.addEventListener('change', (evt) => {
            datosCita(evt);
        });

        // Formulario para nuevas citas
        formulario.addEventListener('submit', nuevaCita);

        window.onload = () => {
            const database = new Database();
        };
    }
}

export default App;