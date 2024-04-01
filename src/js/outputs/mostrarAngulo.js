import * as THREE from 'three'
import {CSS2DObject} from 'three/examples/jsm/renderers/CSS2DRenderer';
import { Output } from './Output';

export class MostrarAngulo extends Output{

    constructor(angle){
        super();

        this.angulo = angle;
        this.estado  = {};
        this.createText();

    }

    createText(){
        const p = document.createElement('p');
        p.style.fontFamily = "'Latin Modern Math', 'Computer Modern', serif";
        p.textContent = "teste";

        const wrapper = document.createElement("div");

        wrapper.addChild(p);

        const cPointLabel = new CSS2DObject(wrapper);

        this.text = {elemento:cPointLabel, on:false}

        return this;
    }

    onHover(onHover){

        if (onHover) {

            const elemento = this.text.elemento;

            const angulo = this.angulo;

            elemento.element.textContent = `${(angulo.degrees).toFixed()}°`;
            elemento.element.style.transform = "rotate(-45deg)"

            const vetor = new THREE.Vector3(0,0,0)
                        .lerpVectors(angulo.vetor2,     angulo.vetor1,      0.5)
                        .normalize()
                        .multiplyScalar(1.5*angulo.angleRadius)
                        .applyMatrix4(new THREE.Matrix4().extractRotation(angulo.mesh.matrixWorld));

            const position = this.angulo.mesh.position.clone();

            const newPosition = position.sub(vetor)

            elemento.position.copy(newPosition)

            this.text.on = true;
        }
        else{
            this.text.on = false;
        }
    }

    _update(novoEstado){

        this.estado = {...this.estado, ...novoEstado};

        const scene = this.scene;

        scene.remove(this.text.elemento)

        this.onHover(this.estado.dentro);

        if(this.text.on)
            scene.add(this.text.elemento)
    }

    addToScene(scene){
        this.scene = scene;
        return this;
    }
}