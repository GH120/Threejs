import {Draggable} from '../inputs/draggable';
import {Hoverable} from '../inputs/hoverable';
import {MostrarAngulo} from '../outputs/mostrarAngulo';
import { ColorirIsoceles } from '../outputs/colorirIsoceles';
import { MostrarTipo } from '../outputs/mostrarTipo';
import  MoverVertice  from '../outputs/moverVertice';
import { MostrarBissetriz } from '../outputs/mostrarBissetriz';
import { Clickable, MultipleClickable } from '../inputs/clickable';
import {CSS2DObject} from 'three/examples/jsm/renderers/CSS2DRenderer';
import {OBJLoader} from 'three/examples/jsm/loaders/OBJLoader';
import {TGALoader} from 'three/examples/jsm/loaders/TGALoader';
import {MTLLoader} from 'three/examples/jsm/loaders/MTLLoader';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader'
import FixarAoCirculo from '../outputs/fixarAoCirculo';



import * as dat from 'dat.gui';
import * as THREE from 'three';
import { TextoAparecendo } from '../animacoes/textoAparecendo';
import Animacao, { AnimacaoSequencial, AnimacaoSimultanea, animacaoIndependente, curvas } from '../animacoes/animation';
import { colorirAngulo } from '../animacoes/colorirAngulo';
import { Tracejado } from '../objetos/tracejado';
import MostrarTracejado from '../animacoes/mostrarTracejado';
import { Divisao } from '../animacoes/divisao';
import { Triangle } from '../objetos/triangle';
import Bracket from '../objetos/bracket';
import Pythagoras from '../equations/pythagoras';
import { Addition, Equality, MathJaxTextBox, Value, Variable, VariableMultiplication } from '../equations/expressions';
import Circle from '../objetos/circle';
import DesenharMalha from '../animacoes/desenharMalha';
import RelogioGLB from '../../assets/Relogio.glb'
import { Angle } from '../objetos/angle';
import ColorirOnHover from '../outputs/colorirOnHover';
import { Fase } from './fase';
import { apagarObjeto } from '../animacoes/apagarObjeto';
import MostrarTexto from '../animacoes/MostrarTexto';
import MoverTexto from '../animacoes/moverTexto';
import { apagarCSS2 } from '../animacoes/apagarCSS2';
import ElementoCSS2D from '../objetos/elementocss2d';
import JuntarEquacoes from '../outputs/juntarEquacoes';
import { Output } from '../outputs/Output';
import ResolverEquacao from '../outputs/resolverEquacao';
import { PopInAngles } from '../animacoes/PopInAngles';
import SimularMovimento from '../animacoes/simularMovimento';
import { Objeto } from '../objetos/objeto';
import Proporcionalidade from '../cards/proporcionalidade';

import imagemProporcionalidade from '../../assets/Proporcionalidade.png'
import ExecutarAnimacaoIdle from '../outputs/executarAnimacaoIdle';
  

//Consertar conflito de paralelismo do diálogo da equação fração
//Mudar razão da proporcionalidade da aula 4 para ser a razão mesmo (sem espaço para confusão)
//Resolver regra de 3 e mostrar que é uma função
//Adicionar carta regra de 3
export class Fase4 extends Fase{

    constructor(){
    
        super();

        this.setupTextBox();

        this.progresso = 0;
        this.setupObjects();
        this.createInputs();
        this.createOutputs();
        this.aula1();

        this.text.position.copy(new THREE.Vector3(0,3.9,0))

        this.problema = 10

        this.debug = false;
        this.mostrarFrameRate = false;
    }

    cartas = [
        Proporcionalidade,
        Proporcionalidade,
        Proporcionalidade,
        // Adicione mais cartas conforme necessário
    ];

    //Objetos básicos
    setupObjects(){

        const circulo = new Circle(new THREE.Vector3(0,0,0), 3).addToScene(this.scene);

        this.circulo = circulo;

        const pontoDoCirculo1 = new Circle(new THREE.Vector3(0,3,0), 0.1, 0.2);
              pontoDoCirculo1.material = new THREE.MeshBasicMaterial({color:0x960000});

        this.ponto1 = pontoDoCirculo1;


        const pontoDoCirculo2          = new Circle(new THREE.Vector3(3*Math.sin(Math.PI*0.3),3*Math.cos(Math.PI*0.3),0), 0.1, 0.2);
              pontoDoCirculo2.material = new THREE.MeshBasicMaterial({color:0x960000});

        this.ponto2 = pontoDoCirculo2;


        this.angle = new Angle([circulo, this.ponto2, this.ponto1]).render();

        this.angle.revolucaoCompleta = true;


        const tracejadoPonto1 = new Tracejado(circulo.position, this.ponto1.position);

        this.ponto1.tracejado = tracejadoPonto1;


        const tracejadoPonto2 = new Tracejado(circulo.position, this.ponto2.position);

        this.ponto2.tracejado = tracejadoPonto2;

        //Atualizar o ponteiro como um todo ao mover a ponta dele
        const criarAtualizadorDeObservers = (ponto, tracejado) => {

            //Função para dar update em todos os observadores dependetes do ponto
            ponto.updateObservers = () => {
                tracejado.destino = ponto.position.clone().multiplyScalar(0.95);
                ponto.update(); //Refatorar circulo, update deve ser apenas update
                tracejado.update();
                this.angle.update()
                this.mostrarAngulo.update({dentro:true})
            }
        }

        criarAtualizadorDeObservers(this.ponto1, this.ponto1.tracejado);
        criarAtualizadorDeObservers(this.ponto2, this.ponto2.tracejado);
    }

    //Objetos temporários ou secundários
    setupObjects2(){

        //Cria 360 tracejados que servirão como os graus no círculo
        const getPoint = angulo => new THREE.Vector3(3.1*Math.sin(angulo), 3.1*Math.cos(angulo), 0);

        const tracejados = new Array(360)
                                    .fill(0)
                                    .map((e,index) => index*Math.PI/180)
                                    .map(angulo => new Tracejado(getPoint(angulo).multiplyScalar(0.95), getPoint(angulo),0.01))
        
        tracejados.map(tracejado => tracejado.material = new THREE.MeshBasicMaterial({color:0x000000}))

        this.tracejados = tracejados;
    }

    aula1(){

        const dialogo = ["O círculo é uma das figuras geométricas mais básicas",
                         "Ele tem um centro",
                         "e um raio",
                         "Como pode ver, todos os pontos no círculo estão na mesma distância do raio",
                         "Então a única diferença entre dois pontos é o giro entre eles",
                         "Esse giro é o chamado ângulo,",
                         "Por padrão, dividimos o círculo em 360 partes, em graus",
                         "e o ângulo é medido neles.",
                         "Arraste o ponteiro para apontar para 1 hora"]

        //Desenha o círculo
        const circulo         = this.circulo;
        const desenharCirculo = new DesenharMalha(circulo, this.scene)
                                    .setDuration(300)
                                    .setOnTermino(() => null);


        //Efeito de popIn do position
        const position           = new Circle(new THREE.Vector3(0,0,0), 0.1, 0.2);
              position.material  = new THREE.MeshBasicMaterial({color:0x960000});
        const circuloCrescendo = this.circuloCrescendoAnimacao(position);

        //Animações de mostrarTexto de cada diálogo
        const animacoes = dialogo.map(texto => new TextoAparecendo(this.text.element).setOnStart(() => this.changeText(texto)));

        const anim1 = new AnimacaoSimultanea(animacoes[0], desenharCirculo);
        const anim2 = new AnimacaoSimultanea(animacoes[1], circuloCrescendo);
        const anim3 = this.thirdDialogue(animacoes[2], position, circulo);
        const anim4 = animacoes[3].setValorFinal(100);
        const anim5 = this.fifthDialogue( animacoes[4].setValorFinal(120), circulo);
        const anim6 = animacoes[5];
        const anim7 = this.seventhDialogue(animacoes[6]);
        const anim8 = this.eigthDialogue(animacoes[7].setValorFinal(120).setDuration(200)).setDelay(50);
        const anim9 = this.ninthDialogue(animacoes[8]);

        //Quando começar a animação 4, ativa os controles para mover o ponteiro
        anim4.setOnTermino(() => this.Configuracao1());

        anim9.setOnTermino(() => this.Configuracao1());

        const animacaoPrincipal = new AnimacaoSequencial(anim1,anim2,anim3,anim4,anim5,anim6,anim7,anim8,anim9);

        animacaoPrincipal.setNome("Execução Principal");

        this.animar(animacaoPrincipal);

    }

