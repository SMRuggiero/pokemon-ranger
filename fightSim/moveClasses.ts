import { typeEnumerator, FetchTypeMatchup } from './typeMatrix.js';
import { NatureStat, MoveContext } from './simTypes.js'
import { Pokemon } from './pokeClasses.js'
import { MoveData } from './dataFetchers.js'

export class Move {
    category : string;

    calcStats : [NatureStat, NatureStat];
    type : string;
    maxPP : number;
    currentPP : number;
    power : number;
    accuracy : number;
    priority : number;
    contact : boolean;
    moveName : string;

    stabMulti : number;

    targeting :[[number, number, number],[number, number, number]];


    randomRolls : number;

    typeMatrix : Array<Array<number | null>>

    //constructor(category, type, maxPP, power, accuracy, priority, contact) {
    constructor(moveJSON : MoveData) {


        this.category = moveJSON.category;
        /* if (this.category === "physical") {
            this.calcStats = ['attack', 'defense']
        } else if (this.category === "special") {
            this.calcStats = ['specialAttack', 'specialDefense']
        } else {
            this.calcStats = [null, null]
        }; */
        this.calcStats = moveJSON.calcStats;
        this.type = moveJSON.type;
        this.maxPP = moveJSON.maxPP;
        this.currentPP = moveJSON.currentPP;
        this.power = moveJSON.power;
        this.accuracy = moveJSON.accuracy;
        this.priority = moveJSON.priority;
        this.contact = moveJSON.contact;
        this.moveName = moveJSON.moveName;

        this.stabMulti = moveJSON.stabMulti;

        //[[self, allyNear, allyFar], [enemyAcross, enemyNear, enemyFar]]
        this.targeting = moveJSON.targeting;

        //All of the random rolls will be fed to the move through
        //moveContext in class methods. Most moves need at least
        //three rolls, accuracyCheck, critCheck, damageRange
        this.randomRolls = moveJSON.randomRolls;

        //Just gonna assume gen 5 for now since that's the current priority target
        //Remove this when this.CalcDamageMultiplier() is updated.
        this.typeMatrix = FetchTypeMatchup(5);

    };

    UseMove(moveContext : MoveContext, attacker : Pokemon, defender : Pokemon) {
        if (this.currentPP <= 0) throw Error("Can't use a move at 0 PP!");
        this.currentPP -= 1


        if (this.category != 'status') {

            //To Hit here

            //const damage = this.CalcDamage(moveContext, attacker, defender)
            defender.ApplyDamage(moveContext, this.CalcDamage(moveContext, attacker, defender))
        };
        this.AdditionalEffect(moveContext, attacker, defender);
    };

    AdditionalEffect(moveContext : MoveContext, attacker : Pokemon, defender : Pokemon) {
        //move dependent implementation
        return
    };

    CalcDamage(moveContext : MoveContext, attacker : Pokemon, defender : Pokemon) {
        //implement Critical Calcs
        //  RaNdOmNeSs - move this roll into the moveContext to enable control of randomness (ie to methodically calculate all possible damage values)

        //  Pretty sure these are the two biggest sources of variance between fights (IVs and ranges)

        const statRatio = attacker.EffectiveStat(this.calcStats[0]) / defender.EffectiveStat(this.calcStats[1]);
        //const random = (85 + Math.random() * 16) / 100;

        const baseDamage = (Math.floor(Math.floor((Math.floor(0.4 * attacker.level) + 2) * this.power * statRatio) / 50) + 2)

        //might want to do some sort of .reduce call on an array of multis from this.CalcDamageMultiplier to better mimic damage calcs in game
        return this.CalcDamageMultipliers(moveContext, attacker, defender).reduce(
            (acc,currentMulti) => Math.floor(acc*currentMulti), 
            baseDamage);
    };

    CalcDamageMultipliers(moveContext : MoveContext, attacker : Pokemon, defender : Pokemon) {
        //Implement this.
        //Includes:
        //  Targets Gen III + : Gen III - 1 or 0.5, Gen IV+ 1 or 0.75
        //  Weather
        //  Badges (Gen II only)
        //  Crits
        //  STAB - done
        //  Type Effectiveness - Update this to have the typeMatrix be passed by moveContext
        //  Burn
        //  Other
        //
        
        
        const stab = attacker.type.reduce(
            (stabAccum, currentType) => { return (currentType === this.type) ? this.stabMulti : stabAccum },
            1.0);
        console.log(stab);
        const typeEffect = defender.type.reduce(
            (typeEffectAccum, currentType) => {
                if (currentType === null) return typeEffectAccum
                const typeMulti = this.typeMatrix[typeEnumerator[this.type]][typeEnumerator[currentType]];
                if (typeMulti === null) throw new Error('Either the move type or a defender type does not exist in this generation.');
                return typeEffectAccum * typeMulti;
            },
            1.0);
        console.log(typeEffect);

        return [stab, typeEffect]
    }

};