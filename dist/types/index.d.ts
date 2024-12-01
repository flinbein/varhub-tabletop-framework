export declare type GetActionsForContext<CTX = any> = (context: CTX) => Array<string>;

declare type IsActionAvailableFn<CTX = any> = (context: CTX) => boolean;

declare type ObserveOnChangeFn = (getAvailableActions: GetActionsForContext) => void;

declare type PlayerAssignmentsMap<ROLE extends string> = Record<string, PlayerTeamAssignment<ROLE>>;

declare interface PlayerTeamAssignment<ROLE extends string> {
    teamId: string | number;
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

export declare function VTLActionsDependsOn<CTX extends ClassMethodDecoratorContext | ClassSetterDecoratorContext | ClassAccessorDecoratorContext>(value: unknown, context: CTX): any;

export declare const VTLCallOnActionsUpdate: <FN extends (this: any, getAvailableActions: GetActionsForContext) => void>(originalValue: FN, context: ClassMethodDecoratorContext<any, FN>) => void;

/**
 * VTLClassWithActions decorator
 * @param onChange
 */
export declare const VTLClassWithActions: (onChange: ObserveOnChangeFn) => <CONSTRUCTOR extends Function>(constructor: CONSTRUCTOR) => CONSTRUCTOR;

export declare class VTLTeams<ROLE extends string> extends StateNotifier<VTLTeamsState<ROLE>> {
    protected teams: Array<Team>;
    protected playerAssignments: PlayerAssignmentsMap<ROLE>;
    protected defaultRole: ROLE;
    constructor(config?: VTLTeamsConfig<ROLE>);
    get state(): {
        teams: Team<Record<string, string>>[];
        assignments: PlayerAssignmentsMap<ROLE>;
    };
    getTeamById(id: string): Team | null;
    getPlayerAssigment(player: string): PlayerTeamAssignment<ROLE>;
    assignPlayer(player: string, teamId: string, role?: ROLE): void;
    removePlayerAssignment(player: string): void;
    getPlayersCount(teamId?: string): number;
    isPlayerInTeam(player: string, teamId: string): boolean;
    isPlayerInRole(player: string, role: ROLE): boolean;
    isPlayerInTeamAndRole(player: string, teamId: string, role: ROLE): boolean;
    isTeamHasPlayerInRole(teamId: string, role: ROLE): boolean;
}

declare interface VTLTeamsConfig<ROLE extends string> {
    defaultRole?: ROLE;
    teams?: Array<Team>;
}

export declare interface VTLTeamsState<ROLE extends string = string> {
    teams: Array<Team>;
    assignments: PlayerAssignmentsMap<ROLE>;
}

export { }
