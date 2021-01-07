// These top three imports are for generating a .JSON file with the ability's data structure.
// I'll want to rewrite these imports once I get the Effects portion of the engine packages up.
import { EngineObject } from '../engine/effects/effectTypes.js';
import { EffectData } from '../engine/effects/effectDataTypes.js';
import { Effect } from '../engine/effects/effectHandling.js';
import { InjectReferences } from '../engine/effects/injectReferences.js';

// Start by implementing Guts
// Event emitted by CalcDamageMuli?
// Nah, can use a similar system to manage other multipliers

export class Ability {
    owner: EngineObject;
    name: string;
    effects: Array<Effect>;

    constructor(owner: EngineObject, name : string, effects : Array<EffectData>) {
      this.owner = owner;
      this.name = name;
      InjectReferences(effects, owner);
      this.effects = effects.map(element => new Effect(element.effectType,
        element.appliesTo,
        element.conditions));
    }
}
