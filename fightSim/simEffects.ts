import { EffectType } from './engine/effects/effectCategories.js'

type CategoryStrings = 'targets' | 'weather' | 'badge' | 'critical' | 'random' | 'stab' | 'type' | 'burn' | 'other'

const DamageCategories : Record<CategoryStrings, number> = {
  targets : 0,
  weather : 1,
  badge : 2,
  critical : 3,
  random : 4,
  stab : 5,
  type : 6,
  burn : 7,
  other : 8,
}

export class DamageMuli implements EffectType {
  category : CategoryStrings;
  multiplier : number;

  constructor(category : CategoryStrings, multiplier : number) {
    // valid categories: Weather, Burn, Other
    // other categories exist, but they are handled entirely by the engine
    // All categories in order of application:
    // Targets -> Weather -> Badge -> Critical -> Random -> STAB -> Type -> Burn -> Other
    this.category = category;

    this.multiplier = multiplier;
  }

  OnTrue = () => [this.category, this.multiplier];

}

