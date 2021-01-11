import { Move } from './moveClasses.js'
import { FetchMoveByName, PokemonData } from './dataFetchers.js'
import { Ability } from './abilities/ability.js'
import { EngineObject } from './engine/core/engineState.js'
import { MoveContext, BaseStatName, CombatStatName, NatureStat } from './simTypes.js'
//import { matrix, setCartesian}
//import { CartesianProduct } from 'js-combinatorics/umd/combinatorics'


export class Pokemon implements EngineObject {
    IVs: StatBlock;

    EVs : StatBlock;

    baseStats : StatBlock;

    nature : StatBlock;

    generation : number;

    level : number;

    // either [type] or [type, type]
    type : Array<string | null>;

    pokeName : string;

    //**** me abilities will be annoying to implement
    //ability : Ability;
    ability : string | null
    item : string | null;

    actualStats : StatBlock;

    //Implement Move Fetcher
    moves : Array<Move|null>;


    currentHp : number;
    persistentStatus : string | null;
    temporaryStatus : Array<string>;

    battleStages : BattleStageManager;

    isEngineComponent : boolean;

    constructor(pokeJSON : PokemonData) {
        //this.IVs = new StatBlock([0, 31], [0, 31], [0, 31], [0, 31], [0, 31], [0, 31]);

        //let pokeData = JSON.parse(pokeJson);

        this.IVs = new StatBlock(pokeJSON.IVs.hp, 
            pokeJSON.IVs.attack, 
            pokeJSON.IVs.defense, 
            pokeJSON.IVs.specialAttack,
            pokeJSON.IVs.specialDefense,
            pokeJSON.IVs.speed);

        this.EVs = new StatBlock(pokeJSON.EVs.hp,
            pokeJSON.EVs.attack,
            pokeJSON.EVs.defense,
            pokeJSON.EVs.specialAttack,
            pokeJSON.EVs.specialDefense,
            pokeJSON.EVs.speed);

        this.baseStats = new StatBlock(pokeJSON.baseStats.hp,
            pokeJSON.baseStats.attack,
            pokeJSON.baseStats.defense,
            pokeJSON.baseStats.specialAttack,
            pokeJSON.baseStats.specialDefense,
            pokeJSON.baseStats.speed);

        this.nature = new StatBlock(1,
            pokeJSON.nature.attack,
            pokeJSON.nature.defense,
            pokeJSON.nature.specialAttack,
            pokeJSON.nature.specialDefense,
            pokeJSON.nature.speed);

        this.generation = pokeJSON.generation

        this.level = pokeJSON.level;
        // either [type] or [type, type]
        this.type = pokeJSON.type

        this.pokeName = pokeJSON.pokeName

        //**** me abilities will be annoying to implement
        this.ability = pokeJSON.ability;
        this.item = pokeJSON.item;

        this.actualStats = new StatBlock(this.CalcHP(this.generation),
            this.CalcStat(this.generation, 'attack'),
            this.CalcStat(this.generation, 'defense'),
            this.CalcStat(this.generation, 'specialAttack'),
            this.CalcStat(this.generation, 'specialDefense'),
            this.CalcStat(this.generation, 'speed'));

        //Implement Move Fetcher
        this.moves = [(pokeJSON.moves[0] === null)? null : new Move(FetchMoveByName(pokeJSON.moves[0], this.generation)),
            (pokeJSON.moves[1] === null)? null : new Move(FetchMoveByName(pokeJSON.moves[1], this.generation)),
            (pokeJSON.moves[2] === null)? null : new Move(FetchMoveByName(pokeJSON.moves[2], this.generation)),
            (pokeJSON.moves[3] === null)? null : new Move(FetchMoveByName(pokeJSON.moves[3], this.generation))];


        this.currentHp = this.actualStats['hp'];
        this.persistentStatus = pokeJSON.persistentStatus;
        this.temporaryStatus = [];

        this.battleStages = new BattleStageManager(this.generation);

        //future stuff?
        //back calc IVs from user input
        //EV routing implementation?
        this.isEngineComponent = true;

    };

