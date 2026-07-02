const App = {
    fechaInicio: new Date("2026-03-11T00:00:00"),
    amor: Number(localStorage.getItem("amor")) || 0,
    secretos: 0,
    cartaTexto: "Hola mi niña hermosa,\n\nScarleth Rassel, este pequeño universo digital es para ti. Cada clic es una muestra de nuestro amor. Te amo muchísimo. ❤️",
    
    frases: ["Scarleth Rassel ❤️ eres mi lugar favorito.", "Mon amour pour toi est infini ❤️", "Tu sonrisa ilumina mi universo."],

    retos: [
        { meta: 1, mensaje: "Aún sigues aquí conmigo... gracias por estar. ;3" },
        { meta: 50, mensaje: "Cada día me demuestras que me amas mucho." },
        { meta: 150, mensaje: "¡Wow! Me amas infinitamente. ❤️" },
        { meta: 300, mensaje: "Eres el amor de mi vida, mi universo entero." },
        { meta: 500, mensaje: "No hay palabras para medir lo mucho que me amas..." }
    ],

    iniciar() {
        this.obtenerElementos();
        this.crearEstrellas();
        this.actualizarTiempo();
        this.cargarContador();
        this.iniciarFrases();
        this.renderizarRetos();
        this.eventos();
        this.animarFuegosArtificiales();
        this.configurarMusica();

        setInterval(() => this.actualizarTiempo(), 1000);
        setInterval(() => this.crearEstrellaFugaz(), 4000);
    },

    obtenerElementos() {
        this.contador = document.getElementById("contador");
        this.botonAmor = document.getElementById("loveButton");
        this.numero = document.getElementById("loveCounter");
        this.nivel = document.getElementById("level");
        this.luna = document.getElementById("moon");
        this.stars = document.getElementById("stars");
        this.welcome = document.getElementById("welcome");
        this.main = document.getElementById("main");
        this.enterBtn = document.getElementById("enter");
        this.musica = document.getElementById("bg-music");
        this.petalsContainer = document.getElementById("petals-container");
        this.canvas = document.getElementById("fireworks");
        this.ctx = this.canvas.getContext("2d");
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    },

    configurarMusica() {
        const selector = document.getElementById("musicSelector");
        const btn = document.getElementById("playBtn");
        btn.addEventListener("click", () => {
            if (this.musica.paused) {
                this.musica.src = selector.value;
                this.musica.play();
                btn.innerText = "⏸️ Pausar";
            } else {
                this.musica.pause();
                btn.innerText = "▶️ Reproducir";
            }
        });
    },

    renderizarRetos() {
        const lista = document.getElementById("lista-retos");
        lista.innerHTML = "";
        this.retos.forEach(reto => {
            let li = document.createElement("li");
            if (this.amor >= reto.meta) {
                li.innerHTML = `✅ <strong>Nivel ${reto.meta}:</strong> ${reto.mensaje}`;
            } else {
                li.innerHTML = `🔒 <strong>Nivel ${reto.meta}:</strong> <em>(Faltan ${reto.meta - this.amor} clics)</em>`;
                li.style.opacity = "0.5";
            }
            lista.appendChild(li);
        });
    },

    sumarAmor() {
        this.amor++;
        this.numero.innerHTML = this.amor;
        localStorage.setItem("amor", this.amor);
        this.actualizarNivel();
        this.renderizarRetos();
        this.lanzarFuegoArtificial(Math.random() * window.innerWidth, Math.random() * (window.innerHeight - 200));
    },

    eventos() {
        this.enterBtn.addEventListener("click", (e) => {
            e.preventDefault();
            this.welcome.style.display = "none";
            this.main.style.display = "block";
            this.lloverPetalos();
        });

        this.botonAmor.addEventListener("click", () => this.sumarAmor());
        this.configurarModal("btn-carta", "modal-carta", () => this.efectoMaquinaEscribir());
        this.configurarModal("btn-retos", "modal-retos");
        this.configurarModal("btn-album", "modal-album");
        this.configurarModal("btn-linea", "modal-linea");
        document.querySelectorAll(".close").forEach(btn => {
            btn.addEventListener("click", function() { this.parentElement.parentElement.style.display = "none"; });
        });
    },

    configurarModal(btnId, modalId, callback = null) {
        document.getElementById(btnId).addEventListener("click", () => {
            document.getElementById(modalId).style.display = "flex";
            if(callback) callback();
        });
    },

    actualizarNivel() {
        if (this.amor < 50) this.nivel.innerHTML = "🤍 Comenzando nuestra historia";
        else if (this.amor < 150) this.nivel.innerHTML = "💗 Enamorándose";
        else this.nivel.innerHTML = "👑 Reina de mi corazón";
    },

    cargarContador() { this.numero.innerHTML = this.amor; this.actualizarNivel(); },
    actualizarTiempo() { /* ... tu lógica de tiempo ... */ },
    iniciarFrases() { /* ... tu lógica de frases ... */ },
    lanzarFuegoArtificial(x, y) { /* ... tu lógica de fuego ... */ },
    animarFuegosArtificiales() { /* ... tu lógica de animación ... */ },
    crearEstrellas() { /* ... */ },
    crearEstrellaFugaz() { /* ... */ },
    lloverPetalos() { /* ... */ },
    efectoMaquinaEscribir() { /* ... */ }
};

document.addEventListener("DOMContentLoaded", () => App.iniciar());
