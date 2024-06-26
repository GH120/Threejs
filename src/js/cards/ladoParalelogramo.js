import { AnimacaoSequencial, AnimacaoSimultanea } from "../animacoes/animation";
import { apagarCSS2 } from "../animacoes/apagarCSS2";
import { colorirAngulo } from "../animacoes/colorirAngulo";
import { TextoAparecendo } from "../animacoes/textoAparecendo";
import { Addition, Equality, Square, Value } from "../equations/expressions";
import { Draggable } from "../inputs/draggable";
import { Hoverable } from "../inputs/hoverable";
import { HoverPosition } from "../inputs/position";
import Bracket from "../objetos/bracket";
import { Output } from "../outputs/Output";
import * as THREE from 'three';
import InsideElipse from "../outputs/insideElipse";
import MostrarTexto from "../animacoes/MostrarTexto";
import imagemParalelogramoLado from '../../assets/CartaParalalogramoLado.png'
import { controleTremedeiraIdle, controleTremedeiraIdleAresta } from "../animacoes/idle";
import { mover } from "../animacoes/mover";

export class LadoParalogramo {


    constructor(whiteboard){

        this.whiteboard = whiteboard;

        this.outputs = [];
    }

    static imagem = this.imagem = imagemParalelogramoLado;


    //Quando a carta for arrastada, pega os triângulos da scene
    //Torna eles hoverable e adiciona um output quando estiverem em cima
    trigger(fase){

        const paralelogramos = fase.objetos;

        this.fase = fase;

        for(const paralelogramo of paralelogramos){

            //Por algum motivo, precisa sempre criar novos outputs

            if(!paralelogramo.hoverable){
                new Hoverable(paralelogramo, fase.camera);
            }

            // if(!this.verificadorDeHover)
                this.criarVerificadorDeHover(paralelogramo, fase.scene, fase.camera);
        }
    }
    
    accept(){

        const fase = this.fase;

        const paralelogramo    = this.paralelogramoSelecionado


        if(!paralelogramo){
            fase.animar(fase.animacaoDialogo('Paralelogramo não encontrado, tente de novo'));
            return false;
        }

        const todosLadosConhecidos = paralelogramo.edges.filter(edge => edge.variable.value).length == paralelogramo.edges.length;


        if(todosLadosConhecidos){
            fase.animar(fase.animacaoDialogo('Paralelogramo tem todos os lados conhecidos, tente outro'));
            return false;
        }

        return paralelogramo && !todosLadosConhecidos;
    }

    process(){

        // Criar novo output para selecionar lado e arrastar ele

        const fase = this.fase;

        const carta = this;

        fase.adicionarControleDaCarta(this.controleArrastarLados());

        const dialogo = new AnimacaoSequencial(fase.animacaoDialogo("Os lados agora são arrastáveis, arraste um conhecido para seu oposto"));
        
        dialogo.setNome("Dialogo Carta")

        dialogo.setOnStart(() => carta.colorirArestas.map(colorir => colorir.update({dentro: true})));
        dialogo.setOnTermino(() => carta.colorirArestas.map(colorir => colorir.update({dentro: false})));

        fase.animar(dialogo)

        
        //Transformar isso em uma pilha?
        //Fase agora lida com esse controle
        // Retorna uma equação de igualdade dos lados
        // Mudar texto da caixa de diálogos para ensinar jogador
    }



    //OUTPUTS

