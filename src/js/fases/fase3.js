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
import { TextoAparecendo } from '../animacoes/textoAparecendo';
import Animacao, { AnimacaoSequencial, AnimacaoSimultanea } from '../animacoes/animation';
import { colorirAngulo } from '../animacoes/colorirAngulo';
import { Tracejado } from '../objetos/tracejado';
import MostrarTracejado from '../animacoes/mostrarTracejado';
import { Divisao } from '../animacoes/divisao';
import { Triangle } from '../objetos/triangle';
import Bracket from '../objetos/bracket';
import Pythagoras from '../equations/pythagoras';
import { Addition, Value, Variable } from '../equations/expressions';
import { Fase } from './fase';
import {CSS2DObject, CSS2DRenderer} from 'three/examples/jsm/renderers/CSS2DRenderer';
import grid from '../../assets/grid.avif';

  

export class Fase3 extends Fase{

    constructor(){

        super()

        this.triangulo = new Triangle()
                        .render()
                        .addToScene(this.scene);
        
        this.trigonometria = [];

        this.createInputs();
        this.createHandlers();
        this.setUpAnimar();
        this.addToScene(this.scene);
        this.setupInterface();
        this.setupTextBox();

        this.triangulo.edges[0].valor = new Addition(new Variable("x"), new Value(-1));
        this.triangulo.edges[1].valor = new Addition(new Variable("x"), new Value(-2));
        this.triangulo.edges[2].valor = new Variable("x");

        this.levelDesign();
    }

    //Onde toda a lógica da fase é realizada, a sequência de animações/texto
    levelDesign(){

        const dialogo = ["Encontre o valor de x"]

        this.changeText(dialogo[0]);

        const lado1 = this.createEquationBox("(x - 1)",[4.1,1.5,0])
        const lado2 = this.createEquationBox("(x - 2)",[1.5,-0.5,0])
        const lado3 = this.createEquationBox("x",[1.1,2,0])

        const bracket = new Bracket(0.2).addToScene(this.scene);
        const bracket2 = new Bracket(0.2, [-0.4,-0.35,0], [2.6,-0.35,0]).addToScene(this.scene)
        const bracket3 = new Bracket(-0.2, [-0.3,0.3,0], [2.7,3.3,0]).addToScene(this.scene)

        const anim1 = new AnimacaoSimultanea(bracket.animacao(), new TextoAparecendo(lado1.element).setProgresso(0))
        const anim2 = new AnimacaoSimultanea(bracket2.animacao(), new TextoAparecendo(lado2.element).setProgresso(0))
        const anim3 = new AnimacaoSimultanea(bracket3.animacao(), new TextoAparecendo(lado3.element).setProgresso(0))
        const anim4 = new TextoAparecendo(this.text.element).setProgresso(0);
        
        const removeAll = () => {this.scene.remove(bracket.mesh);    
                                 this.scene.remove(bracket2.mesh); 
                                 this.scene.remove(bracket3.mesh);
        }

        this.animar(new AnimacaoSequencial(anim1,anim2,anim3.setOnTermino(removeAll),anim4).manterExecucaoTodos(true))

        new Pythagoras(this);
    }

