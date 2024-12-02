const notifyFnSymbol = Symbol("notify");
const actionsDescriptorsMapSymbol = Symbol("action-descriptors-map");
const localNotifyFnSymbol = Symbol("local-notify");

type IsActionAvailableFn<CTX = any> = (context: CTX) => boolean;

export type GetActionsForContext<CTX = any> = (context: CTX) => Array<string>;

type ObserveOnChangeFn = (getAvailableActions: GetActionsForContext) => void;

/**
 * VTLClassWithActions decorator
 * @param onChange
 */
export const VTLClassWithActions = (onChange: ObserveOnChangeFn) => {
    return function decorateClass<CONSTRUCTOR extends Function>(constructor: CONSTRUCTOR): CONSTRUCTOR {
        constructor.prototype[notifyFnSymbol] = function () {
            const actionKeys = Object.keys(constructor.prototype[actionsDescriptorsMapSymbol] || {});
            onChange.call(this, (ctx) => {
                return actionKeys.filter(key => constructor.prototype[actionsDescriptorsMapSymbol][key].call(this, ctx))
            })
        }

        return constructor;
    }
}

export  const VTLCallOnActionsUpdate = <FN extends (this: any, getAvailableActions: GetActionsForContext) => void>(originalValue: FN, context: ClassMethodDecoratorContext<any, FN>) => {
    context.addInitializer(function (this: any) {
        const updateFns = this[localNotifyFnSymbol] || [];
        updateFns.push(function () {
            const actionKeys = Object.keys(this.constructor.prototype[actionsDescriptorsMapSymbol] || {});

            this[context.name].call(this, (ctx) => {
                return actionKeys.filter(key => this.constructor.prototype[actionsDescriptorsMapSymbol][key].call(this, ctx))
            })
        })

        this[localNotifyFnSymbol] = updateFns;
    })
}

/**
 * VTLAction decorator
 * @param onChange
 */
export const VTLAction = (name: string, checkAvailable: IsActionAvailableFn) => {

    function decorator<T>(originalValue: T, context: ClassMethodDecoratorContext<any>): any;
    function decorator<T>(originalValue: T ,context: ClassFieldDecoratorContext<any>): any
    function decorator(originalValue: unknown, context: ClassMethodDecoratorContext | ClassFieldDecoratorContext): any {
        context.addInitializer(function (this: any) {
            const actionsMap = this.constructor.prototype[actionsDescriptorsMapSymbol] || {};
            if (actionsMap[name] !== undefined) throw new Error("You can't use same action name twice: "+name)
            actionsMap[name] = checkAvailable;
            this.constructor.prototype[actionsDescriptorsMapSymbol] = actionsMap;

            if (context.kind === "method") {
                const that = this;
                this[context.name] = function patchedMethod(this: any, ...args) {
                    if (!checkAvailable.call(that, this)) throw new Error(`Action ${name} is unavailable`);

                    return (Object.getPrototypeOf(that)[context.name].apply(this, args))
                }
            }
        })

        if (context.kind === "field") {
            return function initializer(initialFunction) {
                const that = this;
                if (typeof initialFunction !== "function") throw new Error(`You can't decorate non-function fields with VTLAction(${name})`);

                return function resultMethod(this: any, ...args) {
                    if (!checkAvailable.call(that, this)) throw new Error(`Action ${name} is unavailable`);

                    return (initialFunction as Function).apply(this, args);
                }
            }
        }
    }

    return decorator

}

export  function VTLActionsDependsOn<
    CTX extends ClassMethodDecoratorContext<any> | ClassSetterDecoratorContext<any> | ClassAccessorDecoratorContext<any>
>(value: unknown, context: CTX): any {
    if (context.kind === "method" || context.kind === "setter") {
        return function (...args) {
            const fnResult = (value as Function).apply(this, args);
            this[localNotifyFnSymbol]?.forEach(fn => fn.call(this));
            this.constructor.prototype[notifyFnSymbol]?.call?.(this);

            return fnResult;
        }
    }

    if (context.kind === "accessor") {
        const decoratorValue = value as ClassAccessorDecoratorContext["access"];
        return {
            ...decoratorValue,
            set: function setter(valueForSetter: unknown){
                const rez = decoratorValue.set.call(this, valueForSetter, valueForSetter);
                this[localNotifyFnSymbol]?.forEach(fn => fn.call(this));
                this.constructor.prototype[notifyFnSymbol]?.call?.(this)
                return rez;
            }
        };
    }

    throw new Error("You put VTLActionObserve only on method, setter or accessor")
}


/**
 *
 * HERE GOES EXAMPLE OF USAGE
 *
 */

// const availableContexts = ["JOHN", "DAVE", "ALEX"]
//
// const logIfPermissionsChange: ObserveOnChangeFn = function(getAvailableActions) {
//     const mapToLog = availableContexts.map(ctx => [ctx, getAvailableActions(ctx)]);
//     console.log(mapToLog);
// }
//
// type RestParams<T extends any[]> = T extends [any, ...infer R] ? R : never;
// function unbind<T, F extends (this:T, ...args: any[]) => any>(
//     handler: F,
//     thisVal?: T
// ): (this: Parameters<F>[0], ...args: RestParams<Parameters<F>>) => ReturnType<F> {
//     return function(this: any, ...args: any[]){
//         return handler.call(thisVal!, this as any, ...args as any);
//     } as any;
// }
//
//
//
// @VTLClassWithActions(logIfPermissionsChange)
// class MyGameModule {
//
//     static TEST = 1234;
//
//     @VTLActionsDependsOn
//     accessor mainPlayer: string|null = "NOT-A-PLAYER";
//
//     @VTLCallOnActionsUpdate
//     onPermissionsUpdate(getAvailableActions: GetActionsForContext) {
//         console.log("GTG", getAvailableActions);
//         const mapToLog = availableContexts.map(ctx => [ctx, getAvailableActions(ctx)]);
//         console.log("ACTIONS FROM METHOD", mapToLog);
//     }
//
//     @VTLAction("startGame", function BLA(ctx) {
//         return ctx === this?.mainPlayer
//     })
//     startGame(this: string) {
//         console.log("Game started BY ", this);
//     }
//
//     @VTLAction("endGame", function BLA(ctx) {
//         return ctx === this?.mainPlayer
//     })
//     endGame = unbind((connection) => {
//         console.log("Game ENDED BY ", connection);
//     })
//
// }
//
// // console.log("CLASS INFO:", MyGameModule.prototype);
// const instance = new MyGameModule();
// window["instance"] = instance;
// // console.log("PROTO", instance["__proto__"] == MyGameModule.prototype)
// instance.mainPlayer = "JOHN";
// console.log("I MANPLAYER", instance.mainPlayer)
// // console.log("mainPlayer", instance.mainPlayer)
//
// // console.log("TEST", instance.constructor)
//
// console.log("MGM1", MyGameModule.prototype[actionsDescriptorsMapSymbol] != null)
// console.log("MGM2", MyGameModule.prototype[notifyFnSymbol] != null)
//
//
// instance.endGame.apply("ALEX");