const App = {
    fechaInicio: new Date("2026-03-11T00:00:00"),
    amor: Number(localStorage.getItem("amor")) || 0,
    secretos: 0,
    cartaTexto: "Hola mi niña hermosa,\n\nScarleth Rassel, quería hacer algo único para ti. Este lugar es nuestro, un pequeño universo digital donde nuestro tiempo se guarda, donde las estrellas brillan por ti.\n\nTe amo muchísimo, más de lo que las palabras pueden explicar. ❤️",
    
    frases: [
        "Scarleth Rassel ❤️ eres mi lugar favorito.",
        "Mon amour pour toi est infini ❤️",
        "Tu sonrisa ilumina mi universo.",
        "Si pudiera elegir otra vez... te elegiría a ti."
    ],

    retos: [
    // Agrega esto a tu objeto App existente
retos: [
    { meta: 1, mensaje: "Aún sigues aquí conmigo... gracias por estar. ;3" },
    { meta: 50, mensaje: "Cada día me demuestras que me amas mucho." },
    { meta: 150, mensaje: "¡Wow! Me amas infinitamente. ❤️" },
    { meta: 300, mensaje: "Eres el amor de mi vida, mi universo entero." },
    { meta: 500, mensaje: "No hay palabras para medir lo mucho que me amas..." }
        "Cantar nuestra canción favorita a todo pulmón.",
        "Tocar una melodía de cumbia con la flauta de millo solo para ti.",
        "Construir juntos un reloj digital (¡quizás con un Arduino!) que marque nuestro tiempo.",
        "Jugar una partida juntos en Roblox y dejarte ganar.",
        "Aprender a decirte 'Te amo' en 5 idiomas diferentes."
    ],

    iniciar() {
        this.obtenerElementos();
        this.crearEstrellas();
        this.actualizarTiempo();
        this.cargarContador();
        this.iniciarFrases();
        this.iniciarRetos();
        this.eventos();
        this.animarFuegosArtificiales(); // Prepara el Canvas

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
        
        // Ajustar tamaño del canvas
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    },

    eventos() {
        // Entrar y reproducir música
        this.enterBtn.addEventListener("click", (e) => {
        e.preventDefault(); //
            this.welcome.style.display = "none";
            this.main.style.display = "block";
            this.musica.play().catch(error => console.log("La música necesita interacción previa"));
            this.lloverPetalos();
        });

        // Botón de amor
        this.botonAmor.addEventListener("click", () => this.sumarAmor());

        // Luna interactiva (Regalo secreto al dar 5 clics)
        this.luna.addEventListener("click", () => {
            this.secretos++;
            this.lanzarFuegoArtificial(window.innerWidth - 150, 150);
            if(this.secretos === 5) {
                document.getElementById("btn-regalos").style.display = "inline-block";
                alert("¡Has desbloqueado un regalo secreto de la Luna!");
            }
        });

        // Modales (Menús)
        this.configurarModal("btn-carta", "modal-carta", () => this.efectoMaquinaEscribir());
        this.configurarModal("btn-retos", "modal-retos");
        this.configurarModal("btn-album", "modal-album");
        this.configurarModal("btn-linea", "modal-linea");

        // Cerrar modales
        document.querySelectorAll(".close").forEach(btn => {
            btn.addEventListener("click", function() {
                this.parentElement.parentElement.style.display = "none";
            });
        });
    },

    configurarModal(btnId, modalId, callback = null) {
        document.getElementById(btnId).addEventListener("click", () => {
            document.getElementById(modalId).style.display = "flex";
            if(callback) callback();
        });
    },

    crearEstrellas() {
        for (let i = 0; i < 300; i++) {
            let s = document.createElement("div");
            s.className = "star";
            let size = Math.random() * 3;
            s.style.width = size + "px";
            s.style.height = size + "px";
            s.style.left = Math.random() * 100 + "%";
            s.style.top = Math.random() * 100 + "%";
            s.style.animationDelay = Math.random() * 4 + "s";
            this.stars.appendChild(s);
        }
    },

    crearEstrellaFugaz() {
        let s = document.createElement("div");
        s.className = "shooting-star";
        s.style.left = Math.random() * window.innerWidth + "px";
        s.style.top = Math.random() * (window.innerHeight / 2) + "px";
        document.getElementById("shooting-stars").appendChild(s);
        setTimeout(() => s.remove(), 2000);
    },

    lloverPetalos() {
        setInterval(() => {
            let p = document.createElement("div");
            p.className = "petal";
            p.style.left = Math.random() * 100 + "vw";
            p.style.animationDuration = (Math.random() * 3 + 4) + "s";
            this.petalsContainer.appendChild(p);
            setTimeout(() => p.remove(), 7000);
        }, 800);
    },

    efectoMaquinaEscribir() {
        const elemento = document.getElementById("texto-maquina");
        elemento.innerHTML = "";
        let i = 0;
        clearInterval(this.intervaloMaquina);
        this.intervaloMaquina = setInterval(() => {
            if (i < this.cartaTexto.length) {
                elemento.innerHTML += this.cartaTexto.charAt(i);
                i++;
            } else {
                clearInterval(this.intervaloMaquina);
            }
        }, 50);
    },

    iniciarRetos() {
        const lista = document.getElementById("lista-retos");
        this.retos.forEach((reto, index) => {
            lista.innerHTML += `<li>✅ Reto #${index + 1}: ${reto}</li>`;
        });
    },

    sumarAmor() {
        this.amor++;
        this.numero.innerHTML = this.amor;
        localStorage.setItem("amor", this.amor);
        this.actualizarNivel();
        
        // Fuego artificial aleatorio por cada clic de amor
        this.lanzarFuegoArtificial(Math.random() * window.innerWidth, Math.random() * (window.innerHeight - 200));
    },

    actualizarNivel() {
        if (this.amor < 50) this.nivel.innerHTML = "🤍 Comenzando nuestra historia";
        else if (this.amor < 100) this.nivel.innerHTML = "💗 Enamorándose";
        else if (this.amor < 500) this.nivel.innerHTML = "❤️ Amor verdadero";
        else this.nivel.innerHTML = "👑 Reina de mi corazón";
    },

    actualizarTiempo() {
        let diferencia = new Date() - this.fechaInicio;
        if (diferencia < 0) { this.contador.innerHTML = "Pronto comenzará... ❤️"; return; }
        
        let seg = Math.floor(diferencia / 1000);
        let d = Math.floor(seg / 86400); seg %= 86400;
        let h = Math.floor(seg / 3600); seg %= 3600;
        let m = Math.floor(seg / 60); seg %= 60;
        this.contador.innerHTML = `❤️<br>${d} días<br>${h} horas<br>${m} min<br>${seg} seg`;
    },

    iniciarFrases() {
        const el = document.getElementById("frase-romantica");
        const cambiar = () => el.innerHTML = this.frases[Math.floor(Math.random() * this.frases.length)];
        cambiar();
        setInterval(cambiar, 8000);
    },

    // --- Sistema básico de Fuegos Artificiales en Canvas ---
    particulas: [],
    lanzarFuegoArtificial(x, y) {
        for(let i = 0; i < 40; i++) {
            this.particulas.push({
                x: x, y: y,
                vx: (Math.random() - 0.5) * 10, vy: (Math.random() - 0.5) * 10,
                color: `hsl(${Math.random() * 360}, 100%, 60%)`,
                life: 1
            });
        }
    },
    animarFuegosArtificiales() {
        requestAnimationFrame(() => this.animarFuegosArtificiales());
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        for(let i = 0; i < this.particulas.length; i++) {
            let p = this.particulas[i];
            p.x += p.vx; p.y += p.vy;
            p.vy += 0.2; // Gravedad
            p.life -= 0.02;
            this.ctx.fillStyle = p.color;
            this.ctx.globalAlpha = Math.max(p.life, 0);
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
            this.ctx.fill();
        }
        this.particulas = this.particulas.filter(p => p.life > 0);
        this.ctx.globalAlpha = 1;
    }
};

document.addEventListener("DOMContentLoaded", () => App.iniciar());