    //Cria a caixa de texto onde o texto vai aparecer
    setupTextBox(){
        // Create a parent element to hold the spans
        const container = document.createElement('p');
        container.style.fontFamily = "Courier New, monospace";
        container.style.fontSize = "25px";
        container.style.fontWeight ="italic";
        container.style.display = 'inline-block';

        // Create the CSS2DObject using the container
        const cPointLabel = new CSS2DObject(container);       

        this.text = cPointLabel;

        this.text.position.y = 3.5;

        this.scene.add(this.text);

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

    createEquationBox(equation, position){

        const container = document.createElement('p');
        container.style.fontSize = "25px";
        container.style.fontFamily = "Courier New, monospace";
        container.style.fontWeight = 500;
        container.style.display = 'inline-block';

        // Split the text into individual characters
        const characters = equation.split('');

        // Create spans for each character and apply the fading effect
        characters.forEach((character,index) => {
            const span = document.createElement('span');
            span.textContent = character;
            container.appendChild(span);
        });

        // Create the CSS2DObject using the container
        const cPointLabel = new CSS2DObject(container);       

        cPointLabel.position.x = position[0];
        cPointLabel.position.y = position[1];
        cPointLabel.position.z = position[2];

        this.scene.add(cPointLabel);

        return cPointLabel;
    }

    createInputs(){
        
        const triangulo = this.triangulo;
        const camera = this.camera;

        const selecionar = new MultipleClickable(triangulo.angles, camera)
        
        this.clickable = triangulo.angles.map(   angle  => selecionar);
        this.hoverable = triangulo.angles.map(   angle  => new Hoverable(angle , camera));
        this.draggable = triangulo.vertices.map( vertex => new Draggable(vertex, camera));

        return this;
    }

    createHandlers(){

        const triangulo = this.triangulo;

        //É um observer, quando há um arraste do objeto, ele move o objeto para a nova posição
        this.moverVertice = triangulo.vertices.map(vertex => new MoverVertice(vertex));
        //É um observer, quando onHover é acionado, adiciona ou remove o texto do ângulo
        this.mostrarAngulo = triangulo.angles.map(angle => new MostrarAngulo(angle).addToScene(this.scene));
        //É um observer, colore os ângulos quando o triangulo é isóceles/equilatero
        this.colorirIsoceles = new ColorirIsoceles(triangulo);
        // //É um observer, mostra o tipo desse triângulo
        this.mostrarTipo = new MostrarTipo(triangulo).addToScene(this.scene);
        // //É um observer, mostra a bissetriz do ângulo
        this.bissetrizes = triangulo.angles.map(angle => new MostrarBissetriz(triangulo, angle,this.scene));

        // //Liga esses observers ao hover/drag, quando acionados, eles avisam seus observers
        this.hoverable.map((hoverable,index) => hoverable.addObserver(this.mostrarAngulo[index]));
        // this.hoverable.map((hoverable,index) => hoverable.addObserver(this.bissetrizes[index]));
        // this.clickable.map((clickable, index)=> clickable.addObserver(this.bissetrizes[index]));
        // this.draggable.map((draggable,index) => draggable.addObserver(this.bissetrizes[index]));
        // this.draggable.map((draggable,index) => draggable.addObserver(this.moverVertice[index]));
        this.draggable.map((draggable,index) => draggable.addObserver(this.mostrarAngulo[index]));
        this.draggable.map( draggable => draggable.addObserver(this.colorirIsoceles));
        // this.draggable.map( draggable => draggable.addObserver(this.mostrarTipo));
        this.draggable.map(draggable => draggable.addObserver(this.triangulo));

        this.handlers = [...this.moverVertice,
                         ...this.mostrarAngulo,
                         ...this.bissetrizes, 
                         this.colorirIsoceles, 
                         this.mostrarTipo];
        
        return this;
    }

    addToScene(scene){
        this.mostrarAngulo.map(m => m.addToScene(scene));
        this.mostrarTipo.addToScene(scene);
        this.bissetrizes.map(bissetriz => bissetriz.addToScene(scene));

        return this;
    }

    setUpAnimar(){
        const linkarHandler = handler => handler.animar = (animacao) => this.animar(animacao);

        this.handlers.map(linkarHandler);

        return this;
    }

    animar(animacao){

        animacao.animationFrames = animacao.getFrames();

        this.frames.push(animacao.animationFrames);

        this.animacoes.push(animacao);

        return this;
    }

    //Interface gráfica
    setupInterface(){
        const gui = new dat.GUI();

        //Configurações
        const options = {
        "tamanho da esfera": 0.1,
        "grossura": 0.05,
        "raio do ângulo": 0.7,
        "atualizar": false,
        "duração da animação":90,

        mudarFuncaoTrigonometrica: {
            toggleFunction: function() { 
                button.name(`Mostrando ${this.mudarFuncaoTrigonometrica().estado.nome}`);
            }
        }
        };

        //Atualizar configurações
        this.atualizarOptions = () => {
            this.triangulo.edges.map(edge => edge.grossura = options.grossura);
            this.triangulo.sphereGeometry = new THREE.SphereGeometry(options["tamanho da esfera"]);
            this.triangulo.angles.map(angle => angle.angleRadius = options["raio do ângulo"])
        }

        //Botões da interface
        gui.add(options, 'grossura', 0.01, 0.2).onChange( () => this.triangulo.update());
        gui.add(options, 'tamanho da esfera', 0.1, 2).onChange( () => this.triangulo.update());
        gui.add(options, 'raio do ângulo', 0.05, 3).onChange( () => this.triangulo.update());
        gui.add(options, "duração da animação",45,600).onChange((value) => {divisao.setDuration(value); divisao.delay = value/2})
        // gui.add( {onClick: () => this.trigonometria.map(trig => trig.animando = !trig.animando)}, 'onClick').name('Mostrar animação de divisão');
        // gui.add( {onClick: () => this.circunscrever()},'onClick').name('Animação de circunscrever triângulo');
        gui.add( {onClick: () => options.atualizar = !options.atualizar}, 'onClick').name('atualizar todo frame');
        let button = gui.add(options.mudarFuncaoTrigonometrica, 'toggleFunction').name('Mostrando nada');

    }

    update(){
        this.atualizarOptions();

        this.frames.map(frame => frame.next()); //Roda as animações do programa

        // if(options.atualizar) triangle.update();

        if (this.triangulo.equilatero()) {
            this.changeText("VITORIA!!!");
            // botar notif
        }
    }

    //Ajeitar isso depois, inclui lógica da whiteboard para escrever equações e manipular elas
    //Segregar posteriormente em uma classe Whiteboard
    setupThreejs(){

        const scene = new THREE.Scene();
        const width = window.innerWidth;
        const height = window.innerHeight;

        console.log(this)

        const canvas = document.getElementById('triangulo');
        const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
        const renderer = new THREE.WebGLRenderer({ canvas, antialias:true });
        renderer.setSize( window.innerWidth, window.innerHeight );

        camera.position.z = 5;

        scene.background = new THREE.TextureLoader().load(grid);

        const labelRenderer = new CSS2DRenderer();
        labelRenderer.setSize(window.innerWidth, window.innerHeight);
        labelRenderer.domElement.style.position = 'absolute';
        labelRenderer.domElement.style.top = '0px';
        document.body.appendChild(labelRenderer.domElement);

        this.scene  = scene;
        this.camera = camera;
        this.canvas = canvas;

        this.renderer      = renderer;
        this.labelRenderer = labelRenderer

        window.addEventListener('resize', function() {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
            labelRenderer.setSize(window.innerWidth, window.innerHeight);
        });
        
        window.addEventListener('resize', function() {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
            labelRenderer.setSize(window.innerWidth, window.innerHeight);
        });
  
        document.addEventListener("DOMContentLoaded", function() {
            const openButton = document.getElementById("openEquationWindow");
            const closeButton = document.getElementById("closeButton");
            const equationWindow = document.getElementById("equationWindow");
            const options = document.getElementById("options");
        
            let whiteboard;
        
            // const options = new Operations(elemento,programa).getOptions();
        
            // document.body.appendChild(options);
        
            openButton.addEventListener("click", function() {
                openButton.classList.add("hidden");
                equationWindow.classList.remove("hidden");
                options.classList.remove("hidden");
                
                //Adiciona plano de fundo branco a tela de equações
                //Ele é um objeto do threejs, que tem as proporções da tela html, que é transparente
                whiteboard = addWhiteBoard(equationWindow);
        
                scene.add(whiteboard);
                
            });
        
            closeButton.addEventListener("click", function() {
                openButton.classList.remove("hidden");
                equationWindow.classList.add("hidden");
                options.classList.add("hidden");
        
                scene.remove(whiteboard)
            });
        });
        
        
        function addWhiteBoard(equationWindow){
        
            const rect = equationWindow.getBoundingClientRect();
        
            const bottomleft = pixelToCoordinates(rect.left, rect.bottom);
        
            const topright   = pixelToCoordinates(rect.right, rect.top) 
        
            const width = topright.x - bottomleft.x;
        
            const height = topright.y - bottomleft.y;
        
            //Gambiarra para os objetos estarem em cima do html, mas ter um fundo branco ao invés do background do threejs
            const planeGeometry = new THREE.PlaneGeometry(width,height); // Width, height
        
            // Create a white material
            const whiteMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff }); // White color
        
            // Create a mesh using the geometry and material
            const whitePlane = new THREE.Mesh(planeGeometry, whiteMaterial);
        
            whitePlane.position.x = bottomleft.x + width/2;
            whitePlane.position.y = bottomleft.y + height/2;
        
            return whitePlane;
        }
        
        function pixelToCoordinates(x,y){
        
            const raycaster = new THREE.Raycaster();
        
            raycaster.setFromCamera(normalizar(x,y), camera);
            
            const intersects = raycaster.intersectObject(new THREE.Mesh(
            new THREE.PlaneGeometry(100,100),
            new THREE.MeshBasicMaterial({color:0xffffff})
            ));
        
            if (intersects.length > 0) {
            // Update the object's position to the intersection point
            return intersects[0].point;
            }
        
        }
        
        function normalizar(x, y) {
            const rect = canvas.getBoundingClientRect();
            const normalizedX = (x - rect.left) / canvas.width * 2 - 1;
            const normalizedY = -(y - rect.top) / canvas.height * 2 + 1;
            return new THREE.Vector2(normalizedX,normalizedY);
        }
    }
}