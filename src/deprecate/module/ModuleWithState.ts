import {IModuleWithState, StateChangeListener} from "../types";


export abstract class ModuleWithState<STATE> implements IModuleWithState<STATE>{

    private listeners: StateChangeListener[] = [];

    onStateChange(listener: StateChangeListener) {
        this.listeners.push(listener)
    }

    removeStateChangeListener(listener:StateChangeListener) {
        this.listeners = this.listeners.filter(l => l !== listener)
    }

    protected notifyStateChange() {
        for (let listener of this.listeners) {
            listener()
        }
    }

    abstract serializeStateForPlayer(player: string, game: any): STATE

}