/* =========================================================
   NUESTRO UNIVERSO ❤️ — script.js
   Para Scarleth Rassel
   Organizado en módulos pequeños, sin lógica duplicada.
========================================================= */

'use strict';

/* =========================================================
   1. CONFIGURACIÓN Y ESTADO
========================================================= */
const CONFIG = {
  fechaInicio: new Date('2026-03-11T00:00:00'),
  storageKey: 'universo-scarleth-v1',
  version: '2026.07-fotos',
  totalEstrellas: 260,
  intervaloFrase: 11000,
  intervaloEstrellaFugaz: 4500,
  clicksSecretosLuna: [3, 7, 13, 21, 34, 55, 89, 144, 233],
  hitosDias: [7, 30, 50, 100, 200, 365, 500, 730, 1000],
};

/* =========================================================
   CHAT EN VIVO — configuración de Firebase
   ---------------------------------------------------------
   El chat usa Firebase Firestore para sincronizar mensajes
   entre los dos dispositivos en tiempo real. Es gratis y toma
   unos 5 minutos de configuración:

   1. Entra a https://console.firebase.google.com y crea un
      proyecto nuevo (gratis, plan "Spark").
   2. Dentro del proyecto: "Compilación" → "Firestore Database"
      → "Crear base de datos" → modo producción (cualquier
      ubicación cercana está bien).
   3. En "Reglas" de Firestore, pega esto y publica:

        rules_version = '2';
        service cloud.firestore {
          match /databases/{database}/documents {
            match /salas/{sala}/{document=**} {
              allow read, write: if true;
            }
          }
        }

      (Esto cubre los mensajes y también el indicador de "está
      escribiendo...". Deja el chat abierto a quien tenga el
      código de la sala, igual que compartir un enlace. No hay
      login porque esta app es solo para ustedes dos; guarden el
      código en privado.)
   4. En el ícono de engranaje → "Configuración del proyecto" →
      baja hasta "Tus apps" → ícono "</>" (web) → regístrala →
      copia el objeto firebaseConfig que te muestra.
   5. Pega esos valores aquí abajo, reemplazando los de ejemplo.

   Mientras esto no esté configurado, la sección de Chat muestra
   un aviso amable en vez de romperse.
========================================================= */
const FIREBASE_CONFIG = {
  apiKey: 'AIzaSyAJdtdxOpqS547YYFfloQHkLH5vaQeItpk',
  authDomain: 'chat-22212.firebaseapp.com',
  projectId: 'chat-22212',
  storageBucket: 'chat-22212.firebasestorage.app',
  messagingSenderId: '741791837961',
  appId: '1:741791837961:web:6980e99957fe790c022dd8',
};

const CANCIONES = [
  { fuentes: ['only.mp3', 'Only.mp3', 'only.m4a'], nombre: 'Only', autor: 'Lee Hi' },
  { fuentes: ['count-on-me.mp3', 'Count-On-Me.mp3', 'count-on-me.m4a'], nombre: 'Count On Me', autor: 'Bruno Mars' },
  { fuentes: ['its-you.mp3', 'Its-You.mp3', 'its-you.m4a'], nombre: "It's You", autor: 'Ali Gatie' },
  { fuentes: ['Amtrak.mp3', 'amtrak.mp3', 'amtrak.m4a'], nombre: 'Amtrak', autor: '—' },
];

const defaultState = () => ({
  amor: 0,
  retosNotificados: [],
  logrosDesbloqueados: [],
  cancionActual: 0,
  volumen: 70,
  lunaClicks: 0,
  secretosLunaVistos: [],
  constelacionesHechas: 0,
  modoDia: false,
  cartaAbierta: false,
  albumAbierto: false,
  historiaAbierta: false,
  cancionesEscuchadas: [],
  morseUsado: false,
  morseSecretoEncontrado: false,
  capsulas: [],
  rachaDias: 0,
  ultimaVisita: null,
  diaSorpresaVista: null,
  quizJugado: false,
  quizMejorPuntaje: 0,
  chatUsado: false,
  notasUsado: false,
  notas: [],
  gustosUsado: false,
  gustos: { ella: [], el: [] },
  claveCorazonEncontrada: false,
  curiosidadesLunaVistas: [],
  mesesCelebrados: [],
  estadisticoCurioso: false,
  ruletaUsada: false,
  piropos: [],
  animos: {},
  fotos: [],
  timelinePersonal: [],
  versionVista: '',
  reproductorAleatorio: false,
  reproductorRepetir: false,
  hitosCelebrados: [],
});

let state = defaultState();

/* Guardado diferido: agrupa escrituras en localStorage (evita bloquear el
   hilo principal cuando hay eventos muy frecuentes, como arrastrar el
   volumen o tocar el botón de amor muchas veces seguidas). */
const Storage = {
  _pendiente: null,
  intentarGuardarInmediato() {
    if (this._pendiente) { clearTimeout(this._pendiente); this._pendiente = null; }
    try {
      localStorage.setItem(CONFIG.storageKey, JSON.stringify(state));
      return true;
    } catch (e) {
      return false; // por lo general, almacenamiento lleno
    }
  },
  guardarInmediato() {
    this.intentarGuardarInmediato();
  },
  guardar() {
    if (this._pendiente) clearTimeout(this._pendiente);
    this._pendiente = setTimeout(() => this.guardarInmediato(), 400);
  },
  cargar() {
    try {
      const raw = localStorage.getItem(CONFIG.storageKey);
      if (raw) state = Object.assign(defaultState(), JSON.parse(raw));
    } catch (e) { state = defaultState(); }
  },
};

/* Pausa efectos decorativos cuando la pestaña no es visible o cuando el
   sistema pide menos movimiento (ahorra batería y CPU). */
let pestanaOculta = false;
const prefiereMovimientoReducido = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

document.addEventListener('visibilitychange', () => {
  pestanaOculta = document.hidden;
  if (pestanaOculta) Storage.guardarInmediato();
});
window.addEventListener('pagehide', () => Storage.guardarInmediato());

/* Botón de instalación (Android/desktop Chrome usa el prompt nativo;
   iOS no tiene ese evento, así que ahí mostramos instrucciones manuales). */
function esIOS() {
  return /iP(hone|od|ad)/.test(navigator.platform) ||
    (navigator.userAgent.includes('Mac') && navigator.maxTouchPoints > 1);
}
function esStandalone() {
  return (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
    window.navigator.standalone === true;
}
window.promptInstalacionDiferido = null;
window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  window.promptInstalacionDiferido = e;
  const btn = document.getElementById('btn-instalar');
  if (btn) btn.classList.remove('oculto');
});
window.addEventListener('appinstalled', () => {
  const btn = document.getElementById('btn-instalar');
  if (btn) btn.classList.add('oculto');
  window.promptInstalacionDiferido = null;
});

function debounce(fn, espera) {
  let temporizador;
  return (...args) => {
    clearTimeout(temporizador);
    temporizador = setTimeout(() => fn(...args), espera);
  };
}

/* =========================================================
   2. FRASES ROMÁNTICAS
========================================================= */
const FRASES = [
  'Scarleth Rassel, eres mi lugar favorito.',
  'Cada día contigo vale la pena.',
  'Gracias por existir.',
  'Tu sonrisa ilumina mi universo entero.',
  'Nuestro amor hace que todo sea mejor.',
  'Si pudiera elegir otra vez, te elegiría a ti.',
  'Cada segundo contigo es un regalo.',
  'Te amo muchísimo.',
  'Contigo hasta lo simple se siente enorme.',
  'Eres la razón de mis mejores días.',
  'No necesito un cielo distinto si te tengo a ti.',
  'Cada estrella de este cielo tiene tu nombre.',
  'Eres mi calma y mi aventura al mismo tiempo.',
  'Contigo el tiempo se siente diferente, más bonito.',
  'Quiero construir contigo todos los días que faltan.',
  'Tu risa es mi sonido favorito del mundo.',
  'Eres la persona con la que quiero envejecer.',
  'Cada recuerdo contigo se vuelve especial.',
  'No hay universo lo bastante grande para todo lo que siento.',
  'Gracias por elegirme, todos los días.',
  'Eres mi hogar, sin importar el lugar.',
  'Te miro y se me olvida todo lo demás.',
  'Contigo hasta las noches difíciles se sienten más ligeras.',
  'Eres mi persona favorita, sin competencia.',
  'Amarte se siente como respirar: natural y necesario.',
  'Quiero ser tu lugar seguro siempre.',
  'Eres la mejor parte de mi historia.',
  'Contigo aprendí que el amor también es calma.',
  'Nunca pensé que alguien pudiera hacerme tan feliz.',
  'Tu forma de amar me inspira cada día.',
  'Quiero llenarte de motivos para sonreír.',
  'Eres mi razón favorita para creer en el amor.',
  'Contigo todo pesa menos y brilla más.',
  'Nada se compara con la paz que siento a tu lado.',
  'Eres poesía sin intentarlo.',
  'Quiero ser tu equipo en todo, siempre.',
  'Tu amor me hace mejor persona.',
  'Contigo cada plan pequeño se vuelve mi favorito.',
  'Eres la sorpresa más bonita que me dio la vida.',
  'Amo cómo se siente construir contigo.',
  'Te elijo hoy, mañana y todos los días después.',
  'Contigo aprendí el verdadero significado de "para siempre".',
  'Eres mi versión favorita de la felicidad.',
  'Cada detalle tuyo se volvió mi favorito.',
  'Quiero ser el motivo de tu sonrisa más bonita.',
  'Tu voz es mi refugio en cualquier día difícil.',
  'Contigo el amor se siente fácil y honesto.',
  'Eres el "sí" más bonito que me dio la vida.',
  'Nunca me cansaré de elegirte.',
  'Contigo hasta el silencio se siente cómodo.',
  'Eres mi persona favorita para hablar de todo y de nada.',
  'Amarte es la decisión más fácil que he tomado.',
  'Quiero acompañarte en cada capítulo que viene.',
  'Tu forma de ser me enamora un poco más cada día.',
  'Contigo cada "buenos días" se siente especial.',
  'Eres el motivo por el que creo en las cosas bonitas.',
  'Nada se siente tan bien como tu abrazo.',
  'Quiero seguir escribiendo esta historia contigo.',
  'Eres mi calma en medio de cualquier tormenta.',
  'Contigo todo se siente posible.',
  'Amo la forma en la que me miras.',
  'Eres la mejor parte de mis días, sin excepción.',
  'Quiero seguir sumando momentos contigo.',
  'Tu amor me sostiene incluso en los días grises.',
  'Contigo aprendí que el amor también se construye despacio.',
  'Eres mi persona, sin importar la distancia o el tiempo.',
  'Amo todo lo que somos cuando estamos juntos.',
  'Quiero seguir siendo tu razón para sonreír.',
  'Contigo cada día se siente como un buen comienzo.',
  'Eres la persona que hace que todo tenga sentido.',
  'Nunca dejaré de agradecer haberte encontrado.',
  'Contigo el amor no se siente complicado, se siente real.',
  'Eres mi lugar favorito para volver siempre.',
  'Amo pensar en todo lo que nos falta por vivir.',
  'Quiero seguir aprendiendo a amarte mejor cada día.',
  'Contigo todo lo cotidiano se vuelve bonito.',
  'Eres el motivo por el que este universo existe.',
  'Nada me hace más feliz que verte feliz.',
  'Contigo aprendí a creer en los "para siempre".',
  'Eres mi historia favorita, aún sin terminar.',
  'Amo cada versión de ti que he conocido.',
  'Quiero seguir sorprendiéndote toda la vida.',
  'Contigo el futuro no da miedo, da ilusión.',
  'Eres la persona con la que todo encaja.',
  'Amo lo simple que se siente quererte.',
  'Quiero ser tu compañero en cada meta que sueñes.',
  'Contigo cada "te amo" se siente nuevo.',
  'Eres el motivo por el que sonrío sin razón aparente.',
  'Nada compite con la paz de tenerte cerca.',
  'Contigo aprendí que el amor bonito sí existe.',
  'Eres mi persona favorita del universo entero.',
  'Amo todo lo que hemos construido hasta hoy.',
  'Quiero seguir escribiendo capítulos bonitos contigo.',
  'Contigo el amor se siente como llegar a casa.',
  'Eres la razón por la que este pequeño universo existe.',
  'Nunca voy a dejar de elegirte, Scarleth Rassel.',
  'Amo la manera en la que iluminas todo lo que tocas.',
  'Quiero seguir creciendo a tu lado, siempre.',
  'Contigo cada día se siente un poco más mágico.',
  'Eres, sin duda, mi persona favorita para siempre.',
  'Amarte es de las cosas más bonitas que me han pasado.',
  'Quiero seguir sumando estrellas a este cielo por ti.',
  'Contigo todo brilla un poco más.',
  'Eres mi razón favorita para creer en las cosas bonitas.',
  'Nunca me voy a cansar de decirte cuánto te amo.',
  'Contigo aprendí que el amor también es paciencia y calma.',
  'Eres mi persona, mi calma, mi lugar favorito.',
  'Amo todo lo que somos y todo lo que seremos.',
  'Quiero seguir construyendo este universo, contigo dentro.',
  'Contigo el amor se siente eterno.',
  'Eres el motivo más bonito de mis días.',
  'Nunca dejaré de agradecer que existas.',
  'Contigo todo tiene un poco más de magia.',
  'Eres mi persona favorita, hoy y siempre, Scarleth Rassel.',
];

let ultimaFraseIndex = -1;

/* =========================================================
   3. RETOS (100 metas de corazones)
========================================================= */
function generarRetos() {
  const retos = [];
  let valor = 1;
  while (retos.length < 100) {
    retos.push(valor);
    if (valor < 20) valor += 1;
    else if (valor < 100) valor += 5;
    else if (valor < 500) valor += 25;
    else if (valor < 2000) valor += 100;
    else if (valor < 10000) valor += 500;
    else valor += 2500;
  }
  return retos;
}
const RETOS = generarRetos();

