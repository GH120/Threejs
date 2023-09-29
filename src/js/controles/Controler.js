import * as THREE from 'three'

//É o input do usuário, pode ser ligado a um output no handler
export class Controler{

    constructor(object, camera){

        this.object     = object;
        this.camera     = camera;
        this.observers  = [];
        this.raycaster  = new THREE.Raycaster();
    }

    //Retorna se o evento intersectou o objeto
    intersectouObjeto(event, object){

        // Calculate the mouse position in normalized device coordinates (-1 to +1)
        const mouse = new THREE.Vector2(
          (event.clientX / window.innerWidth) * 2 - 1,
          -(event.clientY / window.innerHeight) * 2 + 1
        );
        
    
        // Raycast to determine the intersection point between the mouse and the object's plane
        this.raycaster.setFromCamera(mouse, this.camera);
    
        const hitbox = object.hitbox;

        const intersects = this.raycaster.intersectObject(hitbox);
    
        if (intersects.length > 0) {
          // Update the object's position to the intersection point
          return intersects[0];
        }
    
        return null;
      }

      //Implementação do observable
      notify(estado){
        for(const observer of this.observers) if(observer) observer.update(estado);
      }
    
      addObserver(observer){
        this.observers.push(observer);
        return this;
      }
    
      removeObserver(criteria){
        this.observers = this.observers.filter(criteria);
    
        console.log(this.observers.filter(criteria))
        return this;
      }
}