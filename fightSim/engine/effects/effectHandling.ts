import { Subject } from './effectTypes.js';
import { EffectConditionData, TruthValues, SubjectPropertyData, EffectData } from './effectDataTypes.js';
import { DynamicReference, EngineObject } from '../core/engineState.js'
import { EffectType } from './effectCategories.js';
import { GenericEngineCall, EngineCallHandler } from '../core/engineCall.js'

// type InjectableProperty<T> = string | T;

// For effect/condition adding effects
export const EffectParentRegistry = new Map<string, AbstractEffectParent<unknown>>();

export interface AbstractEffectParent<EffectReturn>{
  addedEffects : Array<[Effect<EffectReturn>, Array<EffectConditions>]>,
  addedConditions : Array<[EffectConditions, Array<EffectConditions>, EffectType<EffectReturn>]>
  instances : Set<InstanceEffectParent<EffectReturn>>;
  objectName : string;

  new(owner : EngineObject, effects : Array<EffectData>): InstanceEffectParent<EffectReturn>;
  AddConditionToClass : (condition : EffectConditions, addingCondition : Array<EffectConditions>, targetEffect : EffectType<EffectReturn>) => void;
  AddEffectToClass : (effect : Effect<EffectReturn>, addingConditions : Array<EffectConditions>) => void;
}

export interface InstanceEffectParent<EffectReturn>{
  effects: Array<Effect<EffectReturn>>;
  effectData : Array<EffectData>;
  owner : EngineObject;

  AddConditionToInstance : (condition : EffectConditions, addingCondition : Array<EffectConditions>, targetEffect : EffectType<EffectReturn>) => void;
  AddEffectToInstance : (effect : Effect<EffectReturn>, addingConditions : Array<EffectConditions>) => void;
  UpdateNewInstance : () => void;

  // objectName : string;
}

// : () => AbstractEffectParent 
export const EffectParent : <EffectReturn>(objectName : string) => AbstractEffectParent<EffectReturn> = <EffectReturn>(objectName : string) =>{
  const returnValue = class implements InstanceEffectParent<EffectReturn> {
    static addedEffects : Array<[Effect<EffectReturn>, Array<EffectConditions>]> = [];
    static addedConditions : Array<[EffectConditions, Array<EffectConditions>, EffectType<EffectReturn>]> = [];
    static instances : Set<InstanceEffectParent<EffectReturn>> = new Set();
    static objectName : string = objectName;

    effects: Array<Effect<EffectReturn>>;
    effectData : Array<EffectData>;
    owner : EngineObject;
    // objectName : string;

    constructor(owner : EngineObject, effects : Array<EffectData>){
      this.effectData = effects;
      this.effects = [];
      // this.objectName = objectName;
      this.owner = owner;
      (this.constructor as AbstractEffectParent<EffectReturn>).instances.add(this);
      // EffectParentRegistry.set(objectName, this);
    }

    //This should be the last line of the constructor for the subclass
    UpdateNewInstance(){
      for (let i = 0; i < (this.constructor as AbstractEffectParent<EffectReturn>).addedEffects.length; i += 1){
        this.AddEffectToInstance(...(this.constructor as AbstractEffectParent<EffectReturn>).addedEffects[i]);
      }
      for (let j = 0; j < (this.constructor as AbstractEffectParent<EffectReturn>).addedConditions.length; j += 1){
        this.AddConditionToInstance(...(this.constructor as AbstractEffectParent<EffectReturn>).addedConditions[j]);
      }
    }

    AddConditionToInstance(condition : EffectConditions, addingCondition : Array<EffectConditions>, targetEffect : EffectType<EffectReturn>){
      let i;
      let addCondition = true;
      // let spliceTargets = []
      for (i = 0; i<addingCondition.length; i += 1){
        // I think for now I don't want cleanup here.
        /*
        if(!(addingCondition[i].subjectConditions.length === 0)){
          spliceTargets.push(i);
          continue;
        }
        */
        if(!addingCondition[i].CheckConditions()) {
          addCondition = false;
          break;
        }
      }
      /*
      for (let j = 0; j<spliceTargets.length; j += 1) addingCondition.splice(spliceTargets[spliceTargets.length - (j+1)], 1);
      */
      if(addCondition){
        for (let k = 0; k < this.effects.length; k += 1){
          if (this.effects[k].effectType === targetEffect){
            this.effects[k].conditions.push(condition);
          };
        };
      };

    }

    static AddConditionToClass(condition : EffectConditions, addingCondition : Array<EffectConditions>, targetEffect : EffectType<EffectReturn>){
      this.addedConditions.push([condition, addingCondition, targetEffect]);
      for (const instance of this.instances){
        instance.AddConditionToInstance(condition, addingCondition, targetEffect);
      }

    }

    AddEffectToInstance(effect : Effect<EffectReturn>, addingCondition : Array<EffectConditions>){
      let i;
      let addCondition = true;
      // let spliceTargets = []
      for (i = 0; i<addingCondition.length; i += 1){
        /*
        if(!(addingCondition[i].subjectConditions.length === 0)){
          spliceTargets.push(i);
          continue;
        }
        */
        if(!addingCondition[i].CheckConditions()) {
          addCondition = false;
          break;
        }
      }
      // for (let j = 0; j<spliceTargets.length; j += 1) addingCondition.splice(spliceTargets[spliceTargets.length - (j+1)], 1);
      if(addCondition){
        this.effects.push(effect);
      };
    }

    static AddEffectToClass(effect : Effect<EffectReturn>, addingCondition : Array<EffectConditions>){
      this.addedEffects.push([effect, addingCondition]);
      for (const instance of this.instances){
        instance.AddEffectToInstance(effect, addingCondition);
      }
    }
  }

  EffectParentRegistry.set(objectName, returnValue as AbstractEffectParent<unknown>);

  return returnValue;
}

