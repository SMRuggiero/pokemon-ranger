import { EngineObject, Subject } from './effectTypes.js'
import { EffectData, EffectConditionData, TruthValues, SubjectPropertyData } from './effectDataTypes.js'

/* eslint-disable max-classes-per-file */

//type InjectableProperty<T> = string | T;



function hasOwnProperty<X extends {}, Y extends PropertyKey>(obj: X, prop: Y): obj is X & Record<Y, unknown> {
    return obj.hasOwnProperty(prop);
}

const TARGET_PROPERTIES = ['subject', 'appliesTo'] as const;
type TargetProperty = typeof TARGET_PROPERTIES[number];
const RECURSION_PROPERTIES = ['conditions', 'propertyConditions', 'existenceCondition'] as const;
type RecursionProperty = typeof RECURSION_PROPERTIES[number];


export function InjectReferences(effectDataStructure : Array<EffectData | EffectConditionData | SubjectPropertyData>, owner : EngineObject, otherReferences : Array<EngineObject> = []
    ) : Array<EffectData | EffectConditionData | SubjectPropertyData>{
    // This function recursively replaces the string 'owner' with a reference to the effect owner.
    // This function will be expanded to inject other references upon core development.
    
    const targetProperties: TargetProperty[] = ['subject', 'appliesTo'];
    const recurOn: RecursionProperty[] = ['conditions', 'propertyConditions', 'existenceCondition']; //as Array<keyof EffectInfo | keyof EffectConditionArgs | keyof SPTConstructorArgs>;

    for (let i = 0; i < effectDataStructure.length; i += 1) {
        const effectDataElement = effectDataStructure[i]
        for (let j = 0; j < targetProperties.length; j += 1) {
            const targetProperty = targetProperties[j];
            if (hasOwnProperty(effectDataElement, targetProperty)){
                if (effectDataElement[targetProperty] === 'owner'){
                    effectDataElement[targetProperty] = owner;
                }
            }
        }
        for (let k = 0; i < recurOn.length; i += 1) {
            const recursionCheckProp = recurOn[k];
            if (hasOwnProperty(effectDataElement, recursionCheckProp)){
                InjectReferences(effectDataElement[recursionCheckProp] as Array<EffectData | EffectConditionData | SubjectPropertyData>, owner, otherReferences)
            }
        }    
    }

    return effectDataStructure as Array<EffectData | EffectConditionData | SubjectPropertyData>
}

export class Effect {
    effectType : string;
    appliesTo : Subject;
    // Priority will be handled by the relevant effects
    // priority : number | null;
    conditions : Array<EffectConditions>
    existenceCondition : 'inherent' | Array<EffectConditions>;

    constructor(effectType : string, appliesTo : Subject, conditions : Array<EffectConditionData>, existenceCondition : 'inherent' | Array<EffectConditionData> = 'inherent') {
      this.effectType = effectType;
      this.appliesTo = appliesTo;

      //this.priority = priority;

      this.conditions = conditions.map(value => new EffectConditions(value.subject, value.subjectConditions));
      
      // 'inherent' means this condition will always exist as long as the effect source exists on its owner (ability, item, etc.)
      // When the effect is removed from the owner, this.existenceCondition will be set to []
      // Other effect sources can dynamically add conditions to effects, and existenceConditions will determine whether to remove this.
      // Force this to always be 'inherent' if string?
      this.existenceCondition = (typeof existenceCondition === 'string') ? existenceCondition : existenceCondition.map(value => new EffectConditions(value.subject, value.subjectConditions));
    }
}

export class EffectConditions {
    subject : Subject;
    subjectConditions : Array<SubjectPropertyTruths>;

    constructor(subject : Subject, subjectTruths : Array<SubjectPropertyData>) {
      this.subject = subject;
      this.subjectConditions = subjectTruths.map(value => new SubjectPropertyTruths(value.property,
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



export class SubjectPropertyTruths {
    property : string | Array<string>;
    truthValues : TruthValues;
    existenceCondition : string | Array<EffectConditions>;

    constructor(property : string | Array<string>, truthValues : TruthValues, existenceCondition : 'inherent' | Array<EffectConditionData> = 'inherent') {
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

      // 'inherent' means this condition will always exist as long as the effect source exists on its owner (ability, item, etc.)
      // Other effect sources can dynamically add conditions to effects, and existenceConditions will determine whether to remove this.
      // Force this to always be 'inherent' if string?
      this.existenceCondition = (typeof existenceCondition === 'string') ? existenceCondition : existenceCondition.map(value => new EffectConditions(value.subject, value.subjectConditions));
    }
}