    //Animações junto com os diálogos
    thirdDialogue(dialogue){

        const pontoDoCirculo = this.ponto1;
        const tracejado      = this.ponto1.tracejado;
        const criarPonto     = this.circuloCrescendoAnimacao(pontoDoCirculo);

        const moverPonto = (posicaoFinal) => new Animacao(pontoDoCirculo)
                                        .setValorInicial(0)
                                        .setValorFinal(2*Math.PI)
                                        .setInterpolacao((inicial, final, peso) => inicial*(1-peso) + final*peso)
                                        .setDuration(200)
                                        .setCurva(x => x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2)
                                        .setUpdateFunction((angulo) => {
                                            const posicao = new THREE.Vector3(3*Math.sin(angulo), 3*Math.cos(angulo), 0)
                                            pontoDoCirculo.position = posicao;
                                            tracejado.destino = posicao.clone().multiplyScalar(0.95);
                                            pontoDoCirculo.update(); //Refatorar circulo, update deve ser apenas update
                                            tracejado.update();
                                        })
        
        const demonstrarRaio = new AnimacaoSequencial(
                                    new AnimacaoSimultanea(criarPonto, new MostrarTracejado(tracejado, this.scene)),
                                    moverPonto(new THREE.Vector3(3,0,0)).setOnStart(() => tracejado.addToScene(this.scene))
                                )

        return new AnimacaoSimultanea(dialogue, demonstrarRaio)
    }

    fifthDialogue(dialogue){

        const pontoDoCirculo = this.ponto2;
        const tracejado      = this.ponto2.tracejado;
        const angle          = this.angle;

        this.mostrarAngulo.addToScene(this.scene); //Mostrar ângulo agora visível

        const criarPonto = this.circuloCrescendoAnimacao(pontoDoCirculo);
        
        //Consertar desenhar malha do angulo
        const desenharAngulo = PopInAngles(angle, this.scene)

        const moverPonto = (posicaoFinal) => new Animacao(pontoDoCirculo)
                                        .setValorInicial(Math.PI*0.3)
                                        .setValorFinal(Math.PI*2/3)
                                        .setInterpolacao((inicial, final, peso) => inicial*(1-peso) + final*peso)
                                        .setDuration(200)
                                        .setCurva(x => {
                                            const n1 = 7.5625;
                                            const d1 = 2.75;
                                            
                                            if (x < 1 / d1) {
                                                return n1 * x * x;
                                            } else if (x < 2 / d1) {
                                                return n1 * (x -= 1.5 / d1) * x + 0.75;
                                            } else if (x < 2.5 / d1) {
                                                return n1 * (x -= 2.25 / d1) * x + 0.9375;
                                            } else {
                                                return n1 * (x -= 2.625 / d1) * x + 0.984375;
                                            }
                                            }
                                        )
                                        .setUpdateFunction((angulo) => {
                                            const posicao = new THREE.Vector3(3*Math.sin(angulo), 3*Math.cos(angulo), 0)
                                            pontoDoCirculo.position = posicao;
                                            pontoDoCirculo.update(); //Refatorar circulo, update deve ser apenas update
                                            pontoDoCirculo.updateObservers();
                                        })
                                        .setOnTermino(() => {

                                            //Poderia transformar em animação independente?
                                            const texto = this.createMathJaxTextBox("Ponteiro~arrastável", 
                                                                                    pontoDoCirculo.position.clone()
                                                                                                           .add(new THREE.Vector3(1, 0, 0))
                                                                                                           .toArray(), 
                                                                                    5           
                                                                                  );

                                            const simularMovimento = this.moverPonteiro(120, 150)
                                                                    .setCurva(curvas.decrescimentoLinear(curvas.curvaPeriodica(x => x, 10)));

                                            const moverSetinha = new SimularMovimento(this.ponto2)
                                                                    .mostrarSetinha(this.scene, true)

                                            const mostrarTexto = new MostrarTexto(texto)
                                                                .setCurva(x => {
                                                                    x = 1 - Math.abs(1 - 2*x)

                                                                    return -(Math.cos(Math.PI * x) - 1) / 2
                                                                })
                                                                .setDelay(50)
                                                                .setOnStart(() => {
                                                                    this.scene.add(texto);
                                                                    this.ponto2.hoverable.observers.map(observer => observer.update({dentro:true}));
                                                                 })
                                                                .setOnTermino(() => {
                                                                    this.scene.remove(texto);
                                                                    this.ponto2.hoverable.observers.map(observer => observer.update({dentro:false}))
                                                                });

                                            this.animar(new AnimacaoSimultanea(mostrarTexto, moverSetinha, simularMovimento.filler(200)));

                                        })
        
        const demonstrarRaio = new AnimacaoSequencial(
                                    new AnimacaoSimultanea(criarPonto, new MostrarTracejado(tracejado, this.scene)),
                                    desenharAngulo,
                                    moverPonto(new THREE.Vector3(3,0,0)).setOnStart(() => tracejado.addToScene(this.scene))
                                )

        return new AnimacaoSimultanea(dialogue, demonstrarRaio)
    }

    seventhDialogue(dialogue){

        const scene = this.scene;

        this.setupObjects2(); //Criando os tracejados para serem usados nos graus

        const tracejados = this.tracejados;

        //Adiciona um por um os retângulos dos graus
        const sequencial = new Animacao(tracejados)
                           .setValorInicial(0)
                           .setValorFinal(360)
                           .setDuration(360)
                           .setInterpolacao((a,b,c) => a*(1-c) + b*c)
                           .setUpdateFunction(function(index){
                                const inicio = (this.counter)? this.counter : 0;

                                for(let i = inicio; i < index; i++){

                                    const tracejado = this.objeto[i];
                                    tracejado.addToScene(scene);
                                    tracejado.update();
                                }

                                this.counter = Math.ceil(index);
                           })

        //Transformar isso em apenas uma animação, usar um array de tracejados que dá pop
        //Deletar os angulos maiores que 120
        //Juntar os tracejados em um contador que vira depois 120 graus

        const descolorir = tracejados.map(tracejado => apagarObjeto(tracejado)
                                                       .setUpdateFunction((valor) => {
                                                            tracejado.material = new THREE.MeshBasicMaterial({color: tracejado.material.color, transparent:true, opacity: valor});
                                                            tracejado.update();
                                                       })
                                                       .setDuration(45)
                                                       );

        const simultanea = new AnimacaoSimultanea();

        simultanea.setDuration(50);

        simultanea
        .setOnStart(() => {
            this.Configuracao2();
            const graus          = Math.round(this.angle.degrees);
            simultanea.animacoes = descolorir.slice(graus, 360)
            this.tracejados      = tracejados.slice(0, graus + 1);
        })

        return new AnimacaoSimultanea(dialogue, new AnimacaoSequencial(sequencial,simultanea));
    }

    eigthDialogue(dialogue){

        const mostrarAngulo = this.mostrarAngulo;

        const simultanea = new AnimacaoSimultanea();

        //Vai esperar a animação ser executada antes de pegar os tracejados
        simultanea.setOnStart(() => {
            const animacoes = this.tracejados.map((tracejado, index) => this.moverTracejado(tracejado,index));

            animacoes.map(tracejado => tracejado.setOnTermino(function(){
                                            mostrarAngulo.increment();
                                            mostrarAngulo.text.elemento.position.x = 1.8
                                        })
                        )

            simultanea.animacoes = animacoes;
        })

        simultanea.frames = this.tracejados.length*1.4;

        return new AnimacaoSimultanea(dialogue, simultanea);
    }

