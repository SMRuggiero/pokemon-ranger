// Unused at the moment.
// Experimental class used as an attempt to replace structure data
// with object references while maintaining type safety. Currently unused

export class Injectable<DataType, InjectableType> {

  proxyValue : DataType;

  constructor(proxyValue : DataType) {
      this.proxyValue = proxyValue;
  }

  checkInject(otherReferences : Array<[DataType, InjectableType]> = []) : boolean | InjectableType{
      if (typeof this.proxyValue === 'string' && this.proxyValue === "owner") return true;
      
      for (let i = 0; i < otherReferences.length; i += 1) {
          const element =  otherReferences[i];
          if (element[0] === this.proxyValue) return element[1];
          
      }
      
      return false;
  }

  injectPrimative() : DataType {
      return this.proxyValue;
  }

  toJSON(){
      return this.proxyValue;
  }

}

// Accompanying class for carrying out injections and then clean up.
class Injector<DataType, InjectableType> {
  injectableRegistry : Array<Injectable<DataType, InjectableType>>

  constructor() {
    this.injectableRegistry = [];
  }

  InjectReferences(referencesToInject : Array<[DataType, InjectableType]> = []){

  }

}