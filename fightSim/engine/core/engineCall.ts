import { Effect } from '../effects/effectHandling.js'

class CallHandler {
  [index : string] : GenericEngineCall<unknown>;

  constructor(){

  }

}

export const EngineCallHandler : CallHandler= new CallHandler();

export interface GenericEngineCall<FunctionReturn> {
  onResolveEffects : Array<Effect<FunctionReturn>>;
  afterResolveEffects : Array<Effect<FunctionReturn>>;
}

class EngineCall<FunctionCallArguments extends any[], IntermediateReturn, FunctionReturn> implements GenericEngineCall<FunctionReturn> {
  onResolveEffects : Array<Effect<FunctionReturn>>;
  afterResolveEffects : Array<Effect<FunctionReturn>>;
  callFunction : (...args : FunctionCallArguments) => IntermediateReturn;
  resultCombiner : (...args : Array<IntermediateReturn>) => FunctionReturn;
  ResolveEngineCall : (...args : FunctionCallArguments) => FunctionReturn;

  constructor(callFunction : (...args : FunctionCallArguments) => IntermediateReturn, resultCombiner : (...args : Array<IntermediateReturn>) => FunctionReturn){
    this.onResolveEffects = [];
    this.afterResolveEffects = [];
    this.callFunction = callFunction;
    // Bind ResolveEngineCall to this instance
    this.resultCombiner = resultCombiner;
    this.ResolveEngineCall = this.GenerateBoundEngineCall();
  }
  /*
  ResolveEngineCall(...args : FunctionCallArguments) : FunctionReturn {
    let intermediateReturn : Array<IntermediateReturn> = [];
    // Do something with preResolveEffects
    // for each in array
    //  if (check existence === false)
    //    slice and continue
    //  if (check conditions)
    //    get value  
    intermediateReturn.push(this.callFunction(...args))
    // Do something with postResolveEffects
    // for each in array
    //  if (check existence === false)
    //    slice and continue
    //  if (check conditions)
    //    get value 

    //  combiner?
    let returnValue = this.resultCombiner(...intermediateReturn)
    return returnValue;
  }
  */

  GenerateBoundEngineCall(bindTarget : object | null = null) : (...args : FunctionCallArguments) => FunctionReturn {
    let callFunction = this.callFunction;
    if (bindTarget !== null) callFunction = callFunction.prototype.bind(bindTarget);
    // const combiner = this.resultCombiner

    let BoundCall = (...args : FunctionCallArguments) => {
      let intermediateReturn : Array<IntermediateReturn> = [];
      let spliceTargets = [];
      for (let i = 0; i < this.onResolveEffects.length; i += 1){
        const currentEffect = this.onResolveEffects[i];
          
        if (!(currentEffect.CheckExistence() === 1)){
          spliceTargets.push(i);
          continue;
        };
          /*
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
          */
      }
      for (let j = 0; j<spliceTargets.length; j += 1) this.onResolveEffects.splice(spliceTargets[spliceTargets.length - (j+1)], 1);
      intermediateReturn.push(callFunction(...args))
        // Do something with postResolveEffects
        // for each in array
        //  if (check existence === false)
        //    slice and continue
        //  if (check conditions)
        //    get value 
    
      let returnValue = this.resultCombiner(...intermediateReturn)
      return returnValue;
    }

    BoundCall = BoundCall.prototype.bind(this)

    return BoundCall
  }

}


/*
function GetEngineCall() {
  


}
*/

export function RegisterEngineCall<FunctionCallArguments extends any[], IntermediateReturn, FunctionReturn> (
  callName : string,
  callFunction : (...args : FunctionCallArguments) => IntermediateReturn,
  resultCombiner : (...args : Array<IntermediateReturn>) => FunctionReturn,
  ) :( (bindTarget : object | null) => (...args: FunctionCallArguments) => FunctionReturn) {
    const call = new EngineCall<FunctionCallArguments, IntermediateReturn, FunctionReturn>(callFunction, resultCombiner);
    EngineCallHandler[callName] = call;

    const CallRetriever : (bindTarget : object | null) => (...args: FunctionCallArguments) => FunctionReturn = (bindTarget : object | null = null) => {
      if (bindTarget === null) return call.ResolveEngineCall;
      return call.GenerateBoundEngineCall(bindTarget);
    };

    return CallRetriever;
}