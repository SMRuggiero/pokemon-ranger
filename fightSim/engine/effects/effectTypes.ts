// Placeholder types. To be expanded upon engine core development
import { DynamicReference, EngineObject } from '../core/engineState.js'


export type EngineHookTarget = string;



export type Subject = EngineHookTarget | EngineObject | DynamicReference;