/* =========================================================
   4. LOGROS
========================================================= */
const LOGROS = [
  { id: 'primer-corazon', icono: '❤️', nombre: 'Primer corazón', desc: 'Sumaste tu primer corazón.', check: s => s.amor >= 1 },
  { id: 'cien-corazones', icono: '💗', nombre: '100 corazones', desc: 'Ya son 100 razones para amarte.', check: s => s.amor >= 100 },
  { id: 'mil-corazones', icono: '💖', nombre: '1000 corazones', desc: 'Mil latidos guardados aquí.', check: s => s.amor >= 1000 },
  { id: 'diez-mil-corazones', icono: '👑', nombre: '10 000 corazones', desc: 'Un amor casi infinito.', check: s => s.amor >= 10000 },
  { id: 'primera-carta', icono: '💌', nombre: 'Primera carta', desc: 'Leíste la carta completa.', check: s => s.cartaAbierta },
  { id: 'primer-secreto', icono: '🌙', nombre: 'Primer secreto', desc: 'Descubriste un secreto de la luna.', check: s => s.secretosLunaVistos.length >= 1 },
  { id: 'luna-llena', icono: '🌕', nombre: 'Luna llena', desc: 'Encontraste todos los secretos de la luna.', check: s => s.secretosLunaVistos.length >= CONFIG.clicksSecretosLuna.length },
  { id: 'mitad-retos', icono: '🥈', nombre: 'A mitad de camino', desc: 'Cumpliste 50 de los 100 retos.', check: s => s.retosNotificados.length >= 50 },
  { id: 'todos-retos', icono: '🏆', nombre: 'Los 100 retos', desc: 'Completaste los 100 retos.', check: s => s.retosNotificados.length >= 100 },
  { id: 'constelacion', icono: '✨', nombre: 'Constelación propia', desc: 'Dibujaste una constelación tocando estrellas.', check: s => s.constelacionesHechas >= 1 },
  { id: 'dj-personal', icono: '🎧', nombre: 'DJ del universo', desc: 'Escuchaste completas las 4 canciones.', check: s => s.cancionesEscuchadas.length >= CANCIONES.length },
  { id: 'amanecer', icono: '🌅', nombre: 'Otro cielo', desc: 'Cambiaste el universo a modo día.', check: s => s.modoDia === true },
  { id: 'album-explorador', icono: '📸', nombre: 'Coleccionista', desc: 'Abriste nuestro álbum de recuerdos.', check: s => s.albumAbierto },
  { id: 'historia-conocida', icono: '📖', nombre: 'Nuestra historia', desc: 'Leíste nuestra línea del tiempo.', check: s => s.historiaAbierta },
  { id: 'amor-verdadero', icono: '💞', nombre: 'Amor verdadero', desc: 'Llegaste a 500 corazones.', check: s => s.amor >= 500 },
  { id: 'traductor-morse', icono: '🔤', nombre: 'Mensajero en morse', desc: 'Tradujiste tu primer mensaje en código morse.', check: s => s.morseUsado },
  { id: 'morse-secreto', icono: '💓', nombre: 'Mensaje descifrado', desc: 'Escribiste nuestro mensaje secreto en morse.', check: s => s.morseSecretoEncontrado },
  { id: 'primera-capsula', icono: '⏳', nombre: 'Mensajera del futuro', desc: 'Sellaste tu primera cápsula del tiempo.', check: s => s.capsulas.length >= 1 },
  { id: 'capsula-abierta', icono: '📬', nombre: 'Carta desde el pasado', desc: 'Abriste una cápsula del tiempo.', check: s => s.capsulas.some(c => c.abierta) },
  { id: 'racha-3', icono: '🔥', nombre: 'Costumbre bonita', desc: 'Volviste 3 días seguidos.', check: s => s.rachaDias >= 3 },
  { id: 'racha-7', icono: '🌠', nombre: 'Una semana entera', desc: 'Volviste 7 días seguidos.', check: s => s.rachaDias >= 7 },
  { id: 'quiz-jugado', icono: '🧠', nombre: 'Pusiste a prueba la memoria', desc: 'Jugaste el quiz de nosotros.', check: s => s.quizJugado },
  { id: 'quiz-perfecto', icono: '🥇', nombre: 'Nos conoces de memoria', desc: 'Respondiste todo el quiz sin fallar.', check: s => s.quizMejorPuntaje >= QUIZ_PREGUNTAS.length && QUIZ_PREGUNTAS.length > 0 },
  { id: 'primer-mensaje', icono: '💬', nombre: 'Primer mensaje', desc: 'Enviaste tu primer mensaje en el chat.', check: s => s.chatUsado },
  { id: 'primera-nota', icono: '📝', nombre: 'Primera nota', desc: 'Guardaron su primera nota juntos.', check: s => s.notasUsado },
  { id: 'nos-conocemos', icono: '💗', nombre: 'Nos conocemos', desc: 'Agregaron algo a la lista de gustos de cada uno.', check: s => s.gustosUsado },
  { id: 'clave-corazon', icono: '🔐', nombre: 'La clave del corazón', desc: 'Tocaste tres veces el corazón del título.', check: s => s.claveCorazonEncontrada },
  { id: 'curiosidad-luna', icono: '🌘', nombre: 'Más allá de la luna', desc: 'Mantuviste presionada la luna y encontraste algo más.', check: s => s.curiosidadesLunaVistas.length >= 1 },
  { id: 'estadistico-curioso', icono: '🧮', nombre: 'Estadístico curioso', desc: 'Descubriste cuántos latidos han pasado juntos.', check: s => s.estadisticoCurioso },
  { id: 'ruleta-girada', icono: '🎡', nombre: 'Indecisos resueltos', desc: 'Giraron la ruleta de citas por primera vez.', check: s => s.ruletaUsada },
  { id: 'frasco-piropos', icono: '🫙', nombre: 'El frasco de los piropos', desc: 'Guardaron su primer piropo en el frasco.', check: s => s.piropos.length >= 1 },
  { id: 'animo-registrado', icono: '🌈', nombre: '¿Cómo te sientes?', desc: 'Registraron su primer estado de ánimo.', check: s => Object.keys(s.animos).length >= 1 },
  { id: 'album-real', icono: '📷', nombre: 'Primer recuerdo guardado', desc: 'Subieron su primera foto real al álbum.', check: s => s.fotos.length >= 1 },
  { id: 'historia-ampliada', icono: '📖', nombre: 'Su propia historia', desc: 'Agregaron un momento propio a la línea de tiempo.', check: s => s.timelinePersonal.length >= 1 },
  { id: 'hito-100-dias', icono: '📅', nombre: '100 días juntos', desc: 'Llegaron a los 100 días desde el 11 de marzo.', check: s => s.hitosCelebrados.includes(100) },
  { id: 'hito-365-dias', icono: '🎂', nombre: 'Un año entero', desc: 'Un año completo construyendo este universo.', check: s => s.hitosCelebrados.includes(365) },
];

/* =========================================================
   5. REGALOS SECRETOS
========================================================= */
const REGALOS = [
  { id: 'regalo-1', titulo: 'Una promesa', requiere: s => s.amor >= 200,
    texto: 'Prometo seguir eligiéndote incluso en los días donde nada sale como esperamos. Este es solo el inicio.' },
  { id: 'regalo-2', titulo: 'Mitad del camino', requiere: s => s.retosNotificados.length >= 50,
    texto: 'Llegar hasta aquí ya dice mucho de lo que somos. Gracias por sumar cada corazón conmigo.' },
  { id: 'regalo-3', titulo: 'Estrellas con tu nombre', requiere: s => s.constelacionesHechas >= 1,
    texto: 'Ahora hay una constelación en este cielo que solo existe porque tú la tocaste. Es tuya.' },
  { id: 'regalo-final', titulo: 'El regalo final', requiere: s => s.retosNotificados.length >= 100,
    texto: 'Completaste los 100 retos. Este universo entero, con todo lo que tiene, es un pequeño reflejo de lo mucho que te amo, Scarleth Rassel.' },
  { id: 'regalo-morse', titulo: 'Nuestro código', requiere: s => s.morseSecretoEncontrado,
    texto: 'Ahora conoces nuestro pequeño código secreto. Úsalo cuando quieras decirme algo sin decirlo en voz alta.' },
  { id: 'regalo-racha', titulo: 'Siete días', requiere: s => s.rachaDias >= 7,
    texto: 'Volviste siete días seguidos a este pequeño universo. Eso también es una forma bonita de decir "te quiero".' },
  { id: 'regalo-clave', titulo: 'La clave del corazón', requiere: s => s.claveCorazonEncontrada,
    texto: 'Encontraste la clave escondida en el título. Este universo entero está lleno de detalles como este, esperando a que los descubras.' },
];

/* =========================================================
   6. SECRETOS DE LA LUNA
========================================================= */
const SECRETOS_LUNA = [
  'Secreto 1: la primera vez que pensé en ti no pude dejar de sonreír.',
  'Secreto 2: guardo cada pequeño detalle que compartimos.',
  'Secreto 3: contigo hasta los días comunes se sienten especiales.',
  'Secreto 4: este universo tardó horas en construirse, pensando en ti todo el tiempo.',
  'Secreto 5: no existe una versión de mi futuro donde tú no estés.',
  'Secreto 6: eres, sin duda, el secreto mejor guardado de mi vida.',
  'Secreto 7: a veces reviso nuestras fotos solo para sonreír un rato.',
  'Secreto 8: cada vez que algo bueno me pasa, quiero contártelo a ti primero.',
  'Secreto 9: este pequeño universo va a seguir creciendo mientras tú quieras seguir aquí.',
];

/* Secreto extra: mantener presionada la luna (en vez de solo tocarla)
   revela una de estas curiosidades al azar, una por una. */
const CURIOSIDADES_LUNA = [
  '🌘 Curiosidad: probé cada botón de este sitio más de una vez para asegurarme de que todo te funcionara bien.',
  '🌘 Curiosidad: elegí cada canción de la playlist pensando en un momento distinto contigo.',
  '🌘 Curiosidad: este universo sigue creciendo — de vez en cuando le agrego algo nuevo, solo para ti.',
];

/* Ideas para la Ruleta de Citas */
const IDEAS_RULETA = [
  { icono: '🌅', texto: 'Vean juntos el amanecer o el atardecer desde algún lugar alto.' },
  { icono: '🍳', texto: 'Cocinen un platillo nuevo que ninguno de los dos haya probado hacer.' },
  { icono: '🎬', texto: 'Maratón de películas de su infancia, con snacks incluidos.' },
  { icono: '🚶', texto: 'Caminen sin rumbo fijo y dejen que el camino decida.' },
  { icono: '🎨', texto: 'Pinten o dibujen algo juntos, sin importar qué tan bien les quede.' },
  { icono: '📸', texto: 'Recreen la primera foto que se tomaron juntos.' },
  { icono: '🌌', texto: 'Salgan a ver las estrellas y busquen una constelación inventada por ustedes.' },
  { icono: '🎲', texto: 'Noche de juegos de mesa o cartas: el que pierda hace el desayuno.' },
  { icono: '📖', texto: 'Léanse un cuento en voz alta, cada uno con una voz distinta.' },
  { icono: '🍿', texto: 'Vean una película que el otro ama pero tú nunca has visto.' },
  { icono: '🚲', texto: 'Paseen por un lugar que nunca han visitado juntos.' },
  { icono: '💌', texto: 'Escríbanse una carta cada uno y ábranlas juntos al final del día.' },
  { icono: '🎧', texto: 'Hagan una playlist nueva: cada uno agrega 5 canciones sin decirle al otro cuáles.' },
  { icono: '🕯️', texto: 'Cena a la luz de las velas, aunque sea en casa.' },
];

/* =========================================================
   7. TIMELINE (edítalo con sus fechas reales)
========================================================= */
const TIMELINE = [
  { fecha: '11 de marzo', texto: 'Cuando todo comenzó.' },
  { fecha: 'Hoy', texto: 'Amándote más que ayer.' },
  { fecha: 'Futuro', texto: 'Todo lo que nos falta por vivir.' },
  // Agrega aquí más eventos importantes de su historia:
  // { fecha: '', texto: '' },
];

/* =========================================================
   8. FECHAS ESPECIALES (edítalas con fechas reales — mes es 1-12)
========================================================= */
const FECHAS_ESPECIALES = [
  { nombre: 'Nuestro aniversario', mes: 3, dia: 11, icono: '💞' },
  // Agrega cumpleaños u otras fechas importantes, por ejemplo:
  // { nombre: 'Cumpleaños de Scarleth', mes: 0, dia: 0, icono: '🎂' },
];

/* =========================================================
   9. SORPRESAS DIARIAS (una se muestra cada día distinto)
========================================================= */
const SORPRESAS_DIARIAS = [
  { icono: '☀️', texto: 'Hoy el universo amaneció un poco más bonito porque volviste.' },
  { icono: '🎁', texto: 'Sorpresa de hoy: un corazón extra, de regalo, sin que lo pidieras.' },
  { icono: '🌟', texto: 'De todas las personas del mundo, me alegra que sigas siendo tú la que vuelve aquí.' },
  { icono: '📻', texto: 'Dato del día: nuestra playlist suena mejor cuando tú la escuchas.' },
  { icono: '🌙', texto: 'La luna preguntó por ti otra vez. Le dije que ibas a venir hoy.' },
  { icono: '🍃', texto: 'Un pétalo más cayó hoy en este universo, solo para darte la bienvenida.' },
  { icono: '💌', texto: 'Si hoy necesitas una razón para sonreír, aquí tienes una: te amo.' },
  { icono: '✨', texto: 'Cada vez que vuelves, este pequeño universo se siente un poco más real.' },
  { icono: '🎶', texto: 'Hoy es buen día para escuchar una canción nuestra otra vez.' },
  { icono: '🔥', texto: 'Racha de días viéndonos aquí: sigue así, se siente bonito contarlos.' },
  { icono: '💫', texto: 'Gracias por convertir en costumbre algo que para mí es un regalo.' },
  { icono: '🕯️', texto: 'Hoy también cuenta. Cada día contigo, aunque sea aquí, cuenta.' },
];

