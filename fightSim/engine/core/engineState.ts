// export interface EngineState {
//   isEnginestate : true;
// }

export interface EngineObject extends Object{
  //[index : string] : unknown;
  isEngineComponent : boolean;
}

export type DynamicReference = [ string, Map<string, EngineObject | undefined | null> ]

export function ResolveDynamicReference(dynamicReference : DynamicReference) : EngineObject | null {
  let reference = dynamicReference[1].get(dynamicReference[0]);
  if(reference === undefined) throw new Error('Attempted to derefference an undefined state component');
  return reference;
}

/*
export let dynamicReferences : DynamicReferences = {

}
*/

export class EngineState implements EngineState{
  private state : Map<string, EngineObject | undefined | null>;
  private isFixed : boolean;
  // isFixed only affects adding or removing entries from state
  //ConstructReferenceInjections : () => void;

  constructor(){
    this.state = new Map();
    this.isFixed = false;
  }

  AddStateComponent(stateKey : string) {
    if (this.isFixed) throw new Error('This EngineState class has been fixed and new state components cannot be added.');
    this.state.set(stateKey, undefined);
    
  }

  RemoveStateComponent(stateKey : string) {
    if (this.isFixed) throw new Error('This EngineState class has been fixed and new state components cannot be removed.');
    this.state.delete(stateKey);
  }

  SetStateComponent(stateKey : string, objectReference: EngineObject | null){
    if (!this.state.has(stateKey)) throw new Error(`This EngineState class does not have a ${stateKey} entry`);
    this.state.set(stateKey, objectReference);
  }

  ResetStateComponent(stateKey : string){
    if (!this.state.has(stateKey)) throw new Error(`This EngineState class does not have a ${stateKey} entry`);
    this.state.set(stateKey, undefined);
  }

  ConstructDynamicReferences() : Array<DynamicReference>{
    let returnValue = []
    for (const entry of this.state){
      returnValue.push(entry);
    };

    return []
  }

}