    EffectiveStat(stat : NatureStat) {
        //I'm assuming this is floored.
        return Math.floor(this.actualStats[stat] * this.battleStages[stat].statMultiplier)
    };

    CalcStat(generation : number, stat : BaseStatName) {
        switch (generation) {

            case 1:
                if (stat === 'specialDefense') throw new RangeError("Gen I doesn't have specialDefense as a stat.");
            case 2:
                return Math.floor(((this.baseStats[stat] + this.IVs[stat]) * 2 + Math.floor(Math.ceil(Math.sqrt(this.EVs[stat])) / 4)) * this.level / 100) + 5;

            default:
                return Math.floor((Math.floor((2 * this.baseStats[stat] + this.IVs[stat] + Math.floor(this.EVs[stat] / 4)) * this.level / 100) + 5) * this.nature[stat]);
        };

        /* // Stuff for working with multiple level/IV/etc. values
        const level = this.level;
        const baseStat = this.baseStats[stat];
        const IV = this.IVs[stat];
        const EV = this.EVs[stat];
        const nature = this.nature[stat];

        
        let statFunc;

        switch (generation) {

            case 1:
                if (stat === 'specialDefense') throw new RangeError("Gen I doesn't have specialDefense as a stat.");
            case 2:
                statFunc = (base, IV, EV, level, nature) => {
                            return Math.floor(((base + IV) * 2 + Math.floor(Math.ceil(Math.sqrt(EV)) / 4)) * level / 100) + 5;
                        };

            default:
                
                statFunc = (base, IV, EV, level, nature) =>{
                            return Math.floor((Math.floor((2 * base + IV + Math.floor(EV / 4)) * level / 100) + 5) * nature);
                };
        };
        //
        if (this.baseStats.propertyType[stat] +
            this.baseStats.propertyType[stat] +
            this.baseStats.propertyType[stat] +
            this.baseStats.propertyType[stat] + 
            (Array.isArray(this.level) ? 1 : 0) === 0){ 
                
        };
        */
    };

    CalcHP(generation : number) : number {
        switch (generation) {

            case 1:
            case 2:
                return Math.floor(((this.baseStats['hp'] + this.IVs['hp']) * 2 + Math.floor(Math.ceil(Math.sqrt(this.EVs['hp'])) / 4)) * this.level / 100) + this.level + 10;

            default:
                return Math.floor((2 * this.baseStats['hp'] + this.IVs['hp'] + Math.floor(this.EVs['hp'] / 4)) * this.level / 100) + this.level + 10;
        };

    };

    RecalcStats() {
        this.actualStats['hp'] = this.CalcHP(this.generation);
        this.actualStats['attack'] = this.CalcStat(this.generation, 'attack');
        this.actualStats['defense'] = this.CalcStat(this.generation, 'defense');
        this.actualStats['specialAttack'] = this.CalcStat(this.generation, 'specialAttack');
        this.actualStats['specialDefense'] = this.CalcStat(this.generation, 'specialDefense');
        this.actualStats['speed'] = this.CalcStat(this.generation, 'speed');

    };

    ApplyDamage(moveContext : MoveContext, damage : number) {
        //Here's where we can check for certain ability/item triggers. When that is set up at least.

        this.currentHp -= damage;
        console.log(damage.toString() + ' damage was dealt!')

        if (this.currentHp <= 0) {
            this.currentHp = 0
            if (this.pokeName) {
                console.log(this.pokeName + ' has fainted!')
            } else {
                console.log('A Pokemon has fainted!');
            };
        };
    };
};
/*
interface PokeJSON{

    IVs


}
*/

class StatBlock {
    _hp : number;
    _attack : number;
    _defense : number;
    _specialAttack : number;
    _specialDefense : number;
    _speed : number;
    monitor : boolean;
    updatedProperty : [number, number, number, number, number, number];
    propertyType : {
        hp : number;
        attack : number;
        defense : number;
        specialAttack : number;
        specialDefense : number;
        speed : number;

    }

    /*
    constructor(hp, attack, defense, specialAttack, specialDefense, speed) {
        this.hp = hp;
        this.attack = attack;
        this.defense = defense;
        this.specialAttack = specialAttack;
        this.specialDefense = specialDefense;
        this.speed = speed;
    };*/