    ninthDialogue(dialogue){

        const fase = this;


        const light = new THREE.AmbientLight(0xffffff,10);

        dialogue.setOnTermino(() =>{

            this.mostrarAngulo.update({dentro:true})

            var loader = new GLTFLoader();
            loader.load(
                RelogioGLB,
                ( gltf ) =>  {
                    const relogio = gltf.scene.children[0];
                    relogio.scale.set(7,7,1)
                    relogio.position.z = -0.5
                    gltf.scene.add(light);
                    fase.circulo.removeFromScene();
                    fase.scene.add(gltf.scene);

                    fase.relogio = Objeto.fromMesh(relogio);

                    fase.Configuracao4();
                },
            );

            fase.dialogoTerminado = true; //Avisa para os problemas saberem que terminou o diálogo
        })

        return new AnimacaoSimultanea(dialogue);
    }

    aula2(){

        const fase = this;

        //Veja, quanto mais horas maior a quantidade de graus, pois elas são ** proporcionais **
        //Por isso que se 1 hora tem 30°, então 5 horas tem 5 vezes o tanto de graus (Mostra animação incrementando a hora e somando 30°)
        //Então chamamos de **razão** o valor de proporção, que nesse caso é 30°/1 hora '30 graus para cada hora' (adiciona razão na whiteboard)
        //Usamos essa razão para calcular graus a partir da hora (transforma razão em função graus(hora) = hora * razao)
        //Dado uma hora, basta multiplicar por ela para conseguir o resultado (aparece texto 'arraste horas para essa equação', na junção joga pra fora o valor em graus)
        //(Depois de mostrar todas as horas na função) Com isso, aprendemos proporcionalidade.
        //Razão horas pra minutos
        //42 minutos são 60 * 360/12 graus

        this.whiteboard.ativar(false);

        const dialogos = [
            "A razão entre as duas grandezas permanesce a mesma. por serem diretamente proporcionais",
            "Quando tivermos valores desconhecidos de graus ou de horas, usamos a regra de 3", //substituir esse
            "Comparamos a razão antiga entre as grandezas com a nova, pois são iguais", //que nesse caso é 30°/1 hora '30 graus para cada hora' na parte direita da tela,
            "Usamos essa razão para calcular graus a partir da hora",
            "Dada uma hora, basta multiplicar ela pela razão para conseguir os graus",
            "Mova a o valor da hora na lousa para a equação",
        ]
        .map(texto => this.animacaoDialogo(texto));

        const anim1 = this.aula2Dialogo1(dialogos[0]);
        const anim2 = dialogos[1];
        const anim3 = this.aula2Dialogo3(dialogos[2]);
        const anim4 = this.aula2Dialogo4(dialogos[3]);
        const anim5 = this.aula2Dialogo5(dialogos[4]);
        const anim6 = dialogos[5];

        const animacao = new AnimacaoSequencial(
                            anim1,
                            anim2,
                            anim3,
                            anim4,
                            anim5,
                            anim6
                        )

        this.animar(this.aula4dialogo1(fase.equacaoUmaHora, fase.equacaocincoHoras).setOnTermino(() => this.animar(animacao)))




        //-> Criar carta verificar proporcionalidade => pega duas comparações e verifica se são proporcionais, retorna a razão
        //Todos os lados proporcionais é uma carta que coloca na lousa uma equação que precisa ser preenchida com todos os lados
        //Todos os angulos iguais basta clicar nos dois polígonos com angulos iguais e retorna a propriedade na lousa
    }

    aula3(){

        //Veja, quanto mais horas maior a quantidade de graus, pois elas são ** proporcionais **
        //Por isso que se 1 hora tem 30°, então 5 horas tem 5 vezes o tanto de graus (Mostra animação incrementando a hora e somando 30°)
        //Então chamamos de **razão** o valor de proporção, que nesse caso é 30°/1 hora '30 graus para cada hora' (adiciona razão na whiteboard)
        //Usamos essa razão para calcular graus a partir da hora (transforma razão em função graus(hora) = hora * razao)
        //Dado uma hora, basta multiplicar por ela para conseguir o resultado (aparece texto 'arraste horas para essa equação', na junção joga pra fora o valor em graus)
        //(Depois de mostrar todas as horas na função) Com isso, aprendemos proporcionalidade.
        //Razão horas pra minutos
        //42 minutos são 60 * 360/12 graus

        this.whiteboard.ativar(false);

        const dialogos = [
            "Podemos usar essa razão para calcular até valores quebrados de horas",
            "Por exemplo, quantos graus teriam 0.4 horas?",
        ]
        .map(texto => this.animacaoDialogo(texto));

        const animacao = new AnimacaoSequencial(
                            dialogos[0],
                            dialogos[1],
                            dialogos[2]
                        )

        this.animar(animacao)




        //-> Criar carta verificar proporcionalidade => pega duas comparações e verifica se são proporcionais, retorna a razão
        //Todos os lados proporcionais é uma carta que coloca na lousa uma equação que precisa ser preenchida com todos os lados
        //Todos os angulos iguais basta clicar nos dois polígonos com angulos iguais e retorna a propriedade na lousa
    }

    aula2Dialogo1(dialogo){

        //Animar incrementação 
        const equacoes = {
           proporcao: (fator) => ` \\color{red} \\frac{\\uparrow ${fator}h}{1h}~ \\color{black} =  \\color{blue}\\frac{\\uparrow ${30*fator}°}{30°} \\color{black} = ${fator} `,
        }

        const equacao = this.createMathJaxTextBox(equacoes.proporcao(2), [5,0,0], 1);

        const mostrarEquacao1 = new MostrarTexto(equacao)
                                .setValorFinal(400)
                                .setCurva(x => {

                                    x = (x > 0.25)? (x < 0.75)? 0.25 : x/2 : x;

                                    x = 1 - Math.abs(1 - 4*x);

                                    return -(Math.cos(Math.PI * x) - 1) / 2
                                })
                                .setDuration(400)
                                .setOnStart(() => this.scene.add(equacao));

        const mostrarEquacao2 = new MostrarTexto(equacao)
                                .setValorFinal(400)
                                .setCurva(x => {

                                    x = (x > 0.25)? (x < 0.75)? 0.25 : x/2 : x;

                                    x = 1 - Math.abs(1 - 4*x);

                                    return -(Math.cos(Math.PI * x) - 1) / 2
                                })
                                .setDuration(400)
                                .setOnStart(() => equacao.mudarTexto(equacoes.proporcao(4), 1)) 

        const mostrarEquacao3 = new MostrarTexto(equacao)
                                .setValorFinal(400)
                                .setCurva(x => {

                                    x = (x > 0.25)? (x < 0.75)? 0.25 : x/2 : x;

                                    x = 1 - Math.abs(1 - 4*x);

                                    return -(Math.cos(Math.PI * x) - 1) / 2
                                })
                                .setDuration(400)
                                .setOnStart(() => equacao.mudarTexto(equacoes.proporcao(5), 1)) 


        const moverPonteiro1 = this.moverPonteiro(30,60)
                                   .setCurva(x => -(Math.cos(Math.PI * x) - 1) / 2)
                                   .setDelay(200)
        const moverPonteiro2 = this.moverPonteiro(60,120)
                                   .setCurva(x => x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2)
                                   .setDelay(200)

        const moverPonteiro3 = this.moverPonteiro(120,150)
                                   .setCurva(x => {
                                        const c1 = 1.70158;
                                        const c2 = c1 * 1.525;
                                        
                                        return x < 0.5
                                        ? (Math.pow(2 * x, 2) * ((c2 + 1) * 2 * x - c2)) / 2
                                        : (Math.pow(2 * x - 2, 2) * ((c2 + 1) * (x * 2 - 2) + c2) + 2) / 2;
                                    })
                                   .setDelay(200)


        const movimentacaoDePonteiro = new AnimacaoSequencial(
                                        new AnimacaoSimultanea(moverPonteiro1, mostrarEquacao1), 
                                        new AnimacaoSimultanea(moverPonteiro2, mostrarEquacao2), 
                                        new AnimacaoSimultanea(moverPonteiro3, mostrarEquacao3)
                                    )


        const animacao = new AnimacaoSimultanea(dialogo, movimentacaoDePonteiro);

        return animacao;
    }

