import * as THREE from 'three';

//Como a lógica geral é só pegar dois lados, seno, cosseno e tangente só mudam o get
export class TrigOnHover {

    constructor(triangulo, angulo){
        this.triangulo = triangulo;
        this.angulo = angulo;
    }

    getHipotenusa(){

        const getLength = (cilindro) => (cilindro)? cilindro.getLength() : 0;

        const Hipotenusa = this.triangulo.edges.reduce((
            edge, longest) => (getLength(edge) < getLength(longest))? longest : edge, 
            null
        );

        return Hipotenusa;
    }

    getAdjacente(){
        
        const Hipotenusa = this.getHipotenusa();

        const indice = this.angulo.index;

        const anterior = this.triangulo.edges[(indice+2)%3];

        const adjacente = [this.triangulo.edges[(indice+1)%3], anterior].filter(lado => lado != Hipotenusa)

        return adjacente[0];
    }

    getOposto(){
        const indice = this.angulo.index;

        const proximo = indice;

        const oposto = this.triangulo.edges[proximo];

        return oposto;
    }

    //Só mudando esse daqui dá para instanciar seno,cosseno e tangente
    getRatio(){

        //retorna o lado dividendo e o lado divisor
        return this.dividendo().getLength()/this.divisor().getLength();
    }

    addToScene(scene){
        this.scene = scene;
        return this;
    }

    createProp(){
        //Cria uma visualização para o seno como uma animação
        //Inicialmente pensando em adicionar uma transição que pega o cateto oposto e translada ele
        //para a parte direita da tela, com cor (azul?) e fazer o mesmo para a hipotenusa(vermelha?)
        //assim, vai ter uma superposição dos dois lados esticados verticalmente, podendo fazer uma razão geométrica
    }

    onHover(isInside){
        //muda a cor das aréstas do triângulo utilizadas no seno
        //Vermelho hipotenusa, azul o cateto oposto
        //Adicionar nomes dos catetos?

        //divisor.material = new MeshBasicMaterial({color:0xff0000})
        //dividendo.material = new MeshBasicMaterial({color:0x0000ff})

        const dividendo = this.dividendo();
        const divisor   = this.divisor();

        if(isInside){

            this.memory = [dividendo.material, divisor.material];

            dividendo.material = new THREE.MeshBasicMaterial({color:0x0000aa});
            divisor.material   = new THREE.MeshBasicMaterial({color:0x880000});
        }
        else if(this.memory){
            dividendo.material = this.memory[0];
            divisor.material   = this.memory[1];
        }
    }

    update(){
        this.dividendo().update();
        this.divisor().update();
    }
}

export class SenoOnHover extends TrigOnHover{

    dividendo(){
        return this.getOposto();
    }

    divisor(){
        return this.getHipotenusa()
    }
}

export class CossenoOnHover extends TrigOnHover{

    dividendo(){
        return this.getAdjacente();
    }

    divisor(){
        return this.getHipotenusa()
    }
}

export class TangenteOnHover extends TrigOnHover{

    dividendo(){
        return this.getOposto();
    }

    divisor(){
        return this.getAdjacente();
    }
}


//Classe para criar isoceles
//Recebe um vértice para ser o pivô, ou seja, seu ângulo permanece o mesmo
//No entanto, os outros dois são distorcidos de modo a tornar o triângulo isóceles com o menor esforço possível
//Possível animação? Tipo, uma linha pontilhada como a bissetriz do ângulo indo do vértice até a nova aresta oposta?
//Transição fluida entre as posições dos vértices, loop de animação
class CreateIsoceles{

    constructor(triangulo){
        this.triangulo = triangulo;
    }
}

//Classe para desenhar um círculo que contem todos os vértices do triângulo
//Possivelmente criar outro prop círculo?
//Poder criar uma binding que força o triângulo a ficar restringido aos pontos do círculo?
//Animação com um modelo de compasso para tracejar em passos o contorno do círculo
class UnitCircle{
    constructor(triangulo){
        this.triangulo = triangulo;
    }
}

//Uma classe para criar um novo triângulo manualmente, a partir de inputs do usuário
class trianguloConstructor{
    
}


//Ideia: possibilidade de mudar plano de fundo para uma situação específica
//Imagine que tem um determinado problema para determinar a sombra de um prédio de altura H sabendo que
//a sombra de um poste de altura h tem comprimento l
//Coloca essa imagem do prédio como plano de fundo, desenha o triângulo fincando dois pontos no prédio e deixando o outro livre
//A sombra do poste vai ter um ângulo dado, o usuário vai poder mecher no vertice livre até o ângulo da sombra do prédio ficar proxima o suficiente

//          |#######|0
//          |       |  \
//          |       |   \
//          |Prédio |    \
//          |       |     \                 I0\
//          |       |sombra\                I  \
//          |       |       \               I   \
//          |       |0  <=== O ===>         I0   0    ângulo theta
//##################################################################################################################

//O = vértice móvel
//0 = vértice fixo
//<=== ===> = direções de movimento


//Transição entre a animação 3d do modelo do prédio com a visualização 3d


//Ideia: um texto do problema iterativo, no estilo de um puzzle. 
//As palavras chave poderiam brilhar onHover e criar uma visualização do problema