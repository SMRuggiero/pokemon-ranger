/* eslint-disable max-classes-per-file */

type InjectableProperty<T> = string | T;

export type EngineHookTarget = string;
// Placeholder type
export interface EngineObject {
    isEngineComponent : boolean;
}


export type Subject = EngineHookTarget | EngineObject;

export type EffectInfo = {
    effectType : string,
    appliesTo : Subject;
    priority : number | null,
    conditions : Array<EffectConditionArgs>
}

function hasOwnProperty<X extends {}, Y extends PropertyKey>(obj: X, prop: Y): obj is X & Record<Y, unknown> {
    return obj.hasOwnProperty(prop);
}

const TARGET_PROPERTIES = ['subject', 'appliesTo'] as const;
type TargetProperty = typeof TARGET_PROPERTIES[number];
const RECURSION_PROPERTIES = ['conditions', 'propertyConditions', 'existenceCondition'] as const;
type RecursionProperty = typeof RECURSION_PROPERTIES[number];


// Unused at the moment. Usable later?
class Injectable {

    proxyValue : EngineHookTarget;

    constructor(proxyValue : EngineHookTarget) {
        this.proxyValue = proxyValue;
    }

    checkInject(otherReferences : Array<[EngineHookTarget, EngineObject]> = []) : boolean | EngineObject{
        if (typeof this.proxyValue === 'string' && this.proxyValue === "owner") return true;
        
        for (let i = 0; i < otherReferences.length; i += 1) {
            const element =  otherReferences[i];
            if (element[0] === this.proxyValue) return element[1];
            
        }
        
        return false;
    }

    injectPrimative() : EngineHookTarget {
        return this.proxyValue;
    }

    toJSON(){
        return this.proxyValue;
    }

}

/*
class Injector{
  injectableRegistry : Array<Injectable>

  constructor() {
    this.injectableRegistry = [];
  }

  InjectReferences(owner : EngineObject, otherReferences : Array<EngineObject> = []){

  }

}
*/





export function InjectReferences(effectDataStructure : Array<EffectInfo | EffectConditionArgs | SPTConstructorArgs>, owner : EngineObject, otherReferences : Array<EngineObject> = []
    ) : Array<EffectInfo | EffectConditionArgs | SPTConstructorArgs>{
    // This function recursively replaces the string 'owner' with a reference to the effect owner.
    // This function may be expanded to inject other references if development needs it.
    
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
                InjectReferences(effectDataElement[recursionCheckProp] as Array<EffectInfo | EffectConditionArgs | SPTConstructorArgs>, owner, otherReferences)
            }
        }    
    }

    return effectDataStructure as Array<EffectInfo | EffectConditionArgs | SPTConstructorArgs>
}

export class Effect {
    effectType : string;
    appliesTo : Subject;
    // Priority will be handled by the relevant effects
    // priority : number | null;
    conditions : Array<EffectConditions>
    existenceCondition : 'inherent' | Array<EffectConditions>;

    constructor(effectType : string, appliesTo : Subject, conditions : Array<EffectConditionArgs>, existenceCondition : 'inherent' | Array<EffectConditionArgs> = 'inherent') {
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



export type EffectConditionArgs = {
    subject: Subject;
    subjectConditions: Array<SPTConstructorArgs>;
}

export class EffectConditions {
    subject : Subject;
    subjectConditions : Array<SubjectPropertyTruths>;

    constructor(subject : Subject, subjectTruths : Array<SPTConstructorArgs>) {
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

export type TruthValues = {
    truthy : Array<string | boolean | null> | Array<Array<string | boolean | null>>;
    falsy : Array<string | boolean | null> | Array<Array<string | boolean | null>>;
}

export type SPTConstructorArgs = {
    property: string | Array<string>;
    truthValues: TruthValues;
    existenceCondition: 'inherent' | Array<EffectConditionArgs>;
}

export class SubjectPropertyTruths {
    property : string | Array<string>;
    truthValues : TruthValues;
    existenceCondition : string | Array<EffectConditions>;

    constructor(property : string | Array<string>, truthValues : TruthValues, existenceCondition : 'inherent' | Array<EffectConditionArgs> = 'inherent') {
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
