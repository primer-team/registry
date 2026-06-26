#!/usr/bin/env node
import { Command as Mr } from "commander";
import { z as i } from "zod";
import { access as Pt, chmod as Or, mkdir as kt, readFile as S, readdir as qr, rm as Nr, stat as Me, writeFile as Le } from "node:fs/promises";
import { dirname as Dr, isAbsolute as Oe, join as C, relative as Lr, resolve as x } from "node:path";
import { existsSync as qe } from "node:fs";
import { spawn as Vr } from "node:child_process";
import { createInterface as jt } from "node:readline/promises";
import { stdin as Tt, stdout as Ct } from "node:process";
import { homedir as Br } from "node:os";
var Fr = Object.create, xt = Object.defineProperty, Jr = Object.getOwnPropertyDescriptor, zr = Object.getOwnPropertyNames, Gr = Object.getPrototypeOf, Hr = Object.prototype.hasOwnProperty, Wr = (e, t) => () => (t || (e((t = { exports: {} }).exports, t), e = null), t.exports), Yr = (e, t, r, s) => {
  if (t && typeof t == "object" || typeof t == "function")
    for (var n = zr(t), a = 0, o = n.length, c; a < o; a++)
      c = n[a], !Hr.call(e, c) && c !== r && xt(e, c, {
        get: ((d) => t[d]).bind(null, c),
        enumerable: !(s = Jr(t, c)) || s.enumerable
      });
  return e;
}, Qr = (e, t, r) => (r = e != null ? Fr(Gr(e)) : {}, Yr(t || !e || !e.__esModule ? xt(r, "default", {
  value: e,
  enumerable: !0
}) : r, e));
var $t = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/, g = i.string().max(80).regex($t, "must be a safe app ID"), $ = i.uuid(), Ut = i.uuid();
function Kr(e) {
  return e.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").replace(/-{2,}/g, "-").slice(0, 80).replace(/-+$/g, "");
}
var Xr = [
  "submitted",
  "approved",
  "rejected"
], fe = i.enum(Xr), Zr = ["prod", "staging"], O = i.enum(Zr), es = i.object({
  id: i.string().min(1),
  registryUrl: i.url(),
  materialized: i.boolean(),
  sourceManifestPath: i.string().min(1).optional()
}), ts = ["owner", "member"], se = i.enum(ts).describe("Role granted to a user on a claimed app."), Ve = i.object({
  channelId: O.describe("Distribution channel receiving this version."),
  appId: g.describe("Stable app identifier for this assignment."),
  appVersionId: $.describe("Version currently connected to the channel."),
  updatedAt: i.iso.datetime().nullable().describe("Time the channel assignment last changed.")
}).describe("Current app version assigned to a distribution channel."), H = i.object({
  id: $.describe("Stable app version identifier."),
  appId: g.describe("Stable app identifier that owns this version."),
  title: i.string().min(1),
  tags: i.array(i.string()),
  primerSdkVersion: i.string().nullable(),
  status: fe.describe("Review lifecycle state for this version."),
  channels: i.array(Ve).default([]).describe("Channels currently connected to this version.")
}).describe("Submitted app version and its review state.");
var E = i.string().trim().min(1).max(500).describe("Short audit reason recorded with the change."), Be = "channels.write:", Mt = "apps.members.read:", Ot = "apps.members.write:", we = "tokens.read:", ve = "tokens.update:", Re = "tokens.delete:", Se = "tokens.permissions.write:", rs = [
  "apps.claim",
  "apps.delete",
  "versions.publish",
  "versions.reserved.read",
  "versions.reserved.write",
  "versions.delete",
  "versions.review",
  "allowlist.read",
  "allowlist.write",
  "users.read",
  "users.permissions.read",
  "users.permissions.write",
  "sessions.revoke",
  "tokens.create"
], ss = [
  "apps.claim",
  "apps.delete",
  "versions.publish",
  "versions.reserved.read",
  "versions.reserved.write",
  "versions.delete",
  "versions.review",
  "allowlist.read",
  "users.read"
], qt = [
  "read",
  "write",
  "reviewer",
  "admin",
  "testing"
], To = i.enum(qt), ns = i.enum(rs), as = i.enum(ss), Fe = i.custom((e) => Nt(e), "Expected channels.write:<channel-slug>"), is = i.custom((e) => ms(e), "Expected apps.members.read:<app-id> or apps.members.write:<app-id>"), Co = i.custom((e) => Lt(e), "Expected apps.members.read:<app-id>"), xo = i.custom((e) => Vt(e), "Expected apps.members.write:<app-id>"), os = i.custom((e) => fs(e), "Expected a token-scoped Registry permission"), $o = i.custom((e) => ae(e, we), "Expected tokens.read:<token-id>"), Uo = i.custom((e) => ae(e, ve), "Expected tokens.update:<token-id>"), Mo = i.custom((e) => ae(e, Re), "Expected tokens.delete:<token-id>"), Oo = i.custom((e) => ae(e, Se), "Expected tokens.permissions.write:<token-id>"), he = i.union([
  ns,
  Fe,
  is,
  os
]), Je = i.union([as, Fe]), tt = /* @__PURE__ */ new Map([
  ["apps.claim", 0],
  ["apps.delete", 1],
  [Mt, 2],
  [Ot, 3],
  ["versions.publish", 4],
  ["versions.reserved.read", 5],
  ["versions.reserved.write", 6],
  ["versions.delete", 7],
  ["versions.review", 8],
  [Be, 9],
  ["allowlist.read", 10],
  ["allowlist.write", 11],
  ["users.read", 12],
  ["users.permissions.read", 13],
  ["users.permissions.write", 14],
  ["sessions.revoke", 15],
  ["tokens.create", 16],
  [we, 17],
  [ve, 18],
  [Re, 19],
  [Se, 20]
]);
function rt(e) {
  const t = cs(e);
  return t ? [tt.get(t) ?? 0, e] : [tt.get(e) ?? Number.MAX_SAFE_INTEGER, e];
}
function cs(e) {
  if (Nt(e)) return Be;
  if (e.startsWith("apps.members.read:")) return Mt;
  if (e.startsWith("apps.members.write:")) return Ot;
  if (e.startsWith("tokens.read:")) return we;
  if (e.startsWith("tokens.update:")) return ve;
  if (e.startsWith("tokens.delete:")) return Re;
  if (e.startsWith("tokens.permissions.write:")) return Se;
}
function Nt(e) {
  if (typeof e != "string" || !e.startsWith("channels.write:")) return !1;
  const t = e.slice(15);
  return $t.test(t);
}
function ds(e) {
  return Fe.parse(`${Be}${e}`);
}
function D(e) {
  return Array.from(new Set(e.map((t) => he.parse(t)))).sort((t, r) => {
    const [s, n] = rt(t), [a, o] = rt(r);
    return s - a || n.localeCompare(o);
  });
}
function Dt(e) {
  return D((Array.isArray(e) ? e : [e]).flatMap((t) => t.split(",")).map((t) => t.trim()).filter(Boolean));
}
function ls(e) {
  return D(e).map((t) => Je.parse(t));
}
function ze(e) {
  return Dt(e).map((t) => Je.parse(t));
}
function us(e, t = {}) {
  const r = t.channelIds;
  switch (e) {
    case "read":
      return [];
    case "write":
      return D([
        "apps.claim",
        "versions.publish",
        "versions.delete",
        "channels.write:staging"
      ]);
    case "reviewer":
      return D([
        "apps.claim",
        "versions.publish",
        "versions.delete",
        "versions.review",
        ...ke(r ?? ["staging", "prod"])
      ]);
    case "admin":
      return D([
        "apps.claim",
        "apps.delete",
        "versions.publish",
        "versions.reserved.read",
        "versions.reserved.write",
        "versions.delete",
        "versions.review",
        ...ke(r ?? ["staging", "prod"]),
        "allowlist.read",
        "users.read"
      ]);
    case "testing":
      return D([
        "apps.claim",
        "apps.delete",
        "versions.publish",
        "versions.reserved.read",
        "versions.reserved.write",
        "versions.delete",
        "versions.review",
        ...ke(r ?? ["staging"])
      ]);
  }
}
var ps = i.array(he).transform(D), ne = i.array(Je).transform(ls);
function ke(e) {
  return e.map(ds);
}
function ms(e) {
  return Lt(e) || Vt(e);
}
function Lt(e) {
  return typeof e != "string" ? !1 : e.startsWith("apps.members.read:") && g.safeParse(e.slice(18)).success;
}
function Vt(e) {
  return typeof e != "string" ? !1 : e.startsWith("apps.members.write:") && g.safeParse(e.slice(19)).success;
}
function fs(e) {
  return [
    we,
    ve,
    Re,
    Se
  ].some((t) => ae(e, t));
}
function ae(e, t) {
  return typeof e == "string" && e.startsWith(t) && hs(e.slice(t.length));
}
function hs(e) {
  return /^[A-Za-z0-9][A-Za-z0-9_-]*$/.test(e);
}
var X = qt, ge = {
  email: "email",
  domain: "domain"
}, N = {
  listed: "listed",
  found: "found",
  created: "created",
  enabled: "enabled",
  disabled: "disabled",
  updated: "updated",
  revoked: "revoked"
}, gs = [
  N.created,
  N.enabled,
  N.disabled
], st = i.enum(X).describe("Named shortcut expanded to concrete Registry user permissions."), Bt = i.enum([ge.email, ge.domain]).describe("Whether an allowlist entry matches one email or an email domain."), Ft = i.object({
  id: i.string().min(1).describe("Stable email allowlist entry identifier."),
  entryType: Bt,
  value: i.string().min(1).describe("Email address or domain matched by the entry."),
  description: i.string().nullable().describe("Optional admin note for the entry."),
  disabledAt: i.iso.datetime().nullable().describe("Time the entry was disabled, if inactive."),
  createdAt: i.iso.datetime().describe("Time the entry was created."),
  updatedAt: i.iso.datetime().describe("Time the entry last changed.")
}).describe("Email allowlist entry used for Registry account access."), qo = i.object({
  entryType: Bt,
  value: i.string().trim().min(1).max(320),
  description: i.string().trim().max(500).optional().nullable(),
  reason: E
}), No = i.object({
  enabled: i.boolean(),
  reason: E
}), ys = i.object({
  status: i.literal(N.listed),
  entries: i.array(Ft)
}), nt = i.object({
  status: i.enum(gs),
  entry: Ft
}), Ge = i.object({
  id: i.string().min(1).describe("Stable Registry user identifier."),
  email: i.email().nullable().describe("User email address, when available."),
  permissions: ps.describe("Concrete Registry permissions granted to the user.")
}).describe("Registry user visible to admin workflows."), bs = i.object({
  status: i.literal(N.listed),
  users: i.array(Ge)
}), at = i.object({
  status: i.literal(N.found),
  user: Ge
}), Do = i.object({
  grantPermissions: i.array(he).optional().default([]),
  revokePermissions: i.array(he).optional().default([]),
  grantPreset: st.optional(),
  revokePreset: st.optional(),
  reason: E
}).refine((e) => e.grantPermissions.length > 0 || e.revokePermissions.length > 0 || !!e.grantPreset || !!e.revokePreset, { message: "Grant or revoke at least one permission or preset." }), ws = i.object({
  status: i.literal(N.updated),
  user: Ge,
  revokedSessionCount: i.number().int().nonnegative().describe("Number of user sessions revoked after permissions were removed.")
}), Lo = i.object({ reason: E }), vs = i.object({
  status: i.literal(N.revoked),
  userId: i.string().min(1).describe("Stable Registry user identifier."),
  revokedSessionCount: i.number().int().nonnegative().describe("Number of user sessions revoked.")
}), Rs = class {
  transport;
  constructor(e) {
    this.transport = e;
  }
  listEmailAllowlistEntries() {
    return this.transport.request("/api/admin/email-allowlist", ys);
  }
  createEmailAllowlistEntry(e) {
    return this.transport.request("/api/admin/email-allowlist", nt, {
      method: "POST",
      body: e
    });
  }
  updateEmailAllowlistEntry(e, t) {
    return this.transport.request(`/api/admin/email-allowlist/${encodeURIComponent(e)}`, nt, {
      method: "PATCH",
      body: t
    });
  }
  listUsers() {
    return this.transport.request("/api/admin/users", bs);
  }
  getUser(e) {
    return this.transport.request(`/api/admin/users/${encodeURIComponent(e)}`, at);
  }
  getUserByEmail(e) {
    const t = new URLSearchParams({ email: e });
    return this.transport.request(`/api/admin/users?${t}`, at);
  }
  updateUserPermissions(e, t) {
    return this.transport.request(`/api/admin/users/${encodeURIComponent(e)}`, ws, {
      method: "PATCH",
      body: t
    });
  }
  revokeUserSessions(e, t) {
    return this.transport.request(`/api/admin/users/${encodeURIComponent(e)}/revoke-sessions`, vs, {
      method: "POST",
      body: t
    });
  }
}, Jt = i.discriminatedUnion("exists", [i.object({
  appId: g.describe("Stable app identifier being checked."),
  exists: i.literal(!1).describe("Whether the app is already claimed."),
  available: i.literal(!0).describe("Whether this app ID can be claimed.")
}), i.object({
  appId: g.describe("Stable app identifier being checked."),
  exists: i.literal(!0).describe("Whether the app is already claimed."),
  available: i.literal(!1).describe("Whether this app ID can be claimed.").optional(),
  deletedAt: i.iso.datetime().nullable().optional().describe("Time this app was soft-deleted, when applicable."),
  claim: i.discriminatedUnion("claimedByCurrentUser", [i.object({
    claimedByCurrentUser: i.literal(!0).describe("Whether the current account has this claim."),
    role: se.describe("Current account role on the claimed app.")
  }), i.object({
    claimedByCurrentUser: i.literal(!1).describe("Whether the current account has this claim."),
    role: i.null().describe("No app role is available for the current account.")
  })])
})]), Ss = i.object({
  appId: g.describe("Stable app identifier being checked."),
  available: i.boolean().describe("Whether this app ID can be claimed."),
  exists: i.boolean().describe("Whether the app is already claimed.")
}), Is = i.object({ apps: i.array(i.object({
  appId: g.describe("Stable app identifier."),
  visibility: i.enum(["private", "public"]).describe("Registry app visibility."),
  status: i.enum(["active", "deleted"]).describe("Registry app lifecycle status."),
  latestVersionId: i.string().nullable().describe("Latest non-deleted app version ID, when one exists.")
})) }), Vo = i.object({
  appId: g.describe("Stable app identifier to claim."),
  title: i.string().trim().min(1)
}), As = i.object({
  appId: g.describe("Stable app identifier that was claimed."),
  created: i.boolean().describe("Whether a new app claim was created."),
  role: se.describe("Role assigned to the acting app claimant.")
}), Bo = i.object({
  reason: E,
  force: i.literal(!1).optional().describe("Hard delete is deferred and unsupported.")
}), _s = i.object({
  app: i.object({
    appId: g.describe("Stable app identifier that remains reserved."),
    deletedAt: i.iso.datetime().describe("Time this app was soft-deleted.")
  }),
  cleanup: i.object({
    disconnectedChannelAssignments: i.number().int().nonnegative(),
    deletedVersions: i.number().int().nonnegative(),
    deactivatedAccessTokenGrants: i.number().int().nonnegative()
  }),
  event: i.object({
    eventId: i.string().min(1).describe("Stable audit event identifier."),
    eventType: i.literal("app_deleted").describe("Audit event type for the app deletion."),
    actorUserId: i.string().min(1).describe("User ID that performed the deletion."),
    reason: i.string().min(1).describe("Audit reason recorded with the deletion."),
    createdAt: i.iso.datetime().describe("Time the audit event was recorded.")
  })
});
function zt(e = {}, t = new URLSearchParams()) {
  return e.query && t.set("query", JSON.stringify(e.query)), e.includeReserved && t.set("includeReserved", "true"), t;
}
function Y(e, t) {
  return t.size ? `${e}?${t}` : e;
}
var R = encodeURIComponent, w = {
  apps: {
    collection: () => "/api/apps",
    item: (e) => `/api/apps/${R(e)}`,
    availability: (e) => `/api/apps/${R(e)}/availability`,
    history: (e) => `/api/apps/${R(e)}/history`,
    versions: (e, t = new URLSearchParams()) => Y(`/api/apps/${R(e)}/versions`, t)
  },
  versions: {
    collection: (e = new URLSearchParams()) => Y("/api/versions", e),
    item: (e) => `/api/versions/${R(e)}`,
    approve: (e) => `/api/versions/${R(e)}/approve`,
    reject: (e) => `/api/versions/${R(e)}/reject`,
    history: (e) => `/api/versions/${R(e)}/history`
  },
  channels: {
    collection: () => "/api/channels",
    item: (e, t = new URLSearchParams()) => Y(`/api/channels/${R(e)}`, t),
    versions: (e, t = new URLSearchParams()) => Y(`/api/channels/${R(e)}/versions`, t),
    version: (e, t) => `/api/channels/${R(e)}/versions/${R(t)}`,
    rollback: (e) => `/api/channels/${R(e)}/rollback`,
    history: (e, t = new URLSearchParams()) => Y(`/api/channels/${R(e)}/history`, t)
  }
}, Es = class {
  transport;
  constructor(e) {
    this.transport = e;
  }
  get(e) {
    return this.transport.request(w.apps.item(e), Jt);
  }
  availability(e) {
    return this.transport.request(w.apps.availability(e), Ss);
  }
  list() {
    return this.transport.request(w.apps.collection(), Is);
  }
  create(e) {
    return this.transport.request(w.apps.collection(), As, {
      method: "POST",
      body: e
    });
  }
  delete(e, t) {
    return this.transport.request(w.apps.item(e), _s, {
      method: "DELETE",
      body: t
    });
  }
}, He = i.object({
  userId: i.string().min(1).describe("Stable user identifier for the authenticated account."),
  email: i.email().nullable().describe("Account email address, when available.")
}).describe("Authenticated Registry account returned to the CLI."), Ps = i.object({
  deviceCode: i.string().min(32),
  userCode: i.string().min(4),
  verificationUri: i.url(),
  verificationUriComplete: i.url(),
  expiresIn: i.number().int().positive(),
  interval: i.number().int().positive()
}), Fo = i.object({ deviceCode: i.string().min(32) }), ks = i.discriminatedUnion("status", [i.object({ status: i.literal("pending") }), i.object({
  status: i.literal("approved"),
  accessToken: i.string().min(1),
  expiresIn: i.number().int().positive(),
  refreshToken: i.string().min(32),
  account: He
})]), Jo = i.object({ refreshToken: i.string().min(32) }), js = i.object({
  accessToken: i.string().min(1),
  expiresIn: i.number().int().positive(),
  refreshToken: i.string().min(32),
  account: He
}), Ts = i.object({ account: He }), zo = i.object({ refreshToken: i.string().min(32).optional() }), Go = i.object({ userCode: i.string().min(4) }), Cs = class {
  transport;
  constructor(e) {
    this.transport = e;
  }
  start() {
    return this.transport.request("/api/cli/auth/start", Ps, { method: "POST" });
  }
  poll(e) {
    return this.transport.request("/api/cli/auth/poll", ks, {
      method: "POST",
      body: e
    });
  }
  refresh(e) {
    return this.transport.request("/api/cli/auth/refresh", js, {
      method: "POST",
      body: e
    });
  }
  whoami() {
    return this.transport.request("/api/cli/auth/whoami", Ts);
  }
  revoke(e = {}) {
    return this.transport.requestJson("/api/cli/auth/revoke", {
      method: "POST",
      body: e
    });
  }
}, xs = "index.html", $s = "manifest.json";
var Us = ".registry-assets/";
function Ms(e) {
  return Ns(Us, e, "registryAssets.source");
}
function Os(e, t) {
  if (!e.startsWith(t)) throw new Error(`Object key is outside expected prefix: ${e}`);
  qs(e);
}
function qs(e) {
  if (e.startsWith("/") || e.includes("\\")) throw new Error(`Unsafe object key: ${e}`);
  for (const t of e.split("/")) if (t === ".." || t === ".") throw new Error(`Unsafe object key segment: ${e}`);
}
function ie(e, t = "relativePath") {
  if (!e || e.startsWith("/") || /^[a-z][a-z0-9+.-]*:/i.test(e) || e.includes("\\")) throw new Error(`${t} must be a safe relative path`);
  for (const r of e.split("/")) if (!r || r === "." || r === "..") throw new Error(`${t} must be a safe relative path`);
}
function Ns(e, t, r) {
  ie(t, r);
  const s = `${e}${t}`;
  return Os(s, e), s;
}
var Gt = i.string().trim().min(1), Ie = i.string().trim().min(1).regex(/^[a-zA-Z0-9][a-zA-Z0-9._-]*$/), Ht = i.object({
  id: Ie,
  source: i.string().trim().min(1).optional(),
  registryUrl: i.url().optional()
}).refine((e) => !!(e.source || e.registryUrl), { message: "registryAssets entries must include source or registryUrl" }), Ds = i.object({ assets: i.array(Ht) }), Wt = i.object({
  title: i.string().trim().min(1),
  appId: g.optional(),
  tags: i.array(Gt).default([]),
  primerSdkVersion: i.string().trim().min(1).nullable().optional(),
  thumbnailAssetId: Ie.optional(),
  registryAssets: i.unknown().optional(),
  registryAssetsModule: i.string().trim().min(1).optional()
}).passthrough(), Ls = Wt.superRefine((e, t) => {
  "thumbnailAssetKey" in e && t.addIssue({
    code: "custom",
    path: ["thumbnailAssetKey"],
    message: "thumbnailAssetKey is not a Registry manifest field"
  }), "thumbnailSource" in e && t.addIssue({
    code: "custom",
    path: ["thumbnailSource"],
    message: "thumbnailSource is not a Registry manifest field"
  }), "requiresPrimer" in e && t.addIssue({
    code: "custom",
    path: ["requiresPrimer"],
    message: "requiresPrimer is not a Registry manifest field; use primerSdkVersion when Primer runtime behavior is required"
  });
});
function Ae(e) {
  const t = Ls.parse(e);
  t.registryAssetsModule && ie(t.registryAssetsModule, "registryAssetsModule");
  const r = t.primerSdkVersion ?? null;
  return {
    title: t.title,
    appId: t.appId,
    tags: t.tags,
    primerSdkVersion: r,
    thumbnailAssetId: t.thumbnailAssetId,
    registryAssets: Bs(t.registryAssets),
    registryAssetsModule: t.registryAssetsModule
  };
}
function Yt(e) {
  let t;
  try {
    t = JSON.parse(e);
  } catch {
    throw new Error("manifest.json must be valid JSON");
  }
  return Ae(t);
}
function Qt(e) {
  const t = Ds.parse(e);
  return Xt(t.assets), t;
}
function Kt(e) {
  let t;
  try {
    t = JSON.parse(e);
  } catch {
    throw new Error("Registry assets manifest must be valid JSON");
  }
  return Qt(t);
}
function We(e, t = "source") {
  try {
    const r = new URL(e);
    if (r.protocol !== "https:") throw new Error(`${t} must be a safe relative path or HTTPS URL`);
    if (r.username || r.password) throw new Error(`${t} must be a safe relative path or HTTPS URL`);
    return {
      kind: "httpsUrl",
      url: r.toString()
    };
  } catch (r) {
    if (r instanceof Error && r.message === `${t} must be a safe relative path or HTTPS URL`) throw r;
    return ie(e, t), {
      kind: "artifactPath",
      path: e
    };
  }
}
function Vs(e, t = "registryUrl") {
  const r = new URL(e);
  if (r.protocol !== "https:" || r.username || r.password) throw new Error(`${t} must be an HTTPS URL`);
  return r.toString();
}
function Ye(e) {
  const t = i.array(Ht).parse(e);
  return Xt(t), t;
}
function Bs(e) {
  if (e === void 0) return { kind: "none" };
  if (typeof e == "string") return {
    kind: "files",
    paths: [it(e)]
  };
  if (!Array.isArray(e)) throw new Error("registryAssets must be a path, path array, or inline asset array");
  if (e.length === 0) return {
    kind: "inline",
    assets: []
  };
  if (e.every((t) => typeof t == "string")) return {
    kind: "files",
    paths: e.map((t) => it(t))
  };
  if (e.every((t) => typeof t == "object" && t !== null && !Array.isArray(t))) return {
    kind: "inline",
    assets: Ye(e)
  };
  throw new Error("registryAssets arrays cannot mix manifest paths and inline assets");
}
function it(e) {
  return ie(e, "registryAssets"), e;
}
function Xt(e) {
  for (const t of e)
    t.source && We(t.source, "source"), t.registryUrl && Vs(t.registryUrl, "registryUrl");
}
var Fs = i.object({
  id: Ie,
  registryUrl: i.url()
}), Js = i.object({
  appId: g,
  assets: i.array(Fs)
}), zs = class {
  transport;
  constructor(e) {
    this.transport = e;
  }
  list(e) {
    return this.transport.request(`/api/apps/${encodeURIComponent(e)}/assets`, Js);
  }
}, Gs = i.object({
  id: g,
  title: i.string().trim().min(1),
  tags: i.array(Gt),
  primerSdkVersion: i.string().nullable(),
  versionRootUrl: i.url(),
  thumbnailUrl: i.url().nullable()
});
function b(e, t, r, s = {}) {
  return {
    code: e,
    message: t,
    path: r,
    ...s
  };
}
var Hs = i.union([
  i.string(),
  i.number(),
  i.boolean(),
  i.null()
]), Z = i.lazy(() => i.union([
  Hs,
  i.array(Z),
  i.record(i.string(), Z)
])), Ho = i.record(i.string(), Z), Zt = [
  "eq",
  "ne",
  "in",
  "nin",
  "contains",
  "exists",
  "matches"
], er = i.enum(Zt), tr = i.strictObject({
  pointer: i.string(),
  op: er,
  value: Z.optional()
}), je = i.lazy(() => i.union([
  tr,
  i.strictObject({ all: i.array(je) }),
  i.strictObject({ any: i.array(je) }),
  i.strictObject({ not: je })
]));
function Ws(e, t) {
  const r = t.allowedPointers;
  return r ? typeof r == "function" ? r(e) : r.includes(e) : !0;
}
function Ys(e, t, r) {
  const s = r.allowedOperators;
  return s ? typeof s == "function" ? s(e, t) : s.includes(e) : !0;
}
function Qs(e) {
  return {
    success: !0,
    data: e
  };
}
function Ks(e) {
  return {
    success: !1,
    error: e
  };
}
var rr = /^(?:\/(?:[^~/]|~0|~1)*)*$/, Wo = i.string().nonempty().regex(rr);
function Xs(e) {
  return rr.test(e);
}
var Zs = new Set(tr.keyof().options), en = /* @__PURE__ */ new Set([
  "eq",
  "ne",
  "in",
  "nin",
  "contains",
  "matches"
]);
function tn(e, t = {}) {
  const r = [], s = Qe(e, [], r, t);
  return r.length > 0 || s === void 0 ? Ks(r) : Qs(s);
}
function Qe(e, t, r, s) {
  if (!sn(e)) {
    r.push(b("invalid_expr", "RQL expr must be an object.", t));
    return;
  }
  const n = [
    "all",
    "any",
    "not"
  ].filter((o) => o in e), a = "pointer" in e || "op" in e;
  if (n.length > 0 && a) {
    r.push(b("invalid_composition", "RQL expr cannot mix predicate and composition keys.", t));
    return;
  }
  if (n.length > 1) {
    r.push(b("invalid_composition", "RQL expr must use only one composition key.", t));
    return;
  }
  if (n[0] === "all") return ot(e.all, "all", t, r, s);
  if (n[0] === "any") return ot(e.any, "any", t, r, s);
  if (n[0] === "not") {
    const o = Qe(e.not, [...t, "not"], r, s);
    return o === void 0 ? void 0 : { not: o };
  }
  return rn(e, t, r, s);
}
function ot(e, t, r, s, n) {
  if (!Array.isArray(e)) {
    s.push(b("invalid_composition", `RQL ${t} composition must be an array.`, [...r, t]));
    return;
  }
  if (e.length === 0) {
    s.push(b("empty_composition", `RQL ${t} composition must contain at least one expr.`, [...r, t]));
    return;
  }
  const a = e.map((o, c) => Qe(o, [
    ...r,
    t,
    String(c)
  ], s, n)).filter((o) => o !== void 0);
  if (a.length === e.length)
    return t === "all" ? { all: a } : { any: a };
}
function rn(e, t, r, s) {
  const n = Object.keys(e).filter((m) => !Zs.has(m));
  if (n.length > 0) {
    r.push(b("invalid_expr", `Unknown RQL predicate keys: ${n.join(", ")}.`, t));
    return;
  }
  const a = e.pointer, o = e.op, c = er.safeParse(o);
  let d = !1;
  if (typeof a != "string" ? r.push(b("invalid_pointer", "RQL predicate pointer must be a JSON Pointer string.", [...t, "pointer"])) : Xs(a) ? a === "" ? r.push(b("root_pointer_disallowed", "RQL predicates cannot target the root JSON Pointer.", [...t, "pointer"], { pointer: a })) : Ws(a, s) ? d = !0 : r.push(b("pointer_not_allowed", "RQL predicate pointer is not allowed by policy.", [...t, "pointer"], { pointer: a })) : r.push(b("invalid_pointer", "RQL predicate pointer must use RFC 6901 JSON Pointer syntax.", [...t, "pointer"], { pointer: a })), c.success ? typeof a == "string" && d && !Ys(c.data, a, s) && r.push(b("operator_not_allowed", "RQL predicate operator is not allowed by policy.", [...t, "op"], {
    pointer: a,
    op: c.data
  })) : r.push(b("unknown_operator", "RQL predicate operator is not supported.", [...t, "op"], { op: String(o) })), !c.success || typeof a != "string") return;
  const l = c.data, u = Object.hasOwn(e, "value");
  l === "exists" && u && r.push(b("unexpected_value", "RQL exists predicates must not include a value.", [...t, "value"], {
    pointer: a,
    op: l
  })), en.has(l) && !u && r.push(b("missing_value", `RQL ${l} predicates require a value.`, [...t, "value"], {
    pointer: a,
    op: l
  }));
  const p = e.value;
  if (u && !Z.safeParse(p).success && r.push(b("invalid_value", "RQL predicate value must be JSON-serializable.", [...t, "value"], {
    pointer: a,
    op: l
  })), (l === "in" || l === "nin") && u && !Array.isArray(p) && r.push(b("invalid_value", `RQL ${l} predicates require an array value.`, [...t, "value"], {
    pointer: a,
    op: l
  })), l === "matches" && u && typeof p != "string" && r.push(b("invalid_value", "RQL matches predicates require a string regex pattern value.", [...t, "value"], {
    pointer: a,
    op: l
  })), l === "matches" && typeof p == "string" && s.maxRegexPatternLength !== void 0 && p.length > s.maxRegexPatternLength && r.push(b("regex_pattern_too_long", "RQL matches pattern exceeds the policy maximum length.", [...t, "value"], {
    pointer: a,
    op: l
  })), r.length === 0 || !ct(r, t)) {
    const m = u ? {
      pointer: a,
      op: l,
      value: p
    } : {
      pointer: a,
      op: l
    }, P = s.validateValue?.({
      pointer: a,
      op: l,
      value: p,
      predicate: m,
      path: t
    });
    (P === !1 || typeof P == "string") && r.push(b("value_rejected", typeof P == "string" ? P : "RQL predicate value is not allowed by policy.", [...t, "value"], {
      pointer: a,
      op: l
    }));
  }
  if (!ct(r, t))
    return u ? {
      pointer: a,
      op: l,
      value: p
    } : {
      pointer: a,
      op: l
    };
}
function ct(e, t) {
  return e.some((r) => t.every((s, n) => r.path[n] === s));
}
function sn(e) {
  return typeof e == "object" && e !== null && !Array.isArray(e);
}
var nn = {
  allowedPointers: [
    "/appId",
    "/id",
    "/primerSdkVersion",
    "/status",
    "/tags",
    "/title"
  ],
  allowedOperators: (e, t) => dn[t]?.includes(e) ?? !1,
  maxRegexPatternLength: 128,
  validateValue: ({ pointer: e, op: t, value: r }) => {
    if (e === "/tags") {
      if (t === "exists") return;
      if (t === "contains") return typeof r == "string" || "RQL /tags contains value must be a string.";
      if (t === "in" || t === "nin") return Array.isArray(r) && r.every((s) => typeof s == "string") ? void 0 : `RQL /tags ${t} value must be an array of strings.`;
    }
    if (t === "matches") return typeof r == "string" || "RQL matches value must be a string.";
    if (t === "in" || t === "nin") return Array.isArray(r) && r.every((s) => typeof s == "string" || s === null) ? void 0 : `RQL ${t} value must be an array of strings or null.`;
    if (t !== "exists") return typeof r == "string" || r === null || "RQL scalar value must be a string or null.";
  }
}, me = i.lazy(() => i.union([
  i.object({
    pointer: i.string(),
    op: i.enum(Zt),
    value: i.any().optional()
  }),
  i.object({ all: i.array(me) }),
  i.object({ any: i.array(me) }),
  i.object({ not: me })
])), an = me.superRefine((e, t) => {
  const r = tn(e, nn);
  if (!r.success)
    for (const s of r.error) t.addIssue({
      code: "custom",
      message: s.message,
      path: s.path
    });
}), on = i.preprocess((e) => {
  if (typeof e != "string") return e;
  try {
    return JSON.parse(e);
  } catch {
    return e;
  }
}, an), cn = i.preprocess((e) => {
  if (e !== void 0)
    return e === !0 || e === "true" ? !0 : e === !1 || e === "false" ? !1 : e;
}, i.boolean().optional()), dn = {
  "/appId": [
    "eq",
    "ne",
    "in",
    "nin",
    "exists",
    "matches"
  ],
  "/id": [
    "eq",
    "ne",
    "in",
    "nin",
    "exists",
    "matches"
  ],
  "/primerSdkVersion": [
    "eq",
    "ne",
    "in",
    "nin",
    "exists",
    "matches"
  ],
  "/status": [
    "eq",
    "ne",
    "in",
    "nin",
    "exists"
  ],
  "/tags": [
    "contains",
    "exists",
    "in",
    "nin"
  ],
  "/title": [
    "eq",
    "ne",
    "in",
    "nin",
    "exists",
    "matches"
  ]
}, ln = i.object({ query: on.describe("Registry RQL expr encoded as JSON.").optional() }), un = ln.extend({ includeReserved: cn.describe("Include registry-reserved versions.").optional() }), pn = i.object({
  channel: i.object({ id: O.describe("Stable distribution channel identifier.") }),
  apps: i.array(Gs)
}), mn = i.object({ channels: i.array(i.object({ id: O.describe("Stable distribution channel identifier.") })) }), fn = i.object({
  channel: i.object({ id: O.describe("Stable distribution channel identifier.") }).optional(),
  assignments: i.array(Ve)
}), Yo = i.object({
  appVersionId: $.describe("Version to connect to the channel."),
  reason: E.optional()
}).describe("Assigns a channel to a specific app version."), Qo = i.object({ reason: E.optional() }).describe("Removes the current app version assignment from a channel."), hn = ["rolled_back", "dry_run"], dt = i.object({
  channel: i.object({ id: O.describe("Stable distribution channel identifier.") }),
  appVersion: H
}), Ko = i.object({
  appId: g.describe("Stable app identifier whose channel is rolled back."),
  toVersionId: $.describe("Specific version to reconnect, if selected.").optional(),
  reason: E.optional(),
  dryRun: i.boolean().describe("Preview rollback eligibility without changing the channel.").optional()
}), gn = i.object({
  status: i.enum(hn).describe("Whether rollback was applied or previewed."),
  channel: i.object({ id: O.describe("Stable distribution channel identifier.") }),
  currentAssignment: Ve.describe("Assignment before rollback is applied."),
  targetAppVersion: H.describe("Version selected as the rollback target."),
  eligibility: i.object({
    channelId: O.describe("Channel evaluated for rollback."),
    targetStatus: fe.describe("Review state of the rollback target."),
    allowedStatuses: i.array(fe).describe("Version states allowed on this channel.")
  }),
  reason: E.optional()
}), yn = class {
  transport;
  constructor(e) {
    this.transport = e;
  }
  list() {
    return this.transport.request(w.channels.collection(), mn);
  }
  get(e, t = {}) {
    return this.transport.request(w.channels.item(e, zt(t)), pn);
  }
  assignments(e, t = {}) {
    const r = new URLSearchParams();
    return t.appId && r.set("appId", t.appId), this.transport.request(w.channels.versions(e, r), fn);
  }
  connect(e, t) {
    return this.transport.request(w.channels.versions(e), dt, {
      method: "POST",
      body: t
    });
  }
  disconnect(e, t, r = {}) {
    return this.transport.request(w.channels.version(e, t), dt, {
      method: "DELETE",
      body: r
    });
  }
  rollback(e, t) {
    return this.transport.request(w.channels.rollback(e), gn, {
      method: "POST",
      body: t
    });
  }
}, bn = i.enum([
  "version_submitted",
  "version_approved",
  "version_rejected",
  "version_deleted",
  "channel_connected",
  "channel_disconnected",
  "channel_reconnected"
]).describe("Audit event kind for version review and channel changes."), wn = i.object({
  eventId: i.string().min(1).describe("Stable audit event identifier."),
  eventType: bn,
  appId: g.describe("Stable app identifier for the event."),
  appVersionId: $.nullable().describe("Version affected by the event, when any."),
  channelId: O.nullable().describe("Channel affected by the event, when any."),
  actorUserId: i.string().min(1).nullable().describe("User ID that performed the event."),
  actorEmail: i.email().nullable().describe("Email for the actor, when available."),
  reason: i.string().nullable().describe("Audit reason recorded with the event."),
  previousAppVersionId: $.nullable().describe("Prior channel version, when changed."),
  nextAppVersionId: $.nullable().describe("Next channel version, when changed."),
  createdAt: i.iso.datetime().describe("Time the audit event was recorded.")
}).describe("Audit event for version review or channel assignment changes."), Te = i.object({ events: i.array(wn) }), vn = class {
  transport;
  constructor(e) {
    this.transport = e;
  }
  app(e) {
    return this.transport.request(w.apps.history(e), Te);
  }
  version(e) {
    return this.transport.request(w.versions.history(e), Te);
  }
  channel(e, t) {
    const r = new URLSearchParams({ appId: t.appId });
    return this.transport.request(w.channels.history(e, r), Te);
  }
}, sr = i.object({
  userId: i.string().min(1).describe("Stable user identifier for the member."),
  email: i.email().nullable().describe("Member email address, when available."),
  role: se.describe("Role granted to the app member."),
  createdAt: i.iso.datetime().nullable().describe("Time the membership was created."),
  updatedAt: i.iso.datetime().nullable().describe("Time the membership last changed.")
}).describe("User membership on a claimed app."), Rn = i.object({ members: i.array(sr) }), Xo = i.object({
  email: i.email().optional(),
  userId: i.string().min(1).describe("Stable user identifier for the member.").optional(),
  role: se
}).refine((e) => !!e.email != !!e.userId, {
  message: "Provide exactly one member selector: email or userId",
  path: ["email"]
}), Zo = i.object({ role: se }), lt = i.object({ member: sr }), Sn = class {
  transport;
  constructor(e) {
    this.transport = e;
  }
  list(e) {
    return this.transport.request(`/api/apps/${encodeURIComponent(e)}/members`, Rn);
  }
  add(e, t) {
    return this.transport.request(`/api/apps/${encodeURIComponent(e)}/members`, lt, {
      method: "POST",
      body: t
    });
  }
  setRole(e, t, r) {
    return this.transport.request(`/api/apps/${encodeURIComponent(e)}/members/${encodeURIComponent(t)}`, lt, {
      method: "PATCH",
      body: r
    });
  }
  async remove(e, t) {
    await this.transport.requestJson(`/api/apps/${encodeURIComponent(e)}/members/${encodeURIComponent(t)}`, { method: "DELETE" });
  }
}, In = [
  "created",
  "title_changed",
  "permissions_changed",
  "apps.access.granted",
  "apps.access.revoked",
  "deleted",
  "auth_failed"
], ec = i.enum(In), An = i.string().regex(/^prt_[A-Za-z0-9_-]{43}$/, "Expected a Registry access token secret"), tc = i.object({
  title: i.string().trim().min(1).max(80).refine(nr, { message: "Title cannot contain control characters" }),
  expiresAt: i.iso.datetime({ offset: !0 }).nullable().optional(),
  permissions: ne.default([])
}), rc = i.object({
  title: i.string().trim().min(1).max(80).refine(nr, { message: "Title cannot contain control characters" }).optional(),
  expiresAt: i.iso.datetime({ offset: !0 }).nullable().optional()
}), sc = i.object({ permissions: ne });
function nr(e) {
  return Array.from(e).every((t) => {
    const r = t.codePointAt(0) ?? 0;
    return r > 31 && r !== 127;
  });
}
var nc = i.object({ appId: g }), W = i.object({
  id: i.string(),
  ownerId: i.string(),
  title: i.string(),
  tokenPrefix: i.string(),
  permissions: ne,
  expiresAt: i.string().nullable(),
  deletedAt: i.string().nullable(),
  lastUsedAt: i.string().nullable(),
  createdAt: i.string(),
  updatedAt: i.string()
}), ar = i.object({
  tokenId: i.string(),
  appId: g,
  grantedBy: i.string(),
  deletedAt: i.string().nullable(),
  createdAt: i.string(),
  updatedAt: i.string()
}), _n = i.object({
  token: W,
  secret: An
}), En = i.object({
  token: W,
  removedPermissions: ne.optional()
}), Pn = i.object({ tokens: i.array(W) }), kn = i.object({
  token: W,
  grants: i.array(ar)
}), ut = i.object({ grant: ar }), de = i.object({
  token: W.optional(),
  permissions: ne
}), jn = i.object({ token: W }), Tn = class {
  transport;
  constructor(e) {
    this.transport = e;
  }
  create(e) {
    return this.transport.request("/api/tokens", _n, {
      method: "POST",
      body: e
    });
  }
  list() {
    return this.transport.request("/api/tokens", Pn);
  }
  status(e) {
    return this.transport.request(`/api/tokens/${encodeURIComponent(e)}`, kn);
  }
  update(e, t) {
    return this.transport.request(`/api/tokens/${encodeURIComponent(e)}`, En, {
      method: "PATCH",
      body: t
    });
  }
  listPermissions(e) {
    return this.transport.request(`/api/tokens/${encodeURIComponent(e)}/permissions`, de);
  }
  setPermissions(e, t) {
    return this.transport.request(`/api/tokens/${encodeURIComponent(e)}/permissions`, de, {
      method: "PUT",
      body: t
    });
  }
  addPermissions(e, t) {
    return this.transport.request(`/api/tokens/${encodeURIComponent(e)}/permissions`, de, {
      method: "POST",
      body: t
    });
  }
  removePermissions(e, t) {
    return this.transport.request(`/api/tokens/${encodeURIComponent(e)}/permissions`, de, {
      method: "DELETE",
      body: t
    });
  }
  grant(e, t) {
    return this.transport.request(`/api/tokens/${encodeURIComponent(e)}/apps`, ut, {
      method: "POST",
      body: t
    });
  }
  ungrant(e, t) {
    return this.transport.request(`/api/tokens/${encodeURIComponent(e)}/apps`, ut, {
      method: "DELETE",
      body: t
    });
  }
  delete(e) {
    return this.transport.request(`/api/tokens/${encodeURIComponent(e)}`, jn, { method: "DELETE" });
  }
}, Cn = i.object({
  path: i.string().min(1),
  size: i.number().int().nonnegative(),
  contentType: i.string().min(1)
}), ac = i.object({
  appId: g.describe("Stable app identifier receiving the upload."),
  manifest: Wt.partial().optional(),
  files: i.array(Cn).min(1)
}), xn = i.object({
  uploadId: Ut.describe("Stable upload session identifier."),
  expiresAt: i.iso.datetime().describe("Time the upload URLs expire."),
  files: i.array(i.object({
    path: i.string().min(1),
    method: i.literal("PUT"),
    url: i.url(),
    headers: i.record(i.string().min(1), i.string())
  }))
}), ic = i.object({ forceApprove: i.boolean().optional() }), $n = i.object({
  appId: g.describe("Stable app identifier for the completed upload."),
  appVersionId: $.describe("Version created from the upload."),
  status: i.enum(["submitted", "approved"]).describe("Initial review state for the uploaded version."),
  versionRootUrl: i.url(),
  registryAssets: i.array(es).default([]),
  receipt: i.object({
    uploadId: Ut.describe("Stable upload session identifier."),
    appId: g.describe("Stable app identifier for the completed upload."),
    appVersionId: $.describe("Version created from the upload.")
  })
}), Un = class {
  transport;
  constructor(e) {
    this.transport = e;
  }
  create(e) {
    return this.transport.request("/api/uploads", xn, {
      method: "POST",
      body: e
    });
  }
  complete(e, t) {
    return this.transport.request(`/api/uploads/${encodeURIComponent(e)}/complete`, $n, {
      method: "POST",
      body: t
    });
  }
}, oc = i.object({ reason: E.optional() }), cc = i.object({ reason: E }), dc = i.object({ reason: E }), lc = un.extend({
  appId: g.describe("Filter versions by stable app identifier.").optional(),
  status: fe.describe("Filter versions by review lifecycle state.").optional(),
  channel: O.describe("Filter versions by connected channel.").optional()
}), pt = i.object({ appVersion: H }), Mn = i.object({
  appVersion: H.extend({ deletedAt: i.iso.datetime().describe("Time this version was deleted.") }),
  event: i.object({
    eventId: i.string().min(1).describe("Stable audit event identifier."),
    eventType: i.literal("version_deleted").describe("Audit event type for the deletion."),
    actorUserId: i.string().min(1).nullable().describe("User ID that performed the deletion."),
    actorEmail: i.email().nullable().describe("Email for the actor, when available."),
    reason: i.string().min(1).describe("Audit reason recorded with the deletion."),
    createdAt: i.iso.datetime().describe("Time the audit event was recorded.")
  })
}), On = i.object({ appVersions: i.array(H) }), qn = i.object({ appVersion: H });
var I = class extends Error {
  status;
  code;
  rawPayload;
  constructor(e) {
    super(e.message), this.name = "RegistryHttpError", this.status = e.status, this.code = e.code, this.rawPayload = e.rawPayload;
  }
}, ir = class {
  registryUrl;
  token;
  tokenProvider;
  fetchImplementation;
  constructor(e = {}) {
    this.registryUrl = or(e.registryUrl), this.token = e.token, this.tokenProvider = e.tokenProvider, this.fetchImplementation = e.fetch ?? fetch;
  }
  async request(e, t, r = {}) {
    const s = await this.requestJson(e, r);
    return t.parse(s);
  }
  async requestJson(e, t = {}) {
    const r = await this.fetchImplementation(`${this.registryUrl}${Nn(e)}`, {
      method: t.method || "GET",
      headers: await this.createHeaders(t.headers),
      body: t.body === void 0 ? void 0 : JSON.stringify(t.body)
    }), s = r.status === 204 ? null : await Dn(r);
    if (!r.ok) throw new I({
      status: r.status,
      code: Ln(s),
      message: Vn(s) || `Registry request failed: ${r.status}`,
      rawPayload: s
    });
    return s;
  }
  async createHeaders(e = {}) {
    const t = this.token ?? (this.tokenProvider ? await this.tokenProvider() : void 0);
    return {
      "content-type": "application/json",
      ...t ? { authorization: `Bearer ${t}` } : {},
      ...e
    };
  }
};
function or(e) {
  return (e?.trim() || "https://registry.primerlearn.dev").replace(/\/+$/, "");
}
function Nn(e) {
  return e.startsWith("/") ? e : `/${e}`;
}
async function Dn(e) {
  if ((e.headers.get("content-type") || "").includes("application/json")) return e.json();
  const t = await e.text();
  if (!t) return null;
  try {
    return JSON.parse(t);
  } catch {
    return t;
  }
}
function Ln(e) {
  if (!e || typeof e != "object") return null;
  const t = e;
  return typeof t.code == "string" ? t.code : typeof t.error == "string" ? t.error : null;
}
function Vn(e) {
  if (!e || typeof e != "object") return null;
  const t = e;
  return typeof t.message == "string" ? t.message : typeof t.error == "string" ? t.error : null;
}
var cr = class extends I {
  blockingChannelIds;
  constructor(e, t) {
    super({
      status: e.status,
      code: e.code,
      message: e.message,
      rawPayload: e.rawPayload
    }), this.name = "RegistryVersionDeleteBlockedError", this.blockingChannelIds = t;
  }
}, Bn = class {
  transport;
  constructor(e) {
    this.transport = e;
  }
  approve(e, t = {}) {
    return this.transport.request(`/api/versions/${encodeURIComponent(e)}/approve`, pt, {
      method: "POST",
      body: t
    });
  }
  reject(e, t) {
    return this.transport.request(`/api/versions/${encodeURIComponent(e)}/reject`, pt, {
      method: "POST",
      body: t
    });
  }
  async delete(e, t) {
    try {
      return await this.transport.request(w.versions.item(e), Mn, {
        method: "DELETE",
        body: t
      });
    } catch (r) {
      throw r instanceof I && r.code === "version_delete_blocked_by_channel" ? new cr(r, Fn(r.rawPayload)) : r;
    }
  }
  list(e = {}) {
    const t = new URLSearchParams();
    e.status && t.set("status", e.status), e.channel && t.set("channel", e.channel), zt(e, t);
    const r = e.appId, s = r ? w.apps.versions(r, t) : w.versions.collection(t);
    return this.transport.request(s, On);
  }
  show(e) {
    return this.transport.request(w.versions.item(e), qn);
  }
};
function Fn(e) {
  if (!e || typeof e != "object") return [];
  const t = e.details;
  if (!t || typeof t != "object") return [];
  const r = t.blockingChannelIds;
  return Array.isArray(r) ? r.filter((s) => typeof s == "string") : [];
}
var mt = class {
  transport;
  auth;
  apps;
  assets;
  uploads;
  versions;
  channels;
  members;
  tokens;
  history;
  admin;
  constructor(e = {}) {
    this.transport = e.transport ?? new ir(e), this.auth = new Cs(this.transport), this.apps = new Es(this.transport), this.assets = new zs(this.transport), this.uploads = new Un(this.transport), this.versions = new Bn(this.transport), this.channels = new yn(this.transport), this.members = new Sn(this.transport), this.tokens = new Tn(this.transport), this.history = new vn(this.transport), this.admin = new Rs(this.transport);
  }
};
async function Jn(e, t, r = {}) {
  return new ir({ registryUrl: e }).requestJson(t, r);
}
function ye(e, t = process.env) {
  return or(e.registryUrl || t.VITE_REGISTRY_URL);
}
function L(e, t = {}) {
  return t.request ? new mt({
    registryUrl: e,
    token: t.token,
    fetch: async (r, s) => {
      const n = new URL(String(r)), a = await t.request(e, `${n.pathname}${n.search}`, {
        method: s?.method === "GET" ? void 0 : s?.method,
        headers: zn(s?.headers),
        body: typeof s?.body == "string" ? JSON.parse(s.body) : void 0
      });
      return new Response(JSON.stringify(a), { headers: { "content-type": "application/json" } });
    }
  }) : new mt({
    registryUrl: e,
    token: t.token
  });
}
function zn(e) {
  if (!e) return;
  const t = Object.fromEntries(new Headers(e));
  return delete t["content-type"], Object.keys(t).length > 0 ? t : void 0;
}
function A(e) {
  return {
    json: e.json === !0,
    human(t) {
      e.json || e.write(t);
    },
    result(t) {
      e.write(dr(t));
    }
  };
}
function _(e, t) {
  return t.json === !0 || e.opts().json === !0;
}
function dr(e) {
  return JSON.stringify(e, null, 2);
}
function h(e, t, r) {
  if (e.json) {
    e.result(t);
    return;
  }
  e.human(r);
}
function y(e) {
  process.exitCode = e;
}
function Gn(e, t) {
  const r = e.command("auth").description("Manage Registry CLI authentication");
  r.command("login").description("Sign in through the Registry browser flow").option("-u, --registry-url <url>", "Registry URL").option("--json", "Print a machine-readable result").action(async (s) => {
    const n = A({
      json: _(e, s),
      write: t.write
    });
    if (n.json) {
      y(2), n.result({
        status: "interactive_auth_required",
        message: "Interactive browser auth is not available in JSON mode. Run `registry auth login` without --json."
      });
      return;
    }
    const a = ye({
      ...e.opts(),
      ...s
    }), o = L(a, { request: t.request }), c = await o.auth.start(), d = await t.openBrowser(c.verificationUriComplete);
    t.write(d ? "Attempted to open Registry login in your browser:" : "Could not open Registry login in your browser. Open this URL manually:"), t.write(c.verificationUriComplete), t.write(`Confirm code ${c.userCode} in the browser.`);
    const l = t.now() + c.expiresIn * 1e3;
    for (; t.now() < l; ) {
      await t.sleep(c.interval * 1e3);
      const u = await o.auth.poll({ deviceCode: c.deviceCode });
      if (u.status !== "pending") {
        await t.saveSession({
          registryUrl: a,
          accessToken: u.accessToken,
          refreshToken: u.refreshToken,
          expiresAt: new Date(t.now() + u.expiresIn * 1e3).toISOString(),
          account: u.account
        }), t.write(`Signed in as ${u.account.email || u.account.userId}.`);
        return;
      }
    }
    throw new Error("Login timed out");
  }), r.command("whoami").description("Print the current Registry identity").option("-u, --registry-url <url>", "Registry URL").option("--json", "Print a machine-readable result").action(async (s) => {
    const n = A({
      json: _(e, s),
      write: t.write
    }), a = ye({
      ...e.opts(),
      ...s
    }), o = Hn(e), c = process.env.REGISTRY_ACCESS_TOKEN, d = o || c, l = d ? {
      registryUrl: a,
      accessToken: d,
      refreshToken: "",
      expiresAt: new Date(t.now() + 3600 * 1e3).toISOString(),
      account: {
        userId: "access-token",
        email: null
      }
    } : await lr(a, t), u = await L(l.registryUrl, {
      token: l.accessToken,
      request: t.request
    }).auth.whoami();
    if (n.json) {
      n.result({
        status: "authenticated",
        registryUrl: l.registryUrl,
        account: u.account
      });
      return;
    }
    n.human(u.account.email || u.account.userId);
  }), r.command("logout").description("Revoke the stored CLI session").option("--json", "Print a machine-readable result").action(async (s) => {
    const n = A({
      json: _(e, s),
      write: t.write
    });
    if (n.json) {
      y(2), n.result({
        status: "session_mutation_disabled_in_json",
        message: "Logout mutates the stored CLI session and is not available in JSON mode."
      });
      return;
    }
    const a = await t.readSession();
    a && await L(a.registryUrl, { request: t.request }).auth.revoke({ refreshToken: a.refreshToken }).catch(() => {
    }), await t.removeSession(), n.human("Logged out.");
  });
}
function Hn(e) {
  const t = e.opts().token;
  return typeof t == "string" && t.trim() ? t.trim() : void 0;
}
async function lr(e, t) {
  const r = await t.readSession();
  if (!r || r.registryUrl !== e) throw new Error("No Registry session found. Run `registry auth login`.");
  if (new Date(r.expiresAt).getTime() > t.now() + 3e4) return r;
  const s = await L(e, { request: t.request }).auth.refresh({ refreshToken: r.refreshToken }), n = {
    registryUrl: e,
    accessToken: s.accessToken,
    refreshToken: s.refreshToken,
    expiresAt: new Date(t.now() + s.expiresIn * 1e3).toISOString(),
    account: s.account
  };
  return await t.saveSession(n), n;
}
async function U(e, t, r, s, n) {
  const a = A({
    json: _(e, r),
    write: t.write
  });
  try {
    const { session: o, client: c } = await _e(e, t, { tokenPolicy: n.tokenPolicy }), d = await s({
      session: o,
      client: c,
      output: a
    });
    h(a, d.payload, d.message);
  } catch (o) {
    y(n.isUsageError?.(o) || o instanceof I && o.status >= 400 && o.status < 500 ? 2 : 1);
    const c = n.formatError?.(o) ?? Qn(o, n.defaultErrorMessage);
    if (a.json) {
      a.result(c);
      return;
    }
    throw new Error(c.message);
  }
}
async function _e(e, t, r = {}) {
  const s = ye(e.opts()), n = r.tokenPolicy || "allow-access-token", a = Wn(e), o = process.env.REGISTRY_ACCESS_TOKEN, c = n === "browser-session-only" ? void 0 : a || o, d = c ? Yn(s, c, t.now()) : await lr(s, t);
  return {
    session: d,
    client: L(d.registryUrl, {
      token: d.accessToken,
      request: t.request
    })
  };
}
function Wn(e) {
  const t = e.opts().token;
  return typeof t == "string" && t.trim() ? t.trim() : void 0;
}
function Yn(e, t, r) {
  return {
    registryUrl: e,
    accessToken: t,
    refreshToken: "",
    expiresAt: new Date(r + 3600 * 1e3).toISOString(),
    account: {
      userId: "access-token",
      email: null
    }
  };
}
function Qn(e, t) {
  return {
    status: "error",
    message: e instanceof Error ? e.message : t
  };
}
var Kn = /* @__PURE__ */ Wr(((e, t) => {
  var r = String, s = function() {
    return {
      isColorSupported: !1,
      reset: r,
      bold: r,
      dim: r,
      italic: r,
      underline: r,
      inverse: r,
      hidden: r,
      strikethrough: r,
      black: r,
      red: r,
      green: r,
      yellow: r,
      blue: r,
      magenta: r,
      cyan: r,
      white: r,
      gray: r,
      bgBlack: r,
      bgRed: r,
      bgGreen: r,
      bgYellow: r,
      bgBlue: r,
      bgMagenta: r,
      bgCyan: r,
      bgWhite: r,
      blackBright: r,
      redBright: r,
      greenBright: r,
      yellowBright: r,
      blueBright: r,
      magentaBright: r,
      cyanBright: r,
      whiteBright: r,
      bgBlackBright: r,
      bgRedBright: r,
      bgGreenBright: r,
      bgYellowBright: r,
      bgBlueBright: r,
      bgMagentaBright: r,
      bgCyanBright: r,
      bgWhiteBright: r
    };
  };
  t.exports = s(), t.exports.createColors = s;
})), Q = /* @__PURE__ */ Qr(Kn(), 1), f = {
  heading: Q.default.bold,
  id: Q.default.cyan,
  success: Q.default.green,
  warning: Q.default.yellow,
  placeholder: Q.default.dim
};
function j({ columns: e, rows: t, emptyMessage: r }) {
  if (t.length === 0) return r;
  const s = t.map((a) => e.map((o) => Xn(o, a))), n = e.map((a, o) => Math.max(a.header.length, ...s.map((c) => c[o]?.raw.length ?? 0)));
  return [e.map((a, o) => f.heading(ft(a.header, n[o], o, e))).join("  "), ...s.map((a) => a.map((o, c) => (o.color || ur)(ft(o.raw, n[c], c, a))).join("  "))].join(`
`);
}
function ft(e, t, r, s) {
  return r === s.length - 1 ? e : e.padEnd(t);
}
function Xn(e, t) {
  const r = e.value(t);
  return r && typeof r == "object" && "value" in r ? {
    raw: ht(r.value),
    color: r.color ?? ((s) => gt(s, e, t))
  } : {
    raw: ht(r),
    color: (s) => gt(s, e, t)
  };
}
function ht(e) {
  return e == null || e === "" ? "-" : String(e);
}
function ur(e) {
  return e.trim() === "-" ? f.placeholder(e) : e;
}
function gt(e, t, r) {
  return e.trim() === "-" ? ur(e) : t.color?.(e, r) ?? e;
}
function Zn(e, t) {
  ea(e, t), ta(e, t);
}
function ea(e, t) {
  const r = e.command("allowlist").description("Manage Registry CLI login allowlist entries");
  r.command("list").option("--json", "Print a machine-readable result").action(async (s) => {
    await k(e, t, s, async ({ client: n }) => {
      const a = await n.admin.listEmailAllowlistEntries();
      return {
        payload: a,
        message: na(a.entries)
      };
    });
  }), r.command("add-email").argument("<email>", "Email address to allow").option("--description <text>", "Allowlist description").option("--json", "Print a machine-readable result").action(async (s, n) => {
    await k(e, t, n, async ({ client: a }) => {
      const o = await a.admin.createEmailAllowlistEntry({
        entryType: ge.email,
        value: s,
        description: n.description,
        reason: n.description || "Added email allowlist entry via CLI"
      });
      return {
        payload: o,
        message: `Added email allowlist entry ${o.entry.value}.`
      };
    });
  }), r.command("add-domain").argument("<domain>", "Email domain to allow").option("--description <text>", "Allowlist description").option("--json", "Print a machine-readable result").action(async (s, n) => {
    await k(e, t, n, async ({ client: a }) => {
      const o = await a.admin.createEmailAllowlistEntry({
        entryType: ge.domain,
        value: s,
        description: n.description,
        reason: n.description || "Added domain allowlist entry via CLI"
      });
      return {
        payload: o,
        message: `Added domain allowlist entry ${o.entry.value}.`
      };
    });
  }), r.command("disable").argument("<entry-id>", "Allowlist entry ID").option("--json", "Print a machine-readable result").action(async (s, n) => {
    await k(e, t, n, async ({ client: a }) => {
      const o = await a.admin.updateEmailAllowlistEntry(s, {
        enabled: !1,
        reason: "Disabled allowlist entry via CLI"
      });
      return {
        payload: o,
        message: `Disabled allowlist entry ${o.entry.id}.`
      };
    });
  }), r.command("enable").argument("<entry-id>", "Allowlist entry ID").option("--json", "Print a machine-readable result").action(async (s, n) => {
    await k(e, t, n, async ({ client: a }) => {
      const o = await a.admin.updateEmailAllowlistEntry(s, {
        enabled: !0,
        reason: "Enabled allowlist entry via CLI"
      });
      return {
        payload: o,
        message: `Enabled allowlist entry ${o.entry.id}.`
      };
    });
  });
}
function ta(e, t) {
  const r = e.command("users").description("Manage Registry users");
  r.command("list").option("--json", "Print a machine-readable result").action(async (s) => {
    await k(e, t, s, async ({ client: n }) => {
      const a = await n.admin.listUsers();
      return {
        payload: a,
        message: aa(a.users)
      };
    });
  }), r.command("show").option("--email <email>", "Find a user by email").option("--user-id <user-id>", "Find a user by durable user ID").option("--json", "Print a machine-readable result").action(async (s) => {
    await k(e, t, s, async ({ client: n }) => {
      le(s);
      const a = s.userId ? await n.admin.getUser(s.userId) : await n.admin.getUserByEmail(s.email);
      return {
        payload: a,
        message: ia(a.user)
      };
    });
  }), r.command("grant-permissions").argument("[permissions...]", "Concrete permissions to grant").option("--email <email>", "Find a user by email").option("--user-id <user-id>", "Find a user by durable user ID").option("--preset <preset>", `Permission preset to grant: ${X.join(", ")}`).requiredOption("--reason <text>", "Permission grant reason").option("--json", "Print a machine-readable result").action(async (s, n) => {
    await k(e, t, n, async ({ client: a }) => {
      le(n), yt(n.preset);
      const o = bt(s);
      if (o.length === 0 && !n.preset) throw new z("Grant at least one permission or --preset");
      const c = await Ce(n, a.admin), d = await a.admin.updateUserPermissions(c, {
        grantPermissions: o,
        grantPreset: n.preset,
        reason: n.reason
      });
      return {
        payload: d,
        message: `Granted permissions to ${d.user.id}.`
      };
    });
  }), r.command("revoke-permissions").argument("[permissions...]", "Concrete permissions to revoke").option("--email <email>", "Find a user by email").option("--user-id <user-id>", "Find a user by durable user ID").option("--preset <preset>", `Permission preset to revoke: ${X.join(", ")}`).requiredOption("--reason <text>", "Permission revocation reason").option("--json", "Print a machine-readable result").action(async (s, n) => {
    await k(e, t, n, async ({ client: a }) => {
      le(n), yt(n.preset);
      const o = bt(s);
      if (o.length === 0 && !n.preset) throw new z("Revoke at least one permission or --preset");
      const c = await Ce(n, a.admin), d = await a.admin.updateUserPermissions(c, {
        revokePermissions: o,
        revokePreset: n.preset,
        reason: n.reason
      });
      return {
        payload: d,
        message: `Revoked permissions from ${d.user.id}.`
      };
    });
  }), r.command("revoke-sessions").option("--email <email>", "Find a user by email").option("--user-id <user-id>", "Find a user by durable user ID").requiredOption("--reason <text>", "Session revocation reason").option("--json", "Print a machine-readable result").action(async (s) => {
    await k(e, t, s, async ({ client: n }) => {
      le(s);
      const a = await Ce(s, n.admin), o = await n.admin.revokeUserSessions(a, { reason: s.reason });
      return {
        payload: o,
        message: `Revoked ${o.revokedSessionCount} session(s) for ${o.userId}.`
      };
    });
  });
}
async function k(e, t, r, s) {
  await U(e, t, r, s, {
    defaultErrorMessage: "Registry admin command failed",
    formatError: ra,
    isUsageError: ca
  });
}
function ra(e) {
  return e instanceof I ? {
    status: sa(e),
    message: e.message
  } : {
    status: "error",
    message: e instanceof Error ? e.message : "Registry admin command failed"
  };
}
function sa(e) {
  return e.code === "validation_failed" || e.status === 400 ? "validation_failed" : e.code === "forbidden" || e.status === 403 ? "permission_denied" : e.code === "unauthorized" || e.status === 401 ? "unauthorized" : e.code === "user_not_found" || e.status === 404 ? "user_not_found" : e.code === "email_allowlist_entry_not_found" ? "email_allowlist_entry_not_found" : e.code === "email_allowlist_entry_already_exists" ? "email_allowlist_entry_already_exists" : e.code === "last_admin_required" ? "last_admin_required" : "error";
}
function le(e) {
  if (e.email && e.userId) throw new z("Provide either --email or --user-id, not both");
  if (!e.email && !e.userId) throw new z("Provide a user selector with --email or --user-id");
}
function yt(e) {
  if (e && !X.includes(e)) throw new z(`Preset must be one of: ${X.join(", ")}`);
}
function bt(e) {
  return e.length === 0 ? [] : Dt(e);
}
async function Ce(e, t) {
  return e.userId ? e.userId : (await t.getUserByEmail(e.email)).user.id;
}
function na(e) {
  return j({
    columns: [
      {
        header: "ENTRY ID",
        value: (t) => t.id,
        color: f.id
      },
      {
        header: "TYPE",
        value: (t) => t.entryType
      },
      {
        header: "VALUE",
        value: (t) => t.value
      },
      {
        header: "STATUS",
        value: (t) => t.disabledAt ? "disabled" : "enabled",
        color: oa
      },
      {
        header: "DESCRIPTION",
        value: (t) => t.description
      }
    ],
    rows: e,
    emptyMessage: "No allowlist entries found."
  });
}
function aa(e) {
  return j({
    columns: [
      {
        header: "USER ID",
        value: (t) => t.id,
        color: f.id
      },
      {
        header: "EMAIL",
        value: (t) => t.email
      },
      {
        header: "PERMISSIONS",
        value: (t) => t.permissions.join(",")
      }
    ],
    rows: e,
    emptyMessage: "No users found."
  });
}
function ia(e) {
  return [
    e.id,
    e.email || "",
    e.permissions.join(",")
  ].join("	");
}
function oa(e) {
  return e.trim() === "enabled" ? f.success(e) : f.warning(e);
}
var z = class extends Error {
};
function ca(e) {
  return e instanceof z;
}
var da = "@superbuilders/primer-tives", la = /^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/;
async function ua(e) {
  return Yt(await S(e, "utf8"));
}
async function ee(e) {
  const t = await S(e, "utf8");
  let r;
  try {
    r = JSON.parse(t);
  } catch {
    throw new Error("manifest.json must be valid JSON");
  }
  if (!r || typeof r != "object" || Array.isArray(r)) throw new Error("manifest.json must be a JSON object");
  return {
    manifest: Ae(r),
    document: r
  };
}
async function pa(e) {
  return Yt(await S(e, "utf8"));
}
async function J(e, t) {
  await Le(e, `${JSON.stringify(t, null, 2)}
`);
}
function pr(e) {
  return Kr(e);
}
async function Ke(e) {
  let t;
  try {
    t = JSON.parse(await S(C(e, "package.json"), "utf8"));
  } catch (s) {
    if (fa(s)) return null;
    throw s;
  }
  const r = ma(t, da);
  return r && la.test(r) ? r : null;
}
function ma(e, t) {
  if (!e || typeof e != "object") return null;
  for (const r of [
    "dependencies",
    "devDependencies",
    "peerDependencies",
    "optionalDependencies"
  ]) {
    const s = e[r];
    if (!s || typeof s != "object") continue;
    const n = s[t];
    if (typeof n == "string") return n;
  }
  return null;
}
function fa(e) {
  return e instanceof Error && "code" in e && e.code === "ENOENT";
}
function M(e = {}) {
  const t = x(e.cwd ?? process.cwd(), e.root ?? "."), r = wt(t, e.manifest ?? "manifest.json"), s = wt(t, e.dist ?? "dist");
  return {
    root: t,
    sourceManifest: r,
    artifactDirectory: s,
    artifactManifest: x(s, $s),
    artifactEntrypoint: x(s, xs)
  };
}
function wt(e, t) {
  return Oe(t) ? x(t) : x(e, t);
}
async function mr(e, t) {
  const r = M({
    root: e.root,
    manifest: e.manifest
  }), s = await fr(r.sourceManifest), n = [];
  let a = {};
  if (s) try {
    a = { ...(await ee(r.sourceManifest)).document };
  } catch (l) {
    if (e.json) throw l;
    if (a = { ...await ga(r.sourceManifest) }, typeof a.title != "string" || a.title.trim() === "") delete a.title;
    else throw l;
  }
  if (typeof a.title != "string" || a.title.trim() === "") {
    if (e.json)
      return n.push("Manifest title is required."), {
        status: "missing_required_input",
        manifestPath: r.sourceManifest,
        manifestExists: s,
        wrote: !1,
        suggestedManifest: {
          ...a,
          title: "",
          tags: Array.isArray(a.tags) ? a.tags : []
        },
        suggestedFields: {},
        diagnostics: n,
        nextCommands: [`registry init${e.manifest ? ` --manifest ${e.manifest}` : ""}`]
      };
    const l = await t.promptText("App title?");
    if (!l.trim())
      return n.push("Manifest title is required."), {
        status: "cancelled",
        manifestPath: r.sourceManifest,
        manifestExists: s,
        wrote: !1,
        suggestedFields: {},
        diagnostics: n,
        nextCommands: []
      };
    a.title = l.trim();
  }
  Array.isArray(a.tags) || (a.tags = []);
  const o = {};
  if ((typeof a.appId != "string" || a.appId.trim() === "") && (o.appId = pr(String(a.title))), a.primerSdkVersion === void 0 || a.primerSdkVersion === null) {
    const l = await Ke(r.root);
    l && (o.primerSdkVersion = l);
  }
  const c = {
    ...a,
    ...o
  }, d = ["registry claim"];
  if (e.json) return {
    status: s && Object.keys(o).length > 0 ? "needs_manifest_update" : "initialized_preview",
    manifestPath: r.sourceManifest,
    manifestExists: s,
    wrote: !1,
    suggestedManifest: c,
    suggestedFields: o,
    diagnostics: n,
    nextCommands: d
  };
  if (t.write(ya(r.sourceManifest, c, r.artifactDirectory)), Object.keys(o).length === 0 && s)
    return t.write("Manifest is already initialized."), e.suppressFinalClaimPrompt || t.write("Next: registry claim"), {
      status: "unchanged",
      manifestPath: r.sourceManifest,
      manifestExists: s,
      wrote: !1,
      manifest: a,
      suggestedFields: o,
      diagnostics: n,
      nextCommands: d
    };
  if (!await t.confirm(`Write manifest to ${r.sourceManifest}?`, { defaultValue: !0 }))
    return t.write("Registry init cancelled."), {
      status: "cancelled",
      manifestPath: r.sourceManifest,
      manifestExists: s,
      wrote: !1,
      suggestedManifest: c,
      suggestedFields: o,
      diagnostics: n,
      nextCommands: []
    };
  if (await J(r.sourceManifest, c), t.write(`Wrote ${r.sourceManifest}.`), !e.suppressFinalClaimPrompt) {
    const l = await t.confirm("Claim this app now?", { defaultValue: !1 });
    t.write("Next: registry claim");
  }
  return {
    status: "initialized",
    manifestPath: r.sourceManifest,
    manifestExists: s,
    wrote: !0,
    manifest: c,
    suggestedManifest: c,
    suggestedFields: o,
    diagnostics: n,
    nextCommands: d
  };
}
async function ha(e, t) {
  return fr(M({
    root: e,
    manifest: t
  }).sourceManifest);
}
async function ga(e) {
  const { readFile: t } = await import("node:fs/promises");
  let r;
  try {
    r = JSON.parse(await t(e, "utf8"));
  } catch {
    throw new Error("manifest.json must be valid JSON");
  }
  if (!r || typeof r != "object" || Array.isArray(r)) throw new Error("manifest.json must be a JSON object");
  return r;
}
async function fr(e) {
  try {
    return await Pt(e), !0;
  } catch (t) {
    if (t instanceof Error && "code" in t && t.code === "ENOENT") return !1;
    throw t;
  }
}
function ya(e, t, r) {
  return `Registry manifest preview

Path: ${e}

${dr(t)}

Expected build output:
  ${r}/index.html
  ${r}/manifest.json`;
}
function ba(e, t) {
  hr(e.command("claim"), e, t);
}
function wa(e, t, r) {
  hr(e.command("claim"), t, r);
}
function hr(e, t, r) {
  e.argument("[root]", "Primer app project root", ".").description("Claim a Primer app ID in the Registry").option("-m, --manifest <path>", "Source manifest path").option("--dry-run", "Validate claim readiness without creating Registry state").option("--json", "Print a machine-readable result").action(async (s, n) => {
    const a = A({
      json: _(t, n),
      write: r.write
    });
    try {
      const o = M({
        root: s,
        manifest: n.manifest
      });
      if (!await ha(s, n.manifest)) {
        if (a.json || n.dryRun) {
          y(2), h(a, {
            status: "needs_init",
            message: "No source manifest found. Run registry init before claiming this app.",
            nextCommand: "registry init --json"
          }, "No source manifest found. Run registry init before claiming this app.");
          return;
        }
        if (a.human("No source manifest found. Initialize Registry metadata before claiming this app."), !await r.confirm("Run registry init now?", { defaultValue: !0 })) {
          a.human("Claim cancelled.");
          return;
        }
        const v = await mr({
          root: s,
          manifest: n.manifest,
          suppressFinalClaimPrompt: !0
        }, r);
        if (v.status !== "initialized" && v.status !== "unchanged") {
          a.human("Claim cancelled.");
          return;
        }
        if (!await r.confirm("Continue claiming this app?", { defaultValue: !0 })) {
          a.human("Claim cancelled.");
          return;
        }
      }
      const { client: c } = await _e(t, r), { manifest: d, document: l } = await ee(o.sourceManifest), u = d.appId || pr(d.title), p = await Sa(o.root, l);
      if (!d.appId && (a.json || n.dryRun)) {
        y(2), h(a, {
          status: "needs_manifest_update",
          manifestPath: o.sourceManifest,
          suggestedFields: vt(u, p),
          message: "Update manifest.json, then rerun registry claim."
        }, "Update manifest.json, then rerun registry claim.");
        return;
      }
      const m = await c.apps.availability(u);
      if (m.exists || !m.available) {
        if (!n.dryRun) {
          const v = await Ra(c, u);
          if (v?.exists && "claim" in v && v.claim.claimedByCurrentUser) {
            h(a, {
              status: "already_claimed",
              appId: u
            }, `App ${u} is already claimed by this account.`);
            return;
          }
        }
        y(3), h(a, {
          status: "app_id_unavailable",
          appId: u,
          message: "Edit manifest.json with a different appId, then rerun registry claim."
        }, `App ID ${u} is unavailable. Edit manifest.json with a different appId, then rerun registry claim.`);
        return;
      }
      if (n.dryRun) {
        h(a, {
          status: "claim_ready",
          appId: u,
          available: !0,
          exists: !1
        }, `App ID ${u} is available to claim.`);
        return;
      }
      if (!a.json && (a.human(va(d, u)), !await r.confirm("Create app?", { defaultValue: !0 }))) {
        a.human("Claim cancelled.");
        return;
      }
      const P = await c.apps.create({
        appId: u,
        title: d.title
      });
      d.appId || await J(o.sourceManifest, {
        ...l,
        ...vt(P.appId, p)
      }), h(a, {
        status: "claimed",
        appId: P.appId,
        created: P.created
      }, `Claimed app ${P.appId}.`);
    } catch (o) {
      if (y(1), a.json) {
        a.result({
          status: "error",
          message: o instanceof Error ? o.message : "Registry claim failed"
        });
        return;
      }
      throw o;
    }
  });
}
function va(e, t) {
  return `Create new app?

Title: ${e.title}
App ID: ${t}`;
}
function vt(e, t) {
  return t ? {
    appId: e,
    primerSdkVersion: t
  } : { appId: e };
}
async function Ra(e, t) {
  try {
    return await e.apps.get(t);
  } catch {
    return null;
  }
}
async function Sa(e, t) {
  return t.primerSdkVersion !== void 0 && t.primerSdkVersion !== null ? null : Ke(e);
}
function G(e) {
  return e.some((t) => t.severity === "error");
}
function oe(e) {
  return e.map(Ia).join(`
`);
}
function Ia(e) {
  const t = e.target ? ` (${e.target})` : "", r = e.nextCommand ? ` Run: ${e.nextCommand}` : "";
  return `${e.severity}: ${e.message}${t}${r}`;
}
async function Xe(e = {}) {
  const t = M({
    cwd: e.cwd,
    root: e.root,
    manifest: e.manifest
  });
  if (e.appId) return {
    paths: t,
    appId: e.appId,
    diagnostics: []
  };
  const r = [], s = await Aa(t.sourceManifest, r);
  if (!s) return {
    paths: t,
    appId: null,
    diagnostics: r
  };
  try {
    const n = Ae(s);
    if (n.appId) return {
      paths: t,
      appId: n.appId,
      diagnostics: r
    };
    r.push({
      code: "manifest_missing_app_id",
      severity: "error",
      message: "Source manifest is missing appId.",
      source: "manifest",
      target: t.sourceManifest,
      nextCommand: "registry claim"
    });
  } catch (n) {
    r.push({
      code: "manifest_invalid",
      severity: "error",
      message: n instanceof Error ? n.message : "Source manifest is invalid.",
      source: "manifest",
      target: t.sourceManifest
    });
  }
  return {
    paths: t,
    appId: null,
    diagnostics: r
  };
}
async function Aa(e, t) {
  let r;
  try {
    r = await S(e, "utf8");
  } catch (s) {
    if (_a(s))
      return t.push({
        code: "manifest_missing",
        severity: "error",
        message: "Source manifest was not found.",
        source: "manifest",
        target: e,
        nextCommand: "registry init"
      }), null;
    throw s;
  }
  try {
    return JSON.parse(r);
  } catch {
    return t.push({
      code: "manifest_invalid_json",
      severity: "error",
      message: "Source manifest must be valid JSON.",
      source: "manifest",
      target: e
    }), null;
  }
}
function _a(e) {
  return e instanceof Error && "code" in e && e.code === "ENOENT";
}
function Ea(e, t) {
  e.command("history").description("List app-scoped Registry history").option("--app-id <app-id>", "Registry app ID").option("--root <root>", "Primer app project root").option("--json", "Print a machine-readable result").action(async (r) => {
    await Ee(e, t, r, async ({ client: s }) => {
      const n = await gr(r);
      return Pe({
        appId: n,
        events: (await s.history.app(n)).events
      });
    });
  });
}
function Pa(e, t, r) {
  e.command("history").argument("<app-id>", "Registry app ID").option("--json", "Print a machine-readable result").action(async (s, n) => {
    await Ee(t, r, n, async ({ client: a }) => Pe({
      appId: s,
      events: (await a.history.app(s)).events
    }));
  });
}
function ka(e, t, r) {
  e.command("history").argument("<version-id>", "App version UUID").option("--json", "Print a machine-readable result").action(async (s, n) => {
    await Ee(t, r, n, async ({ client: a }) => Pe({
      versionId: s,
      events: (await a.history.version(s)).events
    }));
  });
}
function ja(e, t, r) {
  e.command("history").argument("<channel-id>", "Distribution channel ID").option("--app-id <app-id>", "Registry app ID").option("--root <root>", "Primer app project root").option("--json", "Print a machine-readable result").action(async (s, n) => {
    await Ee(t, r, n, async ({ client: a }) => {
      const o = await gr(n);
      return Pe({
        appId: o,
        channelId: s,
        events: (await a.history.channel(s, { appId: o })).events
      });
    });
  });
}
async function Ee(e, t, r, s) {
  await U(e, t, r, s, {
    defaultErrorMessage: "Registry history command failed",
    formatError: Ca,
    isUsageError: Ta
  });
}
async function gr(e) {
  if (!e.appId && !e.root) throw new Ze("Provide an app context with --app-id or --root");
  const t = await Xe({
    appId: e.appId,
    root: e.root
  });
  if (t.appId && !G(t.diagnostics)) return t.appId;
  throw new Error(oe(t.diagnostics) || "Unable to resolve Registry app ID");
}
function Pe(e) {
  return {
    payload: {
      status: "history_listed",
      ...e
    },
    message: $a(e.events)
  };
}
var Ze = class extends Error {
};
function Ta(e) {
  return e instanceof Ze;
}
function Ca(e) {
  return e instanceof Ze ? {
    status: "app_id_required",
    message: e.message
  } : e instanceof I ? {
    status: xa(e),
    message: e.message
  } : {
    status: "error",
    message: e instanceof Error ? e.message : "Registry history command failed"
  };
}
function xa(e) {
  return e.code === "permission_denied" || e.status === 403 ? "permission_denied" : e.code === "history_not_found" || e.status === 404 ? "history_not_found" : "error";
}
function $a(e) {
  return e.length === 0 ? "No history events found." : e.map(Ua).join(`
`);
}
function Ua(e) {
  const t = e.actorEmail ?? e.actorUserId ?? "system", r = Ma(e), s = e.reason ? ` - ${e.reason}` : "";
  return `${e.createdAt}	${e.eventType}	${r}	${t}${s}`;
}
function Ma(e) {
  return e.channelId ? `${e.appId}/${e.channelId}` : e.appVersionId ? `${e.appId}/${e.appVersionId}` : e.appId;
}
function Oa(e, t) {
  const r = e.command("apps").description("Inspect Registry apps");
  wa(r, e, t), Pa(r, e, t), r.command("list").option("--json", "Print a machine-readable result").action(async (s) => {
    await U(e, t, s, async ({ client: n }) => {
      const a = await n.apps.list();
      return {
        payload: {
          status: "apps_listed",
          apps: a.apps
        },
        message: Na(a.apps)
      };
    }, { defaultErrorMessage: "Registry apps command failed" });
  }), r.command("delete").argument("<app-id>", "Registry app ID").requiredOption("--reason <text>", "Deletion reason").option("--force", "Hard delete an already-soft-deleted app (unsupported)").option("--json", "Print a machine-readable result").action(async (s, n) => {
    await U(e, t, n, async ({ client: a }) => {
      if (n.force) throw new yr("Hard delete is deferred; omit --force to soft-delete the app");
      const o = await a.apps.delete(s, { reason: n.reason });
      return {
        payload: {
          status: "app_deleted",
          ...o
        },
        message: `Soft-deleted app ${o.app.appId}.`
      };
    }, {
      defaultErrorMessage: "Registry apps command failed",
      formatError: Va,
      isUsageError: La
    });
  }), r.command("show").argument("<app-id>", "Registry app ID").option("--json", "Print a machine-readable result").action(async (s, n) => {
    await U(e, t, n, async ({ client: a }) => {
      const o = await a.apps.get(s);
      return {
        payload: {
          status: "app_shown",
          app: o
        },
        message: qa(o)
      };
    }, { defaultErrorMessage: "Registry apps command failed" });
  });
}
function qa(e) {
  if (!e.exists) return `${e.appId}
Status: available`;
  if (e.deletedAt) return `${e.appId}
Status: deleted
Deleted at: ${e.deletedAt}`;
  const t = e.claim.claimedByCurrentUser ? `claimed by this account (${e.claim.role})` : "claimed by another account";
  return `${e.appId}
Status: ${t}`;
}
function Na(e) {
  return j({
    columns: [
      {
        header: "APP ID",
        value: (t) => t.appId,
        color: f.id
      },
      {
        header: "VISIBILITY",
        value: (t) => t.visibility
      },
      {
        header: "STATUS",
        value: (t) => t.status,
        color: Da
      },
      {
        header: "LATEST VERSION ID",
        value: (t) => t.latestVersionId,
        color: f.id
      }
    ],
    rows: e,
    emptyMessage: "No apps found."
  });
}
function Da(e) {
  return e.trim() === "active" ? f.success(e) : f.warning(e);
}
var yr = class extends Error {
};
function La(e) {
  return e instanceof yr;
}
function Va(e) {
  return {
    status: "error",
    message: e instanceof Error ? e.message : "Registry apps command failed"
  };
}
function Ba(e, t) {
  const r = e.command("assets").description("Manage reusable Registry asset manifest declarations");
  r.command("add").argument("<path-or-url>", "Package-root-relative asset path or HTTPS URL").requiredOption("--id <asset-id>", "User-facing Registry asset ID").option("-m, --manifest <path>", "Source manifest path").option("--json", "Print a machine-readable result").action(async (s, n) => {
    const a = A({
      json: _(e, n),
      write: t.write
    });
    try {
      const o = Ie.parse(n.id);
      We(s, "path-or-url");
      const c = M({ manifest: n.manifest }), { document: d } = await ee(c.sourceManifest), l = Ha(d), u = l.findIndex((m) => m.id === o), p = {
        id: o,
        source: s
      };
      u >= 0 ? l[u] = {
        ...l[u],
        ...p
      } : l.push(p), d.registryAssets = l, await J(c.sourceManifest, d), h(a, {
        status: "asset_added",
        manifestPath: c.sourceManifest,
        asset: p
      }, `Added Registry asset ${o} to ${c.sourceManifest}.`);
    } catch (o) {
      if (y(2), a.json) {
        a.result({
          status: "error",
          message: o instanceof Error ? o.message : "Asset add failed"
        });
        return;
      }
      throw o;
    }
  }), r.command("recover").argument("[root]", "Package root", ".").requiredOption("--app-id <app-id>", "Registered app ID to recover assets for").option("-m, --manifest <path>", "Source manifest path").option("--json", "Print a machine-readable result").action(async (s, n) => {
    const a = A({
      json: _(e, n),
      write: t.write
    });
    try {
      const o = g.parse(n.appId), c = M({
        root: s,
        manifest: n.manifest
      }), { client: d } = await _e(e, t), l = await d.assets.list(o), u = new Map(l.assets.map((m) => [m.id, m.registryUrl])), p = await Fa(c.root, c.sourceManifest, u);
      h(a, {
        status: "assets_recovered",
        manifestPath: c.sourceManifest,
        updatedPaths: p,
        assets: l.assets
      }, `Recovered ${l.assets.length} Registry assets into ${p.join(", ")}.`);
    } catch (o) {
      if (y(1), a.json) {
        a.result({
          status: "error",
          message: o instanceof Error ? o.message : "Asset recovery failed"
        });
        return;
      }
      throw o;
    }
  }), r.command("generate").argument("[root]", "Package root", ".").option("-m, --manifest <path>", "Source manifest path").option("--out <path>", "Generated module output path").option("--check", "Verify the generated module is up to date without writing").option("--json", "Print a machine-readable result").action(async (s, n) => {
    const a = A({
      json: _(e, n),
      write: t.write
    });
    try {
      const o = M({
        root: s,
        manifest: n.manifest
      }), { manifest: c } = await ee(o.sourceManifest), d = await Wa(o.root, c.registryAssets), l = Ya(o.root, n.out ?? c.registryAssetsModule), u = Ka(d);
      if (n.check) {
        if (await Qa(l) !== u) {
          y(1), h(a, {
            status: "assets_module_outdated",
            modulePath: l,
            message: `Registry assets module is out of date: ${l}`
          }, `Registry assets module is out of date: ${l}. Run registry assets generate.`);
          return;
        }
        h(a, {
          status: "assets_module_current",
          modulePath: l,
          assetCount: d.length
        }, `Registry assets module is up to date: ${l}.`);
        return;
      }
      await kt(Dr(l), { recursive: !0 }), await Le(l, u), h(a, {
        status: "assets_module_generated",
        modulePath: l,
        assetCount: d.length
      }, `Generated Registry assets module at ${l}.`);
    } catch (o) {
      if (y(2), a.json) {
        a.result({
          status: "error",
          message: o instanceof Error ? o.message : "Asset module generation failed"
        });
        return;
      }
      throw o;
    }
  });
}
async function Fa(e, t, r) {
  const { manifest: s, document: n } = await ee(t);
  if (s.registryAssets.kind === "files") {
    const a = [], o = new Map(r);
    for (const d of s.registryAssets.paths) {
      const l = x(e, d), u = await Ja(l);
      br(u.assets, r, o), a.push({
        path: l,
        ...u
      });
    }
    const c = a[0];
    if (c) {
      wr(c.assets, o);
      for (const d of a) await J(d.path, d.document);
      return a.map((d) => d.path);
    }
  }
  if (s.registryAssets.kind === "inline") {
    const a = za(n);
    return Ga(a, r), n.registryAssets = a, await J(t, n), [t];
  }
  return n.registryAssets = [...r].map(([a, o]) => ({
    id: a,
    registryUrl: o
  })), await J(t, n), [t];
}
async function Ja(e) {
  const t = await S(e, "utf8");
  let r;
  try {
    r = JSON.parse(t);
  } catch {
    throw new Error("Registry assets manifest must be valid JSON");
  }
  if (!r || typeof r != "object" || Array.isArray(r)) throw new Error("Registry assets manifest must be a JSON object");
  const s = r.assets;
  if (!Array.isArray(s)) throw new Error("Registry assets manifest must include an assets array");
  return Qt(r), {
    document: r,
    assets: s
  };
}
function za(e) {
  const t = e.registryAssets;
  if (!Array.isArray(t)) throw new Error("assets helpers require inline registryAssets in the source manifest");
  return Ye(t), t;
}
function Ga(e, t) {
  const r = new Map(t);
  br(e, t, r), wr(e, r);
}
function br(e, t, r) {
  for (const s of e) {
    const n = t.get(s.id);
    n && (s.registryUrl = n, r.delete(s.id));
  }
}
function wr(e, t) {
  for (const [r, s] of t) e.push({
    id: r,
    registryUrl: s
  });
}
function Ha(e) {
  const t = e.registryAssets;
  if (t === void 0) return [];
  if (!Array.isArray(t)) throw new Error("assets helpers require inline registryAssets in the source manifest");
  try {
    return Ye(t);
  } catch {
    throw new Error("assets helpers require inline registryAssets in the source manifest");
  }
}
async function Wa(e, t) {
  if (t.kind === "none") return [];
  if (t.kind === "inline") return t.assets;
  const r = [];
  for (const s of t.paths) {
    const n = Kt(await S(x(e, s), "utf8"));
    r.push(...n.assets);
  }
  return r;
}
function Ya(e, t) {
  const r = t ?? "src/registry-assets.gen.ts";
  return Oe(r) || ie(r, t ? "out" : "registryAssetsModule"), Oe(r) ? x(r) : x(e, r);
}
async function Qa(e) {
  try {
    return await S(e, "utf8");
  } catch (t) {
    if (t instanceof Error && "code" in t && t.code === "ENOENT") return null;
    throw t;
  }
}
function Ka(e) {
  const t = [...e].sort((n, a) => n.id.localeCompare(a.id)), r = ["// Generated by registry assets generate. Do not edit manually.", ""], s = Za(t);
  for (const n of t) r.push(`export const ${s.get(n.id)} = ${q(n.id)} as const`);
  if (t.length > 0 && r.push(""), t.every((n) => n.registryUrl)) {
    const n = Xa(t.map((a) => a.registryUrl));
    if (n) {
      const a = new URL(n);
      r.push(`export const CDN_BASE_URL = ${q(a.origin)} as const`), r.push(`export const CDN_APP_ASSETS_URL = \`\${CDN_BASE_URL}${a.pathname.replace(/\/+$/, "")}\` as const`), r.push(""), r.push("export const REGISTRY_ASSET_PATHS = {");
      for (const o of t) r.push(`  ${q(o.id)}: ${q(o.registryUrl.slice(n.length))},`);
      return r.push("} as const"), r.push(""), r.push("export type RegistryAssetId = keyof typeof REGISTRY_ASSET_PATHS"), r.push(""), r.push("export function registryAssetUrl(id: RegistryAssetId) {"), r.push("  return `${CDN_APP_ASSETS_URL}/${REGISTRY_ASSET_PATHS[id]}` as const"), r.push("}"), r.push(""), r.join(`
`);
    }
    r.push("export const REGISTRY_ASSET_URLS = {");
    for (const a of t) r.push(`  ${q(a.id)}: ${q(a.registryUrl)},`);
    return r.push("} as const"), r.push(""), r.push("export const REGISTRY_ASSET_PATHS = REGISTRY_ASSET_URLS"), r.push(""), r.push("export type RegistryAssetId = keyof typeof REGISTRY_ASSET_URLS"), r.push(""), r.push("export function registryAssetUrl(id: RegistryAssetId) {"), r.push("  return REGISTRY_ASSET_URLS[id]"), r.push("}"), r.push(""), r.join(`
`);
  }
  r.push("// Registry asset URLs have not been materialized yet, so registryAssetUrl is intentionally omitted."), r.push("// Run registry assets recover or publish --sync-assets before relying on CDN URLs."), r.push("export const REGISTRY_ASSET_PATHS = {");
  for (const n of t) r.push(`  ${q(n.id)}: ${q(n.source ?? n.registryUrl ?? "")},`);
  return r.push("} as const"), r.push(""), r.push("export type RegistryAssetId = keyof typeof REGISTRY_ASSET_PATHS"), r.push(""), r.join(`
`);
}
function Xa(e) {
  let t = null;
  for (const r of e) {
    const s = new URL(r), n = s.pathname.lastIndexOf("/assets/");
    if (n < 0) return null;
    const a = `${s.origin}${s.pathname.slice(0, n + 8)}`;
    if (t === null) t = a;
    else if (t !== a) return null;
  }
  return t;
}
function Za(e) {
  const t = /* @__PURE__ */ new Set(), r = /* @__PURE__ */ new Map();
  for (const s of e) {
    const n = s.id.replace(/[^a-zA-Z0-9]+/g, "_").replace(/^_+|_+$/g, "").toUpperCase() || "ASSET", a = /^[0-9]/.test(n) ? `ASSET_${n}` : n;
    let o = a, c = 2;
    for (; t.has(o); )
      o = `${a}_${c}`, c += 1;
    t.add(o), r.set(s.id, o);
  }
  return r;
}
function q(e) {
  return `'${e.replace(/\\/g, "\\\\").replace(/'/g, "\\'")}'`;
}
async function ei(e) {
  if (e.query && e.queryFile) throw new be("Use either --query or --query-file, not both");
  const t = e.queryFile ? await S(e.queryFile, "utf8") : e.query;
  if (t)
    try {
      return JSON.parse(t);
    } catch (r) {
      throw new be(`Invalid Registry RQL JSON${r instanceof Error ? `: ${r.message}` : ""}`);
    }
}
var be = class extends Error {
};
function vr(e, t = {}) {
  const r = t.descriptionPrefix ? `${t.descriptionPrefix} ` : "";
  return e.option("--query <json>", `Filter ${r}with a Registry RQL JSON expr`).option("--query-file <path>", "Read a Registry RQL JSON expr from a file").option("--include-reserved", `Include registry-reserved versions${r ? ` in ${r.trim()}` : ""}`);
}
async function Rr(e) {
  return {
    query: await ei(e),
    includeReserved: e.includeReserved
  };
}
function ti(e, t) {
  const r = e.command("channels").alias("c").description("Manage Registry distribution channels");
  ja(r, e, t), r.command("list").option("--json", "Print a machine-readable result").action(async (s) => {
    await V(e, t, s, async ({ client: n }) => {
      const a = await n.channels.list();
      return {
        payload: {
          status: "channels_listed",
          channels: a.channels
        },
        message: oi(a.channels)
      };
    });
  }), vr(r.command("show").argument("<channel-id>", "Distribution channel ID").option("--app-id <app-id>", "Filter assignments by app ID"), { descriptionPrefix: "public runtime listings" }).option("--json", "Print a machine-readable result").action(async (s, n) => {
    await V(e, t, n, async ({ client: a }) => {
      if (n.appId) {
        const c = await a.channels.assignments(s, { appId: n.appId });
        return {
          payload: {
            status: "channel_assignments_listed",
            channel: c.channel,
            assignments: c.assignments
          },
          message: Rt(c.assignments)
        };
      }
      const o = await a.channels.get(s, await Rr(n));
      return {
        payload: {
          status: "channel_shown",
          channel: o.channel,
          apps: o.apps
        },
        message: ci(o.apps)
      };
    });
  }), r.command("current").requiredOption("--app-id <app-id>", "Filter assignments by app ID").option("--json", "Print a machine-readable result").action(async (s) => {
    await V(e, t, s, async ({ client: n }) => {
      const a = await n.channels.list(), o = [];
      for (const c of a.channels) {
        const d = await n.channels.assignments(c.id, { appId: s.appId });
        o.push(...d.assignments);
      }
      return {
        payload: {
          status: "channel_assignments_listed",
          appId: s.appId,
          assignments: o
        },
        message: Rt(o)
      };
    });
  }), r.command("connect").argument("<channel-id>", "Distribution channel ID").requiredOption("-v, --version-id <app-version-uuid>", "App version UUID").option("--reason <text>", "Connection reason").option("--json", "Print a machine-readable result").action(async (s, n) => {
    await V(e, t, n, async ({ client: a }) => {
      const o = await a.channels.connect(s, {
        appVersionId: n.versionId,
        reason: n.reason
      });
      return {
        payload: {
          status: "channel_connected",
          channel: o.channel,
          appVersion: o.appVersion
        },
        message: `Connected ${o.channel.id} to app version ${o.appVersion.id}.`
      };
    });
  }), r.command("disconnect").argument("<channel-id>", "Distribution channel ID").requiredOption("-v, --version-id <app-version-uuid>", "App version UUID").option("--reason <text>", "Disconnection reason").option("--json", "Print a machine-readable result").action(async (s, n) => {
    await V(e, t, n, async ({ client: a }) => {
      const o = await a.channels.disconnect(s, n.versionId, { reason: n.reason });
      return {
        payload: {
          status: "channel_disconnected",
          channel: o.channel,
          appVersion: o.appVersion
        },
        message: `Disconnected ${o.channel.id} from app version ${o.appVersion.id}.`
      };
    });
  }), r.command("rollback").argument("<channel-id>", "Distribution channel ID").option("--app-id <app-id>", "Registry app ID").option("--root <root>", "Primer app project root").option("--to-version <app-version-uuid>", "Target app version UUID").option("--reason <text>", "Rollback reason").option("--dry-run", "Preview rollback without mutating Registry state").option("--json", "Print a machine-readable result").action(async (s, n) => {
    await V(e, t, n, async ({ client: a }) => {
      const o = await si(n);
      if (s === "prod" && !n.toVersion) throw new te("Production rollback requires --to-version");
      if (s === "prod" && !n.reason) throw new te("Production rollback requires --reason");
      const c = await a.channels.rollback(s, {
        appId: o,
        toVersionId: n.toVersion,
        reason: n.reason,
        dryRun: n.dryRun
      });
      return {
        payload: {
          status: c.status === "dry_run" ? "dry_run" : "channel_rolled_back",
          channel: c.channel,
          currentAssignment: c.currentAssignment,
          targetAppVersion: c.targetAppVersion,
          eligibility: c.eligibility,
          ...c.reason ? { reason: c.reason } : {}
        },
        message: ni(c)
      };
    });
  });
}
async function V(e, t, r, s) {
  await U(e, t, r, s, {
    defaultErrorMessage: "Registry channels command failed",
    formatError: (n) => ({
      status: "error",
      message: ri(n, ii(r))
    }),
    isUsageError: (n) => n instanceof te || n instanceof be
  });
}
function ri(e, t) {
  if (e instanceof te) return e.message;
  if (e instanceof I && e.code === "prod_requires_approved") {
    const r = ai(e.rawPayload) || t, s = r ? ` Run: registry versions approve ${r}` : " Run registry versions approve <version-id> first.";
    return `${e.message}.${s}`;
  }
  return e instanceof Error ? e.message : "Registry channels command failed";
}
async function si(e) {
  if (!e.appId && !e.root) throw new te("Provide an app context with --app-id or --root");
  const t = await Xe({
    appId: e.appId,
    root: e.root
  });
  if (t.appId && !G(t.diagnostics)) return t.appId;
  throw new Error(oe(t.diagnostics) || "Unable to resolve Registry app ID");
}
function ni(e) {
  return [
    `${e.status === "dry_run" ? "Dry run" : "Rolled back"} ${e.channel.id}.`,
    `Current assignment: ${e.currentAssignment.appVersionId}`,
    `Target version: ${e.targetAppVersion.id}`
  ].join(`
`);
}
var te = class extends Error {
};
function ai(e) {
  if (!e || typeof e != "object") return null;
  const t = e;
  return typeof t.versionId == "string" ? t.versionId : null;
}
function ii(e) {
  return "versionId" in e && typeof e.versionId == "string" ? e.versionId : void 0;
}
function Rt(e) {
  return j({
    columns: [
      {
        header: "CHANNEL",
        value: (t) => t.channelId,
        color: f.id
      },
      {
        header: "APP ID",
        value: (t) => t.appId,
        color: f.id
      },
      {
        header: "VERSION ID",
        value: (t) => t.appVersionId,
        color: f.id
      }
    ],
    rows: e,
    emptyMessage: "No channel assignments found."
  });
}
function oi(e) {
  return j({
    columns: [{
      header: "CHANNEL",
      value: (t) => t.id,
      color: f.id
    }],
    rows: e,
    emptyMessage: "No channels found."
  });
}
function ci(e) {
  return j({
    columns: [{
      header: "APP ID",
      value: (t) => t.id,
      color: f.id
    }, {
      header: "TITLE",
      value: (t) => t.title
    }],
    rows: e,
    emptyMessage: "No apps found."
  });
}
var xe = 1024 * 1024, uc = {
  maxVersionFiles: 1e3,
  maxVersionBytes: 250 * xe,
  maxFileBytes: 50 * xe,
  maxThumbnailBytes: 10 * xe
}, di = /* @__PURE__ */ new Map([
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".mjs", "text/javascript; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".png", "image/png"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".webp", "image/webp"],
  [".gif", "image/gif"],
  [".svg", "image/svg+xml"],
  [".avif", "image/avif"],
  [".wasm", "application/wasm"],
  [".txt", "text/plain; charset=utf-8"]
]);
function Ne(e) {
  return di.get(li(e)) ?? "application/octet-stream";
}
function li(e) {
  const t = e.split("/").pop() || "", r = t.lastIndexOf(".");
  return r > 0 ? t.slice(r).toLowerCase() : "";
}
async function ui(e) {
  const t = [];
  async function r(s) {
    for (const n of await qr(s, { withFileTypes: !0 })) {
      const a = C(s, n.name);
      if (n.isDirectory()) await r(a);
      else if (n.isFile()) {
        const o = await Me(a);
        t.push({
          path: Lr(e, a).replace(/\\/g, "/"),
          size: o.size,
          contentType: Ne(a)
        });
      }
    }
  }
  return await r(e), t;
}
async function pi(e = {}) {
  const t = M(e), r = [], s = await mi(t.sourceManifest, r), n = await Ke(t.root);
  if (fi(s.document, s.manifest, n, t.sourceManifest, r), !qe(t.artifactDirectory))
    return r.push({
      code: "artifact_dist_missing",
      severity: e.requireDist ? "error" : "warning",
      message: "Built app artifact directory was not found.",
      source: "artifact",
      target: t.artifactDirectory
    }), yi(t, s, n, r);
  const a = await hi(t.artifactManifest, r);
  s.manifest?.appId && a?.appId && s.manifest.appId !== a.appId && r.push({
    code: "artifact_app_id_mismatch",
    severity: "error",
    message: "Source and artifact manifest appId values must match.",
    source: "artifact",
    target: t.artifactManifest
  }), a && !a.appId && r.push({
    code: "manifest_missing_app_id",
    severity: "error",
    message: "Artifact manifest is missing appId.",
    source: "artifact",
    target: t.artifactManifest
  }), qe(t.artifactEntrypoint) || r.push({
    code: "artifact_entrypoint_missing",
    severity: "error",
    message: "Artifact entrypoint index.html is required.",
    source: "artifact",
    target: t.artifactEntrypoint
  });
  const o = await gi(t.artifactDirectory, r), c = o.reduce((d, l) => d + l.size, 0);
  return o.length === 0 && r.push({
    code: "artifact_empty",
    severity: "error",
    message: "Built app artifact directory is empty.",
    source: "artifact",
    target: t.artifactDirectory
  }), {
    paths: t,
    sourceDocument: s.document,
    sourceManifest: s.manifest,
    artifactManifest: a,
    files: o,
    totalBytes: c,
    detectedPrimerSdkVersion: n,
    diagnostics: r
  };
}
async function mi(e, t) {
  let r;
  try {
    r = await S(e, "utf8");
  } catch (a) {
    if (Sr(a))
      return t.push({
        code: "manifest_missing",
        severity: "error",
        message: "Source manifest was not found.",
        source: "manifest",
        target: e,
        nextCommand: "registry init"
      }), {
        document: null,
        manifest: null
      };
    throw a;
  }
  let s;
  try {
    s = JSON.parse(r);
  } catch {
    return t.push({
      code: "manifest_invalid_json",
      severity: "error",
      message: "Source manifest must be valid JSON.",
      source: "manifest",
      target: e
    }), {
      document: null,
      manifest: null
    };
  }
  const n = s && typeof s == "object" && !Array.isArray(s) ? s : null;
  try {
    return {
      document: n,
      manifest: Ae(s)
    };
  } catch (a) {
    return t.push({
      code: "manifest_invalid",
      severity: "error",
      message: a instanceof Error ? a.message : "Source manifest is invalid.",
      source: "manifest",
      target: e
    }), {
      document: n,
      manifest: null
    };
  }
}
function fi(e, t, r, s, n) {
  e && typeof e.title != "string" && n.push({
    code: "manifest_missing_title",
    severity: "error",
    message: "Source manifest is missing title.",
    source: "manifest",
    target: s
  }), t && !t.appId && n.push({
    code: "manifest_missing_app_id",
    severity: "error",
    message: "Source manifest is missing appId.",
    source: "manifest",
    target: s
  });
  const a = e?.primerSdkVersion;
  a === void 0 && r ? n.push({
    code: "manifest_primer_sdk_version_missing",
    severity: "warning",
    message: "Source manifest is missing primerSdkVersion.",
    source: "manifest",
    target: s
  }) : typeof a == "string" && !/^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/.test(a) && n.push({
    code: "manifest_primer_sdk_version_non_exact",
    severity: "warning",
    message: "Source manifest primerSdkVersion must be an exact version.",
    source: "manifest",
    target: s
  });
}
async function hi(e, t) {
  try {
    return await pa(e);
  } catch (r) {
    return t.push({
      code: Sr(r) ? "artifact_manifest_missing" : "artifact_manifest_invalid",
      severity: "error",
      message: r instanceof Error ? r.message : "Artifact manifest is invalid.",
      source: "artifact",
      target: e
    }), null;
  }
}
async function gi(e, t) {
  try {
    const r = await ui(e);
    return await Promise.all(r.map((s) => Pt(C(e, s.path)))), r;
  } catch (r) {
    return t.push({
      code: "artifact_file_unreadable",
      severity: "error",
      message: r instanceof Error ? r.message : "Artifact files could not be read.",
      source: "artifact",
      target: e
    }), [];
  }
}
function yi(e, t, r, s) {
  return {
    paths: e,
    sourceDocument: t.document,
    sourceManifest: t.manifest,
    artifactManifest: null,
    files: [],
    totalBytes: 0,
    detectedPrimerSdkVersion: r,
    diagnostics: s
  };
}
function Sr(e) {
  return e instanceof Error && "code" in e && e.code === "ENOENT";
}
async function Ir(e) {
  const t = (e.mode ?? "publish-required") === "publish-required", r = ye(e.registryOptions ?? {}), s = await pi({
    root: e.root,
    manifest: e.manifest,
    dist: e.dist,
    requireDist: t || e.requireDist === !0
  }), n = [...s.diagnostics], a = s.sourceManifest?.appId ?? null, o = s.artifactManifest?.appId ?? null, c = a;
  if (G(n) || (!a && t && n.push({
    code: "manifest_missing_app_id",
    severity: "error",
    message: "Source manifest must include appId before publishing.",
    source: "manifest",
    target: s.paths.sourceManifest,
    nextCommand: "registry claim"
  }), !o && t && n.push({
    code: "manifest_missing_app_id",
    severity: "error",
    message: "Artifact manifest must include appId before publishing.",
    source: "artifact",
    target: s.paths.artifactManifest
  }), a && o && a !== o && n.push({
    code: "artifact_app_id_mismatch",
    severity: "error",
    message: "Source and artifact manifest appId values must match.",
    source: "artifact",
    target: s.paths.artifactManifest
  }), s.files.length === 0 && t && n.push({
    code: "artifact_empty",
    severity: "error",
    message: "Built app artifact directory is empty.",
    source: "artifact",
    target: s.paths.artifactDirectory
  }), G(n)) || !a) return F(s, n, c, r);
  const d = a;
  if (e.local) return De(s, n, d, r, null, null, { kind: "unknown" });
  const l = await bi(r, e.registryOptions, e.services, n, t ? "error" : "warning");
  if (!l) return St(s, n, a, r, t);
  const u = L(l.registryUrl, {
    token: l.accessToken,
    request: e.services.request
  });
  try {
    const p = await u.apps.get(d);
    return p.exists ? p.claim.claimedByCurrentUser ? De(s, n, d, r, l, u, {
      kind: "known",
      appExists: !0,
      role: p.claim.role
    }) : (n.push({
      code: "app_membership_required",
      severity: "error",
      message: `Current Registry account cannot publish app ID "${d}".`,
      source: "registry"
    }), F(s, n, d, r)) : (n.push({
      code: "app_not_claimed",
      severity: "error",
      message: `App ID "${d}" has not been claimed for this Registry.`,
      source: "registry",
      nextCommand: "registry claim"
    }), F(s, n, d, r));
  } catch (p) {
    return n.push(Ar(p, t ? "error" : "warning")), St(s, n, d, r, t);
  }
}
async function bi(e, t, r, s, n) {
  const a = wi(t);
  if (a) return vi(e, a, r.now());
  const o = await r.readSession();
  if (!o || o.registryUrl !== e)
    return s.push({
      code: "auth_required",
      severity: n,
      message: "No Registry session found. Run `registry auth login`.",
      source: "auth",
      nextCommand: "registry auth login"
    }), null;
  if (new Date(o.expiresAt).getTime() > r.now() + 3e4) return o;
  try {
    const c = await L(e, { request: r.request }).auth.refresh({ refreshToken: o.refreshToken }), d = {
      registryUrl: e,
      accessToken: c.accessToken,
      refreshToken: c.refreshToken,
      expiresAt: new Date(r.now() + c.expiresIn * 1e3).toISOString(),
      account: c.account
    };
    return await r.saveSession(d), d;
  } catch (c) {
    return s.push(Ar(c, n)), null;
  }
}
function wi(e) {
  const t = e?.token?.trim();
  return t || process.env.REGISTRY_ACCESS_TOKEN?.trim() || void 0;
}
function vi(e, t, r) {
  return {
    registryUrl: e,
    accessToken: t,
    refreshToken: "",
    expiresAt: new Date(r + 3600 * 1e3).toISOString(),
    account: {
      userId: "access-token",
      email: null
    }
  };
}
function Ar(e, t = "error") {
  if (e instanceof I) {
    if (e.status === 401) return {
      code: "auth_session_expired",
      severity: t,
      message: "Registry session is missing or expired. Run `registry auth login`.",
      source: "auth",
      nextCommand: "registry auth login"
    };
    if (e.status === 403) return {
      code: "auth_forbidden",
      severity: t,
      message: e.message,
      source: "auth"
    };
    if (e.code === "app_not_claimed") return {
      code: "app_not_claimed",
      severity: "error",
      message: e.message,
      source: "registry",
      nextCommand: "registry claim"
    };
  }
  return {
    code: "registry_unreachable",
    severity: t,
    message: e instanceof Error ? e.message : "Registry could not be reached.",
    source: "registry"
  };
}
function F(e, t, r, s) {
  return {
    ok: !1,
    diagnostics: t,
    paths: e.paths,
    inspection: e,
    appId: r,
    registryUrl: s,
    session: null,
    client: null,
    remoteState: { kind: "unknown" }
  };
}
function De(e, t, r, s, n, a, o) {
  return {
    ok: !0,
    diagnostics: t,
    paths: e.paths,
    inspection: e,
    appId: r,
    registryUrl: s,
    session: n,
    client: a,
    remoteState: o
  };
}
function St(e, t, r, s, n) {
  return n ? F(e, t, r, s) : De(e, t, r, s, null, null, { kind: "unknown" });
}
function Ri(e, t) {
  e.command("check").argument("[root]", "Primer app project root", ".").description("Check whether a Primer app project is ready for Registry publishing").option("-m, --manifest <path>", "Source manifest path").option("-d, --dist <path>", "Built app artifact directory").option("--local", "Skip Registry session and remote app checks").option("--require-dist", "Treat a missing built app artifact directory as an error").option("--json", "Print a machine-readable result").action(async (r, s) => {
    const n = A({
      json: _(e, s),
      write: t.write
    }), a = await Ir({
      root: r,
      manifest: s.manifest,
      dist: s.dist,
      registryOptions: e.opts(),
      services: t,
      local: s.local,
      requireDist: s.requireDist,
      mode: "check"
    }), o = !G(a.diagnostics);
    o || y(2), h(n, {
      status: "checked",
      ok: o,
      registryUrl: a.registryUrl,
      appId: a.appId,
      paths: a.paths,
      diagnostics: a.diagnostics,
      summary: {
        fileCount: a.inspection.files.length,
        totalBytes: a.inspection.totalBytes,
        primerSdkVersion: a.inspection.sourceManifest?.primerSdkVersion ?? null,
        remoteState: a.remoteState
      }
    }, Si(a, o));
  });
}
function Si(e, t) {
  const r = [t ? "Registry check completed." : "Registry check failed."];
  r.push(`Registry: ${e.registryUrl}`), e.appId && r.push(`App ID: ${e.appId}`), e.inspection.files.length > 0 && r.push(`Files: ${e.inspection.files.length} (${e.inspection.totalBytes} bytes)`), e.diagnostics.length > 0 && r.push("", oe(e.diagnostics));
  const s = Array.from(new Set(e.diagnostics.map((n) => n.nextCommand).filter(Boolean)));
  return s.length > 0 && r.push("", `Next: ${s.join(" && ")}`), r.join(`
`);
}
function Ii(e, t) {
  e.command("init").argument("[root]", "Primer app project root", ".").description("Initialize local Registry manifest metadata").option("-m, --manifest <path>", "Source manifest path").option("--json", "Print a machine-readable preview without writing").action(async (r, s) => {
    const n = _(e, s), a = A({
      json: n,
      write: t.write
    });
    try {
      const o = await mr({
        root: r,
        manifest: s.manifest,
        json: n
      }, t);
      o.status === "missing_required_input" && y(2), a.json && a.result({
        status: o.status === "missing_required_input" ? "missing_required_input" : o.status,
        manifestPath: o.manifestPath,
        suggestedManifest: o.suggestedManifest,
        suggestedFields: o.suggestedFields,
        diagnostics: o.diagnostics,
        nextCommands: o.nextCommands
      });
    } catch (o) {
      if (y(1), a.json) {
        a.result({
          status: "error",
          message: o instanceof Error ? o.message : "Registry init failed"
        });
        return;
      }
      throw o;
    }
  });
}
function Ai(e, t) {
  const r = e.command("members").description("Manage Registry app members");
  r.command("list").option("--app-id <app-id>", "Registry app ID").option("--root <root>", "Primer app project root", ".").option("--json", "Print a machine-readable result").action(async (s) => {
    await ue(e, t, s, async ({ client: n }) => {
      const a = await pe(s), o = await n.members.list(a);
      return {
        payload: {
          status: "members_listed",
          appId: a,
          members: o.members
        },
        message: ki(a, o.members)
      };
    });
  }), r.command("add").option("--app-id <app-id>", "Registry app ID").option("--root <root>", "Primer app project root", ".").option("--email <email>", "Registry account email").option("--user-id <user-id>", "Registry user ID").requiredOption("--role <role>", "App member role: owner or member").option("--json", "Print a machine-readable result").action(async (s) => {
    await ue(e, t, s, async ({ client: n }) => {
      $e(s);
      const a = await pe(s), o = await n.members.add(a, {
        ...s.email ? { email: s.email } : { userId: s.userId },
        role: s.role
      });
      return {
        payload: {
          status: "member_added",
          appId: a,
          member: o.member
        },
        message: `Added ${B(s)} to ${a} as ${o.member.role}.`
      };
    });
  }), r.command("remove").option("--app-id <app-id>", "Registry app ID").option("--root <root>", "Primer app project root", ".").option("--email <email>", "Registry account email").option("--user-id <user-id>", "Registry user ID").option("--json", "Print a machine-readable result").action(async (s) => {
    await ue(e, t, s, async ({ client: n }) => {
      $e(s);
      const a = await pe(s), o = s.userId ?? await It(n, a, s.email);
      return o ? (await n.members.remove(a, o), {
        payload: {
          status: "member_removed",
          appId: a,
          userId: o,
          target: B(s)
        },
        message: `Removed ${B(s)} from ${a}.`
      }) : At(a, B(s));
    });
  }), r.command("set-role").option("--app-id <app-id>", "Registry app ID").option("--root <root>", "Primer app project root", ".").option("--email <email>", "Registry account email").option("--user-id <user-id>", "Registry user ID").requiredOption("--role <role>", "App member role: owner or member").option("--json", "Print a machine-readable result").action(async (s) => {
    await ue(e, t, s, async ({ client: n }) => {
      $e(s);
      const a = await pe(s), o = s.userId ?? await It(n, a, s.email);
      if (!o) return At(a, B(s));
      const c = await n.members.setRole(a, o, { role: s.role });
      return {
        payload: {
          status: "member_role_updated",
          appId: a,
          member: c.member
        },
        message: `Updated ${B(s)} on ${a} to ${c.member.role}.`
      };
    });
  });
}
async function ue(e, t, r, s) {
  await U(e, t, r, s, {
    defaultErrorMessage: "Registry members command failed",
    formatError: Ei,
    isUsageError: _i
  });
}
async function pe(e) {
  const t = await Xe({
    appId: e.appId,
    root: e.root
  });
  if (t.appId && !G(t.diagnostics)) return t.appId;
  throw new Error(oe(t.diagnostics) || "Unable to resolve Registry app ID");
}
function $e(e) {
  if (!!e.email == !!e.userId) throw new _r("Provide exactly one member selector: --email or --user-id");
}
var _r = class extends Error {
};
function _i(e) {
  return e instanceof _r;
}
async function It(e, t, r) {
  return (await e.members.list(t)).members.find((s) => s.email?.toLowerCase() === r.toLowerCase())?.userId ?? null;
}
function At(e, t) {
  return y(2), {
    payload: {
      status: "member_not_found",
      appId: e,
      target: t,
      message: "Registry app member not found"
    },
    message: `Member ${t} was not found on ${e}.`
  };
}
function Ei(e) {
  return e instanceof I ? {
    status: Pi(e),
    message: e.message
  } : {
    status: "error",
    message: e instanceof Error ? e.message : "Registry members command failed"
  };
}
function Pi(e) {
  return e.code === "permission_denied" || e.status === 403 ? "permission_denied" : e.code === "user_not_found" ? "user_not_found" : e.code === "member_not_found" ? "member_not_found" : e.code === "last_owner_required" ? "last_owner_required" : "error";
}
function ki(e, t) {
  return j({
    columns: [
      {
        header: "USER ID",
        value: (r) => r.userId,
        color: f.id
      },
      {
        header: "EMAIL",
        value: (r) => r.email
      },
      {
        header: "ROLE",
        value: (r) => r.role,
        color: ji
      }
    ],
    rows: t,
    emptyMessage: `No members found for ${e}.`
  });
}
function ji(e) {
  return e.trim() === "owner" ? f.success(e) : e;
}
function B(e) {
  return e.email ?? e.userId ?? "member";
}
function Ti(e) {
  const t = e.inspection.artifactManifest ?? e.inspection.sourceManifest;
  if (!t) throw new Error("Cannot create publish plan without a manifest.");
  const r = !!e.forceApprove;
  return {
    appId: e.appId,
    title: t.title,
    tags: t.tags,
    primerSdkVersion: t.primerSdkVersion ?? e.inspection.detectedPrimerSdkVersion,
    thumbnailAssetId: t.thumbnailAssetId ?? null,
    files: e.inspection.files,
    totalBytes: e.inspection.totalBytes,
    forceApprove: r,
    expectedStatus: r ? "approved" : "submitted",
    expectedChannel: r ? "prod" : "staging",
    remoteState: e.remoteState
  };
}
function Ci(e, t) {
  Er(e.command("publish"), e, t);
}
function xi(e, t, r) {
  Er(e.command("publish"), t, r);
}
function Er(e, t, r) {
  e.argument("[root]", "Primer app project root", ".").description("Publish a Primer app project root").option("-m, --manifest <path>", "Source manifest path").option("-d, --dist <path>", "Built app artifact directory").option("--force-approve", "Approve and connect the uploaded app version to production").option("--dry-run", "Validate and print the upload plan without creating an upload").option("--local", "Skip Registry preflight checks for dry-run validation").option("--json", "Print a machine-readable result").action(async (s, n) => {
    const a = A({
      json: _(t, n),
      write: r.write
    });
    try {
      if (n.local && !n.dryRun) {
        y(2), h(a, {
          status: "error",
          message: "Local publish is only supported with --dry-run."
        }, "Local publish is only supported with --dry-run.");
        return;
      }
      const o = await Ir({
        root: s,
        manifest: n.manifest,
        dist: n.dist,
        registryOptions: t.opts(),
        services: r,
        local: n.local,
        mode: "publish-required"
      });
      if (!o.ok) {
        Oi(a, o.diagnostics, o.inspection, o.appId);
        return;
      }
      if (!o.appId) throw new Error("App ID is required before publishing.");
      const c = Ti({
        inspection: o.inspection,
        appId: o.appId,
        forceApprove: n.forceApprove,
        remoteState: o.remoteState
      });
      if (n.dryRun) {
        h(a, {
          status: "dry_run",
          ok: !0,
          diagnostics: o.diagnostics,
          plan: c
        }, qi(c));
        return;
      }
      const d = o.client;
      if (!d) throw new Error("Registry validation did not create a publish client.");
      if (!o.inspection.artifactManifest) throw new Error("Artifact manifest is required before publishing.");
      const l = await Ui({
        artifactManifestPath: o.paths.artifactManifest,
        sourceManifest: o.inspection.sourceManifest
      }), u = await Mi({
        artifactFiles: c.files,
        sourceManifest: o.inspection.sourceManifest,
        artifactDirectory: o.paths.artifactDirectory,
        projectRoot: o.paths.root,
        artifactManifestBody: l.body
      }), p = await d.uploads.create({
        appId: o.appId,
        manifest: l.document,
        files: u.map((v) => ({
          path: v.uploadPath,
          size: v.size,
          contentType: v.contentType
        }))
      });
      for (const v of u) {
        const ce = p.files.find((Ur) => Ur.path === v.uploadPath);
        if (!ce) throw new Error(`No upload URL returned for ${v.uploadPath}`);
        const et = await fetch(ce.url, {
          method: ce.method,
          headers: ce.headers,
          body: await $i(v)
        });
        if (!et.ok) throw new Error(`Upload failed for ${v.uploadPath}: ${et.status}`);
      }
      const m = await d.uploads.complete(p.uploadId, n.forceApprove ? { forceApprove: !0 } : void 0), P = m.status === "approved" ? `Approved app ${m.appId} version ${m.appVersionId} and connected it to production.` : `Submitted app ${m.appId} version ${m.appVersionId} to staging.`;
      h(a, {
        status: m.status === "approved" ? "publish_approved" : "publish_submitted",
        appId: m.appId,
        appVersionId: m.appVersionId,
        uploadId: p.uploadId,
        versionRootUrl: m.versionRootUrl,
        ...m.registryAssets.length > 0 ? { registryAssets: m.registryAssets } : {}
      }, P);
    } catch (o) {
      if (y(1), a.json) {
        a.result({
          status: "error",
          message: o instanceof Error ? o.message : "Registry publish failed"
        });
        return;
      }
      throw o;
    }
  });
}
async function $i(e) {
  return e.body ? e.body : S(C(e.root, e.path));
}
async function Ui(e) {
  const t = await S(e.artifactManifestPath, "utf8");
  let r;
  try {
    r = JSON.parse(t);
  } catch {
    throw new Error("manifest.json must be valid JSON");
  }
  if (!r || typeof r != "object" || Array.isArray(r)) throw new Error("manifest.json must be a JSON object");
  const s = { ...r }, n = e.sourceManifest?.registryAssets;
  return !n || n.kind === "none" ? s.registryAssets === void 0 ? {
    document: s,
    body: void 0
  } : (delete s.registryAssets, {
    document: s,
    body: _t(s)
  }) : (s.registryAssets = n.kind === "inline" ? n.assets : n.paths.length === 1 ? n.paths[0] : n.paths, {
    document: s,
    body: _t(s)
  });
}
function _t(e) {
  return Buffer.from(`${JSON.stringify(e, null, 2)}
`);
}
async function Mi(e) {
  const t = e.artifactFiles.map((a) => ({
    ...a,
    ...a.path === "manifest.json" && e.artifactManifestBody ? {
      size: e.artifactManifestBody.byteLength,
      body: e.artifactManifestBody
    } : {},
    uploadPath: a.path,
    root: e.artifactDirectory
  })), r = new Set(t.map((a) => a.uploadPath)), s = /* @__PURE__ */ new Set(), n = [];
  if (e.sourceManifest?.registryAssets.kind === "inline") n.push(...e.sourceManifest.registryAssets.assets);
  else if (e.sourceManifest?.registryAssets.kind === "files") for (const a of e.sourceManifest.registryAssets.paths) {
    const o = {
      path: a,
      uploadPath: a,
      size: (await Me(C(e.projectRoot, a))).size,
      contentType: Ne(a),
      root: e.projectRoot
    }, c = t.findIndex((l) => l.uploadPath === a);
    c >= 0 ? t[c] = o : t.push(o), r.add(a);
    const d = Kt(await S(C(e.projectRoot, a), "utf8"));
    n.push(...d.assets);
  }
  for (const a of n) {
    if (!a.source) continue;
    const o = We(a.source, `registryAssets.${a.id}.source`);
    if (o.kind !== "artifactPath" || s.has(o.path)) continue;
    s.add(o.path);
    const c = Ms(o.path);
    if (!r.has(c)) {
      const d = await Me(C(e.projectRoot, o.path));
      t.push({
        path: o.path,
        uploadPath: c,
        size: d.size,
        contentType: Ne(o.path),
        root: e.projectRoot
      }), r.add(c);
    }
  }
  return t;
}
function Oi(e, t, r, s) {
  const n = t.find((a) => a.severity === "error");
  if (y(2), n?.code === "app_not_claimed") {
    const a = s ?? "unknown";
    h(e, {
      status: "app_not_claimed",
      appId: a,
      nextCommand: "registry claim"
    }, `App ID "${a}" has not been claimed for this Registry.

Run:
  registry claim`);
    return;
  }
  if (n?.code === "manifest_missing_app_id" && n.source === "manifest") {
    h(e, {
      status: "manifest_missing_app_id",
      manifestPath: r.paths.sourceManifest,
      message: "Source manifest must include appId before publishing."
    }, `Source manifest ${r.paths.sourceManifest} must include appId before publishing.`);
    return;
  }
  if (n?.code === "manifest_missing_app_id" && n.source === "artifact") {
    h(e, {
      status: "manifest_missing_app_id",
      manifestPath: r.paths.artifactManifest,
      message: "Artifact manifest must include appId before publishing."
    }, `Artifact manifest ${r.paths.artifactManifest} must include appId before publishing.`);
    return;
  }
  if (n?.code === "artifact_app_id_mismatch") {
    h(e, {
      status: "manifest_app_id_mismatch",
      sourceAppId: r.sourceManifest?.appId ?? s,
      artifactAppId: r.artifactManifest?.appId ?? null,
      message: "Source and artifact manifest appId values must match."
    }, n.message);
    return;
  }
  h(e, {
    status: n?.code ?? "error",
    message: n?.message ?? "Registry publish validation failed.",
    diagnostics: t
  }, oe(t));
}
function qi(e) {
  const t = e.remoteState.kind === "unknown" ? `
Remote state: unknown (local dry-run).` : "";
  return [
    `Dry run for app ${e.appId}.`,
    `Files: ${e.files.length} (${e.totalBytes} bytes).`,
    `Expected: ${e.expectedStatus} on ${e.expectedChannel}.`
  ].join(`
`) + t;
}
function Ni(e, t) {
  e.command("status").argument("[root]", "Primer app project root", ".").description("Show Registry state for a Primer app").option("--app-id <app-id>", "Registry app ID").option("--json", "Print a machine-readable result").action(async (r, s) => {
    const n = A({
      json: _(e, s),
      write: t.write
    });
    try {
      const { client: a } = await _e(e, t), o = s.appId ? null : await Di(r), c = s.appId || o;
      if (!c) {
        y(2), h(n, {
          status: "manifest_missing_app_id",
          manifestHasAppId: !1,
          nextCommand: "registry claim"
        }, "Source manifest is missing appId. Run: registry claim");
        return;
      }
      const d = Jt.parse(await a.apps.get(c)), l = d.exists ? await Li(a, c) : null, u = l ? await Vi(a, c) : [], p = {
        status: "registry_status_shown",
        appId: c,
        manifestHasAppId: s.appId ? null : !!o,
        versionsAccessible: !!l,
        app: d,
        latestVersions: {
          submitted: l?.find((m) => m.status === "submitted") || null,
          approved: l?.find((m) => m.status === "approved") || null,
          rejected: l?.find((m) => m.status === "rejected") || null
        },
        channels: u,
        nextCommand: Fi(d.exists, l?.length || 0)
      };
      h(n, p, Ji(p));
    } catch (a) {
      if (y(a instanceof I && a.status >= 400 && a.status < 500 ? 2 : 1), n.json) {
        n.result({
          status: "error",
          message: a instanceof Error ? a.message : "Registry status failed"
        });
        return;
      }
      throw a;
    }
  });
}
async function Di(e) {
  return (await ua(M({ root: e }).sourceManifest)).appId || null;
}
async function Li(e, t) {
  try {
    return (await e.versions.list({ appId: t })).appVersions;
  } catch (r) {
    if (r instanceof I && r.status === 403) return null;
    throw r;
  }
}
async function Vi(e, t) {
  try {
    return await Bi(e, t);
  } catch (r) {
    if (r instanceof I && r.status === 403) return [];
    throw r;
  }
}
async function Bi(e, t) {
  const r = (await e.channels.list()).channels, s = [];
  for (const n of r) {
    const a = await e.channels.assignments(n.id, { appId: t });
    s.push(...a.assignments);
  }
  return s;
}
function Fi(e, t) {
  return e ? t === 0 ? "registry publish" : null : "registry claim";
}
function Ji(e) {
  const t = e.app.exists ? e.app.claim.claimedByCurrentUser ? `claimed by this account (${e.app.claim.role})` : "claimed by another account" : "available", r = e.versionsAccessible ? Object.entries(e.latestVersions).map(([a, o]) => `${a}: ${o ? o.id : "-"}`) : ["versions: not accessible"], s = e.versionsAccessible ? ["staging", "prod"].map((a) => {
    const o = e.channels.find((c) => c.channelId === a);
    return `${a}: ${o ? o.appVersionId : "-"}`;
  }) : [], n = e.nextCommand ? [`Next: ${e.nextCommand}`] : [];
  return [
    `App: ${e.appId}`,
    `Status: ${t}`,
    ...r,
    ...s,
    ...n
  ].join(`
`);
}
function zi(e, t) {
  const r = e.command("token").description("Manage long-lived Registry access tokens");
  r.command("create").description("Create a Registry access token and print its secret once").requiredOption("--title <title>", "Token title").option("-w, --write", "Create a write token").option("--reviewer", "Create a reviewer token").option("-a, --admin", "Create an admin token").option("--testing", "Create a testing token").option("-p, --permission <permission>", "Add a permission; repeat or use comma-separated/grouped values", Qi, []).option("--expires-at <datetime>", "ISO 8601 expiry with timezone").option("--json", "Print JSON output").action(async (n) => {
    await T(e, t, n, async ({ client: a }) => {
      const o = Gi(n), c = await a.tokens.create({
        title: n.title,
        permissions: o,
        expiresAt: n.expiresAt ? Et(n.expiresAt, t.now()).toISOString() : null
      });
      return {
        payload: c,
        message: `Created Registry access token ${c.token.id}. Secret: ${c.secret}`
      };
    });
  }), r.command("update").argument("<token-id>").description("Update Registry access token metadata").option("--title <title>", "Token title").option("--expires-at <datetime>", "ISO 8601 expiry with timezone").option("--json", "Print JSON output").action(async (n, a) => {
    await T(e, t, a, async ({ client: o }) => {
      const c = {};
      if (a.title !== void 0 && (c.title = a.title), a.expiresAt !== void 0 && (c.expiresAt = Et(a.expiresAt, t.now()).toISOString()), Object.keys(c).length === 0) throw new Error("Provide at least one token update option");
      const d = await o.tokens.update(n, c);
      return {
        payload: d,
        message: `Updated token ${d.token.id}.`
      };
    });
  }), r.command("list").description("List your Registry access tokens").option("--json", "Print JSON output").action(async (n) => {
    await T(e, t, n, async ({ client: a }) => {
      const o = await a.tokens.list();
      return {
        payload: o,
        message: Zi(o.tokens)
      };
    });
  }), r.command("status").argument("<token-id>").description("Show a Registry access token status").option("--json", "Print JSON output").action(async (n, a) => {
    await T(e, t, a, async ({ client: o }) => {
      const c = await o.tokens.status(n);
      return {
        payload: c,
        message: `Token ${c.token.id}: ${c.token.title}`
      };
    });
  }), r.command("grant").argument("<token-id>").requiredOption("--app-id <appId>", "App ID").description("Grant a Registry access token to an app").option("--json", "Print JSON output").action(async (n, a) => {
    await T(e, t, a, async ({ client: o }) => {
      const c = await o.tokens.grant(n, { appId: a.appId });
      return {
        payload: c,
        message: `Granted token ${n} to app ${c.grant.appId}.`
      };
    });
  }), r.command("ungrant").argument("<token-id>").requiredOption("--app-id <appId>", "App ID").description("Remove a Registry access token app grant").option("--json", "Print JSON output").action(async (n, a) => {
    await T(e, t, a, async ({ client: o }) => {
      const c = await o.tokens.ungrant(n, { appId: a.appId });
      return {
        payload: c,
        message: `Removed token ${n} grant for app ${c.grant.appId}.`
      };
    });
  }), r.command("delete").argument("<token-id>").description("Delete a Registry access token").option("--json", "Print JSON output").action(async (n, a) => {
    await T(e, t, a, async ({ client: o }) => {
      const c = await o.tokens.delete(n);
      return {
        payload: c,
        message: `Deleted token ${c.token.id}.`
      };
    });
  });
  const s = r.command("permissions").alias("p").description("Manage Registry access token permissions");
  s.command("list").argument("<token-id>").description("List canonical Registry access token permissions").option("--json", "Print JSON output").action(async (n, a) => {
    await T(e, t, a, async ({ client: o }) => {
      const c = await o.tokens.listPermissions(n);
      return {
        payload: c,
        message: jr(c.permissions)
      };
    });
  }), Ue(s, e, t, "set"), Ue(s, e, t, "add"), Ue(s, e, t, "remove");
}
function Gi(e) {
  const t = Wi(e), r = Hi(e);
  return r ? ze([...us(r), ...t]) : t;
}
function Hi(e) {
  const t = [
    e.write,
    e.reviewer,
    e.admin,
    e.testing
  ].filter(Boolean).length;
  if (t > 1) throw new Error("Use only one of --write, --reviewer, --admin, or --testing");
  if (t !== 0) {
    if (e.testing) return "testing";
    if (e.admin) return "admin";
    if (e.reviewer) return "reviewer";
    if (e.write) return "write";
  }
}
function Wi(e) {
  return ze(Pr(e.permission ?? []));
}
function Yi(e) {
  return ze(Pr(e));
}
function Qi(e, t = []) {
  return [...t, e];
}
function Ue(e, t, r, s) {
  e.command(s).argument("<permissions...>", "Permissions; use space-separated, comma-separated, or grouped values").description(`${s[0].toUpperCase()}${s.slice(1)} Registry access token permissions`).requiredOption("-t, --token-id <token-id>", "Registry access token ID").option("--json", "Print JSON output").action(async (n, a) => {
    await T(t, r, a, async ({ client: o }) => {
      const c = { permissions: Yi(n) }, d = s === "set" ? await o.tokens.setPermissions(a.tokenId, c) : s === "add" ? await o.tokens.addPermissions(a.tokenId, c) : await o.tokens.removePermissions(a.tokenId, c);
      return {
        payload: d,
        message: jr(d.permissions)
      };
    });
  });
}
function Pr(e) {
  return e.flatMap((t) => kr(t).flatMap(Ki));
}
function kr(e, t = {}) {
  const r = [];
  let s = 0, n = 0;
  for (let o = 0; o < e.length; o += 1) {
    const c = e[o];
    if (c === "(" && (s += 1), c === ")") {
      if (s === 0) throw new Error("Permission list has an unmatched closing parenthesis");
      s -= 1;
    }
    c === "," && s === 0 && (r.push(e.slice(n, o)), n = o + 1);
  }
  if (s > 0) throw new Error("Permission list has an unmatched opening parenthesis");
  r.push(e.slice(n));
  const a = r.map((o) => o.trim());
  if (t.rejectEmpty && a.some((o) => !o)) throw new Error("Permission group contains an empty item");
  return a.filter(Boolean);
}
function Ki(e) {
  Xi(e);
  const t = /^([a-z]+(?:\.[a-z]+)*)\.\(([^()]+)\)$/.exec(e);
  if (!t) return [e];
  const [, r, s] = t;
  if (!r) throw new Error("Permission group has an empty prefix");
  return kr(s, { rejectEmpty: !0 }).map((n) => `${r}.${n}`);
}
function Xi(e) {
  let t = 0;
  for (const r of e) {
    if (r === "(" && (t += 1, t > 1))
      throw new Error("Permission groups cannot be nested");
    if (r === ")") {
      if (t === 0) throw new Error("Permission list has an unmatched closing parenthesis");
      t -= 1;
    }
  }
  if (t > 0) throw new Error("Permission list has an unmatched opening parenthesis");
}
function Et(e, t) {
  if (!/[zZ]|[+-]\d{2}:\d{2}$/.test(e)) throw new Error("--expires-at requires an explicit timezone or offset");
  const r = new Date(e);
  if (Number.isNaN(r.getTime())) throw new Error("--expires-at must be an ISO 8601 datetime");
  if (r.getTime() <= t) throw new Error("--expires-at must be in the future");
  return r;
}
function T(e, t, r, s) {
  return U(e, t, r, s, {
    defaultErrorMessage: "Registry token command failed",
    tokenPolicy: "browser-session-only"
  });
}
function Zi(e) {
  return j({
    columns: [
      {
        header: "TOKEN ID",
        value: (t) => t.id,
        color: f.id
      },
      {
        header: "TITLE",
        value: (t) => t.title
      },
      {
        header: "PERMISSIONS",
        value: (t) => `${t.permissions.length} permissions`
      },
      {
        header: "STATUS",
        value: (t) => t.deletedAt ? "deleted" : "active",
        color: eo
      }
    ],
    rows: e,
    emptyMessage: "No Registry access tokens found."
  });
}
function jr(e) {
  return j({
    columns: [{
      header: "PERMISSION",
      value: (t) => t
    }],
    rows: [...e],
    emptyMessage: "No Registry access token permissions found."
  });
}
function eo(e) {
  return e.trim() === "active" ? f.success(e) : f.warning(e);
}
function to(e, t) {
  const r = e.command("versions").alias("v").description("Manage Registry app versions");
  xi(r, e, t), ka(r, e, t), r.command("approve").argument("<version-id>", "App version UUID").option("--reason <text>", "Review reason").option("--json", "Print a machine-readable result").action(async (s, n) => {
    await K(e, t, n, async ({ client: a }) => {
      const o = await a.versions.approve(s, { reason: n.reason });
      return {
        payload: {
          status: "version_approved",
          appVersion: o.appVersion
        },
        message: `Approved app version ${o.appVersion.id}.`
      };
    });
  }), r.command("reject").argument("<version-id>", "App version UUID").requiredOption("--reason <text>", "Rejection reason").option("--json", "Print a machine-readable result").action(async (s, n) => {
    await K(e, t, n, async ({ client: a }) => {
      const o = await a.versions.reject(s, { reason: n.reason });
      return {
        payload: {
          status: "version_rejected",
          appVersion: o.appVersion
        },
        message: `Rejected app version ${o.appVersion.id}.`
      };
    });
  }), r.command("delete").argument("<version-id>", "App version UUID").option("--reason <text>", "Deletion reason").option("--json", "Print a machine-readable result").action(async (s, n) => {
    await K(e, t, n, async ({ client: a }) => {
      ro(n);
      const o = await a.versions.delete(s, { reason: n.reason });
      return {
        payload: {
          status: "version_deleted",
          appVersion: o.appVersion,
          event: o.event
        },
        message: `Soft-deleted app version ${o.appVersion.id}.`
      };
    });
  }), vr(r.command("list").option("--app-id <app-id>", "Filter by app ID").option("--status <status>", "Filter by status: submitted, approved, or rejected").option("--channel <channel-id>", "Filter by current channel assignment")).option("--json", "Print a machine-readable result").action(async (s) => {
    await K(e, t, s, async ({ client: n }) => {
      const a = await Rr(s), o = await n.versions.list({
        appId: s.appId,
        status: s.status,
        channel: s.channel,
        ...a
      });
      return {
        payload: {
          status: "versions_listed",
          appVersions: o.appVersions
        },
        message: lo(o.appVersions)
      };
    });
  }), r.command("show").argument("<version-id>", "App version UUID").option("--json", "Print a machine-readable result").action(async (s, n) => {
    await K(e, t, n, async ({ client: a }) => {
      const o = await a.versions.show(s);
      return {
        payload: {
          status: "version_shown",
          appVersion: o.appVersion
        },
        message: co(o.appVersion)
      };
    });
  });
}
async function K(e, t, r, s) {
  await U(e, t, r, s, {
    defaultErrorMessage: "Registry versions command failed",
    formatError: no,
    isUsageError: so
  });
}
function ro(e) {
  if (!e.reason?.trim()) throw new Tr("Provide a deletion reason with --reason <text>");
}
var Tr = class extends Error {
};
function so(e) {
  return e instanceof Tr || e instanceof be;
}
function no(e) {
  if (e instanceof I) {
    const t = ao(e);
    return {
      status: t,
      message: io(e, t),
      ...oo(e)
    };
  }
  return {
    status: "error",
    message: e instanceof Error ? e.message : "Registry versions command failed"
  };
}
function ao(e) {
  return e.code === "permission_denied" || e.code === "forbidden" || e.status === 403 ? "permission_denied" : e.code === "version_not_found" || e.status === 404 ? "version_not_found" : e.code === "version_already_deleted" ? "version_already_deleted" : e.code === "version_delete_blocked_by_channel" ? "version_delete_blocked_by_channel" : "error";
}
function io(e, t) {
  if (t !== "version_delete_blocked_by_channel") return e.message;
  const r = Cr(e), s = r.length > 0 ? ` Blocking channels: ${r.join(", ")}.` : "";
  return `${e.message}.${s} Disconnect or reconnect the blocking channels before deleting this version.`;
}
function oo(e) {
  const t = Cr(e);
  return t.length > 0 ? { blockingChannels: t } : {};
}
function Cr(e) {
  return e instanceof cr ? e.blockingChannelIds : [];
}
function co(e) {
  return `${e.id}
App: ${e.appId}
Status: ${e.status}
Channels: ${xr(e)}
Title: ${e.title}`;
}
function lo(e) {
  return e.length === 0 ? "No app versions found." : j({
    columns: [
      {
        header: "VERSION ID",
        value: (t) => t.id,
        color: f.id
      },
      {
        header: "APP ID",
        value: (t) => t.appId,
        color: f.id
      },
      {
        header: "STATUS",
        value: (t) => t.status,
        color: uo
      },
      {
        header: "CHANNELS",
        value: xr
      },
      {
        header: "TITLE",
        value: (t) => t.title
      }
    ],
    rows: e,
    emptyMessage: "No app versions found."
  });
}
function uo(e) {
  const t = e.trim();
  return t === "approved" ? f.success(e) : t === "rejected" ? f.warning(e) : e;
}
function xr(e) {
  return e.channels && e.channels.length > 0 ? e.channels.map((t) => t.channelId).join(",") : "-";
}
async function po(e, t = {}) {
  const r = `${e} ${t.defaultValue === !1 ? "[y/N]" : "[Y/n]"} `, s = jt({
    input: Tt,
    output: Ct
  });
  try {
    const n = (await s.question(r)).trim().toLowerCase();
    return n ? n === "y" || n === "yes" : t.defaultValue !== !1;
  } finally {
    s.close();
  }
}
async function mo(e, t = {}) {
  const r = `${e}${t.defaultValue ? ` [${t.defaultValue}]` : ""} `, s = jt({
    input: Tt,
    output: Ct
  });
  try {
    return (await s.question(r)).trim() || t.defaultValue || "";
  } finally {
    s.close();
  }
}
var $r = C(Br(), ".config", "primer-registry"), re = C($r, "session.json");
async function fo() {
  return qe(re) ? JSON.parse(await S(re, "utf8")) : null;
}
async function ho(e) {
  await kt($r, {
    recursive: !0,
    mode: 448
  }), await Le(re, JSON.stringify(e, null, 2), { mode: 384 }), await Or(re, 384);
}
async function go() {
  await Nr(re, { force: !0 });
}
function yo(e = {}) {
  return {
    now: () => Date.now(),
    openBrowser: bo,
    readSession: fo,
    removeSession: go,
    request: Jn,
    saveSession: ho,
    sleep: wo,
    write: (t) => console.log(t),
    confirm: po,
    promptText: mo,
    ...e
  };
}
function bo(e) {
  const t = process.platform === "darwin" ? "open" : process.platform === "win32" ? "cmd" : "xdg-open", r = process.platform === "win32" ? [
    "/c",
    "start",
    "",
    e
  ] : [e];
  return new Promise((s) => {
    const n = Vr(t, r, {
      detached: !0,
      stdio: "ignore"
    });
    n.once("error", () => s(!1)), n.once("spawn", () => {
      n.unref(), s(!0);
    });
  });
}
function wo(e) {
  return new Promise((t) => setTimeout(t, e));
}
function vo(e = {}) {
  const t = yo(e), r = new Mr().name("registry").description("Primer Registry HTTP publishing CLI").option("-u, --registry-url <url>", "Registry URL").option("--token <access-token>", "Registry access token").option("--json", "Print machine-readable JSON output");
  return Gn(r, t), Ri(r, t), ba(r, t), Ii(r, t), Ci(r, t), Ni(r, t), zi(r, t), Ba(r, t), Ea(r, t), Oa(r, t), to(r, t), ti(r, t), Ai(r, t), Zn(r, t), r;
}
process.env.NODE_ENV !== "test" && await vo().parseAsync().catch((e) => {
  console.error(e instanceof Error ? e.message : String(e)), process.exitCode = 1;
});