    constructor(hp : number, attack : number, defense : number, specialAttack : number, specialDefense : number, speed : number, monitorPropertyType : boolean = false) {
        this._hp = hp;
        this._attack = attack;
        this._defense = defense;
        this._specialAttack = specialAttack;
        this._specialDefense = specialDefense;
        this._speed = speed;
        this.monitor = monitorPropertyType;
        this.updatedProperty = [0,0,0,0,0,0];
        this.propertyType = {hp : Array.isArray(this._hp) ? 1 : 0,
                            attack : Array.isArray(this._attack) ? 1 : 0,
                            defense : Array.isArray(this._defense) ? 1 : 0,
                            specialAttack : Array.isArray(this._specialAttack) ? 1 : 0,
                            specialDefense : Array.isArray(this._specialDefense) ? 1 : 0,
                            speed : Array.isArray(this._speed) ? 1 : 0}; //0 for scalar, 1 for array
    };

    get hp(){
        return this._hp
    };

    set hp(val){
        if (val === this._hp) return;
        
        if (Array.isArray(val)) {
            if (val.length === 1) {
                val = val[0];
                this.propertyType['hp'] = 0    
            } else {
                this.propertyType['hp'] = 1
            }
        } else {
            this.propertyType['hp'] = 0
        }

        if (this.monitor) this.updatedProperty[0] = 1;

        this._hp = val;
    };

    get attack(){
        return this._attack
    };

    set attack(val){
        if (val === this._attack) return;
        
        if (Array.isArray(val)) {
            if (val.length === 1) {
                val = val[0];
                this.propertyType["attack"] = 0    
            } else {
                this.propertyType["attack"] = 1
            }
        } else {
            this.propertyType["attack"] = 0
        }

        if (this.monitor) this.updatedProperty[1] = 1;

        this._attack = val;
    };

    get defense(){
        return this._hp
    };

    set defense(val){
        if (val === this._defense) return;
        
        if (Array.isArray(val)) {
            if (val.length === 1) {
                val = val[0];
                this.propertyType['defense'] = 0    
            } else {
                this.propertyType['defense'] = 1
            }
        } else {
            this.propertyType['defense'] = 0
        }

        if (this.monitor) this.updatedProperty[2] = 1;

        this._defense = val;
    };

    get specialAttack(){
        return this._specialAttack
    };

    set specialAttack(val){
        if (val === this._specialAttack) return;
        
        if (Array.isArray(val)) {
            if (val.length === 1) {
                val = val[0];
                this.propertyType['specialAttack'] = 0    
            } else {
                this.propertyType['specialAttack'] = 1
            }
        } else {
            this.propertyType['specialAttack'] = 0
        }

        if (this.monitor) this.updatedProperty[3] = 1;

        this._specialAttack = val;
    };

    get specialDefense(){
        return this._specialDefense
    };

    set specialDefense(val){
        if (val === this._specialDefense) return;
        
        if (Array.isArray(val)) {
            if (val.length === 1) {
                val = val[0];
                this.propertyType['specialDefense'] = 0;
            } else {
                this.propertyType['specialDefense'] = 1
            }
        } else {
            this.propertyType['specialDefense'] = 0
        }

        if (this.monitor) this.updatedProperty[4] = 1;

        this._specialDefense = val;
    };

    get speed(){
        return this._speed
    };

    set speed(val){
        if (val === this._speed) return;
        
        if (Array.isArray(val)) {
            if (val.length === 1) {
                val = val[0];
                this.propertyType['speed'] = 0    
            } else {
                this.propertyType['speed'] = 1
            }
        } else {
            this.propertyType['speed'] = 0
        }

        if (this.monitor) this.updatedProperty[5] = 1;

        this._speed = val;
    };

};

class BattleStageManager {
    attack : StatStage;
    defense : StatStage;
    specialAttack : StatStage;
    specialDefense : StatStage;
    speed : StatStage;
    accuracy : EvAccStatStage;
    evasion : EvAccStatStage;

