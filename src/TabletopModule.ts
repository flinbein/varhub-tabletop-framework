import {StateNotifier} from "./util/StateNotifier";

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
}


export interface TeamsModuleState<ROLE extends string = string> {
    teams: Array<Team>
    assignments: PlayerAssignmentsMap<ROLE>
}

export class TabletopModule<ROLE extends string> extends StateNotifier<TeamsModuleState<ROLE>> {

    protected teams: Array<Team> = [];
    protected playerAssignments: PlayerAssignmentsMap<ROLE> = {};
    protected defaultRole: ROLE;

    constructor(config: TeamsModuleConfig<ROLE> = {}) {
        super();
        if (config) {
            this.defaultRole = config.defaultRole;
            this.teams = config.teams;
        }
    }

    get state() {
        return {
            teams: this.teams,
            assignments: this.playerAssignments
        }
    }

    getTeamById(id: string): Team|null {
        return this.teams.find((team) => team.id === id) || null
    }

    getPlayerAssigment(player: string) {
        return this.playerAssignments[player] || null
    }



    public assignPlayer(player: string, teamId: string, role?: ROLE) {
        this.playerAssignments[player] = {teamId, role: role || this.defaultRole}
        this.notifyStateChange();
    }

    public removePlayerAssignment(player: string) {
        delete this.playerAssignments[player];
        this.notifyStateChange();
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
}