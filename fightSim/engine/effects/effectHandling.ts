import { Subject } from './effectTypes.js';
import { EffectConditionData, TruthValues, SubjectPropertyData } from './effectDataTypes.js';
import { dynamicReferences, DynamicReferences } from '../core/engineState.js'

// type InjectableProperty<T> = string | T;

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

      // this.priority = priority;

      this.conditions = conditions.map(value => new EffectConditions(value.subject, value.subjectConditions));
      
      // 'inherent' means this condition will always exist as long as the effect source exists on its owner (ability, item, etc.)
      // When the effect is removed from the owner, this.existenceCondition will be set to []
      // Other effect sources can dynamically add conditions to effects, and existenceConditions will determine whether to remove this.
      // Force this to always be 'inherent' if string?
      this.existenceCondition = (typeof existenceCondition === 'string') ? existenceCondition : existenceCondition.map(value => new EffectConditions(value.subject, value.subjectConditions));
    }
    
    CheckExistence() : -1 | 0 | 1 {

      // placeholder
      return 0
    }

    CheckConditions() : boolean{

      // placeholder
      return false
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

    CheckConditions() : boolean {
      for (let i = 0; i<this.subjectConditions.length; i += 1){
        let currentProp = this.subjectConditions[i].property;
        if (Array.isArray(currentProp)) {
          if (!(currentProp[0] in this.subject))
        }
      }
      // placeholder

      return false
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
