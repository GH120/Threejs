import MostrarTracejado from "../animacoes/mostrarTracejado";
import { Output } from './Output';
import { Tracejado } from "../objetos/tracejado";

//No ato de criar uma bissetriz, criar um novo triangulo?
//DEPRECATED: Refatorar depois
export class MostrarBissetriz extends Output{

    constructor(triangulo, angulo, fase){
        super();

        console.log(triangulo, angulo)
        
        this.triangulo = triangulo;
        this.angulo = angulo;
        this.vertice = triangulo.vertices[angulo.index];
        this.ladoOposto = triangulo.edges[(angulo.index+1)%3];
        this.scene = fase.scene;
        this.fase = fase;

        this.estado = {selecionado:false, clicados:[]};

        const origem  = this.angulo.getPosition();
        const destino = this.ladoOposto.mesh.position.clone();

        this.tracejado = new Tracejado(origem,destino);
    }

    _update(estadoNovo){

        this.estado = {...this.estado, ...estadoNovo};

        this.scene.remove(this.tracejado.mesh);

        if(this.estado.dentro){

            this.tracejado.origem  = this.angulo.position.clone();
            this.tracejado.destino = this.ladoOposto.mesh.position.clone();
            this.tracejado.render();

            this.scene.add(this.tracejado.mesh);

            const animacao = new MostrarTracejado(this.tracejado, this.scene);

            if(this.novaAnimacao(animacao)) this.fase.animar(animacao);
        }
        else{
            //Ignora remoção se clicado

            if(this.estaSelecionado()){
                this.scene.add(this.tracejado.mesh);
                return;
            }

            if(this.animacao) this.animacao.animationFrames.return();
        }
    }

    //Enquanto a animação não estiver terminada, não adicionar animação
    novaAnimacao(animacao){

        if(this.animacao && this.animacao.animationFrames.next().done){
            this.animacao = animacao;
            return true;
        }

        if(this.animacao) return false;

        this.animacao = animacao;

        return true;
    }

    //Determina se o ultimo clique seleciona ou deseleciona 
    estaSelecionado(){

        const JaSelecionado = this.estado.selecionado;

        const selecionados  = this.estado.clicados.filter(colisao => colisao != null)
                                                  .map(colisao => colisao.object);

        const clicouNoVazio = this.estado.clicados.filter(colisao => colisao != null).length == 0;

        const selecionadoNesseClique = selecionados.filter(objeto => objeto == this.angulo.hitbox).length > 0;

        this.estado.selecionado = (JaSelecionado && !clicouNoVazio) || selecionadoNesseClique;

        return this.estado.selecionado;
    }

    addToScene(scene){
        this.scene = scene;
        return this;
    }
}