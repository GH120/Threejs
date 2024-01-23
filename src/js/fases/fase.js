import {Draggable} from '../inputs/draggable';
import {Hoverable} from '../inputs/hoverable';
import {MostrarAngulo} from '../outputs/mostrarAngulo';
import { ColorirIsoceles } from '../outputs/colorirIsoceles';
import { MostrarTipo } from '../outputs/mostrarTipo';
import  MoverVertice  from '../outputs/moverVertice';
import { MostrarBissetriz } from '../outputs/mostrarBissetriz';
import { Clickable, MultipleClickable } from '../inputs/clickable';

import * as dat from 'dat.gui';
import * as THREE from 'three';
import {CSS2DObject, CSS2DRenderer} from 'three/examples/jsm/renderers/CSS2DRenderer';
import grid from '../../assets/grid.avif';
import { TextoAparecendo } from '../animacoes/textoAparecendo';
import KeyInput from '../inputs/keyInput';
import { Output } from '../outputs/Output';

export class Fase {

    
    constructor(){

        const width = 10;
        const height = 8;

        // === THREE.JS CODE START ===
        const scene = new THREE.Scene();
        // const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const camera = new THREE.OrthographicCamera(width / - 2, width / 2, height / 2+1, height / - 2 +1, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.domElement.id = 'MEUCANVAS';
        renderer.setSize(window.innerWidth, window.innerHeight);

        const labelRenderer = new CSS2DRenderer();
        labelRenderer.setSize(window.innerWidth, window.innerHeight);
        labelRenderer.domElement.style.position = 'absolute';
        labelRenderer.domElement.style.top = '0px';
        labelRenderer.domElement.hidden = false;
        labelRenderer.domElement.id = "dialogo"

        this.setupThreejs({scene, 
            width: window.innerWidth,
            height: window.innerHeight,
            renderer,
            camera,
            labelRenderer})

        const container = document.createElement('p');
        container.style.fontFamily = "Courier New, monospace";
        container.style.fontSize = "25px";
        container.style.fontWeight ="italic";
        container.style.display = 'inline-block';
        console.log('SETUPTEXTBOX CONTAINER', container)

        camera.position.z = 150;
        
        this.frames = [];
        this.animacoes = [];
        this.objetos = [];

        this.pauseHandler();
    }

    pauseHandler(){

        const fase = this;

        const keyInput = new KeyInput();

        const pausar = new Output()
                       .setUpdateFunction(function(novoEstado){
                            //Enter
                            if(novoEstado.keyDown == 13){

                                this.estado.pause = !this.estado.pause;

                                const pausado = this.estado.pause;

                                fase.animacoes.map(animacao => animacao.pause = pausado);
                            }
                       });

        keyInput.addObserver(pausar);
    }
    

    //Onde toda a lógica da fase é realizada, a sequência de animações/texto
    levelDesign(){

        
    }

    //Dialogues go here

    //Cria a caixa de texto onde o texto vai aparecer
    setupTextBox(){
        // Create a parent element to hold the spans
        const container = document.createElement('p');
        container.style.fontFamily = "Courier New, monospace";
        container.style.fontSize = "25px";
        container.style.fontWeight ="italic";
        container.style.display = 'inline-block';
        console.log('SETUPTEXTBOX CONTAINER', container)

        // Create the CSS2DObject using the container
        const cPointLabel = new CSS2DObject(container);       

        this.text = cPointLabel;

        this.text.position.y = 3.5;

        this.scene.add(this.text);
        console.log('SETUPTEXTBOX SCENE', this.scene)
        console.log('SETUPTEXTBOX TEXT', this.text)

        this.changeText("Crie um triangulo equilatero");
    }

    //Muda o conteúdo da caixa de texto
    changeText(texto){

        console.log(texto);

        this.text.element.textContent = '';

        // Split the text into individual characters
        const characters = texto.split('');

        // Create spans for each character and apply the fading effect
        characters.forEach((character,index) => {
            const span = document.createElement('span');
            span.textContent = character;
            this.text.element.appendChild(span);
        });
    }

    //Inputs de drag, hover, click...
    createInputs(){
        
    }

    //Inputs que são ligados ao drag, hover e click
    createHandlers(){

        
    }

    addToScene(scene){

        return this;
    }

    //Liga a função animar dos handlers para suas animações rodarem
    setUpAnimar(){
        const linkarHandler = handler => handler.animar = (animacao) => this.animar(animacao);

        this.handlers.map(linkarHandler);

        return this;
    }

    //Roda animação
    animar(animacao){

        animacao.animationFrames = animacao.getFrames();

        this.frames.push(animacao.animationFrames);

        this.animacoes.push(animacao);

        return this;
    }

    //Interface gráfica, caso necessário
    setupInterface(){
        
    }

    //** O update que roda no loop de animações*/
    update(){

        this.frames.map(frame => frame.next()); //Roda as animações do programa

        this.handleCheckpoint();
    }

    handleCheckpoint(){

        //Quando terminar uma animação, então ele para a execução da sequência
        for(const animacao of this.animacoes){

            const isSequential = animacao.constructor.name == "AnimacaoSequencial";

            if(!isSequential) continue;

            const hasCheckPoint = animacao.subAnimacaoAtual.checkpoint;

            const lastFrame = animacao.subAnimacaoAtual.frame == animacao.subAnimacaoAtual.frames - 1;

            if(hasCheckPoint && lastFrame && !animacao.pause){
                
                animacao.pause = true;

                this.animacaoPausar();
            }
        }
    }

