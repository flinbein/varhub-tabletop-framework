type Tail<T extends any[]> =
    ((...x: T) => void) extends ((h: infer A, ...t: infer R) => void) ? R : never;

export type TTPlayer = any;

export type PlayerActionOpts<PLAYER = unknown, MODULES = unknown> = {
    player: PLAYER;
} & MODULES

export type CheckUnavailableFunction<PLAYER = unknown, MODULES = unknown> = (opts: PlayerActionOpts<PLAYER, MODULES>) => string|boolean|undefined;

export type CheckUnavailableFunctionMap<T extends string = string, PLAYER = unknown, MODULES = unknown> = {
    [key in T]: CheckUnavailableFunction<PLAYER, MODULES>
}



export type PlayerAction<PLAYER = unknown, MODULES = unknown, PARAMS extends any[] = any[]> = (opts: PlayerActionOpts<PLAYER, MODULES>, ...params: PARAMS) => void|Promise<void>;

export type PlayerActionRPCCall<PA extends PlayerAction> = (...params: Tail<Parameters<PA>>) => void|Promise<void>

export interface PlayerActionDescriptor<
    NAME extends string = string,
    PA extends PlayerAction = any,
    CHECKS extends unknown = unknown
> {
    name: NAME
    checks?: CHECKS[]
    action: PA
}

export type StateChangeListener = () => void

export interface IModuleWithChecks<T extends string = string> {

    getCheckFunctionMap(game: any): CheckUnavailableFunctionMap<T>
}

export interface IModuleWithState<STATE = any> {

    onStateChange(listener: StateChangeListener): void;
    removeStateChangeListener(listener: StateChangeListener): void;

    serializeStateForPlayer(player: string, game: any): STATE
}