

export type StateListener<S> = (state: S) => void

export abstract class StateNotifier<STATE> {
    private stateListeners: Array<StateListener<STATE>> = [];

    onStateChange(callback: (state: STATE) => void) {
        this.stateListeners.push(callback)
    };

    removeStateChangeListener(callback: (state: STATE) => void) {
        this.stateListeners.splice( this.stateListeners.indexOf(callback), 1);
    }

    protected notifyStateChange = () => {
        for (let i = this.stateListeners.length - 1; i >= 0; i--) {
            this.stateListeners[i](this.state);
        }
    }

    abstract get state(): STATE;
}