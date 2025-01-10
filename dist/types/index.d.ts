export declare type GetActionsForContext<CTX = any> = (context: CTX) => Array<string>;

declare type IsActionAvailableFn<CTX = any> = (context: CTX) => boolean;

declare type ObserveOnChangeFn = (getAvailableActions: GetActionsForContext) => void;

declare type PlayerAssignmentsMap<ROLE extends string> = Record<string, PlayerTeamAssignment<ROLE>>;

declare interface PlayerTeamAssignment<ROLE extends string> {
    teamId: number | null;
    role: ROLE | null;
}

export declare type StateListener<S> = (state: S) => void;

export declare abstract class StateNotifier<STATE> {
    private stateListeners;
    onStateChange(callback: (state: STATE) => void): void;
    removeStateChangeListener(callback: (state: STATE) => void): void;
    protected notifyStateChange: () => void;
    abstract get state(): STATE;
}

declare interface Team<PROPERTIES = Record<string, string>> {
    id: string;
    displayName: string;
    properties: PROPERTIES;
}

/**
 * VTLAction decorator
 * @param onChange
 */
export declare const VTLAction: (name: string, checkAvailable: IsActionAvailableFn) => {
    <T>(originalValue: T, context: ClassMethodDecoratorContext<any>): any;
    <T>(originalValue: T, context: ClassFieldDecoratorContext<any>): any;
};

export declare function VTLActionsDependsOn<CTX extends ClassMethodDecoratorContext<any> | ClassSetterDecoratorContext<any> | ClassAccessorDecoratorContext<any>>(value: unknown, context: CTX): any;

export declare const VTLCallOnActionsUpdate: <FN extends (this: any, getAvailableActions: GetActionsForContext) => void>(originalValue: FN, context: ClassMethodDecoratorContext<any, FN>) => void;

/**
 * VTLClassWithActions decorator
 * @param onChange
 */
export declare const VTLClassWithActions: (onChange: ObserveOnChangeFn) => <CONSTRUCTOR extends Function>(constructor: CONSTRUCTOR) => CONSTRUCTOR;

export declare class VTLTeams<ROLE extends string, PROPERTIES = any> extends StateNotifier<VTLTeamsState<ROLE, PROPERTIES>> {
    protected teams: Array<Team<PROPERTIES>>;
    protected playerAssignments: PlayerAssignmentsMap<ROLE>;
    protected defaultRole: ROLE;
    constructor(config?: VTLTeamsConfig<ROLE, PROPERTIES>);
    get state(): {
        teams: Team<PROPERTIES>[];
        assignments: PlayerAssignmentsMap<ROLE>;
    };
    getTeamById(id: string): Team<PROPERTIES> | null;
    getPlayerAssigment(player: string): PlayerTeamAssignment<ROLE>;
    assignPlayer(player: string, teamId: number, role?: ROLE): void;
    removePlayerAssignment(player: string): void;
    getPlayersCount(teamId?: number): number;
    isPlayerInTeam(player: string, teamId: number): boolean;
    isPlayerInRole(player: string, role: ROLE): boolean;
    isPlayerInTeamAndRole(player: string, teamId: number, role: ROLE): boolean;
    isTeamHasPlayerInRole(teamId: number, role: ROLE): boolean;
    getAllPlayersInRole(role: ROLE, teamId?: number): string[];
    setTeamProperties(teamId: string, properties: PROPERTIES): void;
    getTeams(): Team<PROPERTIES>[];
}

declare interface VTLTeamsConfig<ROLE extends string, PROPERTIES> {
    defaultRole?: ROLE;
    teams?: Array<Team<PROPERTIES>>;
}

export declare interface VTLTeamsState<ROLE extends string = string, PROPERTIES = any> {
    teams: Array<Team<PROPERTIES>>;
    assignments: PlayerAssignmentsMap<ROLE>;
}

export { }
