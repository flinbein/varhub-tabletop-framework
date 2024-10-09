import {
    CheckUnavailableFunction,
    PlayerAction,
    PlayerActionRPCCall,
    PlayerActionDescriptor, IModuleWithState, CheckUnavailableFunctionMap, IModuleWithChecks
} from "./types";

type StateChangeFN = (moduleName: string, module: IModuleWithState) => void;
interface TabletopGameOpts {
    onModuleStateChange?: StateChangeFN
}


export class TabletopGame<
    PLAYER extends unknown = never,
    MODULES extends Record<never, any> = Record<never, any>,
    CHECKS extends Record<never, CheckUnavailableFunction> = Record<never, CheckUnavailableFunction>,
    ACTIONS extends Record<never, PlayerActionDescriptor> = Record<never, PlayerActionDescriptor>
>{
    modules: MODULES = {} as any;
    checks: CHECKS = {} as any;
    playerActions: ACTIONS = {} as any;
    private onModuleStateChange?: StateChangeFN

    private constructor() {}

    static create<PLAYER = never>(opts?: TabletopGameOpts): TabletopGame<PLAYER> {
        const game = new TabletopGame();
        game.onModuleStateChange = opts?.onModuleStateChange;
        return game;
    }

    private isStateGameModule(module: any): module is IModuleWithState {
        return Object.hasOwn(module, "onStateChange");
    }

    private isModuleWithChecks(module: any): module is IModuleWithChecks {
        return Object.hasOwn(module, "getCheckFunctionMap");
    }

    registerModule<
        NAME extends string,
        M extends any,
    >(name: NAME, module: M): M extends IModuleWithChecks<infer MODULE_CHECKS> ? (
        TabletopGame<PLAYER, MODULES & {[key in NAME]: M}, CHECKS & CheckUnavailableFunctionMap<MODULE_CHECKS>, ACTIONS>
    ) : TabletopGame<PLAYER, MODULES & {[key in NAME]: M}, CHECKS, ACTIONS>
    {
        (this.modules as any)[name] = module;
        if (this.isStateGameModule(module)) {
            module.onStateChange(() => {
                this.onModuleStateChange?.(name, module)
            })
        }
        if (this.isModuleWithChecks(module)) {
            this.registerChecks(module.getCheckFunctionMap(this));
        }
        return this as any
    }

    registerCheck<
        NAME extends string,
        CHECK extends CheckUnavailableFunction
    >(name: NAME, check: CHECK): TabletopGame<PLAYER, MODULES, CHECKS & { [key in NAME]: CHECK }, ACTIONS> {
        (this.checks as any)[name] = check;
        return this as any;
    }

    registerChecks<
        CHECK_MAP extends CheckUnavailableFunctionMap
    >(checks: CHECK_MAP): TabletopGame<PLAYER, MODULES, CHECKS & CHECK_MAP, ACTIONS> {
        this.checks = {...this.checks, ...checks};
        return this as any
    }

    registerAction<
        NAME extends string,
        PA extends PlayerAction
    >(descriptor: PlayerActionDescriptor<NAME, PA, (keyof CHECKS | CheckUnavailableFunction)>): TabletopGame<PLAYER, MODULES, CHECKS, ACTIONS & {[key in NAME]: PlayerActionDescriptor<NAME, PA, (keyof CHECKS | CheckUnavailableFunction)>}> {
        (this.playerActions as any)[descriptor.name] = descriptor;
        return this as any;
    }

    private actionToRPCCall<
        DESC extends PlayerActionDescriptor
    >(descriptor: DESC): PlayerActionRPCCall<DESC["action"]> {
        const game = this;
        return function (this: {player: string}, ...params) {
            const checks = descriptor.checks as Array<(keyof CHECKS | CheckUnavailableFunction)>;
            for (const keyOrFn of checks) {
                let unavailableReason: string|undefined|boolean = undefined;
                if (typeof keyOrFn === "function") {
                    unavailableReason = keyOrFn({player: this.player, ...game.modules});
                } else {
                    unavailableReason = (game.checks[keyOrFn] as CheckUnavailableFunction)({player: this.player, ...game.modules});
                }
                if (unavailableReason !== undefined) {
                    throw new Error(
                        typeof unavailableReason === "string" ?
                            unavailableReason
                            : `Action ${descriptor.name} not available ${typeof keyOrFn === "string" ? keyOrFn : ""}`);
                }
            }

            descriptor.action({game, player: this.player}, ...params)
        }
    }

    addAction<
        NAME extends string,
        PA extends PlayerAction<PLAYER, MODULES>
    >(descriptor: PlayerActionDescriptor<NAME, PA, (keyof CHECKS | CheckUnavailableFunction)>): PlayerActionRPCCall<PlayerActionDescriptor<NAME, PA>["action"]> {
        (this.playerActions as any)[descriptor.name] = descriptor;
        return this.actionToRPCCall(descriptor);
    }

    getAction<
        NAME extends keyof ACTIONS
    >(name: NAME): ACTIONS[NAME] extends PlayerActionDescriptor ? PlayerActionRPCCall<ACTIONS[NAME]["action"]> : null {
        const descriptor = this.playerActions[name];
        if (descriptor == null) return null;
        return this.actionToRPCCall(descriptor as any) as any;
    }
}

export type StatesOfTabletopGame<
    GAME extends TabletopGame
> = GAME extends TabletopGame<infer MODULES extends Record<never, any>> ?
    {
        [key in keyof MODULES]: MODULES[key] extends IModuleWithState<infer STATE> ? STATE : never;
    }
    : never