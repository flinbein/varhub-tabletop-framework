class y {
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
class f extends y {
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
    return Object.entries(this.playerAssignments).filter(([s, n]) => n.role === t && (e === void 0 || n.teamId === e)).map((s) => s[0]);
  }
  setTeamProperties(t, e) {
    this.getTeamById(t).properties = e, this.notifyStateChange();
  }
  getTeams() {
    return this.teams;
  }
}
const u = Symbol("notify"), a = Symbol("action-descriptors-map"), l = Symbol("local-notify"), d = (i) => function(e) {
  return e.prototype[u] = function() {
    const s = Object.keys(e.prototype[a] || {});
    i.call(this, (n) => s.filter((r) => e.prototype[a][r].call(this, n)));
  }, e;
}, m = (i, t) => {
  t.addInitializer(function() {
    const e = this[l] || [];
    e.push(function() {
      const s = Object.keys(this.constructor.prototype[a] || {});
      this[t.name].call(this, (n) => s.filter((r) => this.constructor.prototype[a][r].call(this, n)));
    }), this[l] = e;
  });
}, g = (i, t) => {
  function e(s, n) {
    if (n.addInitializer(function() {
      const r = this.constructor.prototype[a] || {};
      if (r[i] !== void 0) throw new Error("You can't use same action name twice: " + i);
      if (r[i] = t, this.constructor.prototype[a] = r, n.kind === "method") {
        const o = this;
        this[n.name] = function(...c) {
          if (!t.call(o, this)) throw new Error(`Action ${i} is unavailable`);
          return Object.getPrototypeOf(o)[n.name].apply(this, c);
        };
      }
    }), n.kind === "field")
      return function(o) {
        const h = this;
        if (typeof o != "function") throw new Error(`You can't decorate non-function fields with VTLAction(${i})`);
        return function(...p) {
          if (!t.call(h, this)) throw new Error(`Action ${i} is unavailable`);
          return o.apply(this, p);
        };
      };
  }
  return e;
};
function A(i, t) {
  if (t.kind === "method" || t.kind === "setter")
    return function(...e) {
      const s = i.apply(this, e);
      return this[l]?.forEach((n) => n.call(this)), this.constructor.prototype[u]?.call?.(this), s;
    };
  if (t.kind === "accessor") {
    const e = i;
    return {
      ...e,
      set: function(n) {
        const r = e.set.call(this, n, n);
        return this[l]?.forEach((o) => o.call(this)), this.constructor.prototype[u]?.call?.(this), r;
      }
    };
  }
  if (t.kind === "field" && typeof i == "function")
    return function(s) {
      const n = this;
      if (typeof s != "function") throw new Error(`You can't decorate non-function fields with VTLActionsDependsOn(${name})`);
      return function(...o) {
        const h = s.apply(this, o);
        return n[l]?.forEach((c) => c.call(this)), n.constructor.prototype[u]?.call?.(this), h;
      };
    };
  throw new Error("You put VTLActionObserve only on method, setter or accessor");
}
export {
  y as StateNotifier,
  g as VTLAction,
  A as VTLActionsDependsOn,
  m as VTLCallOnActionsUpdate,
  d as VTLClassWithActions,
  f as VTLTeams
};
