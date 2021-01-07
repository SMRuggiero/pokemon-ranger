// These top three imports are for generating a .JSON file with the ability's data structure.
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { openSync, readFileSync, closeSync, writeSync } from 'fs';

import * as Effect from './effectHandling.js';

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
// SPTConstructorTuple = [string | Array<string>, TruthValues, string | ConditionInfoTuples]

// const subjectPropertyTruths = [];

// ConditionInfoTuples = Array<[Subject, Array<SPTConstructorTuple>]>

const ownerConditions : Effect.SPTConstructorArgs = {
  property: 'persistentStatus',
  truthValues: {
    truthy: [],
    falsy: [null, 'frozen'], // Gen5
  },
  existenceCondition: 'inherent',
};

const moveConditions : Effect.SPTConstructorArgs = {
  property: 'calcStats',
  truthValues: {
    truthy: [['attack', true]],
    falsy: [],
  },
  existenceCondition: 'inherent', // Maybe true could work here
};

const conditionInfo : Array<Effect.EffectConditionArgs> = [
  {
    subject: 'owner',
    subjectConditions: [ownerConditions],
  }, {
    subject: 'move',
    subjectConditions: [moveConditions],
  },
];

const effectInfo : Effect.EffectInfo = {
  effectType: 'damageMuli',
  appliesTo: 'owner',
  priority: null,
  conditions: conditionInfo,
};

// Here be debugging stuff
/* eslint-disable */


const dummyOwner : Effect.EngineObject = {
  isEngineComponent : false,
}

const guts = new Ability(dummyOwner, 'Guts', [effectInfo]);

/*
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const gutsString = JSON.stringify(guts);

const file = openSync(__dirname + '\\..\\gen5\\abilities\\Guts.json', 'w');
writeSync(file, gutsString);
closeSync(file);
*/
const debugDummy = 0;
