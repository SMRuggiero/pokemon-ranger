//The functions here are placeholders for pulling pokemon JSON data
//With my luck, anything I'd write would break upon contact with a browser

//console.log(process.cwd());
//console.log(__dirname);

import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { openSync, readFileSync, closeSync } from 'fs';
import { MoveContext, BaseStatName, CombatStatName, NatureStat } from './simTypes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log(__dirname);

export function FetchPokemonDataByName(pokeName : string, generation : number) : PokemonData {

    let filepath = __dirname + 'data/gen' + generation.toString() + '/pokemon/' + pokeName + '.json';
    let file ;
    try {
        file = openSync(filepath, 'r');

    } catch (error) {
        console.log(error.message);
        if (error.message === "ENOENT: no such file or directory, open '" + filepath + "'"){
            console.log(error.info);
            error.info = {
                pokeName : pokeName,
                generation : generation
            };
            console.log(error.info);
        };
        throw error
    };

    let data = readFileSync(file, 'utf8');
    closeSync(file);

    return JSON.parse(data) as PokemonData;
};

export function FetchMoveByName(moveName : string, generation : number) : MoveData {

    let filepath = __dirname + '/gen' + generation.toString() + '/moves/' + moveName + '.json';
    let file ;
    try {
        file = openSync(filepath, 'r');

    } catch (error) {
        console.log(error.message);
        if (error.message === "ENOENT: no such file or directory, open '" + filepath + "'"){
            console.log(error.info);
            error.info = {
                moveName : moveName,
                generation : generation
            };
            console.log(error.info);
        };
        throw error
    };

    let data = readFileSync(file, 'utf8');
    closeSync(file);

    return JSON.parse(data) as MoveData;
};


export interface PokemonData {
    IVs: {
        hp: number,
        attack: number,
        defense: number,
        specialAttack: number,
        specialDefense: number,
        speed: number
    },
    EVs: {
        hp: number,
        attack: number,
        defense: number,
        specialAttack: number,
        specialDefense: number,
        speed: number
    },
    baseStats: {
        hp: number,
        attack: number,
        defense: number,
        specialAttack: number,
        specialDefense: number,
        speed: number
    },
    nature: {
        attack: 0.9 | 1.0 | 1.1,
        defense: 0.9 | 1 | 1.1,
        specialAttack: 0.9 | 1 | 1.1,
        specialDefense: 0.9 | 1 | 1.1,
        speed: 0.9 | 1 | 1.1
    },
    generation: number,
    level: number,
    type: [
        string,
        string | null
    ]
    pokeName: string,
    ability: string | null,
    item: string | null,
    moves: [
        null | string,
        null | string,
        null | string,
        null | string
    ],
    persistentStatus: null
};

export interface MoveData {
    category: "physical" | "special" | "status",
    calcStats: [
        NatureStat,
        NatureStat
    ],
    type: string,
    maxPP: number,
    currentPP: number,
    power: number,
    accuracy: number,
    priority: number,
    contact: boolean,
    moveName: string,
    stabMulti: number,
    targeting: [
        [
            0 | 1 | 2,
            0 | 1 | 2,
            0 | 1 | 2
        ],
        [
            0 | 1 | 2,
            0 | 1 | 2,
            0 | 1 | 2
        ]
    ],
    randomRolls : number
}

const dummy = 0;