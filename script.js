/*
==========================================
NUESTRO UNIVERSO ❤️
Versión limpia y funcional
Para Scarleth Rassel
==========================================
*/

const App = {
    // Cambia el año si es necesario
    fechaInicio: new Date('2026-03-11T00:00:00'),

    amor: Number(localStorage.getItem('amor')) || 0,

    frases: [
        'Scarleth Rassel ❤️ eres mi lugar favorito.',
        'Cada día contigo vale la pena.',
        'Gracias por existir.',
        'Tu sonrisa ilumina mi universo.',
        'Nuestro amor hace que todo sea mejor.',
        'Si pudiera elegir otra vez... te elegiría a ti.',
        'Cada segundo contigo es un regalo.',
        'Te amo muchísimo ❤️'
    ],

    retos: [1, 10, 50, 100, 143, 365, 500, 777, 1000, 5000, 10000],

    iniciar() {
        this.obtenerElementos();
        this.crearEstrellas();
        this.actualizarTiempo();
        this.cargarContador();
        this.iniciarFrases();
        this.renderizarRetos();
        this.configurarEventos();

        setInterval(() => this.actualizarTiempo(), 1000);
        setInterval(() => this.cambiarFrase(), 12000);
        setInterval(() => this.crearEstrellaFugaz(), 5000);
    },

    obtenerElementos() {
        this.stars = document.getElementById('stars');
        this.contador = document.getElementById('contador');
        this.numero = document.getElementById('loveCounter');
        this.nivel = document.getElementById('level');
        this.boton = document.getElementById('loveButton');
        this.enter = document.getElementById('enter');
        this.welcome = document.getElementById('welcome');
        this.main = document.getElementById('main');
        this.luna = document.getElementById('moon');
        this.frase = document.getElementById('frase-romantica');
        this.listaRetos = document.getElementById('lista-retos');
        this.textoCarta = document.getElementById('texto-maquina');
    },

    configurarEventos() {
        // Entrar al universo
        this.enter.addEventListener('click', () => {
            this.welcome.style.display = 'none';
            this.main.style.display = 'block';
            this.lloverPetalos();
        });

        // Botón de amor
        this.boton.addEventListener('click', () => this.sumarAmor());

        // Luna secreta
        let toques = 0;
        this.luna.addEventListener('click', () => {
            toques++;
            if (toques === 7) {
                alert('🌙 Has encontrado el secreto de la luna.\\n\\nScarleth Rassel ❤️');
                toques = 0;
            }
        });

        // Modales
        this.configurarModal('btn-carta', 'modal-carta', () => this.escribirCarta());
        this.configurarModal('btn-retos', 'modal-retos');
        this.configurarModal('btn-album', 'modal-album');
        this.configurarModal('btn-linea', 'modal-linea');

        document.querySelectorAll('.close').forEach(btn => {
            btn.addEventListener('click', () => {
                btn.closest('.modal').style.display = 'none';
            });
        });

        window.addEventListener('click', (e) => {
            document.querySelectorAll('.modal').forEach(modal => {
                if (e.target === modal) modal.style.display = 'none';
            });
        });
    },

    configurarModal(btnId, modalId, callback) {
        const btn = document.getElementById(btnId);
        const modal = document.getElementById(modalId);

        if (!btn || !modal) return;

        btn.addEventListener('click', () => {
            modal.style.display = 'flex';
            if (callback) callback();
        });
    },

    crearEstrellas() {
        for (let i = 0; i < 350; i++) {
            const s = document.createElement('div');
            s.className = 'star';

            const size = Math.random() * 3 + 1;

            s.style.width = size + 'px';
            s.style.height = size + 'px';
            s.style.left = Math.random() * 100 + '%';
            s.style.top = Math.random() * 100 + '%';
            s.style.animationDelay = Math.random() * 3 + 's';

            this.stars.appendChild(s);
        }
    },

    crearEstrellaFugaz() {
        const cont = document.getElementById('shooting-stars');
        if (!cont) return;

        const estrella = document.createElement('div');
        estrella.className = 'shooting-star';

        estrella.style.left = Math.random() * window.innerWidth + 'px';
        estrella.style.top = Math.random() * (window.innerHeight / 2) + 'px';

        cont.appendChild(estrella);

        setTimeout(() => estrella.remove(), 2000);
    },

    lloverPetalos() {
        setInterval(() => {
            const p = document.createElement('div');
            p.className = 'petal';

            p.style.left = Math.random() * 100 + 'vw';
            p.style.animationDuration = (5 + Math.random() * 5) + 's';

            document.getElementById('petals-container').appendChild(p);

            setTimeout(() => p.remove(), 10000);
        }, 600);
    },

    actualizarTiempo() {
        const ahora = new Date();
        const diff = ahora - this.fechaInicio;

        if (diff < 0) {
            this.contador.innerHTML = 'Nuestra historia comienza el 11 de marzo ❤️';
            return;
        }

        let segundos = Math.floor(diff / 1000);
        const dias = Math.floor(segundos / 86400);
        segundos %= 86400;

        const horas = Math.floor(segundos / 3600);
        segundos %= 3600;

        const minutos = Math.floor(segundos / 60);
        segundos %= 60;

        this.contador.innerHTML = `
            ❤️<br>
            ${dias} días<br>
            ${horas} horas<br>
            ${minutos} minutos<br>
            ${segundos} segundos
        `;
    },

    cargarContador() {
        this.numero.textContent = this.amor;
        this.actualizarNivel();
    },

    sumarAmor() {
        this.amor++;
        this.numero.textContent = this.amor;

        localStorage.setItem('amor', this.amor);

        this.actualizarNivel();
        this.renderizarRetos();
        this.crearCorazon();
        this.revisarLogros();
    },

    actualizarNivel() {
        if (this.amor < 50)
            this.nivel.textContent = '🤍 Comenzando nuestra historia';
        else if (this.amor < 100)
            this.nivel.textContent = '💗 Enamorándose';
        else if (this.amor < 500)
            this.nivel.textContent = '❤️ Amor verdadero';
        else if (this.amor < 1000)
            this.nivel.textContent = '💖 Alma gemela';
        else
            this.nivel.textContent = '👑 Reina de mi corazón';
    },

    crearCorazon() {
        const h = document.createElement('div');
        h.className = 'heart';
        h.textContent = '❤️';

        h.style.left = Math.random() * 100 + 'vw';
        h.style.bottom = '0px';
        h.style.fontSize = (24 + Math.random() * 30) + 'px';

        document.body.appendChild(h);

        setTimeout(() => h.remove(), 3000);
    },

    revisarLogros() {
        if (this.retos.includes(this.amor)) {
            alert(`🏆 ¡Has alcanzado ${this.amor} corazones! ❤️`);
        }
    },

    renderizarRetos() {
        if (!this.listaRetos) return;

        this.listaRetos.innerHTML = '';

        this.retos.forEach(meta => {
            const li = document.createElement('li');

            if (this.amor >= meta) {
                li.innerHTML = `✅ <strong>${meta}</strong> corazones`;
            } else {
                li.innerHTML = `🔒 <strong>${meta}</strong> corazones`;
                li.style.opacity = '0.6';
            }

            this.listaRetos.appendChild(li);
        });
    },

    iniciarFrases() {
        this.cambiarFrase();
    },

    cambiarFrase() {
        if (!this.frase) return;

        const n = Math.floor(Math.random() * this.frases.length);
        this.frase.textContent = this.frases[n];
    },

    escribirCarta() {
        if (!this.textoCarta) return;

        const texto = `Hola, mi niña hermosa.

Scarleth Rassel, este pequeño universo digital fue hecho especialmente para ti.

Cada estrella representa un momento contigo.
Cada corazón representa lo mucho que te amo.
Y cada segundo que pasa me recuerda lo afortunado que soy de tenerte en mi vida.

Gracias por existir.
Te amo muchísimo. ❤️`;

        this.textoCarta.textContent = '';

        let i = 0;

        const escribir = () => {
            if (i < texto.length) {
                this.textoCarta.textContent += texto[i];
                i++;
                setTimeout(escribir, 25);
            }
        };

        escribir();
    }
};

document.addEventListener('DOMContentLoaded', () => {
    App.iniciar();
});
