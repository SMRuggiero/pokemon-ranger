// These top three imports are for generating a .JSON file with the ability's data structure.
// Here be debugging stuff
/* eslint-disable */
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { openSync, readFileSync, closeSync, writeSync } from 'fs';
/* eslint-enable */

import { Ability } from './ability.js';
// import * as Effect from '../engine/effects/effectHandling.js';
import { EffectConditionData, EffectData, SubjectPropertyData } from '../engine/effects/effectDataTypes.js';
import { EngineObject } from '../engine/core/engineState.js'

// SPTConstructorTuple = [string | Array<string>, TruthValues, string | ConditionInfoTuples]

// const subjectPropertyTruths = [];

// ConditionInfoTuples = Array<[Subject, Array<SPTConstructorTuple>]>

const ownerConditions : SubjectPropertyData = {
  property: 'persistentStatus',
  truthValues: {
    truthy: [],
    falsy: [null, 'frozen'], // Gen5
  },
  existenceCondition: 'inherent',
};

const moveConditions : SubjectPropertyData = {
  property: 'calcStats',
  truthValues: {
    truthy: [['attack', true]],
    falsy: [],
  },
  existenceCondition: 'inherent', // Maybe true could work here
};

const conditionInfo : Array<EffectConditionData> = [
  {
    subject: 'owner',
    subjectConditions: [ownerConditions],
  }, {
    subject: 'move',
    subjectConditions: [moveConditions],
  },
];

const effectInfo : EffectData = {
  effectType: 'damageMuli',
  appliesTo: 'owner',
  priority: null,
  conditions: conditionInfo,
};

// Here be debugging stuff
/* eslint-disable */


const dummyOwner : EngineObject = {
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
