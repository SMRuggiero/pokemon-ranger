// Placeholder types. To be expanded upon engine core development

export type EngineHookTarget = string;

export interface EngineObject {
  isEngineComponent : boolean;
}

export type Subject = EngineHookTarget | EngineObject;
