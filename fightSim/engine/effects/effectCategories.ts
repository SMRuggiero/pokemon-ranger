import { AbstractEffectParent, EffectConditions, EffectParentRegistry, SubjectPropertyTruths } from './effectHandling.js';
import { EffectConditionData } from './effectDataTypes.js';
import { Subject } from './effectTypes.js';
import { EngineState, EngineObject } from '../core/engineState.js'
import { EngineCallHandler, GenericEngineCall } from '../core/engineCall.js'

export interface EffectType<EffectReturn>{
  EffectFunction : () => EffectReturn;
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

interface TargetData{
  subject : Subject,
  property : string | Array<string>,
}

/*
interface Target{
  // subject is the EngineObject that has the targeted effect
  // property contains the keys to access where the Effect is located
  // subject : Subject,
  // property : string | Array<string>
}
*/

export class ConditionAdder<EffectReturn> implements EffectType<EffectReturn>{
  target : AbstractEffectParent<EffectReturn>;
  effectType : EffectType<EffectReturn>;
  addedConditions : Array<EffectConditions>;
  addingConditions : Array<EffectConditions>;

  constructor(target : string, addedConditions : Array<EffectConditionData>, addingConditions : Array<EffectConditionData>, effectType : string) {
    // target might need a more indepth implementation
    const targetObj = EffectParentRegistry.get(target);
    if(targetObj === undefined) throw new Error(`${target} not found in EffectParentRegistry`)
    this.target = targetObj;
    this.addedConditions = addedConditions.map(value => new EffectConditions(value.subject, value.subjectConditions));
    this.addingConditions = addingConditions.map(value => new EffectConditions(value.subject, value.subjectConditions));
    this.effectType = effectType;
    
  }

  EffectFunction(){

    this.addedConditions.map((condition) => this.target.AddConditionToClass(condition, this.addingConditions, this.effectType));

  }
}
