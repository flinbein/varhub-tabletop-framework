import {ModuleWithState} from "./ModuleWithState";
import {CheckUnavailableFunction, CheckUnavailableFunctionMap, IModuleWithChecks} from "../types";

interface PlayerTeamAssignment<ROLE extends string> {
    teamId: string|number;
    role: ROLE|null
}

type PlayerAssignmentsMap<ROLE extends string> = Record<string, PlayerTeamAssignment<ROLE>>

interface Team<PROPERTIES = Record<string, string>> {
    id: string;
    displayName: string;
    properties: PROPERTIES
}

interface TeamsModuleConfig<ROLE extends string> {
    defaultRole?: ROLE
    teams?: Array<Team>
    checkParams?: TeamsModuleReadyCheckOpts<ROLE>
}

interface TeamsModuleReadyCheckOpts<ROLE extends string = string> {
    minPlayersInEachTeam: number,
    everyTeamRequiredRoles: ROLE[],
    moduleName?: string;
}


export interface TeamsModuleState<ROLE extends string = string> {
    teams: Array<Team>
    assignments: PlayerAssignmentsMap<ROLE>
}

export class TeamsModule<
    ROLE extends string = string
> extends ModuleWithState<TeamsModuleState<ROLE>> implements IModuleWithChecks<"isEveryTeamReady"> {
    static defaultModuleName: "teams" = "teams";

    protected teams: Array<Team> = [];
    protected playerAssignments: PlayerAssignmentsMap<ROLE> = {};
    protected config: TeamsModuleConfig<ROLE>;

    serializeStateForPlayer(player: string, game: any) {
        return {
            teams: this.teams,
            assignments: this.playerAssignments
        }
    }

    constructor(config: TeamsModuleConfig<ROLE> = {}) {
        super();
        if (config) this.config = config
    }

    getTeamById(id: string): Team|null {
        return this.teams.find((team) => team.id === id) || null
    }

    getPlayerAssigment(player: string) {
        return this.playerAssignments[player] || null
    }



    public assignPlayer(player: string, teamId: string, role?: ROLE) {
        this.playerAssignments[player] = {teamId, role: role || this.config.defaultRole}
    }

    public removePlayerAssignment(player: string) {
        delete this.playerAssignments[player]
    }

    public getPlayersCount(teamId?: string) {
        if (!teamId) return Object.keys(this.playerAssignments).length
        return Object.values(this.playerAssignments).filter(assignment => assignment.teamId === teamId).length
    }

    public isPlayerInTeam(player: string, teamId: string): boolean {
        return this.playerAssignments[player]?.teamId === teamId;
    }

    public isPlayerInRole(player: string, role: ROLE): boolean {
        return this.playerAssignments[player]?.role === role;
    }

    public isPlayerInTeamAndRole(player: string, teamId: string, role: ROLE): boolean {
        return this.isPlayerInTeam(player, teamId) && this.isPlayerInRole(player, role)
    }

    public isTeamHasPlayerInRole(teamId: string, role: ROLE): boolean {
        return Object.values(this.playerAssignments).some(assignment => assignment.teamId === teamId && assignment.role === role);
    }

    private check_IsEveryTeamReady(){
        if (!this.config.checkParams) return false;
        const notReadyTeams = this.teams.map(it => it.id).filter(teamId => {
            const enoughPlayers = this.getPlayersCount(teamId) >= this.config.checkParams.minPlayersInEachTeam;
            const hasRoles = this.config.checkParams.everyTeamRequiredRoles.every((role) => this.isTeamHasPlayerInRole(teamId, role));
            return !enoughPlayers || !hasRoles;
        });

        return notReadyTeams.length > 0 && `Teams not ready: ${notReadyTeams.join(", ")}`;
    }

    getCheckFunctionMap(): CheckUnavailableFunctionMap<"isEveryTeamReady", any, any> {
        return {
            isEveryTeamReady: this.check_IsEveryTeamReady
        }
    }
}
