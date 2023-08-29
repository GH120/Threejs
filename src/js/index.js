import * as THREE from 'three';
import {CSS2DObject, CSS2DRenderer} from 'three/examples/jsm/renderers/CSS2DRenderer';
import {Triangle} from './objetos/triangle';
import grid from '../assets/grid.avif';
import { Fase } from './fases/fase1';
import { Fase2 } from './fases/fase2';
import Bracket from './objetos/bracket'
import DesenharMalha from './animacoes/desenharMalha';
import { Fase3 } from './fases/fase3';

//Adicionar interface de colisão => hover.objeto = objeto, hover.objeto.hitbox -> angulo.hitbox returns angulo.mesh
//triangulo.hitbox = new Plane().setPosition(triangulo.center)

//setup Threejs
const scene = new THREE.Scene();
const width = window.innerWidth;
const height = window.innerHeight;

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

//Cria o triângulo e o programa
const triangle = new Triangle()
                    .renderVertices()
                    .renderEdges()
                    .renderAngles()
                    .addToScene(scene);

const programa = new Fase3(triangle,scene,camera);

//Loop de animação
function animate() {
    requestAnimationFrame( animate );

    //Atualiza o programa
    programa.update();

    renderer.render( scene, camera );
    labelRenderer.render( scene, camera );
}
animate();

window.addEventListener('resize', function() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  labelRenderer.setSize(window.innerWidth, window.innerHeight);
});

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

function createBracket(element){

  const retangulo = element.getBoundingClientRect();
  const ponto1 = pixelToCoordinates(retangulo.left, retangulo.bottom);
  const ponto2 = pixelToCoordinates(retangulo.right, retangulo.bottom);
  console.log(retangulo);
  console.log(pixelToCoordinates(retangulo.left, retangulo.bottom))
  console.log(pixelToCoordinates(retangulo.right, retangulo.bottom))

  new Bracket(0.2, [ponto1.x - 0.4,ponto1.y - 0.2,0],[ponto2.x-0.4,ponto2.y-0.2,0]).addToScene(scene)
}

function curva(points){

  const curve = new THREE.CubicBezierCurve3(...points);

  // Create the curve geometry
  const numSegments = 100; // Number of segments to approximate the curve
  const curvePoints = curve.getPoints(numSegments);
  const curveGeometry = new THREE.BufferGeometry().setFromPoints(curvePoints);

  // Create a material for the curve
  const curveMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 });

  // Create the curve object
  const curveObject = new THREE.Line(curveGeometry, curveMaterial);

  return curveObject;
}

function desenharSeta(origem, destino){

  const vetor = destino.sub(origem);

  const ortogonal = new THREE.Vector3().crossVectors(vetor, new THREE.Vector3(0,0,-1)).multiplyScalar(1/4)


  const p1 = new THREE.Vector3().add(vetor).multiplyScalar(1/3).add(origem).add(ortogonal);
  const p2 = new THREE.Vector3().add(vetor).multiplyScalar(2/3).add(origem).add(ortogonal);


  scene.add(curva([
    origem,
    p1,
    p2,
    destino
  ]))
}

function comutatividade(elemento1, elemento2){

  const retangulo1 =  elemento1.getBoundingClientRect()

  const retangulo2 =  elemento2.getBoundingClientRect()

  const ponto1 = pixelToCoordinates(retangulo1.left, retangulo1.bottom);

  const ponto2 = pixelToCoordinates(retangulo2.right, retangulo2.bottom);

  scene.add(curva(ponto1,ponto2));
}


document.addEventListener("DOMContentLoaded", function() {
    const openButton = document.getElementById("openEquationWindow");
    const closeButton = document.getElementById("closeButton");
    const equationWindow = document.getElementById("equationWindow");


    //Gambiarra para os objetos estarem em cima do html, mas ter um fundo branco ao invés do background do threejs
    const planeGeometry = new THREE.PlaneGeometry(6, 4); // Width, height

    // Create a white material
    const whiteMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff }); // White color

    // Create a mesh using the geometry and material
    const whitePlane = new THREE.Mesh(planeGeometry, whiteMaterial);

    whitePlane.position.x = -4.5
    whitePlane.position.y = -2.7
    whitePlane.position.z = -0.1

    scene.add(whitePlane);

    whitePlane.visible = false;

    openButton.addEventListener("click", function() {
        openButton.classList.add("hidden");
        equationWindow.classList.remove("hidden");
        whitePlane.visible = true;

        console.log(equationWindow.children[1])
        
        comutatividade(equationWindow.children[1].children[1], equationWindow.children[1].children[7])

        for(const child of equationWindow.children[2].children){
          if(child.identity) createBracket(child)
        }
    });

    closeButton.addEventListener("click", function() {
        openButton.classList.remove("hidden");
        equationWindow.classList.add("hidden");
        whitePlane.visible = false;
    });
});