// These top three imports are for generating a .JSON file with the ability's data structure.
// I'll want to rewrite these imports once I get the Effects portion of the engine packages up.
import { EngineObject } from '../engine/core/engineState.js'
import { EffectData } from '../engine/effects/effectDataTypes.js';
import { Effect, EffectParent, AbstractEffectParent, InstanceEffectParent } from '../engine/effects/effectHandling.js';
import { InjectReferences } from '../engine/effects/injectReferences.js';

// Start by implementing Guts
// Event emitted by CalcDamageMuli?
// Nah, can use a similar system to manage other multipliers

interface AbstractAbility {
  new(owner: EngineObject, objectName : string, effects : Array<EffectData>): InstanceAbility;
}

interface InstanceAbility extends InstanceEffectParent {
  //owner: EngineObject;
  objectName: string;  
  effects: Array<Effect>;
}

// let AbilityParent = EffectParent();

export const Ability : (base : AbstractEffectParent) => AbstractAbility = (base) => class<EffectReturn> extends base implements InstanceAbility {
    //owner: EngineObject;
    objectName: string;
    effects: Array<Effect<EffectReturn>>;

    constructor(owner: EngineObject, objectName : string, effects : Array<EffectData>) {
      super(owner, effects);
      // this.owner = owner;
      this.objectName = objectName;
      InjectReferences(effects, owner);
      this.effects = effects.map(element => new Effect<EffectReturn>(this.owner,
        element.effectType,
        element.appliesTo,
        element.conditions));
    }
}

/*
class Test extends Ability(EffectParent('Test')) {

  constructor(owner: EngineObject, effects : Array<EffectData>){
    super(owner, 'Test', effects);
  }
}

let test = {
  isEngineComponent : true
}

let testAbility = new Test(test, 'test', [])

testAbility.AddConditionToInstance()
*/
