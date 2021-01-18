import { EffectType } from './effectCategories.js';
import { Subject } from './effectTypes.js';

export type EffectData = {
  effectType : string | EffectType;
  appliesTo : Subject;
  priority : number | null;
  conditions : Array<EffectConditionData>;
  when : TimingData;
}

export type TimingData = 'immediate' | ['on' | 'after', string];

export type EffectConditionData = {
  subject: Subject;
  subjectConditions: Array<SubjectPropertyData>;
}

export type TruthValues = {
  truthy : Array<string | boolean | null> | Array<Array<string | boolean | null>>;
  falsy : Array<string | boolean | null> | Array<Array<string | boolean | null>>;
}

export type SubjectPropertyData = {
  property: string | Array<string>;
  truthValues: TruthValues;
  existenceCondition: 'inherent' | Array<EffectConditionData>;
}