export class Effect<EffectReturn> {
    owner : EngineObject;
    effectType : string | EffectType<EffectReturn>;
    appliesTo : Subject;
    // Priority will be handled by the relevant effects
    // priority : number | null;
    conditions : Array<EffectConditions>
    existenceCondition : 'inherent' | Array<EffectConditions>;
    when : 'immediate' | ['on' | 'after', GenericEngineCall<EffectReturn>];

    constructor(owner : EngineObject, effectType : string | EffectType<EffectReturn>, appliesTo : Subject, conditions : Array<EffectConditionData>, existenceCondition : 'inherent' | Array<EffectConditionData> = 'inherent', when :'immediate' | ['on' | 'after', string]) {
      this.owner = owner;
      this.effectType = effectType;
      this.appliesTo = appliesTo;

      // this.priority = priority;

      this.conditions = conditions.map(value => new EffectConditions(value.subject, value.subjectConditions));

      if (Array.isArray(when)){
        this.when = [when[0], EngineCallHandler[when[1]] as GenericEngineCall<EffectReturn>];
        if (this.when[0] === 'on') this.when[1].onResolveEffects.push(this);
        else if (this.when[0] === 'after') this.when[1].afterResolveEffects.push(this);
        else throw new Error('The second element of when must be either `on` or `after`.');
      } else {
        this.when = when;
        if (typeof this.effectType === 'string') throw new Error('Unresolved Effect Type');
        this.effectType.EffectFunction();
      }
      
      // 'inherent' means this condition will always exist as long as the effect source exists on its owner (ability, item, etc.)
      // When the effect is removed from the owner, this.existenceCondition will be set to []
      // Other effect sources can dynamically add conditions to effects, and existenceConditions will determine whether to remove this.
      // Force this to always be 'inherent' if string?
      this.existenceCondition = (typeof existenceCondition === 'string') ? existenceCondition : existenceCondition.map(value => new EffectConditions(value.subject, value.subjectConditions));
    }

    // I forget why I have this return 3 values
    // I think 0 is remove without editing, and -1 is remove and set existenceCondition of the propery to []?
    CheckExistence() : -1 | 0 | 1 {
      if (this.existenceCondition === 'inherent') return 1;
      for (let i = 0; i < this.existenceCondition.length; i += 1){
        if(!this.existenceCondition[i].CheckConditions()) return 0;
      };
      // placeholder
      return -1;
    }

    CheckConditions() : boolean{
      let i;
      let returnValue = true;
      let spliceTargets = []
      for (i = 0; i<this.conditions.length; i += 1){
        if(!(this.conditions[i].subjectConditions.length === 0)){
          spliceTargets.push(i);
          continue;
        }
        if(!this.conditions[i].CheckConditions()) {
          returnValue = false;
          break;
        }
      }
      for (let j = 0; j<spliceTargets.length; j += 1) this.conditions.splice(spliceTargets[spliceTargets.length - (j+1)], 1);

      return returnValue;
      
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
      let i;
      let returnValue = true;
      let spliceTargets = []
      for (i = 0; i<this.subjectConditions.length; i += 1){
        if(!(this.subjectConditions[i].CheckExistence() === 1)){
          spliceTargets.push(i);
          continue;
        }
        if(!this.subjectConditions[i].CheckTruth(this.subject)) {
          returnValue = false;
          break;
        }
      }
      for (let j = 0; j<spliceTargets.length; j += 1) this.subjectConditions.splice(spliceTargets[spliceTargets.length - (j+1)], 1);

      return returnValue;
    }
}

export class SubjectPropertyTruths {
    property : string | Array<string>;
    truthValues : TruthValues;
    existenceCondition : 'inherent' | Array<EffectConditions>;

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
      this.existenceCondition = (existenceCondition === 'inherent') ? existenceCondition : existenceCondition.map(value => new EffectConditions(value.subject, value.subjectConditions));
    }

    CheckExistence() : -1 | 0 | 1 {
      if (this.existenceCondition === 'inherent') return 1;
      for (let i = 0; i < this.existenceCondition.length; i += 1){
        if(!this.existenceCondition[i].CheckConditions()) return 0;
      };
      // placeholder
      return -1;
    }

    CheckTruth(subject : Subject){
        let currentProp;
        if (Array.isArray(this.property)) {
          // Change this typing logic below once reference injection is done for global state. There should be no strings left after that
          //currentProp = subject as object;
          for (let i = 0; i < (this.property.length - 1); i += 1){
            if (!(this.property[i] in (subject as unknown as object))){
              return (this.truthValues.truthy.length === 0);
            };
            subject = subject[this.property[i] as keyof object];
          };
          currentProp = this.property[this.property.length-1];

        } else {
          currentProp = this.property;
          /*
          if (!(this.property in (subject as unknown as object))){
            return (this.truthValues.truthy.length === 0);
          };
          currentProp = subject[this.property as keyof object];
          */
        };
        for (let j = 0; j < this.truthValues.falsy.length; j += 1){
          if (this.truthValues.falsy[j] === subject[currentProp as keyof object]) return false;
        };

        for (let k = 0; k < this.truthValues.truthy.length; k += 1){
          if (this.truthValues.truthy[k] === subject[currentProp as keyof object])return true;
        };

        return (this.truthValues.truthy.length === 0);


    };
};