/* =========================================================
   10. QUIZ "¿CUÁNTO SABES DE NOSOTROS?" (contenido editable)
========================================================= */
const QUIZ_PREGUNTAS = [
  {
    pregunta: '¿Cuántos corazones tiene el reto más grande del Medidor de Amor?',
    opciones: ['1 000', '5 000', '10 000'],
    correcta: 2,
  },
  {
    pregunta: '¿Cuántas canciones tiene nuestra playlist?',
    opciones: ['3', '4', '5'],
    correcta: 1,
  },
  {
    pregunta: '¿En qué fecha comenzó nuestra historia en este universo?',
    opciones: ['10 de marzo', '11 de marzo', '21 de marzo'],
    correcta: 1,
  },
  // Edita las siguientes con datos reales de su historia:
  {
    pregunta: '¿Cuál es nuestra canción favorita?',
    opciones: ['Only', 'Count On Me', "It's You"],
    correcta: 0,
  },
  {
    pregunta: '¿Cuántos secretos tiene la luna en total?',
    opciones: ['4', '6', '8'],
    correcta: 1,
  },
  // Agrega más preguntas personalizadas aquí:
  // { pregunta: '', opciones: ['', '', ''], correcta: 0 },
];

/* =========================================================
   11. CÓDIGO MORSE (texto ↔ morse, con luz y sonido)
========================================================= */
const MORSE_MAPA = {
  A: '.-', B: '-...', C: '-.-.', D: '-..', E: '.', F: '..-.', G: '--.', H: '....', I: '..', J: '.---',
  K: '-.-', L: '.-..', M: '--', N: '-.', O: '---', P: '.--.', Q: '--.-', R: '.-.', S: '...', T: '-',
  U: '..-', V: '...-', W: '.--', X: '-..-', Y: '-.--', Z: '--..',
  '0': '-----', '1': '.----', '2': '..---', '3': '...--', '4': '....-',
  '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.',
  '.': '.-.-.-', ',': '--..--', '?': '..--..', "'": '.----.', '!': '-.-.--',
};
const MORSE_INVERSA = Object.fromEntries(Object.entries(MORSE_MAPA).map(([letra, codigo]) => [codigo, letra]));
const FRASES_SECRETAS_MORSE = ['TE AMO', 'TEAMO', 'SCARLETH', 'SCARLETH RASSEL'];

function normalizarTexto(t) {
  return t.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
}

function textoAMorse(texto) {
  return normalizarTexto(texto).split(' ').filter(Boolean).map(palabra =>
    [...palabra].map(letra => MORSE_MAPA[letra] || '').filter(Boolean).join(' ')
  ).join(' / ');
}

function morseATexto(morse) {
  return morse.trim().split(/\s*\/\s*/).filter(Boolean).map(palabra =>
    palabra.trim().split(/\s+/).map(codigo => MORSE_INVERSA[codigo] || '').join('')
  ).join(' ');
}

const Morse = {
  modo: 'texto',
  reproduciendo: false,
  audioCtx: null,

  init() {
    this.entrada = $('morse-entrada');
    this.salida = $('morse-salida');
    this.luz = $('morse-luz');
    this.btnPlay = $('morse-play');
    this.btnTexto = $('morse-modo-texto');
    this.btnInverso = $('morse-modo-inverso');
    if (!this.entrada) return;

    this.entrada.addEventListener('input', () => this.actualizar());
    this.btnTexto.addEventListener('click', () => this.cambiarModo('texto'));
    this.btnInverso.addEventListener('click', () => this.cambiarModo('inverso'));
    this.btnPlay.addEventListener('click', () => this.reproducir());

    document.querySelectorAll('.morse-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        this.entrada.value = chip.dataset.frase;
        this.actualizar();
      });
    });
  },

  cambiarModo(modo) {
    this.modo = modo;
    this.btnTexto.classList.toggle('activo', modo === 'texto');
    this.btnInverso.classList.toggle('activo', modo === 'inverso');
    this.entrada.placeholder = modo === 'texto'
      ? 'Escribe algo, por ejemplo TE AMO'
      : 'Escribe en morse, ej: - . / .- -- ---';
    this.actualizar();
  },

  actualizar() {
    const valor = this.entrada.value;
    if (!valor.trim()) { this.salida.textContent = ''; return; }

    this.salida.textContent = this.modo === 'texto' ? textoAMorse(valor) : morseATexto(valor);

    if (!state.morseUsado) {
      state.morseUsado = true;
      Storage.guardar();
      Logros.revisar();
    }
    this.revisarSecreto(valor);
  },

  revisarSecreto(valorOriginal) {
    const textoPlano = this.modo === 'texto' ? valorOriginal : morseATexto(valorOriginal);
    const normalizado = normalizarTexto(textoPlano).replace(/\s+/g, ' ');
    const coincide = FRASES_SECRETAS_MORSE.some(f => normalizado === f);
    if (coincide && !state.morseSecretoEncontrado) {
      state.morseSecretoEncontrado = true;
      Storage.guardar();
      Logros.revisar();
      Regalos.revisar();
      mostrarToast('💓 Descifraste nuestro mensaje secreto');
      Efectos.fuegosArtificiales();
    }
  },

  reproducir() {
    if (this.reproduciendo || !this.salida.textContent) return;
    const codigo = this.modo === 'texto' ? this.salida.textContent : normalizarTexto(this.entrada.value);
    const palabras = codigo.trim().split(/\s*\/\s*/).filter(Boolean)
      .map(p => p.trim().split(/\s+/).filter(Boolean));
    if (!palabras.length) return;

    this.reproduciendo = true;
    this.asegurarAudio();

    const UNIDAD = 130;
    let t = 0;
    const programarLuz = (duracionMs) => {
      const inicio = t;
      setTimeout(() => this.luz.classList.add('encendida'), inicio);
      setTimeout(() => this.luz.classList.remove('encendida'), inicio + duracionMs);
      setTimeout(() => this.pitido(duracionMs), inicio);
      t += duracionMs + UNIDAD;
    };

    palabras.forEach((letras, iPalabra) => {
      letras.forEach((letra, iLetra) => {
        [...letra].forEach(simbolo => programarLuz(simbolo === '-' ? UNIDAD * 3 : UNIDAD));
        if (iLetra < letras.length - 1) t += UNIDAD * 2; // total 3 unidades entre letras
      });
      if (iPalabra < palabras.length - 1) t += UNIDAD * 6; // total 7 unidades entre palabras
    });

    setTimeout(() => { this.reproduciendo = false; }, t + 150);
  },

  asegurarAudio() {
    if (this.audioCtx) return;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AC();
    } catch (e) { this.audioCtx = null; }
  },

  pitido(duracionMs) {
    if (!this.audioCtx) return;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    osc.frequency.value = 600;
    osc.type = 'sine';
    gain.gain.value = 0.05;
    osc.connect(gain);
    gain.connect(this.audioCtx.destination);
    osc.start();
    osc.stop(this.audioCtx.currentTime + duracionMs / 1000);
  },
};

/* =========================================================
   12. UTILIDADES
========================================================= */
const $ = id => document.getElementById(id);

function formatTiempo(segundos) {
  const s = Math.floor(segundos % 60);
  const m = Math.floor((segundos / 60) % 60);
  const h = Math.floor(segundos / 3600);
  const pad = n => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

function mostrarToast(texto) {
  let cont = $('toast-container');
  if (!cont) {
    cont = document.createElement('div');
    cont.id = 'toast-container';
    cont.style.cssText = 'position:fixed;left:50%;bottom:30px;transform:translateX(-50%);z-index:200;display:flex;flex-direction:column;gap:8px;align-items:center;pointer-events:none;';
    document.body.appendChild(cont);
  }
  const toast = document.createElement('div');
  toast.textContent = texto;
  toast.style.cssText = 'background:rgba(20,14,40,.95);border:1px solid rgba(255,45,117,.5);color:#fff;padding:12px 22px;border-radius:30px;font-size:14px;box-shadow:0 10px 30px rgba(0,0,0,.4);opacity:0;transform:translateY(10px);transition:opacity .4s ease, transform .4s ease;max-width:88vw;text-align:center;';
  cont.appendChild(toast);
  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
  });
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 500);
  }, 3200);
}

function abrirModal(modal) { modal.classList.add('abierto'); }
function cerrarModal(modal) {
  modal.classList.remove('abierto');
  // Libera la imagen ampliada de memoria al cerrar el visor.
  if (modal.id === 'modal-visor') {
    const img = $('visor-imagen');
    if (img) img.src = '';
  }
  // Deja de escuchar el chat en tiempo real mientras el modal está cerrado
  // (ahorra lecturas de Firestore y batería).
  if (modal.id === 'modal-chat' && typeof Chat !== 'undefined') Chat.detenerEscucha();
}

function generarId() {
  return 'id-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
}