    aula2Dialogo3(dialogo){

        //"Então chamamos de Razão o valor de proporção,", //que nesse caso é 30°/1 hora '30 graus para cada hora' na parte direita da tela,

        const texto1 = `\\displaylines{ que~nesse~caso~é~ \\large{\\color{purple} RAZ \\tilde{A} O ~ = ~ \\frac{\\color{blue} 30°} {\\color{red} 1h~}} \\\\ ela~serve~para~conseguir~os~ \\color {blue}{graus}~ \\color{black} {~a~partir~das~} \\color{red}{horas}}`

        const sidenote = this.createMathJaxTextBox(texto1, [5.5, 0, 0], 1.1);

        const mostrarSidenote = new MostrarTexto(sidenote).setDuration(100).setOnStart(() => this.scene.add(sidenote));
        
        const animacao = new AnimacaoSequencial(dialogo, mostrarSidenote)
                            .setOnTermino(() => this.animar(apagarCSS2(sidenote, this.scene)));

        return animacao;
    }

    aula2Dialogo4(dialogo){
        //Usamos essa razão para calcular graus a partir da hora (transforma razão em função graus(hora) = hora * razao)

        const equacoes = {
            formula: '\\color{purple} RAZ \\tilde{A} O ~ = \\frac{\\color{blue} 30°}{\\color{red} 1h}',
            simplificada: `\\color{blue} \\frac{ graus}{ \\color{red} hora} \\color{black} =  \\color{blue} \\frac{\\color{blue} 30°}{\\color{red} 1h}`,
            fatorada: `\\color{blue} graus \\color{black} = \\color{red} hora \\color{blue} \\cdot \\frac{\\color{blue} 30°} {\\color{red} 1h~}`,
            instanciada: (hora) => `\\color{blue} graus \\color{black} = \\color{red} ${hora}  \\color{blue} \\cdot \\frac{\\color{blue} 30°} {\\color{red} 1h~}`
        } 

        const equacaoInicial = this.createMathJaxTextBox(equacoes.formula, [5, 0, 0], 1.5);

        const aparecerEquacao = apagarCSS2(equacaoInicial)
                                .reverse()
                                .setDelay(150)
                                .setOnStart(() => this.scene.add(equacaoInicial));

        const mudarEquacao = new AnimacaoSequencial(
                                new MostrarTexto(equacaoInicial)
                                .setValorInicial(400)
                                .setValorFinal(0)
                                .setOnTermino(() => equacaoInicial.mudarTexto(equacoes.simplificada, 1.5)),
                                new MostrarTexto(equacaoInicial)
                                .setValorInicial(0)
                                .setValorFinal(400)
        )

        const mudarEquacao2 = new AnimacaoSequencial(
            new MostrarTexto(equacaoInicial)
            .setValorInicial(400)
            .setValorFinal(0)
            .setOnTermino(() => equacaoInicial.mudarTexto(equacoes.fatorada, 1.5)),
            new MostrarTexto(equacaoInicial)
            .setValorInicial(0)
            .setValorFinal(400)
       )

        const moverEquacao = animacaoIndependente(
                                () =>{

                                    this.animar(
                                        this.moverEquacao({
                                            elementoCSS2: equacaoInicial,
                                            duration1: 0,
                                            duration2: 100,
                                        })
                                    )
                                }
                            )

        //Criar objeto que contem equação na whiteboard, quando arrastar para perto uma variável hora retornar uma resposta


        const animacao = new AnimacaoSimultanea(
                            dialogo, 
                            new AnimacaoSequencial(
                                aparecerEquacao,
                                mudarEquacao,
                                mudarEquacao2,
                                moverEquacao
                            )
                        );

        return animacao;
    }

    aula2Dialogo5(dialogo){

        //Criar controle

        const valor = this.createMathJaxTextBox(`\\color{red} 5h`, [5,0,0], 1.3)

        const aparecer = apagarCSS2(valor)
                        .reverse()
                        .setOnStart(()=> {
                            this.scene.add(valor);
                            this.whiteboard.ativar(false);
                        })

        const mover = this.moverEquacao({
                        duration1:0,
                        duration2:100,
                        elementoCSS2: valor
                    });

        const sidenote = this.createTextBox(`Arraste 5h para a equação na lousa`, [-5.6, 0.6, 0], 17, false);

        const mostrarSidenote = new MostrarTexto(sidenote).setOnStart(() => this.scene.add(sidenote));


        mover.setOnTermino(() => 
            this.Configuracao3({
                valor: this.whiteboard.equacoes[1], 
                funcao:this.whiteboard.equacoes[0],
                sidenote: sidenote
            })
        )


        const animacao = new AnimacaoSimultanea(
                            dialogo, 
                            new AnimacaoSequencial(
                                aparecer, 
                                mover,
                                mostrarSidenote
                            )
                        );

        return animacao;

    }

    aula4(){

        const fase = this;

        const dialogo = [
            "Assim, colocando uma maneira mais familiar",
            "Sempre que tivermos duas grandezas diretamente proporcionais,",
            "Conseguimos usar uma dessas grandezas (hora) e a razão entre elas para descobrir a outra (graus)",
            "Chamamos tal regra de 'Regra de 3', como muitos conhecem",
            "Vamos transformar ela em uma carta que poderá utilizar em outros problemas",
            "Basta arrastá-la para a tela e clicar no relógio"
        ]
        .map(linha => fase.animacaoDialogo(linha));

        const anim0 = dialogo[0];
        const anim1 = this.aula4dialogo1(dialogo[1])
        const anim2 = this.aula4dialogo2(dialogo[2])
        const anim3 = dialogo[3]
        const anim4 = dialogo[4].setOnTermino(()=> fase.settings.ativarMenuCartas(true))
        const anim5 = dialogo[5]


        const animacao = new AnimacaoSequencial(
                            anim0, 
                            anim1, 
                            anim2, 
                            anim3,
                            anim4,
                            anim5
                        );

        fase.animar(animacao);
    }

