// These top three imports are for generating a .JSON file with the ability's data structure.

import * as Effect from '../engine/effects/effectHandling.js';

// Start by implementing Guts
// Event emitted by CalcDamageMuli?
// Nah, can use a similar system to manage other multipliers

export class Ability {
    owner: Effect.EngineObject;
    name: string;
    effects: Array<Effect.Effect>;

    constructor(owner: Effect.EngineObject, name : string, effects : Array<Effect.EffectInfo>) {
      this.owner = owner;
      this.name = name;
      Effect.InjectReferences(effects, owner)
      this.effects = effects.map(element => new Effect.Effect(element.effectType,
        element.appliesTo,
        element.conditions));
    }
}