    criarVerificadorDeHover(paralelogramo, scene, camera){

        const carta = this;

        const verificador = new Output()
                            .setName('Verificador Hover')
                            .setUpdateFunction(function(novoEstado){

                                const paralelogramoRenderizado = paralelogramo.renderedInScene();

                                this.estado.valido = novoEstado.dentro && paralelogramoRenderizado;

                                if(!this.estado.valido) return;

                                //Desativa todos os verificadores
                                carta.outputs.filter (output => output.name == 'Vericador Hover')
                                             .forEach(verificador => verificador.ativar(false));

                                //Verificar de novo, dando problemas
                                carta.paralelogramoSelecionado = paralelogramo;

                            })
                            .addInputs(paralelogramo.hoverable)

        this.outputs.push(verificador);

        this.verificadorDeHover = verificador; 
    }

    
    criarColorirArestaSelecionada(aresta, corFinal){

        const fase = this.fase;

        const corInicial = aresta.material.color.getHex();


        if(!aresta.insideElipse) new InsideElipse(aresta, 0.05, fase.camera, fase.scene)

        const colorir = new Output()
                        .addInputs(
                            aresta.insideElipse // Para saber se o mouse está proximo da elipse ao redor da aresta
                        )
                        .setUpdateFunction(function(novoEstado){

                            const estado = this.estado;

                            if(novoEstado.dentro && !estado.ativado){
                                estado.ativado = true;

                                if(estado.colorirAresta.execucaoTerminada()) 
                                    estado.colorirAresta = animarColorirAresta(corInicial, corFinal);
                                else
                                    estado.colorirAresta.reverse(true);
                                

                                fase.animar(estado.colorirAresta);
                            }

                            if(novoEstado.dentro == false && estado.ativado){
                                estado.ativado = false;
                                
                                estado.colorirAresta.reverse(true);

                                fase.animar(estado.colorirAresta);
                            }
                        })
                        .setEstadoInicial({
                            ativado:false,
                            colorirAresta: animarColorirAresta(corFinal, corInicial),
                        });

        function animarColorirAresta(inicial, final){
            
            const animacao = colorirAngulo(aresta)
                            .setValorInicial(inicial)
                            .setValorFinal(final)
                            .voltarAoInicio(false)
                            .setDuration(30)
                            // .setCurva(x => -(Math.cos(Math.PI * x) - 1) / 2)

            return animacao;
        }

        return colorir;
    }

    //Controle intermediário, move um lado apenas
    criarMoverLados(lado, ladoOposto){

        //Criar um suboutput para verificar se sobrevoa sobre um elemento?

        const carta = this;

        const fase = this.fase;

        new Draggable(lado, this.fase.camera);
        new Hoverable(lado, this.fase.camera);
        new Hoverable(ladoOposto, this.fase.camera);

        if(!ladoOposto.insideElipse) new InsideElipse(ladoOposto, 0.05, fase.camera, fase.scene)


        const moverLados = new Output()
                            .addInputs(
                                lado.draggable, 
                                lado.hoverable,
                                ladoOposto.insideElipse
                            )
                           .setUpdateFunction(function(novoEstado){

                                const estado = this.estado;

                                //Tratar seleção do lado principal
                                //Transformar em suboutput?
                                if(novoEstado.alvo == lado){

                                    if(novoEstado.dentro){
                                        estado.mouseSobreLadoPrincipal = true;
                                    }
                                    
                                    if(novoEstado.dentro == false){
                                        estado.mouseSobreLadoPrincipal = false;
                                    }
                                }
                                
                                if(estado.mouseSobreLadoPrincipal && novoEstado.dragging && !estado.arrastando){

                                    //Liga o output de arraste ao mostrarValorAresta
                                    lado.mostrarValorAresta.removeInputs();
                                    lado.mostrarValorAresta.addInputs(lado.draggable);

                                    estado.arrastando    = true;
                                    estado.ultimaPosicao = lado.getPosition();
                                    estado.direcao = ladoOposto.getPosition().sub(lado.getPosition()).normalize();

                                }

                                //Arrastar lado principal
                                if(estado.arrastando && novoEstado.dragging){

                                    const distanciaPercorrida = novoEstado.position
                                                                          .sub(lado.getPosition())
                                                                          .dot(estado.direcao);

                                    const deslocamento = estado.direcao.clone()
                                                                       .multiplyScalar(distanciaPercorrida)

                                    //Criar uma função para atualizar posição?
                                    //Como os lados tem uma rotação de 90°, precisam ser atualizados quando mudada a posição

                                    lado.origem.add(deslocamento);
                                    lado.destino.add(deslocamento);

                                    lado.update();
                                }

                                //Fim do arraste

                                if(estado.arrastando && novoEstado.dragging == false){
                                    
                                    estado.verificar  = true;
                                }

                                //Verificar se está dentro do lado paralelo

                                if(novoEstado.alvo == ladoOposto){
                                        
                                    if(novoEstado.dentro){
                                        estado.ladoOpostoSelecionado = true;
                                    }

                                    if(novoEstado.dentro == false){
                                        estado.ladoOpostoSelecionado = false;
                                    }
                                }

                                if(estado.verificar){

                                    if(estado.ladoOpostoSelecionado == true){

                                        estado.verificar = false;

                                        //Avisa o controle principal qual lado foi selecionado
                                        this.notify({
                                            ladoSelecionado: ladoOposto, 
                                            ladoOriginal: lado,
                                            ultimaPosicaoDoLadoOriginal: estado.ultimaPosicao
                                        })
                                    }

                                    if(!estado.ladoOpostoSelecionado){

                                        carta.voltarAoInicio(lado, estado.ultimaPosicao);

                                        estado.verificar = false;
                                    }
                                }

                                //Se sim, retornar a equação
                           })
                           .setEstadoInicial({
                                mouseSobreLadoPrincipal: false,
                                arrastar: false,
                                ladoOpostoSelecionado: false,
                                verificar: false,
                            })

        return moverLados;

    }


