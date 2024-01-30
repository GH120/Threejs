import React, { useState } from 'react'

import './style.css'

import { FiLock } from "react-icons/fi";

function BotaoFase({faseSelec = 1, faseLib = true}) {

    const [liberada, setLiberada] = useState(faseLib);
    const [fase, setFase] = useState(faseSelec);

    return (
        <button onClick={() => setLiberada(!liberada)} className={liberada ? 'botao-fase' : 'botao-fase-cadeado'}>
            {liberada ? fase : <div className='encapsula-icone'><FiLock color="gray" fontSize="0.7em"/></div>}
        </button>
    )
}

export default BotaoFase