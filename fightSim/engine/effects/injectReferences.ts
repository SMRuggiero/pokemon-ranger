import { EffectData, EffectConditionData, SubjectPropertyData } from './effectDataTypes.js';
import { EngineObject, DynamicReference } from '../core/engineState.js'
import { EngineHookTarget } from './effectTypes.js';

// Ungodly type shenanagans by May. No idea what's going on here, but these types make the function
// work without TypeScript complaining and while still being typesafe.
// These might need to be updated as development continues.
const TARGET_PROPERTIES = ['subject', 'appliesTo'] as const;
type TargetProperty = typeof TARGET_PROPERTIES[number];
const RECURSION_PROPERTIES = ['conditions', 'propertyConditions', 'existenceCondition'] as const;
type RecursionProperty = typeof RECURSION_PROPERTIES[number];

export function InjectReferences(effectDataStructure : Array<EffectData | EffectConditionData | SubjectPropertyData>, owner : EngineObject, otherReferences : Array<[EngineHookTarget, EngineObject | DynamicReference]> = []) : Array<EffectData | EffectConditionData | SubjectPropertyData> {
  // This function recursively replaces the string 'owner' with a reference to the effect owner.
  // This function will be expanded to inject other references upon core development.
  
  const targetProperties: TargetProperty[] = ['subject', 'appliesTo'];
  const recurOn: RecursionProperty[] = ['conditions', 'propertyConditions', 'existenceCondition']; // as Array<keyof EffectInfo | keyof EffectConditionArgs | keyof SPTConstructorArgs>;

  for (let i = 0; i < effectDataStructure.length; i += 1) {
    const effectDataElement = effectDataStructure[i];

    for (let j = 0; j < targetProperties.length; j += 1) {
      const targetProperty = targetProperties[j];

      if (hasOwnProperty(effectDataElement, targetProperty)) {
        if (effectDataElement[targetProperty] === 'owner') {
          effectDataElement[targetProperty] = owner;

        } else {
          for (let k = 0; k < otherReferences.length; k += 1){
            if (effectDataElement[targetProperty] === otherReferences[0]){
              effectDataElement[targetProperty] = otherReferences[k];
              break;
            }
          }
        }
      }
    }
    
    for (let k = 0; i < recurOn.length; i += 1) {
      const recursionCheckProp = recurOn[k];
      if (hasOwnProperty(effectDataElement, recursionCheckProp)) {
        InjectReferences(effectDataElement[recursionCheckProp] as Array<EffectData | EffectConditionData | SubjectPropertyData>, owner, otherReferences);
      }
    }
  }

  return effectDataStructure as Array<EffectData | EffectConditionData | SubjectPropertyData>;
}

// We tried. We tried hard but couldn't figure out another way to implement this.
/* eslint-disable @typescript-eslint/ban-types, no-prototype-builtins */
// More genius type shenanagans straight from the insane brain of May
function hasOwnProperty<X extends {}, Y extends PropertyKey>(obj: X, prop: Y): obj is X & Record<Y, unknown> {
  return obj.hasOwnProperty(prop);
}
/* eslint-enable @typescript-eslint/ban-types, no-prototype-builtins */