// Fecha local (no UTC) en formato YYYY-MM-DD; evita que la racha diaria
// cambie de día a una hora distinta a la del huso horario de la persona.
function fechaLocalISO(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

const NOMBRES_MES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
function formatFecha(fechaISO) {
  const [y, m, d] = fechaISO.split('-').map(Number);
  return `${d} de ${NOMBRES_MES[m - 1]} de ${y}`;
}

// Escapa HTML antes de insertar texto escrito por la persona (cápsulas del
// tiempo) con innerHTML, para que nada de lo que escriba rompa la página.
function escaparHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/* =========================================================
   13. CÁPSULA DEL TIEMPO (mensajes que se abren en una fecha futura)
========================================================= */
const Capsulas = {
  init() {
    this.form = $('capsula-form');
    this.textoInput = $('capsula-texto');
    this.fechaInput = $('capsula-fecha');
    this.lista = $('capsulas-lista');
    this.error = $('capsula-error');
    if (!this.form) return;

    const manana = new Date();
    manana.setDate(manana.getDate() + 1);
    this.fechaInput.min = fechaLocalISO(manana);

    this.form.addEventListener('submit', e => {
      e.preventDefault();
      this.sellar();
    });

    this.render();
  },

  sellar() {
    const texto = this.textoInput.value.trim();
    const fecha = this.fechaInput.value;
    this.error.textContent = '';

    if (!texto) { this.error.textContent = 'Escribe un mensaje antes de sellar la cápsula.'; return; }
    if (texto.length > 600) { this.error.textContent = 'Ese mensaje es un poco largo; intenta resumirlo un poco.'; return; }
    if (!fecha) { this.error.textContent = 'Elige una fecha de apertura.'; return; }
    if (fecha < this.fechaInput.min) { this.error.textContent = 'Elige una fecha futura, para que valga la pena esperar.'; return; }

    state.capsulas.push({
      id: generarId(),
      mensaje: texto,
      fechaApertura: fecha,
      abierta: false,
    });
    Storage.guardar();
    Logros.revisar();

    this.textoInput.value = '';
    this.fechaInput.value = '';
    mostrarToast('⏳ Cápsula sellada para el ' + formatFecha(fecha));
    this.render();
  },

  abrir(id) {
    const capsula = state.capsulas.find(c => c.id === id);
    if (!capsula) return;
    capsula.abierta = true;
    Storage.guardar();
    Logros.revisar();
    Efectos.fuegosArtificiales();
    this.render();
  },

  render() {
    if (!this.lista) return;
    this.lista.innerHTML = '';

    if (!state.capsulas.length) {
      this.lista.innerHTML = '<p class="capsula-vacio">Todavía no has sellado ninguna cápsula. Escribe la primera arriba ⬆️</p>';
      return;
    }

    const hoy = fechaLocalISO(new Date());
    const ordenadas = [...state.capsulas].sort((a, b) => a.fechaApertura.localeCompare(b.fechaApertura));

    ordenadas.forEach(c => {
      const disponible = c.fechaApertura <= hoy;
      const div = document.createElement('div');
      div.className = 'capsula' + (c.abierta ? ' abierta' : disponible ? ' lista' : ' bloqueada');

      if (c.abierta) {
        div.innerHTML = `<span class="capsula-fecha">✉️ escrita para el ${formatFecha(c.fechaApertura)}</span><p class="capsula-texto">${escaparHtml(c.mensaje)}</p>`;
      } else if (disponible) {
        div.innerHTML = `<span class="capsula-fecha">📬 lista para abrir</span><button class="capsula-abrir-btn" type="button">Abrir cápsula</button>`;
        div.querySelector('.capsula-abrir-btn').addEventListener('click', () => this.abrir(c.id));
      } else {
        const dias = Math.round((new Date(c.fechaApertura + 'T00:00:00') - new Date(hoy + 'T00:00:00')) / 86400000);
        div.innerHTML = `<span class="capsula-fecha">🔒 se abre el ${formatFecha(c.fechaApertura)}</span><p class="capsula-cuenta">falta${dias === 1 ? '' : 'n'} ${dias} día${dias === 1 ? '' : 's'}</p>`;
      }
      this.lista.appendChild(div);
    });
  },
};

/* =========================================================
   14. RACHA DIARIA Y SORPRESA DEL DÍA
========================================================= */
const Racha = {
  badge: null,
  sorpresaPendiente: null,

  init() {
    this.badge = $('racha-badge');
    this.procesarVisitaDeHoy();
    this.actualizarBadge();
  },

  procesarVisitaDeHoy() {
    const hoy = fechaLocalISO(new Date());

    if (state.ultimaVisita !== hoy) {
      const ayer = fechaLocalISO(new Date(Date.now() - 86400000));
      state.rachaDias = (state.ultimaVisita === ayer) ? state.rachaDias + 1 : 1;
      state.ultimaVisita = hoy;
      Logros.revisar();
    }

    if (state.diaSorpresaVista !== hoy && SORPRESAS_DIARIAS.length) {
      const inicioAnio = new Date(hoy.slice(0, 4) + '-01-01T00:00:00');
      const diaDelAnio = Math.floor((new Date(hoy + 'T00:00:00') - inicioAnio) / 86400000);
      const indice = ((diaDelAnio % SORPRESAS_DIARIAS.length) + SORPRESAS_DIARIAS.length) % SORPRESAS_DIARIAS.length;
      this.sorpresaPendiente = SORPRESAS_DIARIAS[indice];
      state.diaSorpresaVista = hoy;
    }

    Storage.guardar();
  },

  mostrarSorpresaSiPendiente() {
    if (!this.sorpresaPendiente) return;
    const sorpresa = this.sorpresaPendiente;
    this.sorpresaPendiente = null;
    App.agregarAmor(1, {});
    mostrarToast(sorpresa.icono + ' ' + sorpresa.texto);
    this.actualizarBadge();
  },

  actualizarBadge() {
    if (!this.badge) return;
    if (state.rachaDias >= 2) {
      this.badge.textContent = `🔥 Racha de ${state.rachaDias} días`;
      this.badge.hidden = false;
    } else {
      this.badge.hidden = true;
    }
  },
};

/* =========================================================
   15. FECHAS ESPECIALES (cuenta regresiva)
========================================================= */
const FechasEspeciales = {
  init() {
    this.contenedor = $('fechas-especiales-lista');
    if (!this.contenedor) return;
    if (!FECHAS_ESPECIALES.length) {
      const tarjeta = document.querySelector('.card-fechas');
      if (tarjeta) tarjeta.remove();
      return;
    }
    this.render();
  },

  proximaOcurrencia(mes, dia) {
    const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
    const anio = hoy.getFullYear();
    let fecha = new Date(anio, mes - 1, dia);
    if (fecha < hoy) fecha = new Date(anio + 1, mes - 1, dia);
    return fecha;
  },

  render() {
    const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
    const items = FECHAS_ESPECIALES.map(f => {
      const fecha = this.proximaOcurrencia(f.mes, f.dia);
      const dias = Math.round((fecha - hoy) / 86400000);
      return { ...f, dias };
    }).sort((a, b) => a.dias - b.dias);

    this.contenedor.innerHTML = items.map(f => `
      <div class="fecha-especial">
        <span class="fecha-especial-icono">${f.icono || '📅'}</span>
        <div>
          <p class="fecha-especial-nombre">${f.nombre}</p>
          <p class="fecha-especial-cuenta">${f.dias === 0 ? '¡Es hoy!' : `falta${f.dias === 1 ? '' : 'n'} ${f.dias} día${f.dias === 1 ? '' : 's'}`}</p>
        </div>
      </div>
    `).join('');
  },
};

/* =========================================================
   16. QUIZ (lógica e interacción)
========================================================= */
const Quiz = {
  indice: 0,
  puntaje: 0,
  respondida: false,

  init() {
    this.contenedor = $('quiz-contenedor');
    this.resultado = $('quiz-resultado');
  },

  reiniciar() {
    if (!this.contenedor) return;
    this.indice = 0;
    this.puntaje = 0;
    this.resultado.hidden = true;
    this.contenedor.hidden = false;
    this.renderPregunta();
  },

  renderPregunta() {
    if (!QUIZ_PREGUNTAS.length) {
      this.contenedor.innerHTML = '<p>Agrega preguntas en QUIZ_PREGUNTAS dentro de script.js para activar el quiz.</p>';
      return;
    }
    const p = QUIZ_PREGUNTAS[this.indice];
    this.respondida = false;
    this.contenedor.innerHTML = `
      <p class="quiz-progreso">Pregunta ${this.indice + 1} / ${QUIZ_PREGUNTAS.length}</p>
      <p class="quiz-pregunta">${p.pregunta}</p>
      <div class="quiz-opciones">
        ${p.opciones.map((op, i) => `<button type="button" class="quiz-opcion" data-i="${i}">${op}</button>`).join('')}
      </div>
    `;
    this.contenedor.querySelectorAll('.quiz-opcion').forEach(btn => {
      btn.addEventListener('click', () => this.responder(Number(btn.dataset.i), btn));
    });
  },

  responder(i, btnElegido) {
    if (this.respondida) return;
    this.respondida = true;
    const p = QUIZ_PREGUNTAS[this.indice];
    if (i === p.correcta) this.puntaje++;

    this.contenedor.querySelectorAll('.quiz-opcion').forEach((btn, idx) => {
      btn.disabled = true;
      if (idx === p.correcta) btn.classList.add('correcta');
      else if (btn === btnElegido) btn.classList.add('incorrecta');
    });

    setTimeout(() => {
      this.indice++;
      if (this.indice < QUIZ_PREGUNTAS.length) this.renderPregunta();
      else this.mostrarResultado();
    }, 900);
  },

  mostrarResultado() {
    this.contenedor.hidden = true;
    this.resultado.hidden = false;

    state.quizJugado = true;
    if (this.puntaje > state.quizMejorPuntaje) state.quizMejorPuntaje = this.puntaje;
    Storage.guardar();
    Logros.revisar();

    const total = QUIZ_PREGUNTAS.length;
    const mensaje = this.puntaje === total
      ? '🏆 Puntaje perfecto. Nos conoces de memoria.'
      : this.puntaje >= total / 2
        ? '💗 Nada mal. Y lo que no sabías, ahora ya lo sabemos juntos.'
        : '🌱 No importa el puntaje: lo bonito es que seguimos sumando historia juntos.';

    this.resultado.innerHTML = `
      <p class="quiz-puntaje">${this.puntaje} / ${total}</p>
      <p class="quiz-mensaje">${mensaje}</p>
      <button id="quiz-reintentar" class="menu-btn" type="button">🔁 Jugar de nuevo</button>
    `;
    $('quiz-reintentar').addEventListener('click', () => this.reiniciar());
  },
};

/* =========================================================
   17. EFECTOS VISUALES (estrellas, pétalos, corazones, fuegos)
========================================================= */
const Efectos = {
  contenedorEstrellas: null,
  canvasFuegos: null,
  ctxFuegos: null,
  totalEstrellas: CONFIG.totalEstrellas,

  init() {
    this.contenedorEstrellas = $('stars');
    this.canvasFuegos = $('fireworks');
    this.ctxFuegos = this.canvasFuegos.getContext('2d');
    this.totalEstrellas = this.calcularTotalEstrellas();
    this.ajustarCanvas();
    window.addEventListener('resize', debounce(() => this.ajustarCanvas(), 150));
    this.crearEstrellas();
    // Un solo listener para las ~200 estrellas en vez de uno por elemento.
    this.contenedorEstrellas.addEventListener('click', e => {
      const estrella = e.target.closest('.star');
      if (estrella) Constelaciones.alternarEstrella(estrella);
    });
  },

  calcularTotalEstrellas() {
    if (prefiereMovimientoReducido) return 70;
    const ancho = window.innerWidth;
    if (ancho < 480) return 130;
    if (ancho < 900) return 190;
    return CONFIG.totalEstrellas;
  },

  ajustarCanvas() {
    this.canvasFuegos.width = window.innerWidth;
    this.canvasFuegos.height = window.innerHeight;
    Constelaciones.ajustarCanvas();
  },

  crearEstrellas() {
    const frag = document.createDocumentFragment();
    for (let i = 0; i < this.totalEstrellas; i++) {
      const s = document.createElement('div');
      s.className = 'star';
      const size = Math.random() * 2.6 + 1;
      s.style.width = size + 'px';
      s.style.height = size + 'px';
      s.style.left = Math.random() * 100 + '%';
      s.style.top = Math.random() * 100 + '%';
      s.style.animationDelay = Math.random() * 3 + 's';
      frag.appendChild(s);
    }
    this.contenedorEstrellas.appendChild(frag);
  },

  crearEstrellaFugaz() {
    if (pestanaOculta || prefiereMovimientoReducido) return;
    const cont = $('shooting-stars');
    const e = document.createElement('div');
    e.className = 'shooting-star';
    e.style.left = Math.random() * window.innerWidth + 'px';
    e.style.top = Math.random() * (window.innerHeight * 0.5) + 'px';
    cont.appendChild(e);
    setTimeout(() => e.remove(), 1700);
  },

  lloverPetalos() {
    setInterval(() => {
      if (pestanaOculta || prefiereMovimientoReducido) return;
      const p = document.createElement('div');
      p.className = 'petal';
      p.style.left = Math.random() * 100 + 'vw';
      p.style.animationDuration = (6 + Math.random() * 5) + 's, ' + (2 + Math.random() * 2) + 's';
      $('petals-container').appendChild(p);
      setTimeout(() => p.remove(), 11500);
    }, 550);
  },

  crearCorazon() {
    const h = document.createElement('div');
    h.className = 'heart-flotante';
    h.textContent = '❤️';
    const dx = (Math.random() * 160 - 80) + 'px';
    const rot = (Math.random() * 60 - 30) + 'deg';
    h.style.left = Math.random() * 90 + 5 + 'vw';
    h.style.bottom = '0px';
    h.style.fontSize = (22 + Math.random() * 28) + 'px';
    h.style.setProperty('--dx', dx);
    h.style.setProperty('--rot', rot);
    h.style.animationDuration = (2.2 + Math.random()) + 's';
    $('hearts-layer').appendChild(h);
    setTimeout(() => h.remove(), 3400);
  },

  fuegosArtificiales(x, y) {
    const ctx = this.ctxFuegos;
    const cx = x ?? window.innerWidth / 2;
    const cy = y ?? window.innerHeight / 2.6;
    const colores = ['#ff2d75', '#ffd77a', '#ff86b7', '#6c5ce7', '#ffffff'];
    const particulas = [];
    const total = 60;
    for (let i = 0; i < total; i++) {
      const angulo = (Math.PI * 2 * i) / total;
      const velocidad = 2 + Math.random() * 3.5;
      particulas.push({
        x: cx, y: cy,
        vx: Math.cos(angulo) * velocidad,
        vy: Math.sin(angulo) * velocidad,
        vida: 1,
        color: colores[Math.floor(Math.random() * colores.length)],
      });
    }
    let frames = 0;
    const anim = () => {
      ctx.clearRect(0, 0, this.canvasFuegos.width, this.canvasFuegos.height);
      frames++;
      let activas = false;
      particulas.forEach(p => {
        if (p.vida <= 0) return;
        activas = true;
        p.x += p.vx; p.y += p.vy; p.vy += 0.045; p.vida -= 0.014;
        ctx.globalAlpha = Math.max(p.vida, 0);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2.3, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      if (activas && frames < 160) requestAnimationFrame(anim);
      else ctx.clearRect(0, 0, this.canvasFuegos.width, this.canvasFuegos.height);
    };
    anim();
  },
};

/* =========================================================
   18. CONSTELACIONES
========================================================= */
const Constelaciones = {
  seleccionadas: [],
  canvas: null,
  ctx: null,

  init() {
    this.canvas = $('constelacion-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.ajustarCanvas();
  },

  ajustarCanvas() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.redibujar();
  },

  alternarEstrella(el) {
    const idx = this.seleccionadas.indexOf(el);
    if (idx >= 0) {
      this.seleccionadas.splice(idx, 1);
      el.classList.remove('seleccionada');
    } else {
      this.seleccionadas.push(el);
      el.classList.add('seleccionada');
    }
    this.redibujar();

    if (this.seleccionadas.length === 3) {
      state.constelacionesHechas += 1;
      Storage.guardar();
      Logros.revisar();
      Regalos.revisar();
      mostrarToast('✨ Formaste una constelación en nuestro cielo');
      const rect = el.getBoundingClientRect();
      Efectos.fuegosArtificiales(rect.left, rect.top);
    }
    if (this.seleccionadas.length > 9) {
      const primera = this.seleccionadas.shift();
      primera.classList.remove('seleccionada');
    }
  },

  redibujar() {
    if (!this.ctx) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    if (this.seleccionadas.length < 2) return;
    this.ctx.strokeStyle = 'rgba(255,215,122,.75)';
    this.ctx.lineWidth = 1.4;
    this.ctx.beginPath();
    this.seleccionadas.forEach((el, i) => {
      const r = el.getBoundingClientRect();
      const x = r.left + r.width / 2;
      const y = r.top + r.height / 2;
      if (i === 0) this.ctx.moveTo(x, y);
      else this.ctx.lineTo(x, y);
    });
    this.ctx.stroke();
  },
};

/* =========================================================
   19. REPRODUCTOR DE MÚSICA
========================================================= */
const Reproductor = {
  audio: null,
  audioCtx: null,
  analizador: null,
  fuenteConectada: false,
  reproduciendo: false,
  indiceFuente: 0,

  init() {
    this.audio = $('audio-player');
    this.listaEl = $('lista-canciones');
    this.discoEl = $('disco');
    this.tituloEl = $('cancion-titulo');
    this.autorEl = $('cancion-autor');
    this.playBtn = $('btn-play');
    this.progresoBarra = $('progreso-barra');
    this.progresoFill = $('progreso-fill');
    this.progresoHandle = $('progreso-handle');
    this.tiempoActualEl = $('tiempo-actual');
    this.tiempoTotalEl = $('tiempo-total');
    this.volumenInput = $('volumen');
    this.visualizadorCanvas = $('visualizador');

    this.renderLista();
    this.cargarCancion(state.cancionActual, false);
    this.volumenInput.value = state.volumen;
    this.audio.volume = state.volumen / 100;

    this.playBtn.addEventListener('click', () => this.alternarPlay());
    $('btn-siguiente').addEventListener('click', () => this.siguiente());
    $('btn-anterior').addEventListener('click', () => this.anterior());
    this.btnAleatorio = $('btn-aleatorio');
    this.btnRepetir = $('btn-repetir');
    this.btnAleatorio.setAttribute('aria-pressed', String(state.reproductorAleatorio));
    this.btnRepetir.setAttribute('aria-pressed', String(state.reproductorRepetir));
    this.btnAleatorio.addEventListener('click', () => {
      state.reproductorAleatorio = !state.reproductorAleatorio;
      this.btnAleatorio.setAttribute('aria-pressed', String(state.reproductorAleatorio));
      Storage.guardar();
      mostrarToast(state.reproductorAleatorio ? '🔀 Reproducción aleatoria activada' : '🔀 Reproducción aleatoria desactivada');
    });
    this.btnRepetir.addEventListener('click', () => {
      state.reproductorRepetir = !state.reproductorRepetir;
      this.btnRepetir.setAttribute('aria-pressed', String(state.reproductorRepetir));
      Storage.guardar();
      mostrarToast(state.reproductorRepetir ? '🔁 Repetir canción activado' : '🔁 Repetir canción desactivado');
    });
    this.volumenInput.addEventListener('input', e => {
      const v = Number(e.target.value);
      this.audio.volume = v / 100;
      state.volumen = v;
      Storage.guardar();
    });
    this.configurarArrastreProgreso();

    this.audio.addEventListener('timeupdate', () => this.actualizarProgreso());
    this.audio.addEventListener('loadedmetadata', () => this.actualizarProgreso());
    this.audio.addEventListener('play', () => this.marcarReproduciendo(true));
    this.audio.addEventListener('pause', () => this.marcarReproduciendo(false));
    this.audio.addEventListener('ended', () => this.alTerminar());
    this.audio.addEventListener('error', () => this.alFallar());
  },

  renderLista() {
    this.listaEl.innerHTML = '';
    CANCIONES.forEach((c, i) => {
      const li = document.createElement('li');
      li.tabIndex = 0;
      li.innerHTML = `
        <span class="num">${i + 1}</span>
        <span class="nombre">${c.nombre} · ${c.autor}</span>
        <span class="eq"><span></span><span></span><span></span></span>
      `;
      li.addEventListener('click', () => this.cargarCancion(i, true));
      this.listaEl.appendChild(li);
    });
    this.marcarActiva();
  },

  marcarActiva() {
    [...this.listaEl.children].forEach((li, i) => {
      li.classList.toggle('activa', i === state.cancionActual);
    });
  },

  cargarCancion(indice, autoplay) {
    state.cancionActual = indice;
    this.indiceFuente = 0;
    const c = CANCIONES[indice];
    this.audio.src = c.fuentes[0];
    this.tituloEl.textContent = c.nombre;
    this.autorEl.textContent = c.autor;
    this.marcarActiva();
    Storage.guardar();
    if (autoplay) this.play();
  },

  play() {
    this.intentoReproducir = true;
    this.iniciarVisualizador();
    const p = this.audio.play();
    if (p && p.catch) p.catch(() => this.alFallar());
  },

  alternarPlay() {
    if (this.audio.paused) this.play();
    else this.audio.pause();
  },

  marcarReproduciendo(activo) {
    this.reproduciendo = activo;
    this.playBtn.textContent = activo ? '⏸' : '▶';
    this.discoEl.classList.toggle('reproduciendo', activo);
    if (activo) this.dibujarVisualizador();
  },

  siguienteIndice() {
    if (state.reproductorAleatorio && CANCIONES.length > 1) {
      let i;
      do { i = Math.floor(Math.random() * CANCIONES.length); } while (i === state.cancionActual);
      return i;
    }
    return (state.cancionActual + 1) % CANCIONES.length;
  },

  siguiente() {
    this.cargarCancion(this.siguienteIndice(), this.reproduciendo);
  },

  anterior() {
    const i = (state.cancionActual - 1 + CANCIONES.length) % CANCIONES.length;
    this.cargarCancion(i, this.reproduciendo);
  },

  actualizarProgreso() {
    if (this.arrastrandoProgreso) return;
    const { currentTime, duration } = this.audio;
    const pct = duration ? (currentTime / duration) * 100 : 0;
    this.progresoFill.style.width = pct + '%';
    this.progresoHandle.style.left = pct + '%';
    this.tiempoActualEl.textContent = formatTiempo(currentTime || 0);
    this.tiempoTotalEl.textContent = duration ? formatTiempo(duration) : '0:00';
  },

  configurarArrastreProgreso() {
    this.arrastrandoProgreso = false;

    const pctDesdeEvento = e => {
      const rect = this.progresoBarra.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      return Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    };

    const previsualizar = pct => {
      this.progresoFill.style.width = (pct * 100) + '%';
      this.progresoHandle.style.left = (pct * 100) + '%';
      if (this.audio.duration) this.tiempoActualEl.textContent = formatTiempo(pct * this.audio.duration);
    };

    const iniciar = e => {
      this.arrastrandoProgreso = true;
      previsualizar(pctDesdeEvento(e));
    };
    const mover = e => {
      if (!this.arrastrandoProgreso) return;
      previsualizar(pctDesdeEvento(e));
    };
    const soltar = e => {
      if (!this.arrastrandoProgreso) return;
      this.arrastrandoProgreso = false;
      if (this.audio.duration) this.audio.currentTime = pctDesdeEvento(e) * this.audio.duration;
    };

    this.progresoBarra.addEventListener('mousedown', iniciar);
    window.addEventListener('mousemove', mover);
    window.addEventListener('mouseup', soltar);

    this.progresoBarra.addEventListener('touchstart', iniciar, { passive: true });
    window.addEventListener('touchmove', mover, { passive: true });
    window.addEventListener('touchend', soltar);
  },

  alTerminar() {
    if (!state.cancionesEscuchadas.includes(state.cancionActual)) {
      state.cancionesEscuchadas.push(state.cancionActual);
      Storage.guardar();
      Logros.revisar();
    }
    if (state.reproductorRepetir) {
      this.audio.currentTime = 0;
      this.play();
      return;
    }
    this.siguiente();
  },

  alFallar() {
    const c = CANCIONES[state.cancionActual];
    this.indiceFuente += 1;
    if (this.indiceFuente < c.fuentes.length) {
      this.audio.src = c.fuentes[this.indiceFuente];
      this.audio.load();
      if (this.intentoReproducir) this.play();
      return;
    }
    this.intentoReproducir = false;
    this.tituloEl.textContent = c.nombre;
    this.autorEl.textContent = 'No se encontró ' + c.fuentes.join(' ni ') + ' junto a index.html';
    this.marcarReproduciendo(false);
  },

  iniciarVisualizador() {
    if (this.fuenteConectada) return;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AC();
      const fuente = this.audioCtx.createMediaElementSource(this.audio);
      this.analizador = this.audioCtx.createAnalyser();
      this.analizador.fftSize = 64;
      fuente.connect(this.analizador);
      this.analizador.connect(this.audioCtx.destination);
      this.fuenteConectada = true;
    } catch (e) { /* visualizador no disponible en este navegador */ }
  },

  dibujarVisualizador() {
    if (!this.analizador || !this.reproduciendo || this.bucleVisualizadorActivo) return;
    this.bucleVisualizadorActivo = true;
    const ctx = this.visualizadorCanvas.getContext('2d');
    const datos = new Uint8Array(this.analizador.frequencyBinCount);
    const ancho = this.visualizadorCanvas.width;
    const alto = this.visualizadorCanvas.height;

    const render = () => {
      if (!this.reproduciendo) { this.bucleVisualizadorActivo = false; return; }
      this.analizador.getByteFrequencyData(datos);
      ctx.clearRect(0, 0, ancho, alto);
      const barW = ancho / datos.length;
      datos.forEach((v, i) => {
        const h = (v / 255) * alto;
        ctx.fillStyle = i % 2 === 0 ? 'rgba(255,45,117,.8)' : 'rgba(255,215,122,.8)';
        ctx.fillRect(i * barW, alto - h, barW - 2, h);
      });
      requestAnimationFrame(render);
    };
    render();
  },
};

/* =========================================================
   20. LOGROS (render + revisión)
========================================================= */
const Logros = {
  init() {
    this.grid = $('logros-grid');
    this.progresoEl = $('logros-progreso');
    this.render();
  },
  revisar() {
    let nuevos = false;
    LOGROS.forEach(l => {
      const yaDesbloqueado = state.logrosDesbloqueados.includes(l.id);
      if (!yaDesbloqueado && l.check(state)) {
        state.logrosDesbloqueados.push(l.id);
        nuevos = true;
        mostrarToast('🎖️ Logro desbloqueado: ' + l.nombre);
      }
    });
    if (nuevos) { Storage.guardar(); this.render(); }
  },
  render() {
    if (!this.grid) return;
    this.grid.innerHTML = '';
    LOGROS.forEach(l => {
      const desbloqueado = state.logrosDesbloqueados.includes(l.id);
      const div = document.createElement('div');
      div.className = 'logro' + (desbloqueado ? ' desbloqueado' : '');
      div.innerHTML = `
        <span class="logro-icono">${l.icono}</span>
        <div class="logro-nombre">${l.nombre}</div>
        <div class="logro-desc">${desbloqueado ? l.desc : '???'}</div>
      `;
      this.grid.appendChild(div);
    });
    this.progresoEl.textContent = `${state.logrosDesbloqueados.length} / ${LOGROS.length} desbloqueados`;
  },
};

/* =========================================================
   21. REGALOS SECRETOS
========================================================= */
const Regalos = {
  init() {
    this.lista = $('regalos-lista');
    this.boton = $('btn-regalos');
    this.revisar();
  },
  revisar() {
    const algunoDesbloqueado = REGALOS.some(r => r.requiere(state));
    this.boton.classList.toggle('oculto', !algunoDesbloqueado);
  },
  render() {
    this.lista.innerHTML = '';
    REGALOS.forEach(r => {
      const desbloqueado = r.requiere(state);
      const div = document.createElement('div');
      div.className = 'regalo' + (desbloqueado ? '' : ' bloqueado');
      div.innerHTML = desbloqueado
        ? `<h3>🎁 ${r.titulo}</h3><p>${r.texto}</p>`
        : `<h3>🔒 Regalo bloqueado</h3><p>Sigue explorando el universo para desbloquearlo.</p>`;
      this.lista.appendChild(div);
    });
  },
};

/* =========================================================
   22. RETOS (render)
========================================================= */
const Retos = {
  init() {
    this.lista = $('lista-retos');
    this.progresoEl = $('retos-progreso');
  },
  revisarNuevos() {
    let cambios = false;
    RETOS.forEach(meta => {
      if (state.amor >= meta && !state.retosNotificados.includes(meta)) {
        state.retosNotificados.push(meta);
        cambios = true;
      }
    });
    if (cambios) {
      Storage.guardar();
      const ultimo = state.retosNotificados[state.retosNotificados.length - 1];
      mostrarToast(`🏆 Reto cumplido: ${ultimo} corazones`);
      Efectos.fuegosArtificiales();
      Logros.revisar();
      Regalos.revisar();
    }
  },
  render() {
    this.lista.innerHTML = '';
    RETOS.forEach(meta => {
      const cumplido = state.amor >= meta;
      const li = document.createElement('li');
      li.className = cumplido ? 'hecho' : 'bloqueado';
      li.innerHTML = `<span class="icono">${cumplido ? '✅' : '🔒'}</span> ${meta} corazones`;
      this.lista.appendChild(li);
    });
    this.progresoEl.textContent = `${state.retosNotificados.length} / 100 desbloqueados`;
  },
};

/* =========================================================
   23. LUNA Y SECRETOS
========================================================= */
const Luna = {
  init() {
    this.boton = $('moon');
    this.titulo = $('luna-titulo');
    this.lista = $('luna-lista');
    this.boton.addEventListener('click', () => {
      if (this._pulsacionLarga) { this._pulsacionLarga = false; return; }
      this.tocar();
    });
    this.boton.addEventListener('pointerdown', () => {
      this._temporizadorLargo = setTimeout(() => {
        this._pulsacionLarga = true;
        this.tocarLargo();
      }, 850);
    });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(ev => {
      this.boton.addEventListener(ev, () => {
        if (this._temporizadorLargo) clearTimeout(this._temporizadorLargo);
      });
    });
  },
  tocar() {
    state.lunaClicks += 1;
    const nuevoIndice = CONFIG.clicksSecretosLuna.indexOf(state.lunaClicks);
    if (nuevoIndice >= 0 && !state.secretosLunaVistos.includes(nuevoIndice)) {
      state.secretosLunaVistos.push(nuevoIndice);
      Storage.guardar();
      mostrarToast('🌙 Descubriste un secreto de la luna');
      Efectos.fuegosArtificiales();
      Logros.revisar();
      this.render();
      abrirModal($('modal-luna'));
    } else {
      Storage.guardar();
    }
  },
  tocarLargo() {
    const disponibles = CURIOSIDADES_LUNA.map((_, i) => i).filter(i => !state.curiosidadesLunaVistas.includes(i));
    if (!disponibles.length) {
      mostrarToast('🌘 Ya encontraste todas las curiosidades escondidas aquí.');
      return;
    }
    const idx = disponibles[Math.floor(Math.random() * disponibles.length)];
    state.curiosidadesLunaVistas.push(idx);
    Storage.guardar();
    mostrarToast(CURIOSIDADES_LUNA[idx]);
    Efectos.fuegosArtificiales();
    Logros.revisar();
    Regalos.revisar();
  },
  render() {
    this.lista.innerHTML = '';
    const total = CONFIG.clicksSecretosLuna.length;
    this.titulo.textContent = `${state.secretosLunaVistos.length} / ${total} secretos encontrados`;
    SECRETOS_LUNA.forEach((texto, i) => {
      const visto = state.secretosLunaVistos.includes(i);
      const div = document.createElement('div');
      div.className = 'secreto' + (visto ? '' : ' bloqueado');
      div.textContent = visto ? texto : `🔒 Toca la luna ${CONFIG.clicksSecretosLuna[i]} veces para descubrir este secreto.`;
      this.lista.appendChild(div);
    });
  },
};

/* =========================================================
   23b. SECRETOS EXTRA
========================================================= */

/* Toca 3 veces seguidas el corazón del título para revelar una clave. */
const ClaveCorazon = {
  clicks: 0,
  init() {
    this.el = document.querySelector('.app-header .heart-ico');
    if (!this.el) return;
    this.el.style.cursor = 'pointer';
    this.el.addEventListener('click', () => this.tocar());
  },
  tocar() {
    if (state.claveCorazonEncontrada) return;
    this.clicks += 1;
    clearTimeout(this._temporizador);
    this._temporizador = setTimeout(() => { this.clicks = 0; }, 900);
    if (this.clicks >= 3) {
      this.clicks = 0;
      state.claveCorazonEncontrada = true;
      Storage.guardar();
      mostrarToast('🔐 Encontraste la clave escondida en el título');
      Efectos.fuegosArtificiales();
      Logros.revisar();
      Regalos.revisar();
    }
  },
};

/* Doble toque en el contador de "tiempo juntos" muestra una curiosidad numérica. */
const CuriosidadTiempo = {
  init() {
    this.el = $('contador');
    if (!this.el) return;
    this.el.addEventListener('dblclick', () => this.mostrar());
    let ultimoToque = 0;
    this.el.addEventListener('touchend', () => {
      const ahora = Date.now();
      if (ahora - ultimoToque < 350) this.mostrar();
      ultimoToque = ahora;
    });
  },
  mostrar() {
    const ms = Date.now() - CONFIG.fechaInicio.getTime();
    if (ms < 0) return;
    const minutos = Math.floor(ms / 60000);
    const horas = Math.floor(minutos / 60);
    const latidos = Math.floor(minutos * 70); // ~70 latidos por minuto, solo por diversión
    mostrarToast(`💗 Eso son ${horas.toLocaleString('es')} horas juntos — unos ${latidos.toLocaleString('es')} latidos de tu corazón.`);
    Efectos.fuegosArtificiales();
    if (!state.estadisticoCurioso) { state.estadisticoCurioso = true; Storage.guardar(); Logros.revisar(); }
  },
};

/* Cada 11 del mes (el día de su aniversario), una pequeña celebración extra. */
function revisarAniversarioMensual() {
  const hoy = new Date();
  if (hoy.getDate() !== 11) return;
  const clave = `${hoy.getFullYear()}-${hoy.getMonth() + 1}`;
  if (state.mesesCelebrados.includes(clave)) return;
  state.mesesCelebrados.push(clave);
  Storage.guardar();
  setTimeout(() => {
    mostrarToast('💞 Hoy se cumple un mes más desde el 11 de marzo.');
    Efectos.fuegosArtificiales();
  }, 2200);
}

/* =========================================================
   23c. RULETA DE CITAS
========================================================= */
const Ruleta = {
  girando: false,
  init() {
    this.tarjeta = $('ruleta-tarjeta');
    this.icono = $('ruleta-icono');
    this.texto = $('ruleta-texto');
    this.boton = $('ruleta-girar');
    if (!this.boton) return;
    this.boton.addEventListener('click', () => this.girar());
  },
  girar() {
    if (this.girando) return;
    this.girando = true;
    this.tarjeta.classList.remove('revelada');
    this.icono.classList.add('girando');
    this.boton.disabled = true;

    let vueltas = 0;
    const totalVueltas = 14;
    const intervalo = setInterval(() => {
      const idea = IDEAS_RULETA[Math.floor(Math.random() * IDEAS_RULETA.length)];
      this.icono.textContent = idea.icono;
      this.texto.textContent = idea.texto;
      vueltas += 1;
      if (vueltas >= totalVueltas) {
        clearInterval(intervalo);
        this.icono.classList.remove('girando');
        this.tarjeta.classList.add('revelada');
        this.girando = false;
        this.boton.disabled = false;
        if (!state.ruletaUsada) { state.ruletaUsada = true; Storage.guardar(); Logros.revisar(); }
      }
    }, 90);
  },
};

/* =========================================================
   23d. FRASCO DE PIROPOS
========================================================= */
const Frasco = {
  init() {
    this.form = $('frasco-form');
    if (!this.form) return;
    this.textoInput = $('frasco-texto');
    this.contador = $('frasco-contador');
    this.tarjeta = $('frasco-tarjeta');
    this.icono = $('frasco-icono');
    this.textoSacado = $('frasco-texto-sacado');
    this.form.addEventListener('submit', e => { e.preventDefault(); this.agregar(); });
    $('frasco-sacar').addEventListener('click', () => this.sacar());
    $('frasco-vaciar').addEventListener('click', () => this.vaciar());
  },
  agregar() {
    const texto = this.textoInput.value.trim();
    if (!texto) return;
    state.piropos.push({ id: generarId(), texto });
    Storage.guardar();
    Logros.revisar();
    this.textoInput.value = '';
    mostrarToast('🫙 Piropo guardado en el frasco');
    this.render();
  },
  sacar() {
    if (!state.piropos.length) {
      mostrarToast('El frasco todavía está vacío. ¡Agreguen el primer piropo!');
      return;
    }
    const elegido = state.piropos[Math.floor(Math.random() * state.piropos.length)];
    this.icono.textContent = '💌';
    this.textoSacado.textContent = elegido.texto;
    this.tarjeta.classList.remove('revelada');
    void this.tarjeta.offsetWidth; // fuerza el reinicio de la animación
    this.tarjeta.classList.add('revelada');
  },
  vaciar() {
    if (!state.piropos.length) return;
    state.piropos = [];
    Storage.guardar();
    this.icono.textContent = '🫙';
    this.textoSacado.textContent = 'El frasco está esperando su primer piropo.';
    this.tarjeta.classList.remove('revelada');
    this.render();
  },
  render() {
    if (!this.contador) return;
    this.contador.textContent = state.piropos.length
      ? `El frasco tiene ${state.piropos.length} piropo${state.piropos.length === 1 ? '' : 's'} guardado${state.piropos.length === 1 ? '' : 's'}.`
      : 'El frasco todavía está vacío.';
  },
};

/* =========================================================
   23e. ESTADO DE ÁNIMO DEL DÍA
========================================================= */
const ANIMO_OPCIONES = ['🥰', '😄', '🙂', '😐', '😔', '😴', '😤', '🤒'];

const Animo = {
  init() {
    this.contenedor = $('animo-opciones');
    if (!this.contenedor) return;
    this.guardadoEl = $('animo-guardado');
    this.tira = $('animo-tira');
    this.contenedor.innerHTML = '';
    ANIMO_OPCIONES.forEach(emoji => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'animo-btn';
      btn.textContent = emoji;
      btn.setAttribute('aria-label', 'Registrar ánimo ' + emoji);
      btn.addEventListener('click', () => this.registrar(emoji));
      this.contenedor.appendChild(btn);
    });
  },
  registrar(emoji) {
    const hoy = fechaLocalISO(new Date());
    state.animos[hoy] = emoji;
    Storage.guardar();
    Logros.revisar();
    this.render();
  },
  render() {
    if (!this.contenedor) return;
    const hoy = fechaLocalISO(new Date());
    this.contenedor.querySelectorAll('.animo-btn').forEach(btn => {
      btn.classList.toggle('activo', state.animos[hoy] === btn.textContent);
    });
    if (state.animos[hoy]) {
      this.guardadoEl.hidden = false;
      this.guardadoEl.textContent = `Guardado como el ánimo de hoy: ${state.animos[hoy]}`;
    } else {
      this.guardadoEl.hidden = true;
    }

    this.tira.innerHTML = '';
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const clave = fechaLocalISO(d);
      const emoji = state.animos[clave];
      const div = document.createElement('div');
      div.className = 'animo-dia' + (emoji ? '' : ' vacio');
      div.textContent = emoji || '·';
      div.title = clave;
      this.tira.appendChild(div);
    }
  },
};

