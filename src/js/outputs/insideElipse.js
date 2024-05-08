import { HoverPosition } from "../inputs/position";
import { Objeto } from "../objetos/objeto";
import { Output } from "./Output";
import * as THREE from 'three';

export default class InsideElipse extends Output{

    constructor(aresta, distanciaDeHover, camera, scene){

        super();

        this.aresta = aresta;
        this.distanciaDeHover = distanciaDeHover;

        this.hitbox = Objeto.fromMesh(new THREE.Mesh(new THREE.PlaneGeometry(100,100), new THREE.MeshBasicMaterial({visible:false})));

        scene.add(this.hitbox);

        this.addInputs(new HoverPosition(this.hitbox, camera));

        aresta.interactable = this; //Trata isso como se fosse um input, para quando for deletar inputs esse vim incluso


        this.setEstadoInicial({
            dentroDaElipse: false
        })

    }

    _update(novoEstado){

        const aresta = this.aresta;
        const estado = this.estado;

        const deslocamento = aresta.destino.clone()
                                           .sub(aresta.origem)
                                           .normalize()
                                           .multiplyScalar(this.distanciaDeHover);
                            
        const foco1 = aresta.origem.clone().add(deslocamento);
        const foco2 = aresta.destino.clone().sub(deslocamento);

        const posicaoMouse = novoEstado.position;

        //Círculo
        // const distanciaDoMouse = posicao.clone().sub(posicaoMouse).length();

        //Elipse
        const distanciaEntreEixos = new THREE.Vector3().subVectors(foco1, foco2).length();

        const semieixo = distanciaEntreEixos + this.distanciaDeHover * 2;

        const distanciaDoMouse = posicaoMouse.clone().sub(foco1).length() + posicaoMouse.clone().sub(foco2).length(); 

        const dentroDaElipse = distanciaDoMouse < semieixo;

        if(estado.dentroDaElipse != dentroDaElipse){
            
            estado.dentroDaElipse = dentroDaElipse;

            this.notify({dentro: estado.dentroDaElipse});
        }
    }
}