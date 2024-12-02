class p {
  constructor() {
    this.stateListeners = [], this.notifyStateChange = () => {
      for (let t = this.stateListeners.length - 1; t >= 0; t--)
        this.stateListeners[t](this.state);
    };
  }
  onStateChange(t) {
    this.stateListeners.push(t);
  }
  removeStateChangeListener(t) {
    this.stateListeners.splice(this.stateListeners.indexOf(t), 1);
  }
}
class f extends p {
  constructor(t = {}) {
    super(), this.teams = [], this.playerAssignments = {}, t && (this.defaultRole = t.defaultRole, this.teams = t.teams);
  }
  get state() {
    return {
      teams: this.teams,
      assignments: this.playerAssignments
    };
  }
  getTeamById(t) {
    return this.teams.find((e) => e.id === t) || null;
  }
  getPlayerAssigment(t) {
    return this.playerAssignments[t] || null;
  }
  assignPlayer(t, e, i) {
    this.playerAssignments[t] = { teamId: e, role: i || this.defaultRole }, this.notifyStateChange();
  }
  removePlayerAssignment(t) {
    delete this.playerAssignments[t], this.notifyStateChange();
  }
  getPlayersCount(t) {
    return t ? Object.values(this.playerAssignments).filter((e) => e.teamId === t).length : Object.keys(this.playerAssignments).length;
  }
  isPlayerInTeam(t, e) {
    return this.playerAssignments[t]?.teamId === e;
  }
  isPlayerInRole(t, e) {
    return this.playerAssignments[t]?.role === e;
  }
  isPlayerInTeamAndRole(t, e, i) {
    return this.isPlayerInTeam(t, e) && this.isPlayerInRole(t, i);
  }
  isTeamHasPlayerInRole(t, e) {
    return Object.values(this.playerAssignments).some((i) => i.teamId === t && i.role === e);
  }
  setTeamProperties(t, e) {
    this.getTeamById(t).properties = e, this.notifyStateChange();
  }
}
const h = Symbol("notify"), a = Symbol("action-descriptors-map"), l = Symbol("local-notify"), m = (s) => function(e) {
  return e.prototype[h] = function() {
    const i = Object.keys(e.prototype[a] || {});
    s.call(this, (n) => i.filter((r) => e.prototype[a][r].call(this, n)));
  }, e;
}, d = (s, t) => {
  t.addInitializer(function() {
    const e = this[l] || [];
    e.push(function() {
      const i = Object.keys(this.constructor.prototype[a] || {});
      this[t.name].call(this, (n) => i.filter((r) => this.constructor.prototype[a][r].call(this, n)));
    }), this[l] = e;
  });
}, g = (s, t) => {
  function e(i, n) {
    if (n.addInitializer(function() {
      const r = this.constructor.prototype[a] || {};
      if (r[s] !== void 0) throw new Error("You can't use same action name twice: " + s);
      if (r[s] = t, this.constructor.prototype[a] = r, n.kind === "method") {
        const o = this;
        this[n.name] = function(...u) {
          if (!t.call(o, this)) throw new Error(`Action ${s} is unavailable`);
          return Object.getPrototypeOf(o)[n.name].apply(this, u);
        };
      }
    }), n.kind === "field")
      return function(o) {
        const c = this;
        if (typeof o != "function") throw new Error(`You can't decorate non-function fields with VTLAction(${s})`);
        return function(...y) {
          if (!t.call(c, this)) throw new Error(`Action ${s} is unavailable`);
          return o.apply(this, y);
        };
      };
  }
  return e;
};
function A(s, t) {
  if (t.kind === "method" || t.kind === "setter")
    return function(...e) {
      const i = s.apply(this, e);
      return this[l]?.forEach((n) => n.call(this)), this.constructor.prototype[h]?.call?.(this), i;
    };
  if (t.kind === "accessor") {
    const e = s;
    return {
      ...e,
      set: function(n) {
        const r = e.set.call(this, n, n);
        return this[l]?.forEach((o) => o.call(this)), this.constructor.prototype[h]?.call?.(this), r;
      }
    };
  }
  throw new Error("You put VTLActionObserve only on method, setter or accessor");
}
export {
  p as StateNotifier,
  g as VTLAction,
  A as VTLActionsDependsOn,
  d as VTLCallOnActionsUpdate,
  m as VTLClassWithActions,
  f as VTLTeams
};