    aula4dialogo1(textbox1, textbox2){

        const fase = this;

        // const textbox1 = fase.createMathJaxTextBox(`\\color{red}~5~horas \\color{black} ~tem~ \\color{blue} ~150°`, [5.5,2,0], 2);
        // const textbox2 = fase.createMathJaxTextBox(`\\color{red} ~10~ horas~ \\color{black} ~tem~ \\color{blue} ~300°`, [5.5,-2,0], 2);
        const textbox3 = fase.createMathJaxTextBox(`\\color{red} \\frac{5~ horas~}{1~horas~}~ \\color{black} = \\color{blue} \\frac{150°}{30°}`, [5.5,0,0], 2);

        const resultadoParcial1 = `\\color{red} \\frac{5~ \\cancel{horas}~}{1~\\cancel{horas}~}~ \\color{black} = \\color{blue} \\frac{~150 \\cancel{°}}{30 \\cancel{°}}`

        const resultadoParcial2 = `  \\Large{\\color{red}\\frac{\\uparrow 5}{1}~ \\color{black}=   \\color{blue}\\frac{\\uparrow 150}{30} \\color{black} = 5} \\Rightarrow`
        const resultado = `\\displaylines{\\color{red} \\huge{~horas~} \\\\ \\color{black} ~s\\tilde{a}o \\\\ ~ \\underline{ DIRETAMENTE~PROPORCIONAIS}~  \\\\ \\color{black} aos \\\\ \\color{blue} \\huge{~graus}~\\color{black}}`

        const mostrarTexto1 = new MostrarTexto(textbox1, fase.scene).setValorFinal(300);
        const mostrarTexto2 = new MostrarTexto(textbox2, fase.scene).setValorFinal(300);

        const spline1 = [
            textbox1.position.clone(), 
            textbox1.position.clone().sub(new THREE.Vector3(-0.57, 0.56,0)), 
            textbox1.position.clone().sub(new THREE.Vector3(0.3, 1.57,0)), 
            textbox3.position.clone()
        ]

        const spline2 = [
            textbox2.position.clone(), 
            textbox2.position.clone().add(new THREE.Vector3(-0.57, 0.56,0)), 
            textbox2.position.clone().add(new THREE.Vector3(0.3, 1.57,0)), 
            textbox3.position.clone()
        ]


        const moverTexto1 = new MoverTexto(textbox1, spline1);
        const moverTexto2 = new MoverTexto(textbox2, spline2);


        const animacao = new AnimacaoSequencial(
            // new AnimacaoSimultanea(
            //     mostrarTexto1, 
            //     mostrarTexto2
            // ),
            new AnimacaoSimultanea(
                moverTexto1,
                moverTexto2,

                apagarCSS2(textbox1, fase.scene)
                .filler(200)
                .setDuration(200),

                apagarCSS2(textbox2, fase.scene)
                .filler(200)
                .setDuration(200),

                apagarCSS2(textbox3)
                .reverse()
                .setOnStart(() => fase.scene.add(textbox3))
                .filler(200)
                .setDuration(200)
            )
            .setDelay(50),

            apagarCSS2(textbox3).reverse().setOnStart(() => textbox3.mudarTexto(resultadoParcial1, 1.5)).setDelay(200),
            new AnimacaoSimultanea(
                new AnimacaoSequencial(
                    apagarCSS2(textbox3).setDuration(100),
                    apagarCSS2(textbox3).reverse().setOnStart(() => textbox3.mudarTexto(resultadoParcial2, 0.8)).setDelay(200)
                ),
                fase.animacaoDialogo( "As horas crescem na mesma proporção que os graus, logo")
            ),
            new AnimacaoSequencial(
                apagarCSS2(textbox3).setDuration(100),
                apagarCSS2(textbox3).reverse().setOnStart(() => textbox3.mudarTexto(resultado, 1.3)).setDelay(200),
            ),
            apagarCSS2(textbox3, fase.scene)
        )
        .setOnStart(() => fase.whiteboard.ativar(false))


        fase.informacao.aula4dialogo1 = {textbox:textbox3};

        return animacao;
    }

    aula4dialogo2(dialogo){

        const fase = this;

        //Coloco que a equação anterior implica que dado uma razão 

        const equacoes = {
            valor1: '\\color{red} 7.75 horas',
            valor2: '\\color{blue} 338°', 
            razao: `\\Rightarrow \\frac{ \\color{blue}x}{ \\color{red}7.75h} \\color{black} = \\frac{ \\color{blue}30°}{ \\color{red}1h}`
        }

        const textboxEquacao = fase.informacao.aula4dialogo1.textbox;

        const textbox1 = new MathJaxTextBox(equacoes.valor1, [6,3,0], 2);
        const textbox2 = new MathJaxTextBox(equacoes.valor2, [7,-2, 0], 2);

        const spline1 = [
            textbox1.position.clone(),
            textbox1.position.clone().sub(new THREE.Vector3(0.3,1,0)),
            textbox1.position.clone().sub(new THREE.Vector3(1,2,0)),
            textboxEquacao.position.clone()
        ]

        const spline2 = [
            textbox2.position.clone(),
            textbox2.position.clone().add(new THREE.Vector3(-0.3,1,0)),
            textbox2.position.clone().add(new THREE.Vector3(-1,2,0)),
            textboxEquacao.position.clone()
        ]

        const moverNovoValor1 = new MoverTexto(textbox1, spline1);
        const moverNovoValor2 = new MoverTexto(textbox2, spline2);
        //Mostra as duas formas de usar a razão para conseguir o valor
        //Finalmente mostramos a forma de fração da regra de 3

        const animacao = new AnimacaoSequencial(
                            new MostrarTexto(textbox1, fase.scene),
                            new AnimacaoSimultanea(
                                apagarCSS2(textbox1, fase.scene).filler(200),
                                moverNovoValor1,
                            ),

                            apagarCSS2(textboxEquacao).reverse().setOnStart(() => textboxEquacao.mudarTexto(equacoes.razao, 1))

        );

        return new AnimacaoSimultanea(dialogo, animacao);
    }

    aula4dialogo3(dialogo){

        //Usamos a razão da fórmula anterior para fazer funções para resolver equações
        //Mostra como usar uma carta para verificar razão
    }

    final(){

        const fase = this;

        const dialogo = [
            "Com isso, temos uma breve recaptulação de proporcionalidade",
            "Vamos ver mais alguns conceitos na fase seguinte...",
            "Para nos prepararmos para semelhança, a ultima fase"
        ]

        fase.animar(fase.animacoesDialogo(...dialogo).setOnTermino(() => {

            fase.settings.mostrarSetaProximaFase(true);

            setTimeout(fase.settings.proximaFase, 15000);
        }));

    }

    moverTracejado(tracejado, filler){


        const translation = new THREE.Vector3();

        tracejado.mesh.children[0].getWorldPosition(translation);

        const posicaoFinal = new THREE.Vector3(1.5,0.5,0).add(translation.negate())

        return new Animacao(tracejado.mesh)
               .setValorInicial(new THREE.Vector3(0,0,0))
               .setValorFinal(posicaoFinal)
               .setDuration(100)
               .setInterpolacao((inicial,final,peso) => new THREE.Vector3().lerpVectors(inicial,final,peso))
               .setUpdateFunction(function(posicao){

                    tracejado.mesh.position.copy(posicao);
               })
               .voltarAoInicio(false)
               .setOnTermino(() => this.scene.remove(tracejado.mesh))
               .filler(filler)
    }

    circuloCrescendoAnimacao(circulo){

        return new Animacao(circulo)
                .setValorInicial(0.001)
                .setValorFinal(0.1)
                .setDuration(140)
                .setInterpolacao((inicial,final,peso) => inicial*(1 - peso) + final*peso)
                .setCurva((x) => {
                    const c5 = (2 * Math.PI) / 4.5;
                    
                    return x === 0
                        ? 0
                        : x === 1
                        ? 1
                        : x < 0.5
                        ? -(Math.pow(2, 20 * x - 10) * Math.sin((20 * x - 11.125) * c5)) / 2
                        : (Math.pow(2, -20 * x + 10) * Math.sin((20 * x - 11.125) * c5)) / 2 + 1;
                    })
                .setUpdateFunction((valor) => {
                    circulo.raio = valor;
                    circulo.update();
                })
                .setOnStart(() => circulo.addToScene(this.scene))
    }

    //Criação dos controles, input e output
    createInputs(){

        new Hoverable(this.ponto2,this.camera);
        new Draggable(this.ponto2, this.camera);
    }

    createOutputs(){
        this.mostrarAngulo    = new MostrarAngulo(this.angle, 1.5);
        this.colorirPonto     = new ColorirOnHover(this.ponto2,0xaa0000,0xffff33).setCanvas(this);
        this.colorirTracejado = new ColorirOnHover(this.ponto2.tracejado, 0xaa0000, 0xffff33).setCanvas(this);

        //Função auxiliar para incrementar o contador do ângulo começando de 0
        //Retorna uma closure
        this.mostrarAngulo.increment = (() => {
            let a = 0; 
            return () => {
                this.mostrarAngulo.text.elemento.element.textContent = `${Math.round(this.angle.degrees)}° = ${a++} segmentos`
            }
        })();

    }

