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
  assignPlayer(t, e, s) {
    this.playerAssignments[t] = { teamId: e, role: s || this.defaultRole }, this.notifyStateChange();
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
  isPlayerInTeamAndRole(t, e, s) {
    return this.isPlayerInTeam(t, e) && this.isPlayerInRole(t, s);
  }
  isTeamHasPlayerInRole(t, e) {
    return Object.values(this.playerAssignments).some((s) => s.teamId === t && s.role === e);
  }
  getAllPlayersInRole(t, e) {
    return Object.entries(this.playerAssignments).filter(([s, i]) => i.role === t && (e === void 0 || i.teamId === e)).map((s) => s[0]);
  }
  setTeamProperties(t, e) {
    this.getTeamById(t).properties = e, this.notifyStateChange();
  }
}
const h = Symbol("notify"), a = Symbol("action-descriptors-map"), l = Symbol("local-notify"), m = (n) => function(e) {
  return e.prototype[h] = function() {
    const s = Object.keys(e.prototype[a] || {});
    n.call(this, (i) => s.filter((r) => e.prototype[a][r].call(this, i)));
  }, e;
}, d = (n, t) => {
  t.addInitializer(function() {
    const e = this[l] || [];
    e.push(function() {
      const s = Object.keys(this.constructor.prototype[a] || {});
      this[t.name].call(this, (i) => s.filter((r) => this.constructor.prototype[a][r].call(this, i)));
    }), this[l] = e;
  });
}, g = (n, t) => {
  function e(s, i) {
    if (i.addInitializer(function() {
      const r = this.constructor.prototype[a] || {};
      if (r[n] !== void 0) throw new Error("You can't use same action name twice: " + n);
      if (r[n] = t, this.constructor.prototype[a] = r, i.kind === "method") {
        const o = this;
        this[i.name] = function(...u) {
          if (!t.call(o, this)) throw new Error(`Action ${n} is unavailable`);
          return Object.getPrototypeOf(o)[i.name].apply(this, u);
        };
      }
    }), i.kind === "field")
      return function(o) {
        const c = this;
        if (typeof o != "function") throw new Error(`You can't decorate non-function fields with VTLAction(${n})`);
        return function(...y) {
          if (!t.call(c, this)) throw new Error(`Action ${n} is unavailable`);
          return o.apply(this, y);
        };
      };
  }
  return e;
};
function A(n, t) {
  if (t.kind === "method" || t.kind === "setter")
    return function(...e) {
      const s = n.apply(this, e);
      return this[l]?.forEach((i) => i.call(this)), this.constructor.prototype[h]?.call?.(this), s;
    };
  if (t.kind === "accessor") {
    const e = n;
    return {
      ...e,
      set: function(i) {
        const r = e.set.call(this, i, i);
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
