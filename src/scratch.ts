import {StatesOfTabletopGame, TabletopGame} from "./TabletopGame";
import {TeamsModule} from "./module/TeamsModule";
import {SimplePhaseModule} from "./module/SimplePhaseModule";

type MyStateMap = {
    preparation: {},
    playing: {currentPlayerTurn: string}
    showcase: {winnerPlayer: string, score: number}
}

type MyPlayerType = {
    name: string;
    kick: () => void;
}

const game = TabletopGame
    .create<MyPlayerType>()
    .registerModule(TeamsModule.defaultModuleName, new TeamsModule({
        teams: [],
        defaultRole: "guesser"
    }))
    .registerModule(SimplePhaseModule.defaultModuleName, new SimplePhaseModule<MyStateMap>("preparation", {}))
;

export const startGame = game.addAction({
    name: "startGame",
    checks: ["isEveryTeamReady", "phaseIs_preparation"],
    action: ({}, timer: number) => {
        game.modules.phase.getPhase()
        game.modules.phase.setPhase("playing", {currentPlayerTurn: "X"})
        console.log("Game started")
    }
})

game.checks
// export const startGame = game.getAction("startGame");


//
// game.checks.isChuck("Chuck")
// game.modules.teams.getPlayer();
// game.playerActions.teleport.action({} as any, {x: 3, y: 3})
// //.registerModule("greeter", {sayHello: () => console.log("HELLO")})
//
// const openCardRPC = game.addAction({
//     name: "openCard",
//     action: (opts, cardId: number) => {console.log("PLAYER opened card",cardId)},
//     checks: ["isChuck", (player) => player === "x"]
// })
//
// const teleportRPC = game.getAction("teleport");
// teleportRPC({x: 3, y: 5})