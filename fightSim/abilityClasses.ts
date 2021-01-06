import * as Effect from './effectHandling.js';
// Start by implementing Guts
// Event emitted by CalcDamageMuli?
// Nah, can use a similar system to manage other multipliers

export class Ability {
    owner: Effect.Subject;
    name: string;
    effects: Array<Effect.EffectDeclaration>;

    constructor(owner: Effect.Subject, name : string, effects : Array<Effect.EffectInfo>) {
      this.owner = owner;
      this.name = name;
      this.effects = effects.map(element => new Effect.EffectDeclaration(element.effectType,
        element.appliesTo,
        element.priority,
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
    propertyConditions: [ownerConditions],
  }, {
    subject: 'move',
    propertyConditions: [moveConditions],
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

import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { openSync, readFileSync, closeSync, writeSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const guts = new Ability('null', 'Guts', [effectInfo]);

const gutsString = JSON.stringify(guts);

const file = openSync(__dirname + '\\..\\gen5\\abilities\\Guts.json', 'w');
writeSync(file, gutsString);
closeSync(file);
const debugDummy = 0;