/* =========================================================
   23f. ÁLBUM (fotos reales, guardadas en este dispositivo)
   ---------------------------------------------------------
   Las fotos se comprimen en el navegador antes de guardarse
   (máx. ~900px, calidad ~72%) para que quepan más en el espacio
   disponible. Todo queda en este dispositivo — no se sube a
   ningún servidor.
========================================================= */
const Album = {
  init() {
    this.grid = $('album-grid');
    if (!this.grid) return;
    this.input = $('album-input');
    this.ayuda = $('album-ayuda');
    this.input.addEventListener('change', () => {
      const archivo = this.input.files && this.input.files[0];
      if (archivo) this.manejarArchivo(archivo);
      this.input.value = '';
    });
    this.render();
  },

  manejarArchivo(file) {
    if (!file.type || !file.type.startsWith('image/')) {
      mostrarToast('Ese archivo no parece una imagen.');
      return;
    }
    const lector = new FileReader();
    lector.onload = e => {
      const img = new Image();
      img.onload = () => {
        const MAX = 900;
        let w = img.width, h = img.height;
        if (w > MAX || h > MAX) {
          if (w >= h) { h = Math.round(h * MAX / w); w = MAX; }
          else { w = Math.round(w * MAX / h); h = MAX; }
        }
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.72);
        this.agregarFoto(dataUrl);
      };
      img.onerror = () => mostrarToast('No se pudo leer esa imagen.');
      img.src = e.target.result;
    };
    lector.onerror = () => mostrarToast('No se pudo leer ese archivo.');
    lector.readAsDataURL(file);
  },

  agregarFoto(dataUrl) {
    state.fotos.push({ id: generarId(), src: dataUrl, fecha: fechaLocalISO(new Date()) });
    const ok = Storage.intentarGuardarInmediato();
    if (!ok) {
      state.fotos.pop();
      mostrarToast('📷 No queda espacio en este dispositivo para más fotos. Borra alguna para agregar otra.');
      return;
    }
    Logros.revisar();
    this.render();
    mostrarToast('📷 Foto guardada');
  },

  eliminar(id) {
    state.fotos = state.fotos.filter(f => f.id !== id);
    Storage.guardar();
    this.render();
  },

  abrirVisor(src) {
    $('visor-imagen').src = src;
    $('visor-imagen').alt = 'Recuerdo ampliado';
    abrirModal($('modal-visor'));
  },

  render() {
    if (!this.grid) return;
    this.grid.innerHTML = '';
    state.fotos.forEach(foto => {
      const div = document.createElement('div');
      div.className = 'foto-real';
      const img = document.createElement('img');
      img.src = foto.src;
      img.alt = 'Recuerdo';
      img.loading = 'lazy';
      img.addEventListener('click', () => this.abrirVisor(foto.src));
      const btn = document.createElement('button');
      btn.className = 'foto-borrar';
      btn.type = 'button';
      btn.setAttribute('aria-label', 'Eliminar foto');
      btn.textContent = '✕';
      btn.addEventListener('click', ev => { ev.stopPropagation(); this.eliminar(foto.id); });
      div.appendChild(img);
      div.appendChild(btn);
      this.grid.appendChild(div);
    });

    const tileAgregar = document.createElement('button');
    tileAgregar.type = 'button';
    tileAgregar.className = 'foto-agregar';
    tileAgregar.innerHTML = '<span>➕</span><span class="foto-agregar-texto">Agregar foto</span>';
    tileAgregar.addEventListener('click', () => this.input.click());
    this.grid.appendChild(tileAgregar);

    if (this.ayuda) {
      this.ayuda.textContent = state.fotos.length
        ? `${state.fotos.length} foto${state.fotos.length === 1 ? '' : 's'} guardada${state.fotos.length === 1 ? '' : 's'} en este dispositivo.`
        : 'Toca "Agregar foto" para empezar a guardar sus recuerdos aquí.';
    }
  },
};