    controleArrastarLados(){

        const carta = this;

        const paralelogramo = this.paralelogramoSelecionado;

        //Outputs auxiliares

        carta.colorirArestas = [
            this.criarColorirArestaSelecionada(paralelogramo.edges[2], 0xffff00),
            this.criarColorirArestaSelecionada(paralelogramo.edges[0], 0xe828282),
            this.criarColorirArestaSelecionada(paralelogramo.edges[3], 0xffff00),
            this.criarColorirArestaSelecionada(paralelogramo.edges[1], 0xe828282)
        ];

        const moverLadosLaterais  = this.criarMoverLados(paralelogramo.edges[2], paralelogramo.edges[0]);
        const moverLadosVerticais = this.criarMoverLados(paralelogramo.edges[3], paralelogramo.edges[1]);

        this.arrastarLadosIdle = [
            controleTremedeiraIdleAresta(paralelogramo.edges[2], carta.fase, 5).start(),
            controleTremedeiraIdleAresta(paralelogramo.edges[3], carta.fase, 7).start()
        ]

        const dialogos = {
            primeiroLadoMovido1: `Repita para o lado desconhecido restante`,
            // primeiroLadoMovido2: `Use o mesmo raciocinio com o lado restante para obter seu valor`,
            ultimoLadoMovido: `Muito bem, agora conhecemos todos os lados`
        }

        //Controle propriamente dito
        return new Output()
               .setName('Controle Arraste') 
               .addInputs(moverLadosLaterais, moverLadosVerticais)
               .setUpdateFunction(function(novoEstado){

                    const estado = this.estado;
                    
                    const lado       = novoEstado.ladoOriginal; 
                    const ladoOposto = novoEstado.ladoSelecionado;
                    const ultimaPosicao = novoEstado.ultimaPosicaoDoLadoOriginal;

                    //Desativa todos os outputs como mover lado e colorir
                    lado.removeAllOutputs();
                    ladoOposto.removeAllOutputs();

                    carta.colorirArestas.map(arestaColorida => arestaColorida.update({dentro:false}));

                    estado.ladosConhecidos++;

                    const avisarSeControleTerminou = () => this.notify({execucaoTerminada: estado.ladosConhecidos == paralelogramo.numeroVertices})

                    //Só anima comentário depois de executar as animações da equação
                    //Quando terminado diálogo, notifica termino dessa execução
                    carta.criarEquacao(lado, ladoOposto, ultimaPosicao)
                         .setOnStart(
                            () => animarComentario(estado.ladosConhecidos)
                                 .setOnTermino(avisarSeControleTerminou)
                         )
                         .setOnTermino(() =>{
                             this.notify({
                                carta: "LadoParalelogramo", 
                                completo: estado.ladosConhecidos == paralelogramo.numeroVertices,
                                paralelogramo:   paralelogramo
                            }) //Atualiza o valor das aresta que tem esse controle como input
                         })
               })
               .setEstadoInicial({
                    ladosConhecidos: paralelogramo.edges.filter(aresta => aresta.variable.value).length
                })

        //Funções auxiliares:

        //Função para ser rodada no término do criarEquacao
        function animarComentario(ladosConhecidos){

            let animacaoDialogo;

            if(ladosConhecidos == 3){
                
                animacaoDialogo = new AnimacaoSequencial(
                                    carta.fase.animacaoDialogo(dialogos.primeiroLadoMovido1), 
                                    // carta.fase.animacaoDialogo(dialogos.primeiroLadoMovido2)
                                );

                animacaoDialogo.setNome("Dialogo Carta");

                carta.fase.animar(animacaoDialogo);
            }

            if(ladosConhecidos == 4){
                
                animacaoDialogo = carta.fase.animacaoDialogo(dialogos.ultimoLadoMovido);

                animacaoDialogo.setNome("Dialogo Carta");

                carta.fase.animar(animacaoDialogo);
            }

            return animacaoDialogo;
        }
    }