    //Configurações, nesse caso o controle de arrastar o ponteiro
    Configuracao1(){

        //Atualiza a posição do ponto no arraste para ficar restrita ao círculo
        this.ponto2.draggable.addObserver(new FixarAoCirculo(this.circulo, this.ponto2))

        //Atualiza todos os objetos dependentes da posição do ponto
        this.ponto2.draggable.addObserver({
            update: this.ponto2.updateObservers
        })


        const colorir = colorirAngulo(this.ponto2).setValorInicial(0xff0000).setValorFinal(0xffff00).setDuration(60)

        const controleIdle = new ExecutarAnimacaoIdle(colorir, this, 1).start();

        controleIdle.addInputs(this.ponto2.draggable, this.ponto2.hoverable)

        const colorirPonto     = this.colorirPonto;
        const colorirTracejado = this.colorirTracejado;

        this.ponto2.hoverable.addObserver(colorirPonto)
        this.ponto2.hoverable.addObserver(colorirTracejado)
        this.ponto2.draggable.addObserver(colorirPonto)
        this.ponto2.draggable.addObserver(colorirTracejado)
    }

    //Desativa o controle de arrastar o ponteiro temporariamente
    Configuracao2(){

        this.ponto2.draggable.observers.map(output => output.update({dragging: false}));
        this.ponto2.hoverable.observers.map(output => output.update({dentro:false}));
        this.ponto2.removeAllOutputs();
    }

    //Arraste e instanciação de equações
    Configuracao3(informacao){

        this.informacao = {...this.informacao, ...informacao};

        const equacoes = {
            formula: '\\color{blue} graus( \\color{red} {hora} \\color{blue}) \\color{black} = \\color{red} {hora} \\cdot \\color{purple} {RAZ \\tilde{A}O}',
            fatorada: '\\color{blue} graus( \\color{red} hora \\color{blue}) \\color{black} = \\color{red} hora  \\color{blue} \\cdot \\frac{\\color{blue} 30°} {\\color{red} 1h~}',
            instanciada: (hora) => `\\color{blue} graus \\color{black} = \\color{red} ${hora}  \\color{blue} \\cdot \\frac{\\color{blue} 30°} {\\color{red} 1h~}`
        } 

        //Vai ser a função que vai instanciar as equações
        const funcao = new ElementoCSS2D(informacao.funcao, this.whiteboard);
        const valor  = new ElementoCSS2D(informacao.valor,  this.whiteboard);

        //Criar controle de juntar funcao com valores

        const juntar = new JuntarEquacoes(valor,[funcao], this);

        juntar.criarIdling(1.3);

        juntar.equacaoResultante = equacoes.instanciada("5h");

        this.controleEquacoes("5h", funcao, this.informacao.sidenote)
            .addInputs(juntar);
    }

    Configuracao4(){

        this.Configuracao1();

        const fase = this;

        const graus = () => Math.round(fase.angle.degrees); 
        const hora  = () => Math.round(graus()/30*100)/100 + "h";

        const horaAtual = hora();
        const grausAtuais = graus();

        const estadosResolucaoEquacao = [
            (informacao ) => ` \\frac{\\color{red}${informacao.nome()}}{\\color{red}${horaAtual}} \\color{black} = \\frac{\\color{blue}${informacao.valor()}°}{\\color{blue}${grausAtuais}°}? \\Rightarrow`,
            (informacao ) => ` \\color{red} ${Math.round(parseFloat(informacao.nome())/parseFloat(horaAtual) * 100)/100} \\color{black} = \\color{blue} ${informacao.valor()/grausAtuais} \\Rightarrow cresce~igualmente \\Rightarrow`,
            (           ) => `\\color{red} Horas \\color{black}~são~proporcionais~aos~\\color{blue} graus \\Rightarrow`,
            (informacao ) => `com ~ \\color{purple} RAZ \\tilde AO =  \\frac{\\color{blue}${grausAtuais}°}{\\color{red}${horaAtual}} \\color{black} = \\frac{\\color{blue}${informacao.valor()}°}{\\color{red}${informacao.nome()}}`
        ]

        //Refatorar isso em atributos de uma classe Equação?
        const informacaoNova = {
            objetosProporcionais:[
                {
                    objeto: fase.relogio,
                    nome: hora,
                    valor: graus,
                    equacao: () => `\\color{red} ${hora()} \\color{black}~tem~\\color{blue} ${graus()}°`,
                    position: [6, 0, 0 ],
                    tamanhoFonte: 2,
                    compativelCom: (informacao) => informacao.nome().slice(-1) == 'h',
                    equacaoResultante: (informacao) => estadosResolucaoEquacao[0](informacao),
                    estadosResolucaoEquacao: estadosResolucaoEquacao
                }
            ]
        }

        this.informacao.objetosProporcionais = informacaoNova.objetosProporcionais;
        
    }

