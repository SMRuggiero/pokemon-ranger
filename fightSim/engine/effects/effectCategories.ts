import { EffectConditions } from './effectHandling.js';
import { EffectConditionData } from './effectDataTypes.js';
import { Subject } from './effectTypes.js';
import { EngineState, EngineObject } from '../core/engineState.js'

export interface EffectType{

}

//export type EngineState




/*
function DamageMulti(moveContext : EngineState, attacker : EngineObject, defender : EngineObject) {

  const stab = attacker.type.reduce(
      (stabAccum, currentType) => { return (currentType === this.type) ? this.stabMulti : stabAccum },
      1.0);
  console.log(stab);
  const typeEffect = defender.type.reduce(
      (typeEffectAccum, currentType) => { return typeEffectAccum * this.typeMatrix[typeEnumerator[this.type]][typeEnumerator[currentType]] },
      1.0);
  console.log(typeEffect);

  return [moveContext.random, stab, typeEffect]
}

EngineDamageMulti = RegisterEngineCall('DamageMutli', ,)
*/



export class ConditionAdder implements EffectType{
  target : string | Subject;
  addedConditions : Array<EffectConditions>;

  constructor(target : string | Subject, addedConditions : Array<EffectConditionData>) {
    // target might need a more indepth implementation
    this.target = target;
    this.addedConditions = addedConditions.map(value => new EffectConditions(value.subject, value.subjectConditions));
  }
}
