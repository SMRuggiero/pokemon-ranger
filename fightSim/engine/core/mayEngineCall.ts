import { Effect } from '../effects/effectHandling.js'

type EngineCallFunction<T, R> = (props: T) => R;

type EngineCall<T, R> = EngineCallFunction<T, R> & {
  baseFunc: EngineCallFunction<T, R>;
  preResolveEffects: Effect[];
  postResolveEffects: Effect[];
};

const EffectArrayRefs : Array<[Array<Effect>,Array<Effect>]> = [];

function build<T, R>(func: EngineCallFunction<T, R>, preResolveEffects: Effect[], postResolveEffects: Effect[]): EngineCall<T, R> {
  const wrappedFunc = (props: T): R => {
    // do preresolve stuff
    preResolveEffects.toString();
    const returnValue = func(props);
    // do postresovle stuff

    return returnValue;
  };

  wrappedFunc.baseFunc = func;
  wrappedFunc.preResolveEffects = preResolveEffects;
  wrappedFunc.postResolveEffects = postResolveEffects;

  return wrappedFunc;
};

function setPreResolvedEffects(engineCall: EngineCall<T, R>, preResolvedEffects: Effect[]): EngineCall<T, R> {
  
}


export const EngineCall = {
  build,
  setPreResolvedEffects,
  setPostResolvedEffects,
};