/* =========================================================
   AVISO DE NOVEDADES
   Cada vez que CONFIG.version cambia, la próxima vez que se
   abra la página se muestra un aviso una sola vez.
========================================================= */
function revisarNovedades() {
  if (state.versionVista === CONFIG.version) return;
  const tieneUsoPrevio = state.amor > 0 || state.logrosDesbloqueados.length > 0 || state.lunaClicks > 0;
  state.versionVista = CONFIG.version;
  Storage.guardar();
  if (!tieneUsoPrevio) return; // primera visita de todas: no hay "novedades" que anunciar todavía
  setTimeout(() => {
    mostrarToast('✨ Actualizamos el universo: ahora pueden subir fotos reales y ampliar su propia historia.');
  }, 2600);
}

/* =========================================================
   24. CHAT (vinculado por código, vía Firebase Firestore)
   ---------------------------------------------------------
   Uno de los dos genera un código de sala; el otro lo usa para
   unirse. Desde ahí, los mensajes se sincronizan en tiempo real
   y sin límite mientras el proyecto de Firebase esté activo.
   Ver FIREBASE_CONFIG al inicio de este archivo para activarlo.
========================================================= */
const Chat = {
  storageKey: 'universo-scarleth-chat',
  db: null,
  unsub: null,
  primeraCarga: false,
  datos: null, // { roomCode, nombre, deviceId }

  init() {
    this.panelVinculacion = $('chat-vinculacion');
    this.panelActivo = $('chat-activo');
    this.errorVinculacion = $('chat-vinculacion-error');
    this.nombreInput = $('chat-nombre-input');
    this.codigoInput = $('chat-codigo-input');
    this.codigoValorEl = $('chat-codigo-actual-valor');
    this.mensajesEl = $('chat-mensajes');
    this.indicadorEscribiendo = $('chat-escribiendo');
    this.form = $('chat-form');
    this.input = $('chat-input');
    if (!this.panelVinculacion) return;

    this.cargarDatosLocales();
    this.inicializarFirebase();

    $('chat-crear').addEventListener('click', () => this.crear());
    $('chat-unirse').addEventListener('click', () => this.unirse());
    this.codigoInput.addEventListener('input', () => {
      const pos = this.codigoInput.selectionStart;
      this.codigoInput.value = this.codigoInput.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
      this.codigoInput.setSelectionRange(pos, pos);
    });
    $('chat-copiar-codigo').addEventListener('click', () => this.copiarCodigo());
    $('chat-desvincular').addEventListener('click', () => this.desvincular());
    this.form.addEventListener('submit', e => { e.preventDefault(); this.enviar(); });
    this.input.addEventListener('input', () => this.marcarEscribiendo());
  },

  inicializarFirebase() {
    if (typeof firebase === 'undefined') return;
    if (!FIREBASE_CONFIG.apiKey || FIREBASE_CONFIG.apiKey === 'TU_API_KEY') return;
    try {
      if (!firebase.apps.length) firebase.initializeApp(FIREBASE_CONFIG);
      this.db = firebase.firestore();
    } catch (e) { this.db = null; }
  },

  cargarDatosLocales() {
    try {
      const raw = localStorage.getItem(this.storageKey);
      this.datos = raw ? JSON.parse(raw) : null;
      if (this.datos && this.datos.nombre) this.nombreInput.value = this.datos.nombre;
    } catch (e) { this.datos = null; }
  },

  guardarDatosLocales() {
    try { localStorage.setItem(this.storageKey, JSON.stringify(this.datos)); } catch (e) { /* almacenamiento no disponible */ }
  },

  render() {
    if (!this.panelVinculacion) return;

    if (!this.db) {
      this.panelVinculacion.hidden = false;
      this.panelActivo.hidden = true;
      this.errorVinculacion.textContent = typeof firebase === 'undefined'
        ? '⚠️ El chat necesita conexión a internet para cargar.'
        : '⚠️ El chat todavía no está activado. Sigue las instrucciones dentro de script.js (busca FIREBASE_CONFIG) para activarlo gratis en unos minutos.';
      return;
    }

    if (this.datos && this.datos.roomCode) {
      this.panelVinculacion.hidden = true;
      this.panelActivo.hidden = false;
      this.codigoValorEl.textContent = this.datos.roomCode;
      this.escucharMensajes();
      this.escucharEscribiendo();
    } else {
      this.panelVinculacion.hidden = false;
      this.panelActivo.hidden = true;
      this.errorVinculacion.textContent = '';
    }
  },

  nombreValido() {
    const nombre = this.nombreInput.value.trim();
    if (!nombre) { this.errorVinculacion.textContent = 'Escribe tu nombre antes de continuar.'; return null; }
    return nombre;
  },

  crear() {
    const nombre = this.nombreValido();
    if (!nombre) return;
    const codigo = this.generarCodigo();
    this.vincular(codigo, nombre);
    mostrarToast('✨ Código creado: ' + codigo);
  },

  unirse() {
    const nombre = this.nombreValido();
    if (!nombre) return;
    const codigo = this.codigoInput.value.trim().toUpperCase();
    if (codigo.length < 4) { this.errorVinculacion.textContent = 'Escribe un código válido.'; return; }
    this.vincular(codigo, nombre);
  },

  vincular(codigo, nombre) {
    this.datos = { roomCode: codigo, nombre, deviceId: generarId() };
    this.guardarDatosLocales();
    this.errorVinculacion.textContent = '';
    this.render();
  },

  generarCodigo() {
    const alfabeto = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // sin 0/O ni 1/I/L, para evitar confusiones al leerlo
    let cod = '';
    for (let i = 0; i < 6; i++) cod += alfabeto[Math.floor(Math.random() * alfabeto.length)];
    return cod;
  },

  copiarCodigo() {
    if (!this.datos) return;
    const codigo = this.datos.roomCode;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(codigo).then(() => mostrarToast('📋 Código copiado')).catch(() => mostrarToast('Código: ' + codigo));
    } else {
      mostrarToast('Código: ' + codigo);
    }
  },

  desvincular() {
    this.detenerEscucha();
    this.datos = null;
    try { localStorage.removeItem(this.storageKey); } catch (e) { /* almacenamiento no disponible */ }
    if (this.mensajesEl) this.mensajesEl.innerHTML = '';
    this.render();
  },

  coleccion() {
    return this.db.collection('salas').doc(this.datos.roomCode).collection('mensajes');
  },

  escucharMensajes() {
    if (!this.db || !this.datos || this.unsub) return;
    this.mensajesEl.innerHTML = '<p class="chat-vacio">Cargando mensajes...</p>';
    this.primeraCarga = true;
    this.unsub = this.coleccion().orderBy('ts', 'asc').limitToLast(300).onSnapshot(
      snap => {
        this.renderMensajes(snap.docs.map(d => d.data()));
        this.primeraCarga = false;
      },
      () => { this.mensajesEl.innerHTML = '<p class="chat-vacio">No se pudieron cargar los mensajes. Revisa tu conexión.</p>'; }
    );
  },

  detenerEscucha() {
    if (this.unsub) { this.unsub(); this.unsub = null; }
    if (this.unsubEscribiendo) { this.unsubEscribiendo(); this.unsubEscribiendo = null; }
    if (this._intervaloEscribiendo) { clearInterval(this._intervaloEscribiendo); this._intervaloEscribiendo = null; }
    this._escribiendoDatos = {};
    if (this.datos) this.escribiendoRef().delete().catch(() => {});
  },

  // --- Indicador "está escribiendo..." ---
  escribiendoRef() {
    return this.db.collection('salas').doc(this.datos.roomCode).collection('escribiendo').doc(this.datos.deviceId);
  },

  marcarEscribiendo() {
    if (!this.db || !this.datos) return;
    const ahora = Date.now();
    if (this._ultimoAvisoEscribiendo && ahora - this._ultimoAvisoEscribiendo < 1500) return;
    this._ultimoAvisoEscribiendo = ahora;
    this.escribiendoRef().set({ nombre: this.datos.nombre, ts: ahora }).catch(() => {});
  },

  escucharEscribiendo() {
    if (!this.db || !this.datos || this.unsubEscribiendo) return;
    this._escribiendoDatos = {};
    this.unsubEscribiendo = this.db.collection('salas').doc(this.datos.roomCode).collection('escribiendo')
      .onSnapshot(snap => {
        this._escribiendoDatos = {};
        snap.docs.forEach(d => { if (d.id !== this.datos.deviceId) this._escribiendoDatos[d.id] = d.data(); });
        this.actualizarIndicadorEscribiendo();
      }, () => { /* si falla, simplemente no mostramos el indicador */ });
    this._intervaloEscribiendo = setInterval(() => this.actualizarIndicadorEscribiendo(), 1000);
  },

  actualizarIndicadorEscribiendo() {
    if (!this.indicadorEscribiendo) return;
    const ahora = Date.now();
    const activos = Object.values(this._escribiendoDatos || {}).filter(d => d.ts && ahora - d.ts < 3500);
    if (activos.length) {
      this.indicadorEscribiendo.textContent = `💬 ${activos[0].nombre || 'Está'} escribiendo…`;
      this.indicadorEscribiendo.hidden = false;
    } else {
      this.indicadorEscribiendo.hidden = true;
    }
  },

  renderMensajes(mensajes) {
    if (!mensajes.length) {
      this.mensajesEl.innerHTML = '<p class="chat-vacio">Todavía no hay mensajes. Escribe el primero 💌</p>';
      return;
    }
    const estabaAlFinal = this.primeraCarga
      || (this.mensajesEl.scrollTop + this.mensajesEl.clientHeight >= this.mensajesEl.scrollHeight - 40);

    this.mensajesEl.innerHTML = mensajes.map(m => {
      const mia = m.deviceId === this.datos.deviceId;
      const hora = m.ts ? new Date(m.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
      return `
        <div class="chat-burbuja ${mia ? 'mia' : 'otra'}">
          ${mia ? '' : `<span class="chat-autor">${escaparHtml(m.autor || '')}</span>`}
          <span class="chat-texto">${escaparHtml(m.texto || '')}</span>
          <span class="chat-hora">${hora}</span>
        </div>`;
    }).join('');

    if (estabaAlFinal) this.mensajesEl.scrollTop = this.mensajesEl.scrollHeight;
  },

  enviar() {
    const texto = this.input.value.trim();
    if (!texto || !this.db || !this.datos) return;
    this.input.value = '';
    this._ultimoAvisoEscribiendo = 0;
    this.escribiendoRef().delete().catch(() => {});
    this.coleccion().add({
      texto,
      autor: this.datos.nombre,
      deviceId: this.datos.deviceId,
      ts: Date.now(),
    }).then(() => {
      if (!state.chatUsado) { state.chatUsado = true; Storage.guardar(); Logros.revisar(); }
    }).catch(() => mostrarToast('No se pudo enviar el mensaje. Revisa tu conexión.'));
  },
};

