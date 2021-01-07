import { EffectConditions } from './effectHandling.js';
import { EffectConditionData } from './effectDataTypes.js';
import { Subject } from './effectTypes.js';
export type EffectType = DamageMuli | ConditionAdder;

export class DamageMuli {
  category : string;
  multiplier : number;

  constructor(category : string, multiplier : number) {
    // valid categories: Weather, Burn, Other
    // other categories exist, but they are handled entirely by the engine
    // All categories in order of application:
    // Targets -> Weather -> Badge -> Critical -> Random -> STAB -> Type -> Burn -> Other
    this.category = category;

    this.multiplier = multiplier;

  }

}

export class ConditionAdder {
  target : string | Subject;
  addedConditions : Array<EffectConditions>;

  constructor(target : string | Subject, addedConditions : Array<EffectConditionData>) {

    // target might need a more indepth implementation
    this.target = target;
    this.addedConditions = addedConditions.map(value => new EffectConditions(value.subject, value.subjectConditions));

  }

}