    controleEquacoes(valor, funcao, sidenote){

        //Refatorar depois a parte das equações, esse trabalho aqui é desnecessário
        const equacoes = {
            formula: '\\color{purple} {RAZ \\tilde{A}O} = \\color{black} \\frac {\\color{blue} graus}{\\color{red} hora} \\color{black} = \\frac{\\color{blue} 30°}{\\color{red} 1h}',
            fatorada: `\\color{blue} graus \\color{black} = \\color{red} hora \\color{blue} \\cdot \\frac{\\color{blue} 30°} {\\color{red} 1h~}`,
            instanciada: (hora) => `\\color{blue} graus \\color{black} = \\color{red} ${hora}  \\color{blue} \\cdot \\frac{\\color{blue} 30°} {\\color{red} 1h~}`,
            cancelarUnidade: (hora) => `\\color{blue} graus \\color{black} = \\color{red} ${parseFloat(hora)} \\cancel{h}  \\color{blue} \\cdot \\frac{\\color{blue} 30°} {\\color{red} 1 \\cancel{h}~}`,
            resolvidaParcialmente:   (hora) => `\\color{blue} graus \\color{black} = \\color{blue} ${parseFloat(hora)} \\cdot 30°`,
            resolvida:   (hora) => `\\color{blue} graus \\color{black} = \\color{blue} ${parseFloat(hora) * 30}°`
        } 

        const fase = this;

        //Quando tiver a parte de expressões mathjax funcional,
        //Vamos adicionar inputs do usuário para auxiliá-lo a resolver
        //Se ele acertar os valores das variáveis ele é recompensado
        //REFARTORAR EXPRESSÕES, EM STANDBY POR ENQUANTO
        return new Output()
               .setUpdateFunction(function(novoEstado){

                    const estado = this.estado;

                    const novaEquacao = novoEstado.novaEquacao;

                    if(novaEquacao && estado.etapa == 1){


                        const objetoEquacao = new ElementoCSS2D(novaEquacao, fase.whiteboard);

                        const mudarSidenote = fase.animacaoDialogo("Clique para resolver a equação", estado.sidenote)

                        fase.animar(mudarSidenote)

                        const resolverEquacao = new ResolverEquacao(objetoEquacao, fase, null, equacoes.cancelarUnidade(estado.valor))

                        this.addInputs(resolverEquacao);

                        estado.etapa++;
                    }

                    else if(novaEquacao && estado.etapa == 2){
                        const objetoEquacao = new ElementoCSS2D(novaEquacao, fase.whiteboard);

                        const mudarDialogo  = fase.animacaoDialogo("Podemos cancelar a unidade hora")
                        const mudarSidenote = fase.animacaoDialogo("Clique para resolver a equação", estado.sidenote)

                        fase.animar(mudarDialogo)
                        fase.animar(mudarSidenote);

                        const resolverEquacao = new ResolverEquacao(objetoEquacao, fase, null, equacoes.resolvidaParcialmente(estado.valor))

                        resolverEquacao.tamanhoFonte = 1.7;

                        this.addInputs(resolverEquacao);

                        estado.etapa++;
                    }

                    else if(novaEquacao && estado.etapa == 3){
                        const objetoEquacao = new ElementoCSS2D(novaEquacao, fase.whiteboard);

                        const mudarDialogo = fase.animacaoDialogo("Agora multiplicamos 30 graus para cada hora");

                        const mudarSidenote = fase.animacaoDialogo("Clique uma última vez", estado.sidenote)

                        fase.animar(mudarSidenote);
                        fase.animar(mudarDialogo);

                        const resolverEquacao = new ResolverEquacao(objetoEquacao, fase, null, equacoes.resolvida(estado.valor))

                        resolverEquacao.tamanhoFonte = 1.7

                        this.addInputs(resolverEquacao);

                        estado.etapa++;
                    }

                    else if(novaEquacao && estado.etapa == 4){
                        const dialogo = "Então " + estado.valor + " tem " + 30 * estado.hora + "°";

                        const mudarDialogo = fase.animacaoDialogo(dialogo).setDelay(50);

                        const mudarSidenote = fase.animacaoDialogo("Conseguimos o resultado: ", estado.sidenote)

                        const apagarEquacao = apagarCSS2(fase.whiteboard.equacoes[0], fase.whiteboard.scene).filler(300);

                        //Bugs na renderização do ângulo
                        const hora = (estado.hora == 9 || estado.hora == 12)? estado.hora - 0.001 : estado.hora
                        
                        const moverPonteiro = fase.moverPonteiro(fase.angle.degrees, 30 * hora);

                        const animacao = new AnimacaoSimultanea(mudarSidenote, mudarDialogo, apagarEquacao, moverPonteiro)
                                         .setOnTermino(() => this.update({}))
                                         .setDelay(100)

                        fase.animar(animacao);

                        estado.etapa++;

                    }

                    else if(estado.etapa == 5 && estado.equacoesResolvidas < 3){

                        fase.whiteboard.removerTodasEquacoes();

                        estado.hora  = estado.horarios.splice(Math.round(Math.random() * (estado.horarios.length - 1)), 1)[0]; //Escolhe uma e remove do array
                        estado.valor = `${estado.hora}h`;

                        fase.whiteboard.adicionarTexto(funcao.texto);

                        valor = fase.createMathJaxTextBox("\\color{red}" + estado.valor, [0,0,0], 2);
                        
                        fase.whiteboard.adicionarTexto(valor); //Elemento clonado na lousa retornado

                        valor  = new ElementoCSS2D(valor, fase.whiteboard);

                        const juntarEquacoes = new JuntarEquacoes(valor, [funcao], fase, null, equacoes.instanciada(estado.valor));

                        juntarEquacoes.criarIdling(1.3)

                        this.addInputs(juntarEquacoes);

                        const mudarSidenote = fase.animacaoDialogo(`Arraste ${estado.hora} para a equação na lousa`, estado.sidenote).setDelay(50);
                        const mudarDialogo  = fase.animacaoDialogo("Então quantos graus tem " + estado.valor + "?");
                        const mostrarEquacao = apagarCSS2(funcao.texto).reverse().filler(100);
                        const mostrarValor   = apagarCSS2(valor.texto).reverse().filler(100);

                        fase.animar(mostrarEquacao);
                        fase.animar(mostrarValor);
                        fase.animar(mudarDialogo);
                        fase.animar(mudarSidenote);

                        fase.scene.remove(estado.sidenote);

                        estado.etapa = 1;
                        estado.equacoesResolvidas++;
                    }
                    else if(estado.etapa == 5){

                        fase.whiteboard.ativar(false);

                        fase.scene.remove(estado.sidenote);

                        fase.final();
                    }

                    // //Começa a multiplicação com frações
                    // else if(estado.etapa == 5 && estado.equacoesResolvidas >= 3 && !estado.etapaFracao){

                    //     this.debug = false;

                    //     estado.horarios = new Array(10).fill(0).map((e,i) => Math.round(Math.random() * 11) + Math.round(1 + Math.random() * 18)/20)
                        
                    //     fase.whiteboard.removerTodasEquacoes();

                    //     estado.hora  = estado.horarios.splice(Math.round(Math.random() * (estado.horarios.length - 1)), 1)[0]; //Escolhe uma e remove do array
                    //     estado.valor = `${estado.hora}h`;


                    //     const mudarDialogo = fase.animacoesDialogo(
                    //         "Podemos usar essa razão para calcular até valores quebrados de horas",
                    //         `Por exemplo, quantos graus teriam ${estado.hora} horas?`
                    //     )
                    //     .setOnTermino(() => {

                    //         fase.whiteboard.adicionarTexto(funcao.texto);

                    //         valor = fase.createMathJaxTextBox("\\color{red}" + estado.valor, [0,0,0], 2);
                            
                    //         fase.whiteboard.adicionarTexto(valor); //Elemento clonado na lousa retornado

                    //         valor  = new ElementoCSS2D(valor, fase.whiteboard);

                    //         const juntarEquacoes = new JuntarEquacoes(valor, [funcao], fase, null, equacoes.instanciada(estado.valor));

                    //         this.addInputs(juntarEquacoes);

                    //         fase.animar(apagarCSS2(funcao.texto).reverse())

                    //         this.update({})
                    //     })
                    //     .setCheckpointAll(true)
                    //     .setNome("dialogo");

                    //     //Fazer parte de minutos: criar outra razão, quebra a hora em minutos e aplica ela depois soma em fração de horas

                    //     fase.animar(mudarDialogo);

                    //     estado.etapa = 1;
                    //     estado.etapaFracao = true;
                    //     estado.equacoesResolvidas = 0;
                    // }

                    // else if(estado.etapa == 5 && estado.equacoesResolvidas >= 3 && estado.etapaFracao){

                    //     fase.scene.remove(estado.sidenote);

                    //     fase.aula4();
                    // }


               })
               .setEstadoInicial({
                    valor: valor,
                    etapa: 1,
                    equacoesResolvidas: 0,
                    horarios: [2,3,4,6,7,8,9,10,11,12],
                    hora: parseInt(valor),
                    etapaFracao: false,
                    sidenote: sidenote
               })

    }

    criarControleGeral(){

        const fase = this;

        return new Output()
               .setUpdateFunction(function(novoEstado){

                    const estado = this.estado;

                    if(novoEstado.objetoSelecionado && estado.etapa == 0){
                        
                        const mudarDialogo = fase.animacaoDialogo('Muito bem, mova o ponteiro do relógio para conseguir outra medição');

                        this.addInputs(fase.ponto2.draggable);

                        fase.animar(mudarDialogo);

                        estado.etapa++;
                    }

                    else if(estado.etapa == 1 && novoEstado.dragging == false){

                        estado.etapa++

                        const mudarDialogo = fase.animacaoDialogo('Escolha qualquer hora e clique novamente no relógio');

                        fase.animar(mudarDialogo);

                        const clicarObjetos = fase.controleDaCarta.estado.clicarObjetos;

                        const ativarClick = () => clicarObjetos.map(clicar => clicar.ativar(true));

                        setTimeout(ativarClick, 500)

                    }
               })
               .setEstadoInicial({
                    etapa:0
               })
    }

    //REFATORAR GAMBIARRA
    //Controle da carta proporcionalidade avisa quando acionar
    //Se tiver obtido horas do relógio, roda um diálogo e reativa o click do relógio
    adicionarControleDaCarta(controle){
        super.adicionarControleDaCarta(controle);

        controle.addObserver(this.criarControleGeral());

        return this;
    }


    update(){
        // this.atualizarOptions();

        super.update();
        if(this.debug) super.update();
        if(this.debug) super.update();
        if(this.debug) super.update();

        if(this.debug && this.problema > this.progresso){

            super.update();
            super.update();
            super.update();
            super.update();
            super.update();
            super.update();
            super.update();
            super.update();
            super.update();
            super.update();
            super.update();
            super.update();
            super.update();
            super.update();
            super.update();
            super.update();
            super.update();
            super.update();
            super.update();
            super.update();
            super.update();
            super.update();
            super.update();
            super.update();
            super.update();
        }

        // if(options.atualizar) triangle.update();

        const problema = this.problemas[this.progresso];

        if(!problema) return console.log("Finalizado");

        if(problema.satisfeito(this)){
            problema.consequencia(this);
            this.progresso++;
        }
    }

