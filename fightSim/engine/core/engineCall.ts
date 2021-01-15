import { Effect } from '../effects/effectHandling.js'

class CallHandler {
  [index : string] : GenericEngineCall

  constructor(){

  }

}

export const EngineCallHandler : CallHandler= new CallHandler();

interface GenericEngineCall {
  onResolveEffects : Array<Effect>;
  afterResolveEffects : Array<Effect>;
}

class EngineCall<FunctionCallArguments extends any[], IntermediateReturn, FunctionReturn>{
  onResolveEffects : Array<Effect>;
  afterResolveEffects : Array<Effect>;
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
        for (let i = 0; i< this.onResolveEffects.length; i += 1){
          const currentEffect = this.onResolveEffects[i];
          /*
          for (let i = 0; i< this.onResolveEffects.length; i += 1) {
            const currentCondition = currentEffect[i];

            if (currentEffect.subject === 'attacker'){

            }
          }
          */
        }

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
    EngineCallHandler[callName] = call

    const CallRetriever : (bindTarget : object | null) => (...args: FunctionCallArguments) => FunctionReturn = (bindTarget : object | null = null) => {
      if (bindTarget === null) return call.ResolveEngineCall;
      return call.GenerateBoundEngineCall(bindTarget);
    };

    return CallRetriever;
}