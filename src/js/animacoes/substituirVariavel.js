import MostrarTexto from "./MostrarTexto";
import { AnimacaoSequencial } from "./animation";

export const substituirVariavel = (variavel, valor) => 
    new AnimacaoSequencial(
        new MostrarTexto(variavel)
        .setValorFinal(100)
        .reverse()
        .setDuration(30)
        .setOnTermino(() => variavel.element.textContent = valor),
        new MostrarTexto(variavel)
        .setValorFinal(100)
        .setDuration(30)
    )
    .setCheckpointAll(false)
    
