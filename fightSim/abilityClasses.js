
//Start by implementing Guts
//Event emitted by CalcDamageMuli?
//Nah, can use a similar system to manage other multipliers
export class Ability{

    constructor(owner){

        this.owner = owner;
        this.name = "Guts";
        this.effectType = "damageMuli";

        this.appliesTo = "owner";
        this.conditions = [{
            subject : "owner",
            subjectConditions: [{
                property : "persistentStatus",
                truthValue : {
                    truthy : [],
                    //Gen5
                    falsy : [null, "frozen"]
                },
                existenceCondition : "inherent" //Maybe true could work here
            }]
        }, {
            subject : "move",
            subjectConditions: [{
                property : "calcStats",
                truthValue : {
                    truthy : [['attack', true]],
                    falsy : []
                },
                existenceCondition : "inherent" //Maybe true could work here
            }]
        }]


    };

};