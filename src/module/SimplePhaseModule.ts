import {ModuleWithState} from "./ModuleWithState";
import {CheckUnavailableFunction, CheckUnavailableFunctionMap, IModuleWithChecks} from "../types";

type PhaseStateRecord<PHASE extends string = string> = {
    [key in PHASE]: any
}

type PhaseModuleChecks<PHASE extends string> = `phaseIs_${PHASE}`

export class SimplePhaseModule<
    PHASE_REC extends PhaseStateRecord = PhaseStateRecord,
    CONSTR_PHASE extends keyof PHASE_REC = keyof PHASE_REC,
    CONSTR_STATE extends PHASE_REC[CONSTR_PHASE] = PHASE_REC[CONSTR_PHASE]
>
    extends ModuleWithState<any>
    implements IModuleWithChecks<PhaseModuleChecks<Exclude<keyof PHASE_REC, symbol|number>>>
{
    static defaultModuleName = "phase" as const;

    private phase: keyof PhaseStateRecord;
    private state: PhaseStateRecord[typeof this.phase];

    constructor(initialPhase: Exclude<CONSTR_PHASE, symbol|number>, initialState: CONSTR_STATE) {
        super();
        this.phase = initialPhase;
        this.state = initialState;
    }

    serializeStateForPlayer(player: string, game: any): any {

    }

    getPhase() {
        return this.phase;
    }

    getState<PHASE extends keyof PhaseStateRecord>() {
        return this.state
    }

    setPhase<
        PHASE extends keyof PHASE_REC,
        STATE extends PHASE_REC[PHASE]
    >(phase: PHASE, state: STATE): void {
        this.phase = phase as any;
        this.state = state;
    }

    getCheckFunctionMap(game: any): CheckUnavailableFunctionMap<PhaseModuleChecks<Exclude<keyof PHASE_REC, symbol | number>>> {
        const module = this;
        return new Proxy({}, {
            get(target, p: string): any {
                const phaseName = p.replace("phaseIs_", "");
                return () => module.phase !== phaseName ? `Only available at phase ${phaseName}`: false
            }
        }) as any
    }
}