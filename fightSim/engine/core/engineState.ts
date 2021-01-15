export interface EngineState {
  isEnginestate : true;
}

export interface EngineObject {
  isEngineComponent : boolean;
}

export interface DynamicReferences{
  [index : string] : EngineObject
}

export let dynamicReferences : DynamicReferences = {

}