    constructor(generation : number) {
        this.attack = new StatStage(generation);
        this.defense = new StatStage(generation);
        this.specialAttack = new StatStage(generation);
        this.specialDefense = new StatStage(generation);
        this.speed = new StatStage(generation);
        this.accuracy = new EvAccStatStage(generation, false);
        this.evasion = new EvAccStatStage(generation, true);

    };

    ResetStages() {
        this.attack.stage = 0;
        this.defense.stage = 0;
        this.specialAttack.stage = 0;
        this.specialDefense.stage = 0;
        this.speed.stage = 0;
        this.accuracy.stage = 0;
        this.evasion.stage = 0;
    }
    
};


class StatStage {
    _stage : number;
    multiplierMap : [number, number, number, number, number, number, number, number, number, number, number, number, number]

    constructor(generation : number) {
        this._stage = 0;
        if (generation < 3) {
            this.multiplierMap = [25 / 100, 28 / 100, 33 / 100, 40 / 100, 50 / 100, 66 / 100, 1, 150 / 100, 200 / 100, 250 / 100, 300 / 100, 350 / 100, 400 / 100];
        } else {
            this.multiplierMap = [2 / 8, 2 / 7, 2 / 6, 2 / 5, 2 / 4, 2 / 3, 2 / 2, 3 / 2, 4 / 2, 5 / 2, 6 / 2, 7 / 2, 8 / 2];
        };
    };

    get statMultiplier() {
        return this.multiplierMap[this.stage + 6]
    };

    set stage(val) {
        //force val to be within [-6, 6]
        this._stage = Math.min(6, Math.max(-6, val))
    };

    get stage() {
        return this._stage
    };
};


export class EvAccStatStage {
    _stage : number;
    multiplierMap : [number, number, number, number, number, number, number, number, number, number, number, number, number]
    isEvasion : boolean;
    generation : number;

    constructor(generation : number, isEvasion : boolean) {
        this._stage = 0

        this.isEvasion = isEvasion

        switch (generation) {
            case 1:
                this.multiplierMap = [25 / 100, 28 / 100, 33 / 100, 40 / 100, 50 / 100, 66 / 100, 1, 150 / 100, 200 / 100, 250 / 100, 300 / 100, 350 / 100, 400 / 100];
                break;
            case 2:
                this.multiplierMap = [33 / 100, 36 / 100, 43 / 100, 50 / 100, 60 / 100, 75 / 100, 1, 133 / 100, 166 / 100, 200 / 100, 233 / 100, 266 / 100, 300 / 100];
                break;
            case 3:
            case 4:
                this.multiplierMap = [33 / 100, 36 / 100, 43 / 100, 50 / 100, 60 / 100, 75 / 100, 1, 133 / 100, 166 / 100, 200 / 100, 250 / 100, 266 / 100, 300 / 100];
                break;
            default:
                this.multiplierMap = [3 / 9, 3 / 8, 3 / 7, 3 / 6, 3 / 5, 3 / 4, 3 / 3, 4 / 3, 5 / 3, 6 / 3, 7 / 3, 8 / 3, 9 / 3];
        };

        this.generation = generation

    };

    get statMultiplier() {
        if (this.generation > 2) throw new RangeError("Gen III and after should use EvAccStatStage.calcAccMultiplier().");
        return this.isEvasion ? this.multiplierMap[-this.stage + 6] : this.multiplierMap[this.stage + 6]
    };

    static calcAccMultiplier(moveContext : MoveContext, attackingPokemon : Pokemon, defendingPokemon : Pokemon) {
        if (moveContext.generation < 3) {

            return attackingPokemon.battleStages.accuracy.statMultiplier * defendingPokemon.battleStages.evasion.statMultiplier;

        } else {
            let stageSum = attackingPokemon.battleStages.accuracy.stage - defendingPokemon.battleStages.evasion.stage;
            //force stageSum to be within [-6, 6]
            stageSum = Math.min(6, Math.max(-6, stageSum))

            return attackingPokemon.battleStages.accuracy.multiplierMap[stageSum]
        }
        
    };

    set stage(val) {
        //force val to be within [-6, 6]
        this._stage = Math.min(6, Math.max(-6, val))
    };

    get stage() {
        return this._stage
    };
};


//class MoveManager {

//    constructor() {

//    };

//};