    //Adicionar equação 4 horas = 120 graus, onde graus e horas são variáveis
    //Adicionar possibilidade de resolver equação por meios algébricos
    //Adicionar menu de perguntas
    problemas = {

        0: {
            satisfeito(fase){

                return fase.dialogoTerminado && Math.round(30 - fase.angle.degrees) == 0;
            },

            consequencia(fase){

                fase.Configuracao2();

                const dialogo1 = fase.animacaoDialogo(`Uma hora tem 30°, como acabou de demonstrar`);

                fase.equacaoUmaHora = fase.createMathJaxTextBox(`\\color{red}{1~h}~\\color{black}{tem}~\\color{blue}{30°}`, [5.5,2,0], 2);

                const mostrarEquacao = new MostrarTexto(fase.equacaoUmaHora, fase.scene);

                const dialogo2 = fase.animacaoDialogo(`Agora, arraste para 5 horas`);

                const animacao2 = new AnimacaoSequencial(dialogo2).setOnStart(() => {
                                                                            fase.Configuracao1();
                                                                        });

                const animacao = new AnimacaoSequencial(dialogo1,mostrarEquacao,animacao2).setCheckpointAll(false);

                animacao.setOnTermino(() => fase.whiteboard.ativar(false));

                fase.animar(animacao)
            }
        },

        1: {
            satisfeito(fase){

                console.log(fase.angle.degrees)

                return Math.round(150 - fase.angle.degrees) == 0;
            },

            consequencia(fase){

                fase.Configuracao2();

                fase.equacaocincoHoras = fase.createMathJaxTextBox(`\\color{red}{5~h}~\\color{black}{tem}~\\color{blue}{150°}`, [5.5,-2,0], 2);

                const mostrarEquacao = new MostrarTexto(fase.equacaocincoHoras, fase.scene);

                const dialogo1 = `5 horas tem 150°, como acabou de demonstrar`

                const animacao1 = new TextoAparecendo(fase.text.element).setOnStart(() => fase.changeText(dialogo1))

                const dialogo2 = `Mas será que é preciso medir os graus toda vez?`

                const animacao2 = new TextoAparecendo(fase.text.element).setOnStart(() => fase.changeText(dialogo2))

                const mostrarHora = fase.mostrarHora();

                const animacao = new AnimacaoSequencial(animacao1,mostrarEquacao,animacao2, new AnimacaoSimultanea(mostrarHora));

                fase.animar(animacao.setOnTermino(() => fase.progresso = 3));

            }
        },

        3: {
            satisfeito(){
                return true;
            },

            consequencia(fase){

                fase.whiteboard.removerTodasEquacoes();

                fase.aula2();
            }
        }
    }

    //Trabalhar na carta proporcionalidade
    //Cria a equação da regra de 3, útil para os problemas
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


    //Animações dos problemas

    moverPonteiro(anguloInicial, anguloFinal){

        return new Animacao(this.ponto2)
                .setValorInicial(Math.PI*anguloInicial/180)
                .setValorFinal(Math.PI*anguloFinal/180)
                .setInterpolacao((inicial, final, peso) => inicial*(1-peso) + final*peso)
                .setDuration(200)
                .voltarAoInicio(false)
                .setCurva(x => -(Math.cos(Math.PI * x) - 1) / 2)
                .setUpdateFunction((angulo) => {
                    const posicao = new THREE.Vector3(3*Math.sin(angulo), 3*Math.cos(angulo), 0)
                    this.ponto2.position = posicao;
                    this.ponto2.update(); //Refatorar circulo, update deve ser apenas update
                    this.ponto2.updateObservers();
                    this.ponto2.draggable.notify({dragging: true, position: posicao})
                });

    }

    mostrarHora(){

        const moverPonteiro = this.moverPonteiro(this.angle.degrees,30);


        //Forma algébrica, desenvolver animações para lidar com isso (criar carta e mover)
        //Adicionar carta (círculo tem 360°)
        //Adicionar carta (relógio tem 12 horas)
        //Adicionar carta (relógio é um círculo)
        //Resolução: 12 horas tem 360°
        //Então 6 horas tem 180°
        //e 1 hora tem 30°
        //Shortcut,adicionar bônus se resolver por essa maneira

        // const anguloText = this.mostrarAngulo.text.elemento

        // const moverAngulo = new Animacao(anguloText)
        //                         .setValorInicial(anguloText.position.clone())
        //                         .setValorFinal(new THREE.Vector3(5,2,0))
        //                         .setDuration(200)
        //                         .voltarAoInicio(false)
        //                         .setInterpolacao((inicial,final,peso) => new THREE.Vector3().lerpVectors(inicial,final,peso))
        //                         .setUpdateFunction(value => {
        //                             anguloText.position.copy(value);
        //                         })
        //Animação desativar mostrarÂngulo, mover texto do ângulo
        //Criar texto 1 hora = {Angulo}

        return new AnimacaoSequencial(
                    moverPonteiro
                    
                );
    }

    //Transformar isso numa classe?
    moverEquacao(configs){

        let {elementoCSS2, equacao, spline, duration1, duration2, delayDoMeio} = configs;

        if(!spline){
            spline = [
                new THREE.Vector3(1.473684210526315, -2.2692913385826774, 0),
                new THREE.Vector3(-0.39766081871345005, -0.6944881889763783, 0),
            ]
        }

        if(!equacao){

            const novoElemento = document.createElement("div");

            novoElemento.innerHTML = elementoCSS2.element.innerHTML;

            // novoElemento.style.width = '400px'; // Set width to 200 pixels
            // novoElemento.style.height = '40px'; // Set height to 150 pixels
            // novoElemento.style.top = '10px'; // Set top position to 50 pixels from the top of the parent element

            novoElemento.style.position = 'relative';

            // novoElemento.children[0].style.width = '400px';
            novoElemento.children[0].style.height = 'auto';

            equacao = {html: novoElemento}
        }

        if(!duration1){
            duration1 = 50
        }

        if(!duration2){
            duration2 = 50;
        }

        if(!delayDoMeio){
            delayDoMeio = 0;
        }

        const fase = this;

        //Consertar depois, está debaixo da whiteboard
        // novoElemento.element.style.zIndex = 10000;

        const mostrarTexto = new MostrarTexto(elementoCSS2)
                                .setValorFinal(300)
                                .setProgresso((duration1)? 0 : 1)
                                .setDelay(delayDoMeio)
                                .setDuration(duration1)
                                .setValorFinal(3000)
                                .setOnStart(() => {
                                    fase.scene.add(elementoCSS2);
                                    fase.whiteboard.adicionarEquacao(equacao)
                                });

        const moverEquacaoParaDiv = new MoverTexto(elementoCSS2)
                                    .setOnStart(function(){
                                        const equacaoDiv   = fase.whiteboard.equacoes[0].element;

                                        const dimensoes    = equacaoDiv.getBoundingClientRect();

                                        const posicaoFinal = fase.pixelToCoordinates((dimensoes.right + dimensoes.left)/2, (dimensoes.top + dimensoes.bottom)/2)

                                        this.setSpline([
                                            elementoCSS2.position.clone(),
                                            ...spline,
                                            posicaoFinal
                                        ])

                                        // fase.whiteboard.equationList.children[0].style.display = "none"
                                        

                                    })
                                    .setOnTermino(() =>{
                                        fase.scene.remove(elementoCSS2);
                                        // fase.whiteboard.equationList.children[0].style.display = "block"
                                        fase.whiteboard.ativar(true);
                                    })
                                    .setDuration(duration2)


        const animacao = new AnimacaoSequencial( 
                            mostrarTexto, 
                            moverEquacaoParaDiv
                        )

        animacao.setCheckpointAll(false);

        return animacao

        
    }
}