/* =========================================================
   25. NOTAS / PENSAMIENTOS
   ---------------------------------------------------------
   Un espacio para guardar pensamientos sueltos, canciones,
   películas o cualquier cosa que quieran recordar juntos.
   Se guarda localmente, igual que el resto del progreso.
========================================================= */
const NOTAS_CATEGORIAS = {
  pensamiento: { icono: '💭', nombre: 'Pensamiento' },
  cancion: { icono: '🎵', nombre: 'Canción' },
  pelicula: { icono: '🎬', nombre: 'Película' },
  otro: { icono: '✨', nombre: 'Otro' },
};

const Notas = {
  categoriaActual: 'pensamiento',
  editandoId: null,

  init() {
    this.form = $('notas-form');
    this.textoInput = $('notas-texto');
    this.error = $('notas-error');
    this.lista = $('notas-lista');
    this.guardarBtn = $('notas-guardar-btn');
    this.chips = $('notas-categorias');
    if (!this.form) return;

    this.chips.querySelectorAll('.notas-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        this.categoriaActual = chip.dataset.cat;
        this.chips.querySelectorAll('.notas-chip').forEach(c => c.classList.toggle('activo', c === chip));
      });
    });

    this.form.addEventListener('submit', e => { e.preventDefault(); this.guardar(); });
    this.render();
  },

  guardar() {
    const texto = this.textoInput.value.trim();
    this.error.textContent = '';
    if (!texto) { this.error.textContent = 'Escribe algo antes de guardar.'; return; }

    if (this.editandoId) {
      const nota = state.notas.find(n => n.id === this.editandoId);
      if (nota) { nota.texto = texto; nota.categoria = this.categoriaActual; }
      this.cancelarEdicion();
    } else {
      state.notas.unshift({ id: generarId(), texto, categoria: this.categoriaActual, fecha: fechaLocalISO(new Date()) });
      if (!state.notasUsado) { state.notasUsado = true; Logros.revisar(); }
    }
    Storage.guardar();
    this.textoInput.value = '';
    this.render();
  },

  cancelarEdicion() {
    this.editandoId = null;
    this.guardarBtn.textContent = '💾 Guardar nota';
  },

  editar(id) {
    const nota = state.notas.find(n => n.id === id);
    if (!nota) return;
    this.textoInput.value = nota.texto;
    this.categoriaActual = nota.categoria;
    this.chips.querySelectorAll('.notas-chip').forEach(c => c.classList.toggle('activo', c.dataset.cat === nota.categoria));
    this.editandoId = id;
    this.guardarBtn.textContent = '💾 Guardar cambios';
    this.textoInput.focus();
  },

  eliminar(id) {
    state.notas = state.notas.filter(n => n.id !== id);
    if (this.editandoId === id) { this.cancelarEdicion(); this.textoInput.value = ''; }
    Storage.guardar();
    this.render();
  },

  render() {
    if (!this.lista) return;
    if (!state.notas.length) {
      this.lista.innerHTML = '<p class="capsula-vacio">Todavía no han guardado ninguna nota. Escriban la primera arriba ⬆️</p>';
      return;
    }
    this.lista.innerHTML = '';
    state.notas.forEach(n => {
      const cat = NOTAS_CATEGORIAS[n.categoria] || NOTAS_CATEGORIAS.otro;
      const div = document.createElement('div');
      div.className = 'nota';
      div.innerHTML = `
        <div class="nota-cabeza">
          <span class="nota-categoria">${cat.icono} ${cat.nombre}</span>
          <span class="nota-fecha">${formatFecha(n.fecha)}</span>
        </div>
        <p class="nota-texto">${escaparHtml(n.texto)}</p>
        <div class="nota-acciones">
          <button class="nota-editar" type="button" aria-label="Editar nota">✏️</button>
          <button class="nota-eliminar" type="button" aria-label="Eliminar nota">🗑️</button>
        </div>
      `;
      div.querySelector('.nota-editar').addEventListener('click', () => this.editar(n.id));
      div.querySelector('.nota-eliminar').addEventListener('click', () => this.eliminar(n.id));
      this.lista.appendChild(div);
    });
  },
};

/* =========================================================
   26. GUSTOS (qué le gusta a cada uno — editable)
========================================================= */
const Gustos = {
  init() {
    this.formularios = document.querySelectorAll('.gustos-form');
    if (!this.formularios.length) return;
    this.formularios.forEach(form => {
      form.addEventListener('submit', e => {
        e.preventDefault();
        const input = form.querySelector('.gustos-input');
        this.agregar(form.dataset.quien, input.value);
        input.value = '';
        input.focus();
      });
    });
    this.render();
  },

  agregar(quien, texto) {
    texto = texto.trim();
    if (!texto) return;
    if (!state.gustos[quien]) state.gustos[quien] = [];
    state.gustos[quien].push({ id: generarId(), texto });
    if (!state.gustosUsado) { state.gustosUsado = true; Logros.revisar(); }
    Storage.guardar();
    this.render();
  },

  editarTexto(quien, id, nuevoTexto) {
    const item = (state.gustos[quien] || []).find(g => g.id === id);
    if (!item) return;
    const limpio = nuevoTexto.trim();
    if (!limpio || limpio === item.texto) return;
    item.texto = limpio;
    Storage.guardar();
  },

  eliminar(quien, id) {
    state.gustos[quien] = (state.gustos[quien] || []).filter(g => g.id !== id);
    Storage.guardar();
    this.render();
  },

  render() {
    ['ella', 'el'].forEach(quien => {
      const ul = $('gustos-lista-' + quien);
      if (!ul) return;
      ul.innerHTML = '';
      const items = state.gustos[quien] || [];
      if (!items.length) {
        ul.innerHTML = '<li class="gustos-vacio">Nada agregado todavía.</li>';
        return;
      }
      items.forEach(g => {
        const li = document.createElement('li');
        li.className = 'gustos-item';
        li.innerHTML = `<span class="gustos-texto" contenteditable="true" spellcheck="false">${escaparHtml(g.texto)}</span><button class="gustos-eliminar" type="button" aria-label="Eliminar">✕</button>`;

        const span = li.querySelector('.gustos-texto');
        span.addEventListener('blur', () => {
          if (!span.textContent.trim()) { span.textContent = g.texto; return; }
          this.editarTexto(quien, g.id, span.textContent);
        });
        span.addEventListener('keydown', e => {
          if (e.key === 'Enter') { e.preventDefault(); span.blur(); }
        });

        li.querySelector('.gustos-eliminar').addEventListener('click', () => this.eliminar(quien, g.id));
        ul.appendChild(li);
      });
    });
  },
};

