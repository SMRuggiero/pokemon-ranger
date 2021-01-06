/* eslint-disable max-classes-per-file */

export type EffectInfo = {
    effectType : string,
    appliesTo : string,
    priority : number | null,
    conditions : Array<EffectConditionArgs>
}

export class EffectDeclaration {
    effectType : string;
    appliesTo : string;
    priority : number | null;
    conditions : Array<EffectConditions>
    existenceCondition : string | Array<EffectConditions>;

    constructor(effectType : string, appliesTo : string, priority : number | null = null, conditions : Array<EffectConditionArgs>, existenceCondition : string | Array<EffectConditionArgs> = 'inherent') {
      this.effectType = effectType;
      this.appliesTo = appliesTo;

      this.priority = priority;

      this.conditions = conditions.map(value => new EffectConditions(value.subject, value.propertyConditions));
      this.existenceCondition = (typeof existenceCondition === 'string') ? existenceCondition : existenceCondition.map(value => new EffectConditions(value.subject, value.propertyConditions));
    }
}

// Placeholder type
interface EngineObject {
    isEngineComponent : boolean;
}
export type Subject = string | EngineObject;
export type EffectConditionArgs = {
    subject: Subject;
    propertyConditions: Array<SPTConstructorArgs>;
}

export class EffectConditions {
    subject : Subject;
    subjectConditions : Array<SubjectPropertyTruths>;

    constructor(subject : Subject, propertyTruths : Array<SPTConstructorArgs>) {
      this.subject = subject;
      this.subjectConditions = propertyTruths.map(value => new SubjectPropertyTruths(value.property,
        value.truthValues,
        value.existenceCondition));
      /*: [{
                property : "persistentStatus",
                truthValue : {
                    truthy : [],
                    //Gen5
                    falsy : [null, "frozen"]
                },
                existenceCondition : "inherent" //Maybe true could work here
            }]
        } */
    }
}

export type TruthValues = {
    truthy : Array<string | boolean | null> | Array<Array<string | boolean | null>>;
    falsy : Array<string | boolean | null> | Array<Array<string | boolean | null>>;
}

export type SPTConstructorArgs = {
    property: string | Array<string>;
    truthValues: TruthValues;
    existenceCondition: string | Array<EffectConditionArgs>;
}

export class SubjectPropertyTruths {
    property : string | Array<string>;
    truthValues : TruthValues;
    existenceCondition : string | Array<EffectConditions>;

    constructor(property : string | Array<string>, truthValues : TruthValues, existenceCondition : string | Array<EffectConditionArgs> = 'inherent') {
      this.property = property;
      
      this.truthValues = {
        truthy: truthValues.truthy,
        // If none are false (or there are none), then property condition evaluates to true.
        // If the property doesn't exist on the subject, and truthy is empty,
        // the condition is true (conditions for truth are satisfied, and CANT be negated by falsy).
        // If the property doesn't exist on the subject, and truthy is not empty,
        // the condition is false.
        falsy: truthValues.falsy,
        // If any are true, then property condition is ALWAYS false.
      };

      // Force this to always be 'inherent' if string?
      this.existenceCondition = (typeof existenceCondition === 'string') ? existenceCondition : existenceCondition.map(value => new EffectConditions(value.subject, value.propertyConditions));
    }
}
