import { EngineObject } from './engine/core/engineState.js'

export interface MoveContext extends EngineObject{
  generation : number;
}

export type BaseStatName = 'hp' | 'attack' | 'defense' | 'specialAttack' | 'specialDefense' | 'speed';
export type NatureStat = 'attack' | 'defense' | 'specialAttack' | 'specialDefense' | 'speed'
export type CombatStatName =  NatureStat | 'accuracy' | 'evasion';