/* =========================================================
   27. UI PRINCIPAL / APP
========================================================= */
const NIVELES_AMOR = [
  [50, '🤍 Comenzando nuestra historia'],
  [100, '💗 Enamorándose'],
  [500, '❤️ Amor verdadero'],
  [1000, '💖 Alma gemela'],
  [10000, '👑 Reina de mi corazón'],
  [Infinity, '🌌 Diosa de mi universo'],
];

const App = {
  init() {
    Storage.cargar();
    this.elementos();
    Efectos.init();
    Constelaciones.init();
    this.actualizarTiempo();
    this.cargarNivel();
    this.iniciarFrase();
    this.renderTimeline();
    const formTimeline = $('timeline-form');
    if (formTimeline) {
      formTimeline.addEventListener('submit', e => {
        e.preventDefault();
        this.agregarEventoHistoria($('timeline-fecha').value, $('timeline-texto').value);
        $('timeline-fecha').value = '';
        $('timeline-texto').value = '';
      });
    }
    Retos.init(); Retos.render();
    Logros.init();
    Regalos.init();
    Luna.init(); Luna.render();
    Reproductor.init();
    Morse.init();
    Capsulas.init();
    Racha.init();
    FechasEspeciales.init();
    Quiz.init();
    Chat.init();
    Notas.init();
    Gustos.init();
    ClaveCorazon.init();
    CuriosidadTiempo.init();
    Ruleta.init();
    Frasco.init();
    Animo.init();
    Album.init();
    revisarAniversarioMensual();
    revisarNovedades();
    this.aplicarModo();
    this.eventos();
    this.registrarServiceWorker();

    setInterval(() => this.actualizarTiempo(), 1000);
    setInterval(() => this.cambiarFrase(), CONFIG.intervaloFrase);
    setInterval(() => Efectos.crearEstrellaFugaz(), CONFIG.intervaloEstrellaFugaz);
  },

  registrarServiceWorker() {
    if (!('serviceWorker' in navigator)) return;
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js').catch(() => { /* offline no disponible: la app sigue funcionando en línea */ });
    });
  },

  elementos() {
    this.welcome = $('welcome');
    this.main = $('main');
    this.enterBtn = $('enter');
    this.contador = $('contador');
    this.loveBtn = $('loveButton');
    this.loveCounter = $('loveCounter');
    this.nivelEl = $('level');
    this.barraNivel = $('barra-nivel-fill');
    this.fraseEl = $('frase-romantica');
    this.textoCarta = $('texto-maquina');
  },

  eventos() {
    this.enterBtn.addEventListener('click', () => this.entrarAlUniverso());
    this.loveBtn.addEventListener('click', () => this.sumarAmor());
    $('toggle-modo').addEventListener('click', () => this.alternarModo());
    $('btn-compartir').addEventListener('click', () => this.compartirResumen());

    this.configurarModal('btn-carta', 'modal-carta', () => this.escribirCarta());
    this.configurarModal('btn-chat', 'modal-chat', () => Chat.render());
    this.configurarModal('btn-notas', 'modal-notas', () => Notas.render());
    this.configurarModal('btn-gustos', 'modal-gustos', () => Gustos.render());
    this.configurarModal('btn-retos', 'modal-retos', () => Retos.render());
    this.configurarModal('btn-album', 'modal-album', () => { state.albumAbierto = true; Storage.guardar(); Logros.revisar(); });
    this.configurarModal('btn-linea', 'modal-linea', () => { state.historiaAbierta = true; Storage.guardar(); Logros.revisar(); });
    this.configurarModal('btn-logros', 'modal-logros', () => Logros.render());
    this.configurarModal('btn-regalos', 'modal-regalos', () => Regalos.render());
    this.configurarModal('btn-morse', 'modal-morse');
    this.configurarModal('btn-capsula', 'modal-capsula', () => Capsulas.render());
    this.configurarModal('btn-quiz', 'modal-quiz', () => Quiz.reiniciar());
    this.configurarModal('btn-ruleta', 'modal-ruleta');
    this.configurarModal('btn-frasco', 'modal-frasco', () => Frasco.render());
    this.configurarModal('btn-animo', 'modal-animo', () => Animo.render());

    const btnInstalar = $('btn-instalar');
    if (btnInstalar) {
      if (esIOS() && !esStandalone()) btnInstalar.classList.remove('oculto');
      btnInstalar.addEventListener('click', async () => {
        if (window.promptInstalacionDiferido) {
          window.promptInstalacionDiferido.prompt();
          await window.promptInstalacionDiferido.userChoice;
          window.promptInstalacionDiferido = null;
          btnInstalar.classList.add('oculto');
        } else if (esIOS()) {
          abrirModal($('modal-instalar')); // iOS no tiene prompt nativo: mostramos los pasos manuales
        }
      });
    }

    document.querySelectorAll('.modal .close').forEach(btn => {
      btn.addEventListener('click', () => cerrarModal(btn.closest('.modal')));
    });
    document.querySelectorAll('.modal').forEach(modal => {
      modal.addEventListener('click', e => { if (e.target === modal) cerrarModal(modal); });
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') document.querySelectorAll('.modal.abierto').forEach(cerrarModal);
    });
  },

  configurarModal(btnId, modalId, alAbrir) {
    const btn = $(btnId);
    const modal = $(modalId);
    if (!btn || !modal) return;
    btn.addEventListener('click', () => {
      abrirModal(modal);
      if (alAbrir) alAbrir();
    });
  },

  entrarAlUniverso() {
    this.welcome.classList.add('saliendo');
    setTimeout(() => {
      this.welcome.hidden = true;
      this.main.hidden = false;
      Efectos.lloverPetalos();
      setTimeout(() => Racha.mostrarSorpresaSiPendiente(), 1600);
    }, 800);
  },

  actualizarTiempo() {
    const ahora = new Date();
    const diff = ahora - CONFIG.fechaInicio;
    if (diff < 0) {
      this.contador.innerHTML = '<p>Nuestra historia comienza el 11 de marzo ❤️</p>';
      return;
    }
    let seg = Math.floor(diff / 1000);
    const dias = Math.floor(seg / 86400); seg %= 86400;
    const horas = Math.floor(seg / 3600); seg %= 3600;
    const minutos = Math.floor(seg / 60); seg %= 60;
    const unidades = [
      [dias, 'Días'], [horas, 'Horas'], [minutos, 'Minutos'], [seg, 'Segundos'],
    ];
    this.contador.innerHTML = unidades.map(([valor, etiqueta]) => `
      <div class="unidad"><span class="numero">${valor}</span><span class="etiqueta">${etiqueta}</span></div>
    `).join('');
    this.revisarHitosDias(dias);
  },

  revisarHitosDias(dias) {
    const nuevos = CONFIG.hitosDias.filter(h => dias >= h && !state.hitosCelebrados.includes(h));
    if (!nuevos.length) return;
    nuevos.forEach(h => state.hitosCelebrados.push(h));
    Storage.guardar();
    Logros.revisar();
    const hito = nuevos[nuevos.length - 1];
    setTimeout(() => {
      mostrarToast(`🎉 ¡Ya llevamos ${hito.toLocaleString('es')} días juntos!`);
      Efectos.fuegosArtificiales();
    }, 600);
  },

  calcularDiasJuntos() {
    const diff = new Date() - CONFIG.fechaInicio;
    return diff < 0 ? 0 : Math.floor(diff / 86400000);
  },

  async compartirResumen() {
    const dias = this.calcularDiasJuntos();
    const retosCumplidos = state.retosNotificados.length;
    const secretosLuna = state.secretosLunaVistos.length;
    const logrosCount = state.logrosDesbloqueados.length;

    const texto = [
      '✨ Nuestro Universo ✨',
      `💗 ${dias.toLocaleString('es')} días juntos`,
      `❤️ ${state.amor.toLocaleString('es')} corazones tocados`,
      `🏆 ${retosCumplidos}/100 retos cumplidos`,
      `🌙 ${secretosLuna}/${CONFIG.clicksSecretosLuna.length} secretos de la luna encontrados`,
      `🎖️ ${logrosCount}/${LOGROS.length} logros desbloqueados`,
      '',
      'hecho con ❤️ para Scarleth Rassel',
    ].join('\n');

    if (navigator.share) {
      try {
        await navigator.share({ title: 'Nuestro Universo ❤️', text: texto });
        return;
      } catch (e) {
        if (e && e.name === 'AbortError') return; // cerró el diálogo de compartir: nada que hacer
        // si falla por otra razón, seguimos al plan B (portapapeles)
      }
    }
    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(texto);
        mostrarToast('📋 Resumen copiado — pégalo donde quieras');
        return;
      } catch (e) { /* seguimos al último recurso */ }
    }
    mostrarToast('No se pudo compartir automáticamente en este navegador.');
  },

  cargarNivel() {
    this.loveCounter.textContent = state.amor;
    this.actualizarNivel();
  },

  sumarAmor() {
    this.agregarAmor(1, { vibrar: true, corazonVisual: true });
  },

  // Único punto donde el contador de amor cambia: lo reutiliza el botón
  // manual y el bono automático por visitar cada día (evita duplicar lógica).
  agregarAmor(cantidad, { vibrar = false, corazonVisual = false } = {}) {
    state.amor += cantidad;
    this.loveCounter.textContent = state.amor;
    Storage.guardar();
    this.actualizarNivel();
    Retos.revisarNuevos();
    Logros.revisar();
    if (corazonVisual) Efectos.crearCorazon();
    if (vibrar && navigator.vibrate) navigator.vibrate(18);
  },

  actualizarNivel() {
    const nivel = NIVELES_AMOR.find(([tope]) => state.amor < tope) || NIVELES_AMOR[NIVELES_AMOR.length - 1];
    this.nivelEl.textContent = nivel[1];

    const [tope] = nivel;
    const anteriorTope = NIVELES_AMOR[NIVELES_AMOR.indexOf(nivel) - 1]?.[0] ?? 0;
    const rango = tope === Infinity ? 1 : tope - anteriorTope;
    const avance = tope === Infinity ? 1 : (state.amor - anteriorTope) / rango;
    this.barraNivel.style.width = Math.min(100, Math.max(4, avance * 100)) + '%';
  },

  iniciarFrase() { this.cambiarFrase(); },

  cambiarFrase() {
    if (!this.fraseEl) return;
    let n;
    do { n = Math.floor(Math.random() * FRASES.length); } while (n === ultimaFraseIndex && FRASES.length > 1);
    ultimaFraseIndex = n;
    this.fraseEl.style.animation = 'none';
    void this.fraseEl.offsetWidth;
    this.fraseEl.style.animation = '';
    this.fraseEl.textContent = FRASES[n];
  },

  renderTimeline() {
    const cont = $('timeline');
    cont.innerHTML = '';
    TIMELINE.forEach(ev => {
      const div = document.createElement('div');
      div.className = 'evento';
      const p = document.createElement('span');
      const strong = document.createElement('strong');
      strong.textContent = ev.fecha + ': ';
      p.appendChild(strong);
      p.appendChild(document.createTextNode(ev.texto));
      div.appendChild(p);
      cont.appendChild(div);
    });
    state.timelinePersonal.forEach(ev => {
      const div = document.createElement('div');
      div.className = 'evento';
      const p = document.createElement('span');
      const strong = document.createElement('strong');
      strong.textContent = (ev.fecha || 'Un día especial') + ': ';
      p.appendChild(strong);
      p.appendChild(document.createTextNode(ev.texto));
      div.appendChild(p);
      const btn = document.createElement('button');
      btn.className = 'evento-borrar';
      btn.type = 'button';
      btn.setAttribute('aria-label', 'Eliminar evento');
      btn.textContent = '✕';
      btn.addEventListener('click', () => this.eliminarEventoHistoria(ev.id));
      div.appendChild(btn);
      cont.appendChild(div);
    });
  },

  agregarEventoHistoria(fecha, texto) {
    const limpio = (texto || '').trim();
    if (!limpio) return;
    state.timelinePersonal.push({ id: generarId(), fecha: (fecha || '').trim(), texto: limpio });
    Storage.guardar();
    Logros.revisar();
    this.renderTimeline();
  },

  eliminarEventoHistoria(id) {
    state.timelinePersonal = state.timelinePersonal.filter(ev => ev.id !== id);
    Storage.guardar();
    this.renderTimeline();
  },

  escribirCarta() {
    if (this.cartaEscribiendo) return;
    const texto = `Hola, mi niña hermosa.

Scarleth Rassel, este pequeño universo digital fue hecho especialmente para ti.

Cada estrella representa un momento contigo.
Cada corazón representa lo mucho que te amo.
Y cada segundo que pasa me recuerda lo afortunado que soy de tenerte en mi vida.

Gracias por existir.
Te amo muchísimo.`;

    this.textoCarta.textContent = '';
    this.cartaEscribiendo = true;
    let i = 0;
    const escribir = () => {
      if (i < texto.length) {
        this.textoCarta.textContent += texto[i];
        i++;
        setTimeout(escribir, 22);
      } else {
        this.cartaEscribiendo = false;
        if (!state.cartaAbierta) {
          state.cartaAbierta = true;
          Storage.guardar();
          Logros.revisar();
        }
      }
    };
    escribir();
  },

  alternarModo() {
    state.modoDia = !state.modoDia;
    Storage.guardar();
    this.aplicarModo();
    Logros.revisar();
  },

  aplicarModo() {
    document.body.classList.toggle('modo-dia', state.modoDia);
    $('icono-modo').textContent = state.modoDia ? '☀️' : '🌙';
  },
};

document.addEventListener('DOMContentLoaded', () => App.init());
