import {StateNotifier} from "./util/StateNotifier";

interface PlayerTeamAssignment<ROLE extends string> {
    teamId: number|null;
    role: ROLE|null
}

type PlayerAssignmentsMap<ROLE extends string> = Record<string, PlayerTeamAssignment<ROLE>>

interface Team<PROPERTIES = Record<string, string>> {
    id: number;
    displayName: string;
    properties: PROPERTIES
}

interface VTLTeamsConfig<ROLE extends string, PROPERTIES> {
    defaultRole?: ROLE
    teams?: Array<Team<PROPERTIES>>
}


export interface VTLTeamsState<ROLE extends string = string, PROPERTIES = any> {
    teams: Array<Team<PROPERTIES>>
    assignments: PlayerAssignmentsMap<ROLE>
}

export class VTLTeams<ROLE extends string, PROPERTIES = any> extends StateNotifier<VTLTeamsState<ROLE, PROPERTIES>> {

    protected teams: Array<Team<PROPERTIES>> = [];
    protected playerAssignments: PlayerAssignmentsMap<ROLE> = {};
    protected defaultRole: ROLE;

    constructor(config: VTLTeamsConfig<ROLE, PROPERTIES> = {}) {
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

    getTeamById(id: number): Team<PROPERTIES>|null {
        return this.teams.find((team) => team.id === id) || null
    }

    getPlayerAssigment(player: string) {
        return this.playerAssignments[player] || null
    }



    public assignPlayer(player: string, teamId: number, role?: ROLE) {
        this.playerAssignments[player] = {teamId, role: role || this.defaultRole}
        this.notifyStateChange();
    }

    public removePlayerAssignment(player: string) {
        delete this.playerAssignments[player];
        this.notifyStateChange();
    }

    public getPlayersCount(teamId?: number) {
        if (!teamId) return Object.keys(this.playerAssignments).length
        return Object.values(this.playerAssignments).filter(assignment => assignment.teamId === teamId).length
    }

    public isPlayerInTeam(player: string, teamId: number): boolean {
        return this.playerAssignments[player]?.teamId === teamId;
    }

    public isPlayerInRole(player: string, role: ROLE): boolean {
        return this.playerAssignments[player]?.role === role;
    }

    public isPlayerInTeamAndRole(player: string, teamId: number, role: ROLE): boolean {
        return this.isPlayerInTeam(player, teamId) && this.isPlayerInRole(player, role)
    }

    public isTeamHasPlayerInRole(teamId: number, role: ROLE): boolean {
        return Object.values(this.playerAssignments).some(assignment => assignment.teamId === teamId && assignment.role === role);
    }

    public getAllPlayersInRole(role: ROLE, teamId?: number): string[] {
        return Object.entries(this.playerAssignments)
            .filter(([player, assignment]) => {
                return assignment.role === role && (teamId === undefined || assignment.teamId === teamId)
            })
            .map(e => e[0]);
    }

    public setTeamProperties(teamId: number, properties: PROPERTIES) {
        this.getTeamById(teamId).properties = properties;
        this.notifyStateChange();
    }

    public getTeams() {
        return this.teams;
    }
}