    voltarAoInicio(lado, ultimaPosicao){

        const deslocamento = ultimaPosicao.clone().sub(lado.getPosition());

        lado.origem.add(deslocamento);
        lado.destino.add(deslocamento);

        lado.update();

        const fase = this.fase;

        const dialogo = fase.animacoesDialogo(
                            "Lado não encontrado, arraste ele mais perto do lado oposto",
                            "Os lados agora são arrastáveis, arraste um para o outro e veja o que acontece"
                        )
                        // .setNome("Dialogo Carta")

        fase.animar(dialogo);
    }

    criarEquacao(lado, ladoOposto, ultimaPosicao){

        const deslocamento = ultimaPosicao.clone().sub(lado.getPosition());

        const direcao = deslocamento.clone().normalize();

        const atualizarValorAresta = () => lado.mostrarValorAresta.update({})

        const moverLado = new AnimacaoSequencial(

            mover(lado, lado.getPosition(), ladoOposto.getPosition())
            .setDuration(40 * deslocamento.length()/3)
            .setDelay(60)
            .setOnExecution(atualizarValorAresta),

            mover(lado, lado.getPosition(), ultimaPosicao.clone())
            .setDuration(40)
            .setOnExecution(atualizarValorAresta),
        );

        const desenharEquacao = this.animacaoCriarEquacao(lado, ladoOposto, direcao.multiplyScalar(0.7))

        const animacao = new AnimacaoSequencial(
                            moverLado,
                            desenharEquacao
                        );

        this.fase.animar(animacao);

        return animacao;
    }

    animacaoCriarEquacao(lado, ladoOposto, direcao){

        const fase = this.fase;

        const bracket = Bracket.fromAresta(ladoOposto, -0.2, direcao.clone().multiplyScalar(0.5))
                               .addToScene(fase.scene);

        const equacao = new Equality(ladoOposto.variable, lado.variable);


        const posicaoTexto = ladoOposto.getPosition()
                                       .sub(direcao.clone().multiplyScalar(0.75));
                                       
        if(direcao.x > 0.3) posicaoTexto.sub(new THREE.Vector3(0.7,0,0)); //Offset do lado esquerdo

        const igualdade = fase.createMathJaxTextBox(equacao.html.textContent, posicaoTexto.toArray(), 10);

        //Tornar texto na animação de bracket um método do bracket
        const posicaoIgualdade = bracket.position;

        const desenharChaves = bracket.animacao().setDelay(60);

        const mostrarIgualdade = new MostrarTexto(igualdade)
                                .setOnStart(() => {
                                    fase.scene.add(igualdade);
                                    // igualdade.position.copy(posicaoIgualdade)
                                })
                                .setValorFinal(200)
                                .setDuration(100)
                                .setDelay(50)


        //Mudar variável conhecida da equação => whiteboard guarda identidade das variáveis
        //Animação de mudar variável para valor => pode ser afetada localmente
        //Adcionar o valor conhecido da equação na whiteboard

        //Fazer animação mudando o valor 

        const mudarValor = new AnimacaoSequencial(
            new MostrarTexto(igualdade)
            .setOnTermino(() => fase.scene.remove(igualdade))
            .setDuration(50)
            .setValorInicial(200)
            .setValorFinal(45)
            .setDelay(50)
            .setCurva(x => x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2),

            new MostrarTexto(igualdade)
            .setOnStart(function(){

                equacao.changeVariable(lado.variable.value, lado.variable.name);

                ladoOposto.variable.value = lado.variable.value;

                igualdade.mudarTexto(equacao.html.textContent + 'cm')
                fase.scene.add(igualdade);
                this.setProgresso(0)
            })
            .setValorInicial(45)
            .setValorFinal(200)
            .setDuration(100)
        )

        const apagarEquacao = apagarCSS2(igualdade, fase.scene)
                              .setDuration(30)
                              .setCurva(x => x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);

        // const moverEquacao = fase.moverEquacao({
        //                             elementoCSS2: igualdade,
        //                             equacao: equacao,
        //                             duration1: 0,
        //                             duration2: 80,
        //                             spline: [
        //                                 new THREE.Vector3(-4.05, 0.8, 0),
        //                                 new THREE.Vector3(-3.95, 0, 0),
        //                             ],
        //                         })

        const animacao = new AnimacaoSimultanea(
                            desenharChaves,
                            new AnimacaoSequencial(mostrarIgualdade, mudarValor, apagarEquacao),
                        );

        return animacao;
    }
}