    //Solução temporária, fazer depois no react
    animacaoPausar(){

        const container = document.createElement('p');
        container.style.fontFamily = "Courier New, monospace";
        container.style.fontSize = "15px";
        container.style.display = 'inline-block';

        // Create the CSS2DObject using the container
        const aviso = new CSS2DObject(container);     
        
        const texto = "Aperte Enter para proseguir...";


        //Refatorar a gambiarra do textoAparecendo

        // Split the text into individual characters
        const characters = texto.split('');

        // Create spans for each character and apply the fading effect
        characters.forEach((character,index) => {
            const span = document.createElement('span');
            span.textContent = character;
            aviso.element.appendChild(span);
        });

        aviso.position.y = -2.5;
        aviso.position.x = 4;

        this.animar(new TextoAparecendo(aviso.element).setProgresso(0));

        this.scene.add(aviso);

    }

    // event listener funcionando 
    setupThreejs({scene, width, height, renderer, camera, labelRenderer}) {

        scene.background = new THREE.TextureLoader().load(grid);

        this.scene = scene;
        this.width = width;
        this.height = height;
        this.renderer = renderer;
        this.labelRenderer = labelRenderer;
        this.camera = camera;

        window.addEventListener('resize', function() {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
            labelRenderer.setSize(window.innerWidth, window.innerHeight);
        });

    }

    //Começa a execução do programa inicializando o loop de animações
    start(){

        const fase      = this;
        const labelRenderer = this.labelRenderer;
        const renderer      = this.renderer;
        const scene         = this.scene;
        const camera        = this.camera;

        function animate() {

            if(fase.stop) return;

            requestAnimationFrame( animate );
        
            //Atualiza o fase
            fase.update();
        
            renderer.render( scene, camera );
            labelRenderer.render( scene, camera );
        }
        animate();
    }

    // setupThreejs(){


    //     if (typeof window !== 'undefined') {
    //         // O código dentro deste bloco só será executado no navegador
    //         // const width = window.innerWidth;
    //         // Resto do seu código que depende do objeto window
            
            
            
    //         const scene = new THREE.Scene();
    //         const height = window.innerHeight;
            
    //         const canvas = document.getElementById('triangulo');
    //         const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
    //         const renderer = new THREE.WebGLRenderer({ canvas, antialias:true });
    //         renderer.setSize( window.innerWidth, window.innerHeight );

    //         camera.position.z = 5;
            
    //         scene.background = new THREE.TextureLoader().load(grid);

    //         console.log('CENA:', scene);
            
    //         // const labelRenderer = new CSS2DRenderer();
    //         // labelRenderer.setSize(window.innerWidth, window.innerHeight);
    //         // labelRenderer.domElement.style.position = 'absolute';
    //         // labelRenderer.domElement.style.top = '0px';
    //         // document.body.appendChild(labelRenderer.domElement);
            
    //         this.scene  = scene;
    //         this.camera = camera;
    //         this.canvas = canvas;
            
    //         this.renderer      = renderer;
    //         // this.labelRenderer = labelRenderer
            
    //         window.addEventListener('resize', function() {
    //             camera.aspect = window.innerWidth / window.innerHeight;
    //             camera.updateProjectionMatrix();
    //             renderer.setSize(window.innerWidth, window.innerHeight);
    //             // labelRenderer.setSize(window.innerWidth, window.innerHeight);
    //         });
        
    //     }

    //     else {
    //         // Lida com o caso em que o objeto window não está disponível (por exemplo, em SSR)
    //         console.warn('O objeto window não está disponível neste contexto.');
    //     }
    // }

    // setupThreejs(ref){

    //     console.log(window);

    //     if (typeof window !== 'undefined') {
    //         // O código dentro deste bloco só será executado no navegador
    //         // const width = window.innerWidth;
    //         // Resto do seu código que depende do objeto window

    //         const scene = new THREE.Scene();
    //         const width = window.innerWidth;
    //         const height = window.innerHeight;

    //         const canvas = document.getElementById('triangulo');
    //         const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
    //         // const renderer = new THREE.WebGLRenderer({ canvas, antialias:true });
    //         const renderer = new THREE.WebGLRenderer({ antialias:true });
    //         renderer.setSize( window.innerWidth, window.innerHeight );

            
    //         camera.position.z = 5;
            
    //         scene.background = new THREE.TextureLoader().load(grid);
            
    //         // const labelRenderer = new CSS2DRenderer();
    //         // labelRenderer.setSize(window.innerWidth, window.innerHeight);
    //         // labelRenderer.domElement.style.position = 'absolute';
    //         // labelRenderer.domElement.style.top = '0px';
    //         // document.body.appendChild(labelRenderer.domElement);
            
    //         if (ref.current) {
    //             ref.current.appendChild(renderer.domElement);
    //         }

    //         console.log('CENA', scene);
            
    //         this.scene  = scene;
    //         this.camera = camera;
    //         this.canvas = canvas;

    //         this.renderer      = renderer;
    //         // this.labelRenderer = labelRenderer

    //         window.addEventListener('resize', function() {
    //             camera.aspect = window.innerWidth / window.innerHeight;
    //             camera.updateProjectionMatrix();
    //             renderer.setSize(window.innerWidth, window.innerHeight);
    //             // labelRenderer.setSize(window.innerWidth, window.innerHeight);
    //         });

    //     }

    //     else {
    //         // Lida com o caso em que o objeto window não está disponível (por exemplo, em SSR)
    //         console.warn('O objeto window não está disponível neste contexto.');
    //     }

    // }
}