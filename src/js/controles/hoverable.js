import * as THREE from 'three';
import { Controler } from './Controler';

export class Hoverable extends Controler {

  constructor(object, camera) {

    super(object,camera);

    this.onMouseMove = this.onMouseMove.bind(this);

    window.addEventListener('mousemove', this.onMouseMove.bind(this), false);
  }

  onMouseMove(event) {

    const isInside = !!this.intersectouObjeto(event,this.object);

    //Ignora se continua no mesmo estado
    if(this.isInside == isInside) return;

    //Manda os observadores atualizarem
    this.notify({dentro: isInside});

    this.isInside = isInside;
  }
}