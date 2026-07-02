/*
==========================================
NUESTRO UNIVERSO ❤️
Versión 1.0
Hecho con ❤️ para Scarleth Rassel
==========================================
*/

const App = {

    fechaInicio: new Date("2026-03-11T00:00:00"),

    amor: Number(localStorage.getItem("amor")) || 0,

    secretos: 0,

    frases: [

        "Scarleth Rassel ❤️ eres mi lugar favorito.",

        "Cada día contigo vale la pena.",

        "Gracias por existir.",

        "Mi lugar favorito siempre será contigo.",

        "Tu sonrisa ilumina mi universo.",

        "Nuestro amor hace que todo sea mejor.",

        "Si pudiera elegir otra vez... te elegiría a ti.",

        "Contigo aprendí lo que significa amar.",

        "Te amo muchísimo ❤️"

    ],

    iniciar(){

        this.obtenerElementos();

        this.crearEstrellas();

        this.actualizarTiempo();

        this.cargarContador();

        this.iniciarFrases();

        this.eventos();

        setInterval(()=>{

            this.actualizarTiempo();

        },1000);

    },

    obtenerElementos(){

        this.contador=document.getElementById("contador");

        this.boton=document.getElementById("loveButton");

        this.numero=document.getElementById("loveCounter");

        this.nivel=document.getElementById("level");

        this.luna=document.getElementById("moon");

        this.stars=document.getElementById("stars");

        this.header=document.querySelector("header");

    },

    crearEstrellas(){

        for(let i=0;i<350;i++){

            const s=document.createElement("div");

            s.className="star";

            let size=Math.random()*3;

            s.style.width=size+"px";

            s.style.height=size+"px";

            s.style.left=Math.random()*100+"%";

            s.style.top=Math.random()*100+"%";

            s.style.animationDelay=Math.random()*4+"s";

            this.stars.appendChild(s);

        }

    },

    actualizarTiempo(){

        let ahora=new Date();

        let diferencia=ahora-this.fechaInicio;

        if(diferencia<0){

            this.contador.innerHTML="Nuestra historia comienza el 11 de marzo ❤️";

            return;

        }

        let segundos=Math.floor(diferencia/1000);

        let dias=Math.floor(segundos/86400);

        segundos%=86400;

        let horas=Math.floor(segundos/3600);

        segundos%=3600;

        let minutos=Math.floor(segundos/60);

        segundos%=60;

        this.contador.innerHTML=`
        ❤️<br>
        ${dias} días<br>
        ${horas} horas<br>
        ${minutos} minutos<br>
        ${segundos} segundos
        `;

    },

    cargarContador(){

        this.numero.innerHTML=this.amor;

        this.actualizarNivel();

    },

    actualizarNivel(){

        if(this.amor<50){

            this.nivel.innerHTML="🤍 Comenzando nuestra historia";

        }

        else if(this.amor<100){

            this.nivel.innerHTML="💗 Enamorándose";

        }

        else if(this.amor<500){

            this.nivel.innerHTML="❤️ Amor verdadero";

        }

        else if(this.amor<1000){

            this.nivel.innerHTML="💖 Alma gemela";

        }

        else{

            this.nivel.innerHTML="👑 Reina de mi corazón";

        }

    },

    iniciarFrases(){

        this.frase=document.createElement("h3");

        this.frase.style.marginTop="15px";

        this.frase.style.fontWeight="300";

        this.header.appendChild(this.frase);

        this.cambiarFrase();

        setInterval(()=>{

            this.cambiarFrase();

        },12000);

    },

    cambiarFrase(){

        let n=Math.floor(Math.random()*this.frases.length);

        this.frase.innerHTML=this.frases[n];

    },

    eventos(){

        this.boton.addEventListener("click",()=>{

            this.sumarAmor();

        });

        this.luna.addEventListener("click",()=>{

            this.secretos++;

        });

    },

    sumarAmor(){

        this.amor++;

        this.numero.innerHTML=this.amor;

        localStorage.setItem("amor",this.amor);

        this.actualizarNivel();

    }

};

document.addEventListener("DOMContentLoaded",()=>{

    App.iniciar();

});