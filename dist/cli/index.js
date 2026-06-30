#!/usr/bin/env node
import { Command as Xs } from "commander";
import { z as i } from "zod";
import { access as Vt, chmod as Zs, mkdir as Bt, readFile as I, readdir as er, rm as tr, stat as re, writeFile as Ge } from "node:fs/promises";
import { dirname as sr, isAbsolute as Je, join as x, relative as rr, resolve as T } from "node:path";
import { existsSync as ze } from "node:fs";
import { spawn as nr } from "node:child_process";
import { createInterface as Ft } from "node:readline/promises";
import { stdin as Jt, stdout as zt } from "node:process";
import { homedir as ar } from "node:os";
import "node:module";
var ir = Object.create, Ht = Object.defineProperty, or = Object.getOwnPropertyDescriptor, cr = Object.getOwnPropertyNames, dr = Object.getPrototypeOf, ur = Object.prototype.hasOwnProperty, lr = (e, t) => () => (t || (e((t = { exports: {} }).exports, t), e = null), t.exports), pr = (e, t, s, r) => {
  if (t && typeof t == "object" || typeof t == "function")
    for (var n = cr(t), a = 0, o = n.length, c; a < o; a++)
      c = n[a], !ur.call(e, c) && c !== s && Ht(e, c, {
        get: ((d) => t[d]).bind(null, c),
        enumerable: !(r = or(t, c)) || r.enumerable
      });
  return e;
}, mr = (e, t, s) => (s = e != null ? ir(dr(e)) : {}, pr(t || !e || !e.__esModule ? Ht(s, "default", {
  value: e,
  enumerable: !0
}) : s, e));
var Gt = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/, g = i.string().max(80).regex(Gt, "must be a safe app ID"), M = i.uuid(), We = i.uuid();
function fr(e) {
  return e.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").replace(/-{2,}/g, "-").slice(0, 80).replace(/-+$/g, "");
}
var hr = [
  "submitted",
  "approved",
  "rejected"
], ve = i.enum(hr), gr = ["prod", "staging"], N = i.enum(gr), yr = i.object({
  id: i.string().min(1),
  registryUrl: i.url(),
  materialized: i.boolean(),
  sourceManifestPath: i.string().min(1).optional()
}), br = ["owner", "member"], de = i.enum(br).describe("Role granted to a user on a claimed app."), Qe = i.object({
  channelId: N.describe("Distribution channel receiving this version."),
  appId: g.describe("Stable app identifier for this assignment."),
  appVersionId: M.describe("Version currently connected to the channel."),
  updatedAt: i.iso.datetime().nullable().describe("Time the channel assignment last changed.")
}).describe("Current app version assigned to a distribution channel."), X = i.object({
  id: M.describe("Stable app version identifier."),
  appId: g.describe("Stable app identifier that owns this version."),
  title: i.string().min(1),
  tags: i.array(i.string()),
  primerSdkVersion: i.string().nullable(),
  status: ve.describe("Review lifecycle state for this version."),
  channels: i.array(Qe).default([]).describe("Channels currently connected to this version.")
}).describe("Submitted app version and its review state.");
var j = i.string().trim().min(1).max(500).describe("Short audit reason recorded with the change."), Ye = "channels.write:", Wt = "apps.members.read:", Qt = "apps.members.write:", Pe = "tokens.read:", Ee = "tokens.update:", _e = "tokens.delete:", ke = "tokens.permissions.write:", wr = [
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
], vr = [
  "apps.claim",
  "apps.delete",
  "versions.publish",
  "versions.reserved.read",
  "versions.reserved.write",
  "versions.delete",
  "versions.review",
  "allowlist.read",
  "users.read"
], Yt = [
  "read",
  "write",
  "reviewer",
  "admin",
  "testing"
], ec = i.enum(Yt), Rr = i.enum(wr), Sr = i.enum(vr), Ke = i.custom((e) => Kt(e), "Expected channels.write:<channel-slug>"), Ir = i.custom((e) => Tr(e), "Expected apps.members.read:<app-id> or apps.members.write:<app-id>"), tc = i.custom((e) => Zt(e), "Expected apps.members.read:<app-id>"), sc = i.custom((e) => es(e), "Expected apps.members.write:<app-id>"), Ar = i.custom((e) => $r(e), "Expected a token-scoped Registry permission"), rc = i.custom((e) => le(e, Pe), "Expected tokens.read:<token-id>"), nc = i.custom((e) => le(e, Ee), "Expected tokens.update:<token-id>"), ac = i.custom((e) => le(e, _e), "Expected tokens.delete:<token-id>"), ic = i.custom((e) => le(e, ke), "Expected tokens.permissions.write:<token-id>"), Re = i.union([
  Rr,
  Ke,
  Ir,
  Ar
]), Xe = i.union([Sr, Ke]), dt = /* @__PURE__ */ new Map([
  ["apps.claim", 0],
  ["apps.delete", 1],
  [Wt, 2],
  [Qt, 3],
  ["versions.publish", 4],
  ["versions.reserved.read", 5],
  ["versions.reserved.write", 6],
  ["versions.delete", 7],
  ["versions.review", 8],
  [Ye, 9],
  ["allowlist.read", 10],
  ["allowlist.write", 11],
  ["users.read", 12],
  ["users.permissions.read", 13],
  ["users.permissions.write", 14],
  ["sessions.revoke", 15],
  ["tokens.create", 16],
  [Pe, 17],
  [Ee, 18],
  [_e, 19],
  [ke, 20]
]);
function ut(e) {
  const t = Pr(e);
  return t ? [dt.get(t) ?? 0, e] : [dt.get(e) ?? Number.MAX_SAFE_INTEGER, e];
}
function Pr(e) {
  if (Kt(e)) return Ye;
  if (e.startsWith("apps.members.read:")) return Wt;
  if (e.startsWith("apps.members.write:")) return Qt;
  if (e.startsWith("tokens.read:")) return Pe;
  if (e.startsWith("tokens.update:")) return Ee;
  if (e.startsWith("tokens.delete:")) return _e;
  if (e.startsWith("tokens.permissions.write:")) return ke;
}
function Kt(e) {
  if (typeof e != "string" || !e.startsWith("channels.write:")) return !1;
  const t = e.slice(15);
  return Gt.test(t);
}
function Er(e) {
  return Ke.parse(`${Ye}${e}`);
}
function F(e) {
  return Array.from(new Set(e.map((t) => Re.parse(t)))).sort((t, s) => {
    const [r, n] = ut(t), [a, o] = ut(s);
    return r - a || n.localeCompare(o);
  });
}
function Xt(e) {
  return F((Array.isArray(e) ? e : [e]).flatMap((t) => t.split(",")).map((t) => t.trim()).filter(Boolean));
}
function _r(e) {
  return F(e).map((t) => Xe.parse(t));
}
function Ze(e) {
  return Xt(e).map((t) => Xe.parse(t));
}
function kr(e, t = {}) {
  const s = t.channelIds;
  switch (e) {
    case "read":
      return [];
    case "write":
      return F([
        "apps.claim",
        "versions.publish",
        "versions.delete",
        "channels.write:staging"
      ]);
    case "reviewer":
      return F([
        "apps.claim",
        "versions.publish",
        "versions.delete",
        "versions.review",
        ...Me(s ?? ["staging", "prod"])
      ]);
    case "admin":
      return F([
        "apps.claim",
        "apps.delete",
        "versions.publish",
        "versions.reserved.read",
        "versions.reserved.write",
        "versions.delete",
        "versions.review",
        ...Me(s ?? ["staging", "prod"]),
        "allowlist.read",
        "users.read"
      ]);
    case "testing":
      return F([
        "apps.claim",
        "apps.delete",
        "versions.publish",
        "versions.reserved.read",
        "versions.reserved.write",
        "versions.delete",
        "versions.review",
        ...Me(s ?? ["staging"])
      ]);
  }
}
var jr = i.array(Re).transform(F), ue = i.array(Xe).transform(_r);
function Me(e) {
  return e.map(Er);
}
function Tr(e) {
  return Zt(e) || es(e);
}
function Zt(e) {
  return typeof e != "string" ? !1 : e.startsWith("apps.members.read:") && g.safeParse(e.slice(18)).success;
}
function es(e) {
  return typeof e != "string" ? !1 : e.startsWith("apps.members.write:") && g.safeParse(e.slice(19)).success;
}
function $r(e) {
  return [
    Pe,
    Ee,
    _e,
    ke
  ].some((t) => le(e, t));
}
function le(e, t) {
  return typeof e == "string" && e.startsWith(t) && Cr(e.slice(t.length));
}
function Cr(e) {
  return /^[A-Za-z0-9][A-Za-z0-9_-]*$/.test(e);
}
var ne = Yt, Se = {
  email: "email",
  domain: "domain"
}, L = {
  listed: "listed",
  found: "found",
  created: "created",
  enabled: "enabled",
  disabled: "disabled",
  updated: "updated",
  revoked: "revoked"
}, Ur = [
  L.created,
  L.enabled,
  L.disabled
], lt = i.enum(ne).describe("Named shortcut expanded to concrete Registry user permissions."), ts = i.enum([Se.email, Se.domain]).describe("Whether an allowlist entry matches one email or an email domain."), ss = i.object({
  id: i.string().min(1).describe("Stable email allowlist entry identifier."),
  entryType: ts,
  value: i.string().min(1).describe("Email address or domain matched by the entry."),
  description: i.string().nullable().describe("Optional admin note for the entry."),
  disabledAt: i.iso.datetime().nullable().describe("Time the entry was disabled, if inactive."),
  createdAt: i.iso.datetime().describe("Time the entry was created."),
  updatedAt: i.iso.datetime().describe("Time the entry last changed.")
}).describe("Email allowlist entry used for Registry account access."), oc = i.object({
  entryType: ts,
  value: i.string().trim().min(1).max(320),
  description: i.string().trim().max(500).optional().nullable(),
  reason: j
}), cc = i.object({
  enabled: i.boolean(),
  reason: j
}), xr = i.object({
  status: i.literal(L.listed),
  entries: i.array(ss)
}), pt = i.object({
  status: i.enum(Ur),
  entry: ss
}), et = i.object({
  id: i.string().min(1).describe("Stable Registry user identifier."),
  email: i.email().nullable().describe("User email address, when available."),
  permissions: jr.describe("Concrete Registry permissions granted to the user.")
}).describe("Registry user visible to admin workflows."), Mr = i.object({
  status: i.literal(L.listed),
  users: i.array(et)
}), mt = i.object({
  status: i.literal(L.found),
  user: et
}), dc = i.object({
  grantPermissions: i.array(Re).optional().default([]),
  revokePermissions: i.array(Re).optional().default([]),
  grantPreset: lt.optional(),
  revokePreset: lt.optional(),
  reason: j
}).refine((e) => e.grantPermissions.length > 0 || e.revokePermissions.length > 0 || !!e.grantPreset || !!e.revokePreset, { message: "Grant or revoke at least one permission or preset." }), Or = i.object({
  status: i.literal(L.updated),
  user: et,
  revokedSessionCount: i.number().int().nonnegative().describe("Number of user sessions revoked after permissions were removed.")
}), uc = i.object({ reason: j }), qr = i.object({
  status: i.literal(L.revoked),
  userId: i.string().min(1).describe("Stable Registry user identifier."),
  revokedSessionCount: i.number().int().nonnegative().describe("Number of user sessions revoked.")
}), Nr = class {
  transport;
  constructor(e) {
    this.transport = e;
  }
  listEmailAllowlistEntries() {
    return this.transport.request("/api/admin/email-allowlist", xr);
  }
  createEmailAllowlistEntry(e) {
    return this.transport.request("/api/admin/email-allowlist", pt, {
      method: "POST",
      body: e
    });
  }
  updateEmailAllowlistEntry(e, t) {
    return this.transport.request(`/api/admin/email-allowlist/${encodeURIComponent(e)}`, pt, {
      method: "PATCH",
      body: t
    });
  }
  listUsers() {
    return this.transport.request("/api/admin/users", Mr);
  }
  getUser(e) {
    return this.transport.request(`/api/admin/users/${encodeURIComponent(e)}`, mt);
  }
  getUserByEmail(e) {
    const t = new URLSearchParams({ email: e });
    return this.transport.request(`/api/admin/users?${t}`, mt);
  }
  updateUserPermissions(e, t) {
    return this.transport.request(`/api/admin/users/${encodeURIComponent(e)}`, Or, {
      method: "PATCH",
      body: t
    });
  }
  revokeUserSessions(e, t) {
    return this.transport.request(`/api/admin/users/${encodeURIComponent(e)}/revoke-sessions`, qr, {
      method: "POST",
      body: t
    });
  }
}, rs = i.discriminatedUnion("exists", [i.object({
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
    role: de.describe("Current account role on the claimed app.")
  }), i.object({
    claimedByCurrentUser: i.literal(!1).describe("Whether the current account has this claim."),
    role: i.null().describe("No app role is available for the current account.")
  })])
})]), Dr = i.object({
  appId: g.describe("Stable app identifier being checked."),
  available: i.boolean().describe("Whether this app ID can be claimed."),
  exists: i.boolean().describe("Whether the app is already claimed.")
}), Lr = i.object({ apps: i.array(i.object({
  appId: g.describe("Stable app identifier."),
  visibility: i.enum(["private", "public"]).describe("Registry app visibility."),
  status: i.enum(["active", "deleted"]).describe("Registry app lifecycle status."),
  latestVersionId: i.string().nullable().describe("Latest non-deleted app version ID, when one exists.")
})) }), lc = i.object({
  appId: g.describe("Stable app identifier to claim."),
  title: i.string().trim().min(1)
}), Vr = i.object({
  appId: g.describe("Stable app identifier that was claimed."),
  created: i.boolean().describe("Whether a new app claim was created."),
  role: de.describe("Role assigned to the acting app claimant.")
}), pc = i.object({
  reason: j,
  force: i.literal(!1).optional().describe("Hard delete is deferred and unsupported.")
}), Br = i.object({
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
function ns(e = {}, t = new URLSearchParams()) {
  return e.query && t.set("query", JSON.stringify(e.query)), e.includeReserved && t.set("includeReserved", "true"), t;
}
function ee(e, t) {
  return t.size ? `${e}?${t}` : e;
}
var S = encodeURIComponent, v = {
  apps: {
    collection: () => "/api/apps",
    item: (e) => `/api/apps/${S(e)}`,
    availability: (e) => `/api/apps/${S(e)}/availability`,
    history: (e) => `/api/apps/${S(e)}/history`,
    versions: (e, t = new URLSearchParams()) => ee(`/api/apps/${S(e)}/versions`, t)
  },
  versions: {
    collection: (e = new URLSearchParams()) => ee("/api/versions", e),
    item: (e) => `/api/versions/${S(e)}`,
    approve: (e) => `/api/versions/${S(e)}/approve`,
    reject: (e) => `/api/versions/${S(e)}/reject`,
    history: (e) => `/api/versions/${S(e)}/history`
  },
  channels: {
    collection: () => "/api/channels",
    item: (e, t = new URLSearchParams()) => ee(`/api/channels/${S(e)}`, t),
    versions: (e, t = new URLSearchParams()) => ee(`/api/channels/${S(e)}/versions`, t),
    version: (e, t) => `/api/channels/${S(e)}/versions/${S(t)}`,
    rollback: (e) => `/api/channels/${S(e)}/rollback`,
    history: (e, t = new URLSearchParams()) => ee(`/api/channels/${S(e)}/history`, t)
  }
}, Fr = class {
  transport;
  constructor(e) {
    this.transport = e;
  }
  get(e) {
    return this.transport.request(v.apps.item(e), rs);
  }
  availability(e) {
    return this.transport.request(v.apps.availability(e), Dr);
  }
  list() {
    return this.transport.request(v.apps.collection(), Lr);
  }
  create(e) {
    return this.transport.request(v.apps.collection(), Vr, {
      method: "POST",
      body: e
    });
  }
  delete(e, t) {
    return this.transport.request(v.apps.item(e), Br, {
      method: "DELETE",
      body: t
    });
  }
}, tt = i.object({
  userId: i.string().min(1).describe("Stable user identifier for the authenticated account."),
  email: i.email().nullable().describe("Account email address, when available.")
}).describe("Authenticated Registry account returned to the CLI."), Jr = i.object({
  deviceCode: i.string().min(32),
  userCode: i.string().min(4),
  verificationUri: i.url(),
  verificationUriComplete: i.url(),
  expiresIn: i.number().int().positive(),
  interval: i.number().int().positive()
}), mc = i.object({ deviceCode: i.string().min(32) }), zr = i.discriminatedUnion("status", [i.object({ status: i.literal("pending") }), i.object({
  status: i.literal("approved"),
  accessToken: i.string().min(1),
  expiresIn: i.number().int().positive(),
  refreshToken: i.string().min(32),
  account: tt
})]), fc = i.object({ refreshToken: i.string().min(32) }), Hr = i.object({
  accessToken: i.string().min(1),
  expiresIn: i.number().int().positive(),
  refreshToken: i.string().min(32),
  account: tt
}), Gr = i.object({ account: tt }), hc = i.object({ refreshToken: i.string().min(32).optional() }), gc = i.object({ userCode: i.string().min(4) }), Wr = class {
  transport;
  constructor(e) {
    this.transport = e;
  }
  start() {
    return this.transport.request("/api/cli/auth/start", Jr, { method: "POST" });
  }
  poll(e) {
    return this.transport.request("/api/cli/auth/poll", zr, {
      method: "POST",
      body: e
    });
  }
  refresh(e) {
    return this.transport.request("/api/cli/auth/refresh", Hr, {
      method: "POST",
      body: e
    });
  }
  whoami() {
    return this.transport.request("/api/cli/auth/whoami", Gr);
  }
  revoke(e = {}) {
    return this.transport.requestJson("/api/cli/auth/revoke", {
      method: "POST",
      body: e
    });
  }
}, Qr = "index.html", Yr = "manifest.json";
var Kr = ".registry-assets/";
function as(e) {
  return en(Kr, e, "registryAssets.source");
}
function Xr(e, t) {
  if (!e.startsWith(t)) throw new Error(`Object key is outside expected prefix: ${e}`);
  Zr(e);
}
function Zr(e) {
  if (e.startsWith("/") || e.includes("\\")) throw new Error(`Unsafe object key: ${e}`);
  for (const t of e.split("/")) if (t === ".." || t === ".") throw new Error(`Unsafe object key segment: ${e}`);
}
function pe(e, t = "relativePath") {
  if (!e || e.startsWith("/") || /^[a-z][a-z0-9+.-]*:/i.test(e) || e.includes("\\")) throw new Error(`${t} must be a safe relative path`);
  for (const s of e.split("/")) if (!s || s === "." || s === "..") throw new Error(`${t} must be a safe relative path`);
}
function en(e, t, s) {
  pe(t, s);
  const r = `${e}${t}`;
  return Xr(r, e), r;
}
var is = i.string().trim().min(1), je = i.string().trim().min(1).regex(/^[a-zA-Z0-9][a-zA-Z0-9._-]*$/), Te = i.object({
  id: je,
  source: i.string().trim().min(1).optional(),
  registryUrl: i.url().optional()
}).refine((e) => !!(e.source || e.registryUrl), { message: "registryAssets entries must include source or registryUrl" }), tn = i.object({ assets: i.array(Te) }), os = i.object({
  title: i.string().trim().min(1),
  appId: g.optional(),
  tags: i.array(is).default([]),
  primerSdkVersion: i.string().trim().min(1).nullable().optional(),
  thumbnailAssetId: je.optional(),
  registryAssets: i.unknown().optional(),
  registryAssetsModule: i.string().trim().min(1).optional()
}).passthrough(), sn = os.superRefine((e, t) => {
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
function $e(e) {
  const t = sn.parse(e);
  t.registryAssetsModule && pe(t.registryAssetsModule, "registryAssetsModule");
  const s = t.primerSdkVersion ?? null;
  return {
    title: t.title,
    appId: t.appId,
    tags: t.tags,
    primerSdkVersion: s,
    thumbnailAssetId: t.thumbnailAssetId,
    registryAssets: an(t.registryAssets),
    registryAssetsModule: t.registryAssetsModule
  };
}
function cs(e) {
  let t;
  try {
    t = JSON.parse(e);
  } catch {
    throw new Error("manifest.json must be valid JSON");
  }
  return $e(t);
}
function ds(e) {
  const t = tn.parse(e);
  return us(t.assets), t;
}
function rn(e) {
  let t;
  try {
    t = JSON.parse(e);
  } catch {
    throw new Error("Registry assets manifest must be valid JSON");
  }
  return ds(t);
}
function me(e, t = "source") {
  try {
    const s = new URL(e);
    if (s.protocol !== "https:") throw new Error(`${t} must be a safe relative path or HTTPS URL`);
    if (s.username || s.password) throw new Error(`${t} must be a safe relative path or HTTPS URL`);
    return {
      kind: "httpsUrl",
      url: s.toString()
    };
  } catch (s) {
    if (s instanceof Error && s.message === `${t} must be a safe relative path or HTTPS URL`) throw s;
    return pe(e, t), {
      kind: "artifactPath",
      path: e
    };
  }
}
function nn(e, t = "registryUrl") {
  const s = new URL(e);
  if (s.protocol !== "https:" || s.username || s.password) throw new Error(`${t} must be an HTTPS URL`);
  return s.toString();
}
function st(e) {
  const t = i.array(Te).parse(e);
  return us(t), t;
}
function an(e) {
  if (e === void 0) return { kind: "none" };
  if (typeof e == "string") return {
    kind: "files",
    paths: [ft(e)]
  };
  if (!Array.isArray(e)) throw new Error("registryAssets must be a path, path array, or inline asset array");
  if (e.length === 0) return {
    kind: "inline",
    assets: []
  };
  if (e.every((t) => typeof t == "string")) return {
    kind: "files",
    paths: e.map((t) => ft(t))
  };
  if (e.every((t) => typeof t == "object" && t !== null && !Array.isArray(t))) return {
    kind: "inline",
    assets: st(e)
  };
  throw new Error("registryAssets arrays cannot mix manifest paths and inline assets");
}
function ft(e) {
  return pe(e, "registryAssets"), e;
}
function us(e) {
  for (const t of e)
    t.source && me(t.source, "source"), t.registryUrl && nn(t.registryUrl, "registryUrl");
}
var ls = i.object({
  id: je,
  registryUrl: i.url()
}), on = i.object({
  appId: g,
  assets: i.array(ls)
}), yc = i.object({
  assets: i.array(Te).min(1),
  files: i.array(i.object({
    path: i.string().min(1),
    size: i.number().int().nonnegative(),
    contentType: i.string().min(1)
  }))
}), cn = i.object({
  appId: g,
  uploadId: We,
  expiresAt: i.iso.datetime(),
  files: i.array(i.object({
    path: i.string().min(1),
    method: i.literal("PUT"),
    url: i.url(),
    headers: i.record(i.string().min(1), i.string())
  }))
}), dn = i.enum([
  "materialized",
  "current",
  "repaired",
  "validated"
]), bc = i.object({ assets: i.array(Te).min(1) }), un = i.object({
  appId: g,
  assets: i.array(ls.extend({ action: dn }))
}), ln = class {
  transport;
  constructor(e) {
    this.transport = e;
  }
  list(e) {
    return this.transport.request(`/api/apps/${encodeURIComponent(e)}/assets`, on);
  }
  createUpload(e, t) {
    return this.transport.request(`/api/apps/${encodeURIComponent(e)}/assets/uploads`, cn, {
      method: "POST",
      body: t
    });
  }
  completeUpload(e, t, s) {
    return this.transport.request(`/api/apps/${encodeURIComponent(e)}/assets/uploads/${encodeURIComponent(t)}/complete`, un, {
      method: "POST",
      body: s
    });
  }
}, pn = i.object({
  id: g,
  title: i.string().trim().min(1),
  tags: i.array(is),
  primerSdkVersion: i.string().nullable(),
  versionRootUrl: i.url(),
  thumbnailUrl: i.url().nullable()
});
function w(e, t, s, r = {}) {
  return {
    code: e,
    message: t,
    path: s,
    ...r
  };
}
var mn = i.union([
  i.string(),
  i.number(),
  i.boolean(),
  i.null()
]), ae = i.lazy(() => i.union([
  mn,
  i.array(ae),
  i.record(i.string(), ae)
])), wc = i.record(i.string(), ae), ps = [
  "eq",
  "ne",
  "in",
  "nin",
  "contains",
  "exists",
  "matches"
], ms = i.enum(ps), fs = i.strictObject({
  pointer: i.string(),
  op: ms,
  value: ae.optional()
}), Oe = i.lazy(() => i.union([
  fs,
  i.strictObject({ all: i.array(Oe) }),
  i.strictObject({ any: i.array(Oe) }),
  i.strictObject({ not: Oe })
]));
function fn(e, t) {
  const s = t.allowedPointers;
  return s ? typeof s == "function" ? s(e) : s.includes(e) : !0;
}
function hn(e, t, s) {
  const r = s.allowedOperators;
  return r ? typeof r == "function" ? r(e, t) : r.includes(e) : !0;
}
function gn(e) {
  return {
    success: !0,
    data: e
  };
}
function yn(e) {
  return {
    success: !1,
    error: e
  };
}
var hs = /^(?:\/(?:[^~/]|~0|~1)*)*$/, vc = i.string().nonempty().regex(hs);
function bn(e) {
  return hs.test(e);
}
var wn = new Set(fs.keyof().options), vn = /* @__PURE__ */ new Set([
  "eq",
  "ne",
  "in",
  "nin",
  "contains",
  "matches"
]);
function Rn(e, t = {}) {
  const s = [], r = rt(e, [], s, t);
  return s.length > 0 || r === void 0 ? yn(s) : gn(r);
}
function rt(e, t, s, r) {
  if (!In(e)) {
    s.push(w("invalid_expr", "RQL expr must be an object.", t));
    return;
  }
  const n = [
    "all",
    "any",
    "not"
  ].filter((o) => o in e), a = "pointer" in e || "op" in e;
  if (n.length > 0 && a) {
    s.push(w("invalid_composition", "RQL expr cannot mix predicate and composition keys.", t));
    return;
  }
  if (n.length > 1) {
    s.push(w("invalid_composition", "RQL expr must use only one composition key.", t));
    return;
  }
  if (n[0] === "all") return ht(e.all, "all", t, s, r);
  if (n[0] === "any") return ht(e.any, "any", t, s, r);
  if (n[0] === "not") {
    const o = rt(e.not, [...t, "not"], s, r);
    return o === void 0 ? void 0 : { not: o };
  }
  return Sn(e, t, s, r);
}
function ht(e, t, s, r, n) {
  if (!Array.isArray(e)) {
    r.push(w("invalid_composition", `RQL ${t} composition must be an array.`, [...s, t]));
    return;
  }
  if (e.length === 0) {
    r.push(w("empty_composition", `RQL ${t} composition must contain at least one expr.`, [...s, t]));
    return;
  }
  const a = e.map((o, c) => rt(o, [
    ...s,
    t,
    String(c)
  ], r, n)).filter((o) => o !== void 0);
  if (a.length === e.length)
    return t === "all" ? { all: a } : { any: a };
}
function Sn(e, t, s, r) {
  const n = Object.keys(e).filter((m) => !wn.has(m));
  if (n.length > 0) {
    s.push(w("invalid_expr", `Unknown RQL predicate keys: ${n.join(", ")}.`, t));
    return;
  }
  const a = e.pointer, o = e.op, c = ms.safeParse(o);
  let d = !1;
  if (typeof a != "string" ? s.push(w("invalid_pointer", "RQL predicate pointer must be a JSON Pointer string.", [...t, "pointer"])) : bn(a) ? a === "" ? s.push(w("root_pointer_disallowed", "RQL predicates cannot target the root JSON Pointer.", [...t, "pointer"], { pointer: a })) : fn(a, r) ? d = !0 : s.push(w("pointer_not_allowed", "RQL predicate pointer is not allowed by policy.", [...t, "pointer"], { pointer: a })) : s.push(w("invalid_pointer", "RQL predicate pointer must use RFC 6901 JSON Pointer syntax.", [...t, "pointer"], { pointer: a })), c.success ? typeof a == "string" && d && !hn(c.data, a, r) && s.push(w("operator_not_allowed", "RQL predicate operator is not allowed by policy.", [...t, "op"], {
    pointer: a,
    op: c.data
  })) : s.push(w("unknown_operator", "RQL predicate operator is not supported.", [...t, "op"], { op: String(o) })), !c.success || typeof a != "string") return;
  const u = c.data, l = Object.hasOwn(e, "value");
  u === "exists" && l && s.push(w("unexpected_value", "RQL exists predicates must not include a value.", [...t, "value"], {
    pointer: a,
    op: u
  })), vn.has(u) && !l && s.push(w("missing_value", `RQL ${u} predicates require a value.`, [...t, "value"], {
    pointer: a,
    op: u
  }));
  const p = e.value;
  if (l && !ae.safeParse(p).success && s.push(w("invalid_value", "RQL predicate value must be JSON-serializable.", [...t, "value"], {
    pointer: a,
    op: u
  })), (u === "in" || u === "nin") && l && !Array.isArray(p) && s.push(w("invalid_value", `RQL ${u} predicates require an array value.`, [...t, "value"], {
    pointer: a,
    op: u
  })), u === "matches" && l && typeof p != "string" && s.push(w("invalid_value", "RQL matches predicates require a string regex pattern value.", [...t, "value"], {
    pointer: a,
    op: u
  })), u === "matches" && typeof p == "string" && r.maxRegexPatternLength !== void 0 && p.length > r.maxRegexPatternLength && s.push(w("regex_pattern_too_long", "RQL matches pattern exceeds the policy maximum length.", [...t, "value"], {
    pointer: a,
    op: u
  })), s.length === 0 || !gt(s, t)) {
    const m = l ? {
      pointer: a,
      op: u,
      value: p
    } : {
      pointer: a,
      op: u
    }, A = r.validateValue?.({
      pointer: a,
      op: u,
      value: p,
      predicate: m,
      path: t
    });
    (A === !1 || typeof A == "string") && s.push(w("value_rejected", typeof A == "string" ? A : "RQL predicate value is not allowed by policy.", [...t, "value"], {
      pointer: a,
      op: u
    }));
  }
  if (!gt(s, t))
    return l ? {
      pointer: a,
      op: u,
      value: p
    } : {
      pointer: a,
      op: u
    };
}
function gt(e, t) {
  return e.some((s) => t.every((r, n) => s.path[n] === r));
}
function In(e) {
  return typeof e == "object" && e !== null && !Array.isArray(e);
}
var An = {
  allowedPointers: [
    "/appId",
    "/id",
    "/primerSdkVersion",
    "/status",
    "/tags",
    "/title"
  ],
  allowedOperators: (e, t) => kn[t]?.includes(e) ?? !1,
  maxRegexPatternLength: 128,
  validateValue: ({ pointer: e, op: t, value: s }) => {
    if (e === "/tags") {
      if (t === "exists") return;
      if (t === "contains") return typeof s == "string" || "RQL /tags contains value must be a string.";
      if (t === "in" || t === "nin") return Array.isArray(s) && s.every((r) => typeof r == "string") ? void 0 : `RQL /tags ${t} value must be an array of strings.`;
    }
    if (t === "matches") return typeof s == "string" || "RQL matches value must be a string.";
    if (t === "in" || t === "nin") return Array.isArray(s) && s.every((r) => typeof r == "string" || r === null) ? void 0 : `RQL ${t} value must be an array of strings or null.`;
    if (t !== "exists") return typeof s == "string" || s === null || "RQL scalar value must be a string or null.";
  }
}, we = i.lazy(() => i.union([
  i.object({
    pointer: i.string(),
    op: i.enum(ps),
    value: i.any().optional()
  }),
  i.object({ all: i.array(we) }),
  i.object({ any: i.array(we) }),
  i.object({ not: we })
])), Pn = we.superRefine((e, t) => {
  const s = Rn(e, An);
  if (!s.success)
    for (const r of s.error) t.addIssue({
      code: "custom",
      message: r.message,
      path: r.path
    });
}), En = i.preprocess((e) => {
  if (typeof e != "string") return e;
  try {
    return JSON.parse(e);
  } catch {
    return e;
  }
}, Pn), _n = i.preprocess((e) => {
  if (e !== void 0)
    return e === !0 || e === "true" ? !0 : e === !1 || e === "false" ? !1 : e;
}, i.boolean().optional()), kn = {
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
}, jn = i.object({ query: En.describe("Registry RQL expr encoded as JSON.").optional() }), Tn = jn.extend({ includeReserved: _n.describe("Include registry-reserved versions.").optional() }), $n = i.object({
  channel: i.object({ id: N.describe("Stable distribution channel identifier.") }),
  apps: i.array(pn)
}), Cn = i.object({ channels: i.array(i.object({ id: N.describe("Stable distribution channel identifier.") })) }), Un = i.object({
  channel: i.object({ id: N.describe("Stable distribution channel identifier.") }).optional(),
  assignments: i.array(Qe)
}), Rc = i.object({
  appVersionId: M.describe("Version to connect to the channel."),
  reason: j.optional()
}).describe("Assigns a channel to a specific app version."), Sc = i.object({ reason: j.optional() }).describe("Removes the current app version assignment from a channel."), xn = ["rolled_back", "dry_run"], yt = i.object({
  channel: i.object({ id: N.describe("Stable distribution channel identifier.") }),
  appVersion: X
}), Ic = i.object({
  appId: g.describe("Stable app identifier whose channel is rolled back."),
  toVersionId: M.describe("Specific version to reconnect, if selected.").optional(),
  reason: j.optional(),
  dryRun: i.boolean().describe("Preview rollback eligibility without changing the channel.").optional()
}), Mn = i.object({
  status: i.enum(xn).describe("Whether rollback was applied or previewed."),
  channel: i.object({ id: N.describe("Stable distribution channel identifier.") }),
  currentAssignment: Qe.describe("Assignment before rollback is applied."),
  targetAppVersion: X.describe("Version selected as the rollback target."),
  eligibility: i.object({
    channelId: N.describe("Channel evaluated for rollback."),
    targetStatus: ve.describe("Review state of the rollback target."),
    allowedStatuses: i.array(ve).describe("Version states allowed on this channel.")
  }),
  reason: j.optional()
}), On = class {
  transport;
  constructor(e) {
    this.transport = e;
  }
  list() {
    return this.transport.request(v.channels.collection(), Cn);
  }
  get(e, t = {}) {
    return this.transport.request(v.channels.item(e, ns(t)), $n);
  }
  assignments(e, t = {}) {
    const s = new URLSearchParams();
    return t.appId && s.set("appId", t.appId), this.transport.request(v.channels.versions(e, s), Un);
  }
  connect(e, t) {
    return this.transport.request(v.channels.versions(e), yt, {
      method: "POST",
      body: t
    });
  }
  disconnect(e, t, s = {}) {
    return this.transport.request(v.channels.version(e, t), yt, {
      method: "DELETE",
      body: s
    });
  }
  rollback(e, t) {
    return this.transport.request(v.channels.rollback(e), Mn, {
      method: "POST",
      body: t
    });
  }
}, qn = i.enum([
  "version_submitted",
  "version_approved",
  "version_rejected",
  "version_deleted",
  "channel_connected",
  "channel_disconnected",
  "channel_reconnected"
]).describe("Audit event kind for version review and channel changes."), Nn = i.object({
  eventId: i.string().min(1).describe("Stable audit event identifier."),
  eventType: qn,
  appId: g.describe("Stable app identifier for the event."),
  appVersionId: M.nullable().describe("Version affected by the event, when any."),
  channelId: N.nullable().describe("Channel affected by the event, when any."),
  actorUserId: i.string().min(1).nullable().describe("User ID that performed the event."),
  actorEmail: i.email().nullable().describe("Email for the actor, when available."),
  reason: i.string().nullable().describe("Audit reason recorded with the event."),
  previousAppVersionId: M.nullable().describe("Prior channel version, when changed."),
  nextAppVersionId: M.nullable().describe("Next channel version, when changed."),
  createdAt: i.iso.datetime().describe("Time the audit event was recorded.")
}).describe("Audit event for version review or channel assignment changes."), qe = i.object({ events: i.array(Nn) }), Dn = class {
  transport;
  constructor(e) {
    this.transport = e;
  }
  app(e) {
    return this.transport.request(v.apps.history(e), qe);
  }
  version(e) {
    return this.transport.request(v.versions.history(e), qe);
  }
  channel(e, t) {
    const s = new URLSearchParams({ appId: t.appId });
    return this.transport.request(v.channels.history(e, s), qe);
  }
}, gs = i.object({
  userId: i.string().min(1).describe("Stable user identifier for the member."),
  email: i.email().nullable().describe("Member email address, when available."),
  role: de.describe("Role granted to the app member."),
  createdAt: i.iso.datetime().nullable().describe("Time the membership was created."),
  updatedAt: i.iso.datetime().nullable().describe("Time the membership last changed.")
}).describe("User membership on a claimed app."), Ln = i.object({ members: i.array(gs) }), Ac = i.object({
  email: i.email().optional(),
  userId: i.string().min(1).describe("Stable user identifier for the member.").optional(),
  role: de
}).refine((e) => !!e.email != !!e.userId, {
  message: "Provide exactly one member selector: email or userId",
  path: ["email"]
}), Pc = i.object({ role: de }), bt = i.object({ member: gs }), Vn = class {
  transport;
  constructor(e) {
    this.transport = e;
  }
  list(e) {
    return this.transport.request(`/api/apps/${encodeURIComponent(e)}/members`, Ln);
  }
  add(e, t) {
    return this.transport.request(`/api/apps/${encodeURIComponent(e)}/members`, bt, {
      method: "POST",
      body: t
    });
  }
  setRole(e, t, s) {
    return this.transport.request(`/api/apps/${encodeURIComponent(e)}/members/${encodeURIComponent(t)}`, bt, {
      method: "PATCH",
      body: s
    });
  }
  async remove(e, t) {
    await this.transport.requestJson(`/api/apps/${encodeURIComponent(e)}/members/${encodeURIComponent(t)}`, { method: "DELETE" });
  }
}, Bn = [
  "created",
  "title_changed",
  "permissions_changed",
  "apps.access.granted",
  "apps.access.revoked",
  "deleted",
  "auth_failed"
], Ec = i.enum(Bn), Fn = i.string().regex(/^prt_[A-Za-z0-9_-]{43}$/, "Expected a Registry access token secret"), _c = i.object({
  title: i.string().trim().min(1).max(80).refine(ys, { message: "Title cannot contain control characters" }),
  expiresAt: i.iso.datetime({ offset: !0 }).nullable().optional(),
  permissions: ue.default([])
}), kc = i.object({
  title: i.string().trim().min(1).max(80).refine(ys, { message: "Title cannot contain control characters" }).optional(),
  expiresAt: i.iso.datetime({ offset: !0 }).nullable().optional()
}), jc = i.object({ permissions: ue });
function ys(e) {
  return Array.from(e).every((t) => {
    const s = t.codePointAt(0) ?? 0;
    return s > 31 && s !== 127;
  });
}
var Tc = i.object({ appId: g }), Z = i.object({
  id: i.string(),
  ownerId: i.string(),
  title: i.string(),
  tokenPrefix: i.string(),
  permissions: ue,
  expiresAt: i.string().nullable(),
  deletedAt: i.string().nullable(),
  lastUsedAt: i.string().nullable(),
  createdAt: i.string(),
  updatedAt: i.string()
}), bs = i.object({
  tokenId: i.string(),
  appId: g,
  grantedBy: i.string(),
  deletedAt: i.string().nullable(),
  createdAt: i.string(),
  updatedAt: i.string()
}), Jn = i.object({
  token: Z,
  secret: Fn
}), zn = i.object({
  token: Z,
  removedPermissions: ue.optional()
}), Hn = i.object({ tokens: i.array(Z) }), Gn = i.object({
  token: Z,
  grants: i.array(bs)
}), wt = i.object({ grant: bs }), he = i.object({
  token: Z.optional(),
  permissions: ue
}), Wn = i.object({ token: Z }), Qn = class {
  transport;
  constructor(e) {
    this.transport = e;
  }
  create(e) {
    return this.transport.request("/api/tokens", Jn, {
      method: "POST",
      body: e
    });
  }
  list() {
    return this.transport.request("/api/tokens", Hn);
  }
  status(e) {
    return this.transport.request(`/api/tokens/${encodeURIComponent(e)}`, Gn);
  }
  update(e, t) {
    return this.transport.request(`/api/tokens/${encodeURIComponent(e)}`, zn, {
      method: "PATCH",
      body: t
    });
  }
  listPermissions(e) {
    return this.transport.request(`/api/tokens/${encodeURIComponent(e)}/permissions`, he);
  }
  setPermissions(e, t) {
    return this.transport.request(`/api/tokens/${encodeURIComponent(e)}/permissions`, he, {
      method: "PUT",
      body: t
    });
  }
  addPermissions(e, t) {
    return this.transport.request(`/api/tokens/${encodeURIComponent(e)}/permissions`, he, {
      method: "POST",
      body: t
    });
  }
  removePermissions(e, t) {
    return this.transport.request(`/api/tokens/${encodeURIComponent(e)}/permissions`, he, {
      method: "DELETE",
      body: t
    });
  }
  grant(e, t) {
    return this.transport.request(`/api/tokens/${encodeURIComponent(e)}/apps`, wt, {
      method: "POST",
      body: t
    });
  }
  ungrant(e, t) {
    return this.transport.request(`/api/tokens/${encodeURIComponent(e)}/apps`, wt, {
      method: "DELETE",
      body: t
    });
  }
  delete(e) {
    return this.transport.request(`/api/tokens/${encodeURIComponent(e)}`, Wn, { method: "DELETE" });
  }
}, Yn = i.object({
  path: i.string().min(1),
  size: i.number().int().nonnegative(),
  contentType: i.string().min(1)
}), $c = i.object({
  appId: g.describe("Stable app identifier receiving the upload."),
  manifest: os.partial().optional(),
  files: i.array(Yn).min(1)
}), Kn = i.object({
  uploadId: We.describe("Stable upload session identifier."),
  expiresAt: i.iso.datetime().describe("Time the upload URLs expire."),
  files: i.array(i.object({
    path: i.string().min(1),
    method: i.literal("PUT"),
    url: i.url(),
    headers: i.record(i.string().min(1), i.string())
  }))
}), Cc = i.object({ forceApprove: i.boolean().optional() }), Xn = i.object({
  appId: g.describe("Stable app identifier for the completed upload."),
  appVersionId: M.describe("Version created from the upload."),
  status: i.enum(["submitted", "approved"]).describe("Initial review state for the uploaded version."),
  versionRootUrl: i.url(),
  registryAssets: i.array(yr).default([]),
  receipt: i.object({
    uploadId: We.describe("Stable upload session identifier."),
    appId: g.describe("Stable app identifier for the completed upload."),
    appVersionId: M.describe("Version created from the upload.")
  })
}), Zn = class {
  transport;
  constructor(e) {
    this.transport = e;
  }
  create(e) {
    return this.transport.request("/api/uploads", Kn, {
      method: "POST",
      body: e
    });
  }
  complete(e, t) {
    return this.transport.request(`/api/uploads/${encodeURIComponent(e)}/complete`, Xn, {
      method: "POST",
      body: t
    });
  }
}, Uc = i.object({ reason: j.optional() }), xc = i.object({ reason: j }), Mc = i.object({ reason: j }), Oc = Tn.extend({
  appId: g.describe("Filter versions by stable app identifier.").optional(),
  status: ve.describe("Filter versions by review lifecycle state.").optional(),
  channel: N.describe("Filter versions by connected channel.").optional()
}), vt = i.object({ appVersion: X }), ea = i.object({
  appVersion: X.extend({ deletedAt: i.iso.datetime().describe("Time this version was deleted.") }),
  event: i.object({
    eventId: i.string().min(1).describe("Stable audit event identifier."),
    eventType: i.literal("version_deleted").describe("Audit event type for the deletion."),
    actorUserId: i.string().min(1).nullable().describe("User ID that performed the deletion."),
    actorEmail: i.email().nullable().describe("Email for the actor, when available."),
    reason: i.string().min(1).describe("Audit reason recorded with the deletion."),
    createdAt: i.iso.datetime().describe("Time the audit event was recorded.")
  })
}), ta = i.object({ appVersions: i.array(X) }), sa = i.object({ appVersion: X });
var E = class extends Error {
  status;
  code;
  rawPayload;
  constructor(e) {
    super(e.message), this.name = "RegistryHttpError", this.status = e.status, this.code = e.code, this.rawPayload = e.rawPayload;
  }
}, ws = class {
  registryUrl;
  token;
  tokenProvider;
  fetchImplementation;
  constructor(e = {}) {
    this.registryUrl = vs(e.registryUrl), this.token = e.token, this.tokenProvider = e.tokenProvider, this.fetchImplementation = e.fetch ?? fetch;
  }
  async request(e, t, s = {}) {
    const r = await this.requestJson(e, s);
    return t.parse(r);
  }
  async requestJson(e, t = {}) {
    const s = await this.fetchImplementation(`${this.registryUrl}${ra(e)}`, {
      method: t.method || "GET",
      headers: await this.createHeaders(t.headers),
      body: t.body === void 0 ? void 0 : JSON.stringify(t.body)
    }), r = s.status === 204 ? null : await na(s);
    if (!s.ok) throw new E({
      status: s.status,
      code: aa(r),
      message: ia(r) || `Registry request failed: ${s.status}`,
      rawPayload: r
    });
    return r;
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
function vs(e) {
  return (e?.trim() || "https://registry.primerlearn.dev").replace(/\/+$/, "");
}
function ra(e) {
  return e.startsWith("/") ? e : `/${e}`;
}
async function na(e) {
  if ((e.headers.get("content-type") || "").includes("application/json")) return e.json();
  const t = await e.text();
  if (!t) return null;
  try {
    return JSON.parse(t);
  } catch {
    return t;
  }
}
function aa(e) {
  if (!e || typeof e != "object") return null;
  const t = e;
  return typeof t.code == "string" ? t.code : typeof t.error == "string" ? t.error : null;
}
function ia(e) {
  if (!e || typeof e != "object") return null;
  const t = e;
  return typeof t.message == "string" ? t.message : typeof t.error == "string" ? t.error : null;
}
var Rs = class extends E {
  blockingChannelIds;
  constructor(e, t) {
    super({
      status: e.status,
      code: e.code,
      message: e.message,
      rawPayload: e.rawPayload
    }), this.name = "RegistryVersionDeleteBlockedError", this.blockingChannelIds = t;
  }
}, oa = class {
  transport;
  constructor(e) {
    this.transport = e;
  }
  approve(e, t = {}) {
    return this.transport.request(`/api/versions/${encodeURIComponent(e)}/approve`, vt, {
      method: "POST",
      body: t
    });
  }
  reject(e, t) {
    return this.transport.request(`/api/versions/${encodeURIComponent(e)}/reject`, vt, {
      method: "POST",
      body: t
    });
  }
  async delete(e, t) {
    try {
      return await this.transport.request(v.versions.item(e), ea, {
        method: "DELETE",
        body: t
      });
    } catch (s) {
      throw s instanceof E && s.code === "version_delete_blocked_by_channel" ? new Rs(s, ca(s.rawPayload)) : s;
    }
  }
  list(e = {}) {
    const t = new URLSearchParams();
    e.status && t.set("status", e.status), e.channel && t.set("channel", e.channel), ns(e, t);
    const s = e.appId, r = s ? v.apps.versions(s, t) : v.versions.collection(t);
    return this.transport.request(r, ta);
  }
  show(e) {
    return this.transport.request(v.versions.item(e), sa);
  }
};
function ca(e) {
  if (!e || typeof e != "object") return [];
  const t = e.details;
  if (!t || typeof t != "object") return [];
  const s = t.blockingChannelIds;
  return Array.isArray(s) ? s.filter((r) => typeof r == "string") : [];
}
var Rt = class {
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
    this.transport = e.transport ?? new ws(e), this.auth = new Wr(this.transport), this.apps = new Fr(this.transport), this.assets = new ln(this.transport), this.uploads = new Zn(this.transport), this.versions = new oa(this.transport), this.channels = new On(this.transport), this.members = new Vn(this.transport), this.tokens = new Qn(this.transport), this.history = new Dn(this.transport), this.admin = new Nr(this.transport);
  }
};
async function da(e, t, s = {}) {
  return new ws({ registryUrl: e }).requestJson(t, s);
}
function Ce(e, t = process.env) {
  return vs(e.registryUrl || t.VITE_REGISTRY_URL);
}
function z(e, t = {}) {
  return t.request ? new Rt({
    registryUrl: e,
    token: t.token,
    fetch: async (s, r) => {
      const n = new URL(String(s)), a = await t.request(e, `${n.pathname}${n.search}`, {
        method: r?.method === "GET" ? void 0 : r?.method,
        headers: ua(r?.headers),
        body: typeof r?.body == "string" ? JSON.parse(r.body) : void 0
      });
      return new Response(JSON.stringify(a), { headers: { "content-type": "application/json" } });
    }
  }) : new Rt({
    registryUrl: e,
    token: t.token
  });
}
function ua(e) {
  if (!e) return;
  const t = Object.fromEntries(new Headers(e));
  return delete t["content-type"], Object.keys(t).length > 0 ? t : void 0;
}
function _(e) {
  return {
    json: e.json === !0,
    human(t) {
      e.json || e.write(t);
    },
    result(t) {
      e.write(Ss(t));
    }
  };
}
function k(e, t) {
  return t.json === !0 || e.opts().json === !0;
}
function Ss(e) {
  return JSON.stringify(e, null, 2);
}
function f(e, t, s) {
  if (e.json) {
    e.result(t);
    return;
  }
  e.human(s);
}
function Is(e, t, s = t.message) {
  y(2), f(e, t, s);
}
function y(e) {
  process.exitCode = e;
}
function la(e, t) {
  const s = e.command("auth").description("Manage Registry CLI authentication");
  St(s, e, t), It(s, e, t), At(s, e, t), St(e, e, t), It(e, e, t), At(e, e, t);
}
function St(e, t, s) {
  e.command("login").description("Sign in through the Registry browser flow").option("-u, --registry-url <url>", "Registry URL").option("--json", "Print a machine-readable result").action(async (r) => {
    const n = _({
      json: k(t, r),
      write: s.write
    });
    if (n.json) {
      y(2), n.result({
        status: "interactive_auth_required",
        message: "Interactive browser auth is not available in JSON mode. Run `registry login` without --json."
      });
      return;
    }
    const a = Ce({
      ...t.opts(),
      ...r
    }), o = z(a, { request: s.request }), c = await o.auth.start(), d = await s.openBrowser(c.verificationUriComplete);
    s.write(d ? "Attempted to open Registry login in your browser:" : "Could not open Registry login in your browser. Open this URL manually:"), s.write(c.verificationUriComplete), s.write(`Confirm code ${c.userCode} in the browser.`);
    const u = s.now() + c.expiresIn * 1e3;
    for (; s.now() < u; ) {
      await s.sleep(c.interval * 1e3);
      const l = await o.auth.poll({ deviceCode: c.deviceCode });
      if (l.status !== "pending") {
        await s.saveSession({
          registryUrl: a,
          accessToken: l.accessToken,
          refreshToken: l.refreshToken,
          expiresAt: new Date(s.now() + l.expiresIn * 1e3).toISOString(),
          account: l.account
        }), s.write(`Signed in as ${l.account.email || l.account.userId}.`);
        return;
      }
    }
    throw new Error("Login timed out");
  });
}
function It(e, t, s) {
  e.command("whoami").description("Print the current Registry identity").option("-u, --registry-url <url>", "Registry URL").option("--json", "Print a machine-readable result").action(async (r) => {
    const n = _({
      json: k(t, r),
      write: s.write
    }), a = Ce({
      ...t.opts(),
      ...r
    }), o = pa(t), c = process.env.REGISTRY_ACCESS_TOKEN, d = o || c, u = d ? {
      registryUrl: a,
      accessToken: d,
      refreshToken: "",
      expiresAt: new Date(s.now() + 3600 * 1e3).toISOString(),
      account: {
        userId: "access-token",
        email: null
      }
    } : await As(a, s), l = await z(u.registryUrl, {
      token: u.accessToken,
      request: s.request
    }).auth.whoami();
    if (n.json) {
      n.result({
        status: "authenticated",
        registryUrl: u.registryUrl,
        account: l.account
      });
      return;
    }
    n.human(l.account.email || l.account.userId);
  });
}
function At(e, t, s) {
  e.command("logout").description("Revoke the stored CLI session").option("-y, --yes", "Approve non-interactive session mutation").option("--json", "Print a machine-readable result").action(async (r) => {
    const n = _({
      json: k(t, r),
      write: s.write
    });
    if (n.json && !r.yes) {
      Is(n, {
        status: "mutation_requires_confirmation",
        message: "Logout mutates the stored CLI session. Re-run with --yes --json to confirm.",
        nextCommand: "registry logout --yes --json"
      });
      return;
    }
    const a = await s.readSession();
    a && await z(a.registryUrl, { request: s.request }).auth.revoke({ refreshToken: a.refreshToken }).catch(() => {
    }), await s.removeSession(), n.json ? n.result({ status: "logged_out" }) : n.human("Logged out.");
  });
}
function pa(e) {
  const t = e.opts().token;
  return typeof t == "string" && t.trim() ? t.trim() : void 0;
}
async function As(e, t) {
  const s = await t.readSession();
  if (!s || s.registryUrl !== e) throw new Error("No Registry session found. Run `registry login`.");
  if (new Date(s.expiresAt).getTime() > t.now() + 3e4) return s;
  const r = await z(e, { request: t.request }).auth.refresh({ refreshToken: s.refreshToken }), n = {
    registryUrl: e,
    accessToken: r.accessToken,
    refreshToken: r.refreshToken,
    expiresAt: new Date(t.now() + r.expiresIn * 1e3).toISOString(),
    account: r.account
  };
  return await t.saveSession(n), n;
}
async function O(e, t, s, r, n) {
  const a = _({
    json: k(e, s),
    write: t.write
  });
  try {
    const { session: o, client: c } = await ie(e, t, { tokenPolicy: n.tokenPolicy }), d = await r({
      session: o,
      client: c,
      output: a
    });
    f(a, d.payload, d.message);
  } catch (o) {
    y(n.isUsageError?.(o) || o instanceof E && o.status >= 400 && o.status < 500 ? 2 : 1);
    const c = n.formatError?.(o) ?? ha(o, n.defaultErrorMessage);
    if (a.json) {
      a.result(c);
      return;
    }
    throw new Error(c.message);
  }
}
async function ie(e, t, s = {}) {
  const r = Ce(e.opts()), n = s.tokenPolicy || "allow-access-token", a = ma(e), o = process.env.REGISTRY_ACCESS_TOKEN, c = n === "browser-session-only" ? void 0 : a || o, d = c ? fa(r, c, t.now()) : await As(r, t);
  return {
    session: d,
    client: z(d.registryUrl, {
      token: d.accessToken,
      request: t.request
    })
  };
}
function ma(e) {
  const t = e.opts().token;
  return typeof t == "string" && t.trim() ? t.trim() : void 0;
}
function fa(e, t, s) {
  return {
    registryUrl: e,
    accessToken: t,
    refreshToken: "",
    expiresAt: new Date(s + 3600 * 1e3).toISOString(),
    account: {
      userId: "access-token",
      email: null
    }
  };
}
function ha(e, t) {
  return {
    status: "error",
    message: e instanceof Error ? e.message : t
  };
}
var ga = /* @__PURE__ */ lr(((e, t) => {
  var s = String, r = function() {
    return {
      isColorSupported: !1,
      reset: s,
      bold: s,
      dim: s,
      italic: s,
      underline: s,
      inverse: s,
      hidden: s,
      strikethrough: s,
      black: s,
      red: s,
      green: s,
      yellow: s,
      blue: s,
      magenta: s,
      cyan: s,
      white: s,
      gray: s,
      bgBlack: s,
      bgRed: s,
      bgGreen: s,
      bgYellow: s,
      bgBlue: s,
      bgMagenta: s,
      bgCyan: s,
      bgWhite: s,
      blackBright: s,
      redBright: s,
      greenBright: s,
      yellowBright: s,
      blueBright: s,
      magentaBright: s,
      cyanBright: s,
      whiteBright: s,
      bgBlackBright: s,
      bgRedBright: s,
      bgGreenBright: s,
      bgYellowBright: s,
      bgBlueBright: s,
      bgMagentaBright: s,
      bgCyanBright: s,
      bgWhiteBright: s
    };
  };
  t.exports = r(), t.exports.createColors = r;
})), te = /* @__PURE__ */ mr(ga(), 1), b = {
  heading: te.default.bold,
  id: te.default.cyan,
  success: te.default.green,
  warning: te.default.yellow,
  placeholder: te.default.dim
};
function C({ columns: e, rows: t, emptyMessage: s }) {
  if (t.length === 0) return s;
  const r = t.map((a) => e.map((o) => ya(o, a))), n = e.map((a, o) => Math.max(a.header.length, ...r.map((c) => c[o]?.raw.length ?? 0)));
  return [e.map((a, o) => b.heading(Pt(a.header, n[o], o, e))).join("  "), ...r.map((a) => a.map((o, c) => (o.color || Ps)(Pt(o.raw, n[c], c, a))).join("  "))].join(`
`);
}
function Pt(e, t, s, r) {
  return s === r.length - 1 ? e : e.padEnd(t);
}
function ya(e, t) {
  const s = e.value(t);
  return s && typeof s == "object" && "value" in s ? {
    raw: Et(s.value),
    color: s.color ?? ((r) => _t(r, e, t))
  } : {
    raw: Et(s),
    color: (r) => _t(r, e, t)
  };
}
function Et(e) {
  return e == null || e === "" ? "-" : String(e);
}
function Ps(e) {
  return e.trim() === "-" ? b.placeholder(e) : e;
}
function _t(e, t, s) {
  return e.trim() === "-" ? Ps(e) : t.color?.(e, s) ?? e;
}
function ba(e, t) {
  wa(e, t), va(e, t);
}
function wa(e, t) {
  const s = e.command("allowlist").description("Manage Registry CLI login allowlist entries");
  s.command("list").option("--json", "Print a machine-readable result").action(async (r) => {
    await $(e, t, r, async ({ client: n }) => {
      const a = await n.admin.listEmailAllowlistEntries();
      return {
        payload: a,
        message: Ia(a.entries)
      };
    });
  }), s.command("add-email").argument("<email>", "Email address to allow").option("--description <text>", "Allowlist description").option("--json", "Print a machine-readable result").action(async (r, n) => {
    await $(e, t, n, async ({ client: a }) => {
      const o = await a.admin.createEmailAllowlistEntry({
        entryType: Se.email,
        value: r,
        description: n.description,
        reason: n.description || "Added email allowlist entry via CLI"
      });
      return {
        payload: o,
        message: `Added email allowlist entry ${o.entry.value}.`
      };
    });
  }), s.command("add-domain").argument("<domain>", "Email domain to allow").option("--description <text>", "Allowlist description").option("--json", "Print a machine-readable result").action(async (r, n) => {
    await $(e, t, n, async ({ client: a }) => {
      const o = await a.admin.createEmailAllowlistEntry({
        entryType: Se.domain,
        value: r,
        description: n.description,
        reason: n.description || "Added domain allowlist entry via CLI"
      });
      return {
        payload: o,
        message: `Added domain allowlist entry ${o.entry.value}.`
      };
    });
  }), s.command("disable").argument("<entry-id>", "Allowlist entry ID").option("--json", "Print a machine-readable result").action(async (r, n) => {
    await $(e, t, n, async ({ client: a }) => {
      const o = await a.admin.updateEmailAllowlistEntry(r, {
        enabled: !1,
        reason: "Disabled allowlist entry via CLI"
      });
      return {
        payload: o,
        message: `Disabled allowlist entry ${o.entry.id}.`
      };
    });
  }), s.command("enable").argument("<entry-id>", "Allowlist entry ID").option("--json", "Print a machine-readable result").action(async (r, n) => {
    await $(e, t, n, async ({ client: a }) => {
      const o = await a.admin.updateEmailAllowlistEntry(r, {
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
function va(e, t) {
  const s = e.command("users").description("Manage Registry users");
  s.command("list").option("--json", "Print a machine-readable result").action(async (r) => {
    await $(e, t, r, async ({ client: n }) => {
      const a = await n.admin.listUsers();
      return {
        payload: a,
        message: Aa(a.users)
      };
    });
  }), s.command("show").option("--email <email>", "Find a user by email").option("--user-id <user-id>", "Find a user by durable user ID").option("--json", "Print a machine-readable result").action(async (r) => {
    await $(e, t, r, async ({ client: n }) => {
      ge(r);
      const a = r.userId ? await n.admin.getUser(r.userId) : await n.admin.getUserByEmail(r.email);
      return {
        payload: a,
        message: Pa(a.user)
      };
    });
  }), s.command("grant-permissions").argument("[permissions...]", "Concrete permissions to grant").option("--email <email>", "Find a user by email").option("--user-id <user-id>", "Find a user by durable user ID").option("--preset <preset>", `Permission preset to grant: ${ne.join(", ")}`).requiredOption("--reason <text>", "Permission grant reason").option("--json", "Print a machine-readable result").action(async (r, n) => {
    await $(e, t, n, async ({ client: a }) => {
      ge(n), kt(n.preset);
      const o = jt(r);
      if (o.length === 0 && !n.preset) throw new Q("Grant at least one permission or --preset");
      const c = await Ne(n, a.admin), d = await a.admin.updateUserPermissions(c, {
        grantPermissions: o,
        grantPreset: n.preset,
        reason: n.reason
      });
      return {
        payload: d,
        message: `Granted permissions to ${d.user.id}.`
      };
    });
  }), s.command("revoke-permissions").argument("[permissions...]", "Concrete permissions to revoke").option("--email <email>", "Find a user by email").option("--user-id <user-id>", "Find a user by durable user ID").option("--preset <preset>", `Permission preset to revoke: ${ne.join(", ")}`).requiredOption("--reason <text>", "Permission revocation reason").option("--json", "Print a machine-readable result").action(async (r, n) => {
    await $(e, t, n, async ({ client: a }) => {
      ge(n), kt(n.preset);
      const o = jt(r);
      if (o.length === 0 && !n.preset) throw new Q("Revoke at least one permission or --preset");
      const c = await Ne(n, a.admin), d = await a.admin.updateUserPermissions(c, {
        revokePermissions: o,
        revokePreset: n.preset,
        reason: n.reason
      });
      return {
        payload: d,
        message: `Revoked permissions from ${d.user.id}.`
      };
    });
  }), s.command("revoke-sessions").option("--email <email>", "Find a user by email").option("--user-id <user-id>", "Find a user by durable user ID").requiredOption("--reason <text>", "Session revocation reason").option("--json", "Print a machine-readable result").action(async (r) => {
    await $(e, t, r, async ({ client: n }) => {
      ge(r);
      const a = await Ne(r, n.admin), o = await n.admin.revokeUserSessions(a, { reason: r.reason });
      return {
        payload: o,
        message: `Revoked ${o.revokedSessionCount} session(s) for ${o.userId}.`
      };
    });
  });
}
async function $(e, t, s, r) {
  await O(e, t, s, r, {
    defaultErrorMessage: "Registry admin command failed",
    formatError: Ra,
    isUsageError: _a
  });
}
function Ra(e) {
  return e instanceof E ? {
    status: Sa(e),
    message: e.message
  } : {
    status: "error",
    message: e instanceof Error ? e.message : "Registry admin command failed"
  };
}
function Sa(e) {
  return e.code === "validation_failed" || e.status === 400 ? "validation_failed" : e.code === "forbidden" || e.status === 403 ? "permission_denied" : e.code === "unauthorized" || e.status === 401 ? "unauthorized" : e.code === "user_not_found" || e.status === 404 ? "user_not_found" : e.code === "email_allowlist_entry_not_found" ? "email_allowlist_entry_not_found" : e.code === "email_allowlist_entry_already_exists" ? "email_allowlist_entry_already_exists" : e.code === "last_admin_required" ? "last_admin_required" : "error";
}
function ge(e) {
  if (e.email && e.userId) throw new Q("Provide either --email or --user-id, not both");
  if (!e.email && !e.userId) throw new Q("Provide a user selector with --email or --user-id");
}
function kt(e) {
  if (e && !ne.includes(e)) throw new Q(`Preset must be one of: ${ne.join(", ")}`);
}
function jt(e) {
  return e.length === 0 ? [] : Xt(e);
}
async function Ne(e, t) {
  return e.userId ? e.userId : (await t.getUserByEmail(e.email)).user.id;
}
function Ia(e) {
  return C({
    columns: [
      {
        header: "ENTRY ID",
        value: (t) => t.id,
        color: b.id
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
        color: Ea
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
function Aa(e) {
  return C({
    columns: [
      {
        header: "USER ID",
        value: (t) => t.id,
        color: b.id
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
function Pa(e) {
  return [
    e.id,
    e.email || "",
    e.permissions.join(",")
  ].join("	");
}
function Ea(e) {
  return e.trim() === "enabled" ? b.success(e) : b.warning(e);
}
var Q = class extends Error {
};
function _a(e) {
  return e instanceof Q;
}
var ka = "@superbuilders/primer-tives", ja = /^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/;
async function Ta(e) {
  return cs(await I(e, "utf8"));
}
async function Y(e) {
  const t = await I(e, "utf8");
  let s;
  try {
    s = JSON.parse(t);
  } catch {
    throw new Error("manifest.json must be valid JSON");
  }
  if (!s || typeof s != "object" || Array.isArray(s)) throw new Error("manifest.json must be a JSON object");
  return {
    manifest: $e(s),
    document: s
  };
}
async function $a(e) {
  return cs(await I(e, "utf8"));
}
async function J(e, t) {
  await Ge(e, `${JSON.stringify(t, null, 2)}
`);
}
function Es(e) {
  return fr(e);
}
async function nt(e) {
  let t;
  try {
    t = JSON.parse(await I(x(e, "package.json"), "utf8"));
  } catch (r) {
    if (Ua(r)) return null;
    throw r;
  }
  const s = Ca(t, ka);
  return s && ja.test(s) ? s : null;
}
function Ca(e, t) {
  if (!e || typeof e != "object") return null;
  for (const s of [
    "dependencies",
    "devDependencies",
    "peerDependencies",
    "optionalDependencies"
  ]) {
    const r = e[s];
    if (!r || typeof r != "object") continue;
    const n = r[t];
    if (typeof n == "string") return n;
  }
  return null;
}
function Ua(e) {
  return e instanceof Error && "code" in e && e.code === "ENOENT";
}
function q(e = {}) {
  const t = T(e.cwd ?? process.cwd(), e.root ?? "."), s = Tt(t, e.manifest ?? "manifest.json"), r = Tt(t, e.dist ?? "dist");
  return {
    root: t,
    sourceManifest: s,
    artifactDirectory: r,
    artifactManifest: T(r, Yr),
    artifactEntrypoint: T(r, Qr)
  };
}
function Tt(e, t) {
  return Je(t) ? T(t) : T(e, t);
}
async function _s(e, t) {
  const s = q({
    root: e.root,
    manifest: e.manifest
  }), r = await ks(s.sourceManifest), n = [];
  let a = {};
  if (r) try {
    a = { ...(await Y(s.sourceManifest)).document };
  } catch (u) {
    if (e.json) throw u;
    if (a = { ...await Ma(s.sourceManifest) }, typeof a.title != "string" || a.title.trim() === "") delete a.title;
    else throw u;
  }
  if (typeof a.title != "string" || a.title.trim() === "") {
    if (e.json)
      return n.push("Manifest title is required."), {
        status: "missing_required_input",
        manifestPath: s.sourceManifest,
        manifestExists: r,
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
    const u = await t.promptText("App title?");
    if (!u.trim())
      return n.push("Manifest title is required."), {
        status: "cancelled",
        manifestPath: s.sourceManifest,
        manifestExists: r,
        wrote: !1,
        suggestedFields: {},
        diagnostics: n,
        nextCommands: []
      };
    a.title = u.trim();
  }
  Array.isArray(a.tags) || (a.tags = []);
  const o = {};
  if ((typeof a.appId != "string" || a.appId.trim() === "") && (o.appId = Es(String(a.title))), a.primerSdkVersion === void 0 || a.primerSdkVersion === null) {
    const u = await nt(s.root);
    u && (o.primerSdkVersion = u);
  }
  const c = {
    ...a,
    ...o
  }, d = ["registry claim"];
  if (e.json) return {
    status: r && Object.keys(o).length > 0 ? "needs_manifest_update" : "initialized_preview",
    manifestPath: s.sourceManifest,
    manifestExists: r,
    wrote: !1,
    suggestedManifest: c,
    suggestedFields: o,
    diagnostics: n,
    nextCommands: d
  };
  if (t.write(Oa(s.sourceManifest, c, s.artifactDirectory)), Object.keys(o).length === 0 && r)
    return t.write("Manifest is already initialized."), e.suppressFinalClaimPrompt || t.write("Next: registry claim"), {
      status: "unchanged",
      manifestPath: s.sourceManifest,
      manifestExists: r,
      wrote: !1,
      manifest: a,
      suggestedFields: o,
      diagnostics: n,
      nextCommands: d
    };
  if (!await t.confirm(`Write manifest to ${s.sourceManifest}?`, { defaultValue: !0 }))
    return t.write("Registry init cancelled."), {
      status: "cancelled",
      manifestPath: s.sourceManifest,
      manifestExists: r,
      wrote: !1,
      suggestedManifest: c,
      suggestedFields: o,
      diagnostics: n,
      nextCommands: []
    };
  if (await J(s.sourceManifest, c), t.write(`Wrote ${s.sourceManifest}.`), !e.suppressFinalClaimPrompt) {
    const u = await t.confirm("Claim this app now?", { defaultValue: !1 });
    t.write("Next: registry claim");
  }
  return {
    status: "initialized",
    manifestPath: s.sourceManifest,
    manifestExists: r,
    wrote: !0,
    manifest: c,
    suggestedManifest: c,
    suggestedFields: o,
    diagnostics: n,
    nextCommands: d
  };
}
async function xa(e, t) {
  return ks(q({
    root: e,
    manifest: t
  }).sourceManifest);
}
async function Ma(e) {
  const { readFile: t } = await import("node:fs/promises");
  let s;
  try {
    s = JSON.parse(await t(e, "utf8"));
  } catch {
    throw new Error("manifest.json must be valid JSON");
  }
  if (!s || typeof s != "object" || Array.isArray(s)) throw new Error("manifest.json must be a JSON object");
  return s;
}
async function ks(e) {
  try {
    return await Vt(e), !0;
  } catch (t) {
    if (t instanceof Error && "code" in t && t.code === "ENOENT") return !1;
    throw t;
  }
}
function Oa(e, t, s) {
  return `Registry manifest preview

Path: ${e}

${Ss(t)}

Expected build output:
  ${s}/index.html
  ${s}/manifest.json`;
}
function qa(e, t) {
  js(e.command("claim"), e, t);
}
function Na(e, t, s) {
  js(e.command("claim"), t, s);
}
function js(e, t, s) {
  e.argument("[root]", "Primer app project root", ".").description("Claim a Primer app ID in the Registry").option("-m, --manifest <path>", "Source manifest path").option("--dry-run", "Validate claim readiness without creating Registry state").option("-y, --yes", "Approve non-interactive claim creation").option("--json", "Print a machine-readable result").action(async (r, n) => {
    const a = _({
      json: k(t, n),
      write: s.write
    });
    try {
      const o = q({
        root: r,
        manifest: n.manifest
      });
      if (!await xa(r, n.manifest)) {
        if (a.json || n.dryRun) {
          y(2), f(a, {
            status: "needs_init",
            message: "No source manifest found. Run registry init before claiming this app.",
            nextCommand: "registry init --json"
          }, "No source manifest found. Run registry init before claiming this app.");
          return;
        }
        if (a.human("No source manifest found. Initialize Registry metadata before claiming this app."), !await s.confirm("Run registry init now?", { defaultValue: !0 })) {
          a.human("Claim cancelled.");
          return;
        }
        const R = await _s({
          root: r,
          manifest: n.manifest,
          suppressFinalClaimPrompt: !0
        }, s);
        if (R.status !== "initialized" && R.status !== "unchanged") {
          a.human("Claim cancelled.");
          return;
        }
        if (!await s.confirm("Continue claiming this app?", { defaultValue: !0 })) {
          a.human("Claim cancelled.");
          return;
        }
      }
      const { client: c } = await ie(t, s), { manifest: d, document: u } = await Y(o.sourceManifest), l = d.appId || Es(d.title), p = await Va(o.root, u);
      if (!d.appId && (a.json || n.dryRun)) {
        y(2), f(a, {
          status: "needs_manifest_update",
          manifestPath: o.sourceManifest,
          suggestedFields: $t(l, p),
          message: "Update manifest.json, then rerun registry claim."
        }, "Update manifest.json, then rerun registry claim.");
        return;
      }
      const m = await c.apps.availability(l);
      if (m.exists || !m.available) {
        if (!n.dryRun) {
          const R = await La(c, l);
          if (R?.exists && "claim" in R && R.claim.claimedByCurrentUser) {
            f(a, {
              status: "already_claimed",
              appId: l
            }, `App ${l} is already claimed by this account.`);
            return;
          }
        }
        y(3), f(a, {
          status: "app_id_unavailable",
          appId: l,
          message: "Edit manifest.json with a different appId, then rerun registry claim."
        }, `App ID ${l} is unavailable. Edit manifest.json with a different appId, then rerun registry claim.`);
        return;
      }
      if (n.dryRun) {
        f(a, {
          status: "claim_ready",
          appId: l,
          available: !0,
          exists: !1
        }, `App ID ${l} is available to claim.`);
        return;
      }
      if (a.json && !n.yes) {
        Is(a, {
          status: "claim_requires_confirmation",
          appId: l,
          nextCommand: `registry claim ${r} --yes --json`,
          message: "Claiming this app creates Registry state. Re-run with --yes to confirm."
        });
        return;
      }
      if (!a.json && !n.yes && (a.human(Da(d, l)), !await s.confirm("Create app?", { defaultValue: !0 }))) {
        a.human("Claim cancelled.");
        return;
      }
      const A = await c.apps.create({
        appId: l,
        title: d.title
      });
      d.appId || await J(o.sourceManifest, {
        ...u,
        ...$t(A.appId, p)
      }), f(a, {
        status: "claimed",
        appId: A.appId,
        created: A.created
      }, `Claimed app ${A.appId}.`);
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
function Da(e, t) {
  return `Create new app?

Title: ${e.title}
App ID: ${t}`;
}
function $t(e, t) {
  return t ? {
    appId: e,
    primerSdkVersion: t
  } : { appId: e };
}
async function La(e, t) {
  try {
    return await e.apps.get(t);
  } catch {
    return null;
  }
}
async function Va(e, t) {
  return t.primerSdkVersion !== void 0 && t.primerSdkVersion !== null ? null : nt(e);
}
function K(e) {
  return e.some((t) => t.severity === "error");
}
function fe(e) {
  return e.map(Ba).join(`
`);
}
function Ba(e) {
  const t = e.target ? ` (${e.target})` : "", s = e.nextCommand ? ` Run: ${e.nextCommand}` : "";
  return `${e.severity}: ${e.message}${t}${s}`;
}
async function at(e = {}) {
  const t = q({
    cwd: e.cwd,
    root: e.root,
    manifest: e.manifest
  });
  if (e.appId) return {
    paths: t,
    appId: e.appId,
    diagnostics: []
  };
  const s = [], r = await Fa(t.sourceManifest, s);
  if (!r) return {
    paths: t,
    appId: null,
    diagnostics: s
  };
  try {
    const n = $e(r);
    if (n.appId) return {
      paths: t,
      appId: n.appId,
      diagnostics: s
    };
    s.push({
      code: "manifest_missing_app_id",
      severity: "error",
      message: "Source manifest is missing appId.",
      source: "manifest",
      target: t.sourceManifest,
      nextCommand: "registry claim"
    });
  } catch (n) {
    s.push({
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
    diagnostics: s
  };
}
async function Fa(e, t) {
  let s;
  try {
    s = await I(e, "utf8");
  } catch (r) {
    if (Ja(r))
      return t.push({
        code: "manifest_missing",
        severity: "error",
        message: "Source manifest was not found.",
        source: "manifest",
        target: e,
        nextCommand: "registry init"
      }), null;
    throw r;
  }
  try {
    return JSON.parse(s);
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
function Ja(e) {
  return e instanceof Error && "code" in e && e.code === "ENOENT";
}
function za(e, t) {
  e.command("history").description("List app-scoped Registry history").option("--app-id <app-id>", "Registry app ID").option("--root <root>", "Primer app project root").option("--json", "Print a machine-readable result").action(async (s) => {
    await Ue(e, t, s, async ({ client: r }) => {
      const n = await Ts(s);
      return xe({
        appId: n,
        events: (await r.history.app(n)).events
      });
    });
  });
}
function Ha(e, t, s) {
  e.command("history").argument("<app-id>", "Registry app ID").option("--json", "Print a machine-readable result").action(async (r, n) => {
    await Ue(t, s, n, async ({ client: a }) => xe({
      appId: r,
      events: (await a.history.app(r)).events
    }));
  });
}
function Ga(e, t, s) {
  e.command("history").argument("<version-id>", "App version UUID").option("--json", "Print a machine-readable result").action(async (r, n) => {
    await Ue(t, s, n, async ({ client: a }) => xe({
      versionId: r,
      events: (await a.history.version(r)).events
    }));
  });
}
function Wa(e, t, s) {
  e.command("history").argument("<channel-id>", "Distribution channel ID").option("--app-id <app-id>", "Registry app ID").option("--root <root>", "Primer app project root").option("--json", "Print a machine-readable result").action(async (r, n) => {
    await Ue(t, s, n, async ({ client: a }) => {
      const o = await Ts(n);
      return xe({
        appId: o,
        channelId: r,
        events: (await a.history.channel(r, { appId: o })).events
      });
    });
  });
}
async function Ue(e, t, s, r) {
  await O(e, t, s, r, {
    defaultErrorMessage: "Registry history command failed",
    formatError: Ya,
    isUsageError: Qa
  });
}
async function Ts(e) {
  if (!e.appId && !e.root) throw new it("Provide an app context with --app-id or --root");
  const t = await at({
    appId: e.appId,
    root: e.root
  });
  if (t.appId && !K(t.diagnostics)) return t.appId;
  throw new Error(fe(t.diagnostics) || "Unable to resolve Registry app ID");
}
function xe(e) {
  return {
    payload: {
      status: "history_listed",
      ...e
    },
    message: Xa(e.events)
  };
}
var it = class extends Error {
};
function Qa(e) {
  return e instanceof it;
}
function Ya(e) {
  return e instanceof it ? {
    status: "app_id_required",
    message: e.message
  } : e instanceof E ? {
    status: Ka(e),
    message: e.message
  } : {
    status: "error",
    message: e instanceof Error ? e.message : "Registry history command failed"
  };
}
function Ka(e) {
  return e.code === "permission_denied" || e.status === 403 ? "permission_denied" : e.code === "history_not_found" || e.status === 404 ? "history_not_found" : "error";
}
function Xa(e) {
  return e.length === 0 ? "No history events found." : e.map(Za).join(`
`);
}
function Za(e) {
  const t = e.actorEmail ?? e.actorUserId ?? "system", s = ei(e), r = e.reason ? ` - ${e.reason}` : "";
  return `${e.createdAt}	${e.eventType}	${s}	${t}${r}`;
}
function ei(e) {
  return e.channelId ? `${e.appId}/${e.channelId}` : e.appVersionId ? `${e.appId}/${e.appVersionId}` : e.appId;
}
function ti(e, t) {
  const s = e.command("apps").description("Inspect Registry apps");
  Na(s, e, t), Ha(s, e, t), s.command("list").option("--json", "Print a machine-readable result").action(async (r) => {
    await O(e, t, r, async ({ client: n }) => {
      const a = await n.apps.list();
      return {
        payload: {
          status: "apps_listed",
          apps: a.apps
        },
        message: ri(a.apps)
      };
    }, { defaultErrorMessage: "Registry apps command failed" });
  }), s.command("delete").argument("<app-id>", "Registry app ID").requiredOption("--reason <text>", "Deletion reason").option("--force", "Hard delete an already-soft-deleted app (unsupported)").option("--json", "Print a machine-readable result").action(async (r, n) => {
    await O(e, t, n, async ({ client: a }) => {
      if (n.force) throw new $s("Hard delete is deferred; omit --force to soft-delete the app");
      const o = await a.apps.delete(r, { reason: n.reason });
      return {
        payload: {
          status: "app_deleted",
          ...o
        },
        message: `Soft-deleted app ${o.app.appId}.`
      };
    }, {
      defaultErrorMessage: "Registry apps command failed",
      formatError: ii,
      isUsageError: ai
    });
  }), s.command("show").argument("<app-id>", "Registry app ID").option("--json", "Print a machine-readable result").action(async (r, n) => {
    await O(e, t, n, async ({ client: a }) => {
      const o = await a.apps.get(r);
      return {
        payload: {
          status: "app_shown",
          app: o
        },
        message: si(o)
      };
    }, { defaultErrorMessage: "Registry apps command failed" });
  });
}
function si(e) {
  if (!e.exists) return `${e.appId}
Status: available`;
  if (e.deletedAt) return `${e.appId}
Status: deleted
Deleted at: ${e.deletedAt}`;
  const t = e.claim.claimedByCurrentUser ? `claimed by this account (${e.claim.role})` : "claimed by another account";
  return `${e.appId}
Status: ${t}`;
}
function ri(e) {
  return C({
    columns: [
      {
        header: "APP ID",
        value: (t) => t.appId,
        color: b.id
      },
      {
        header: "VISIBILITY",
        value: (t) => t.visibility
      },
      {
        header: "STATUS",
        value: (t) => t.status,
        color: ni
      },
      {
        header: "LATEST VERSION ID",
        value: (t) => t.latestVersionId,
        color: b.id
      }
    ],
    rows: e,
    emptyMessage: "No apps found."
  });
}
function ni(e) {
  return e.trim() === "active" ? b.success(e) : b.warning(e);
}
var $s = class extends Error {
};
function ai(e) {
  return e instanceof $s;
}
function ii(e) {
  return {
    status: "error",
    message: e instanceof Error ? e.message : "Registry apps command failed"
  };
}
var De = 1024 * 1024, qc = {
  maxVersionFiles: 1e3,
  maxVersionBytes: 250 * De,
  maxFileBytes: 50 * De,
  maxThumbnailBytes: 10 * De
}, oi = /* @__PURE__ */ new Map([
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
function Ie(e) {
  return oi.get(ci(e)) ?? "application/octet-stream";
}
function ci(e) {
  const t = e.split("/").pop() || "", s = t.lastIndexOf(".");
  return s > 0 ? t.slice(s).toLowerCase() : "";
}
function di(e, t) {
  const s = e.command("assets").description("Manage reusable Registry asset manifest declarations");
  s.command("sync").argument("[root]", "Package root", ".").option("--check", "Verify Registry asset URLs are current without uploading or writing").option("-g, --generate-typescript", "Generate synced Registry asset TypeScript helper").option("--out <path>", "Generated TypeScript helper output path").option("--json", "Print a machine-readable result").action(async (r, n) => {
    const a = _({
      json: k(e, n),
      write: t.write
    });
    try {
      if (n.out && !n.generateTypescript) throw new Error("--out requires --generate-typescript");
      const o = q({ root: r }), { manifest: c } = await Y(o.sourceManifest);
      if (!c.appId) throw new Error("Source manifest must include appId before syncing assets.");
      const d = g.parse(c.appId), u = await li(o.root, o.sourceManifest), l = Ct(u);
      pi(l);
      const p = Ri(o.root, n.out ?? c.registryAssetsModule);
      if (l.length === 0) {
        if (n.generateTypescript) {
          const h = Le(d, []);
          if (n.check) {
            if (await Ut(p) !== h) {
              y(1), f(a, {
                status: "assets_module_outdated",
                appId: d,
                modulePath: p,
                assetCount: 0,
                assets: []
              }, `Registry assets module is out of date: ${p}. Run registry assets sync ${r} --generate-typescript.`);
              return;
            }
            f(a, {
              status: "assets_current",
              appId: d,
              modulePath: p,
              assetCount: 0,
              assets: []
            }, `Registry assets for ${d} and generated module are current.`);
            return;
          }
          await xt(p, h), f(a, {
            status: "assets_module_generated",
            appId: d,
            modulePath: p,
            assetCount: 0,
            assets: []
          }, `Generated Registry assets module at ${p}.`);
          return;
        }
        f(a, {
          status: "assets_current",
          appId: d,
          assetCount: 0,
          assets: []
        }, `No Registry assets declared for ${d}.`);
        return;
      }
      const { client: m } = await ie(e, t);
      if (!await ui(m, a, d, r)) return;
      const A = await m.assets.list(d), R = new Map(A.assets.map((h) => [h.id, h.registryUrl]));
      if (n.check) {
        const h = await mi(o.root, d, l, R);
        if (h.errors.length > 0) {
          y(2), f(a, {
            status: "assets_sync_failed",
            appId: d,
            errors: h.errors,
            assets: h.assets
          }, h.errors.join(`
`));
          return;
        }
        if (h.assets.some((P) => P.action !== "current" && P.action !== "validated")) {
          y(1), f(a, {
            status: "assets_outdated",
            appId: d,
            assets: h.assets
          }, `Registry assets for ${d} are not fully synced. Run registry assets sync ${r}.`);
          return;
        }
        if (n.generateTypescript) {
          const P = Le(d, l);
          if (await Ut(p) !== P) {
            y(1), f(a, {
              status: "assets_module_outdated",
              appId: d,
              modulePath: p,
              assetCount: l.length,
              assets: h.assets
            }, `Registry assets module is out of date: ${p}. Run registry assets sync ${r} --generate-typescript.`);
            return;
          }
          f(a, {
            status: "assets_current",
            appId: d,
            modulePath: p,
            assetCount: l.length,
            assets: h.assets
          }, `Registry assets for ${d} and generated module are current.`);
          return;
        }
        f(a, {
          status: "assets_current",
          appId: d,
          assets: h.assets
        }, `Registry assets for ${d} are current.`);
        return;
      }
      const V = await gi(o.root, l), B = await m.assets.createUpload(d, {
        assets: l.map(({ documentPath: h, ...P }) => P),
        files: V.map((h) => ({
          path: h.uploadPath,
          size: h.size,
          contentType: h.contentType
        }))
      });
      for (const h of V) {
        const P = B.files.find((Ks) => Ks.path === h.uploadPath);
        if (!P) throw new Error(`No upload URL returned for ${h.uploadPath}`);
        const ct = await fetch(P.url, {
          method: P.method,
          headers: P.headers,
          body: await I(h.path)
        });
        if (!ct.ok) throw new Error(`Upload failed for ${h.uploadPath}: ${ct.status}`);
      }
      const D = await m.assets.completeUpload(d, B.uploadId, { assets: l.map(({ documentPath: h, ...P }) => P) }), ot = await yi(u, D.assets);
      if (n.generateTypescript) {
        await xt(p, Le(d, Ct(u))), f(a, {
          status: "assets_module_generated",
          appId: d,
          uploadId: B.uploadId,
          updatedPaths: ot,
          modulePath: p,
          assetCount: D.assets.length,
          assets: D.assets
        }, `Synced ${D.assets.length} Registry assets for ${d} and generated ${p}.`);
        return;
      }
      f(a, {
        status: "assets_synced",
        appId: d,
        uploadId: B.uploadId,
        updatedPaths: ot,
        assets: D.assets
      }, `Synced ${D.assets.length} Registry assets for ${d}.`);
    } catch (o) {
      if (y(2), a.json) {
        a.result({
          status: "error",
          message: o instanceof Error ? o.message : "Asset sync failed"
        });
        return;
      }
      throw o;
    }
  }), s.command("add").argument("<path-or-url>", "Package-root-relative asset path or HTTPS URL").requiredOption("--id <asset-id>", "User-facing Registry asset ID").option("-m, --manifest <path>", "Source manifest path").option("--json", "Print a machine-readable result").action(async (r, n) => {
    const a = _({
      json: k(e, n),
      write: t.write
    });
    try {
      const o = je.parse(n.id);
      me(r, "path-or-url");
      const c = q({ manifest: n.manifest }), { document: d } = await Y(c.sourceManifest), u = vi(d), l = u.findIndex((m) => m.id === o), p = {
        id: o,
        source: r
      };
      l >= 0 ? u[l] = {
        ...u[l],
        ...p
      } : u.push(p), d.registryAssets = u, await J(c.sourceManifest, d), f(a, {
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
  }), s.command("recover").argument("[root]", "Package root", ".").requiredOption("--app-id <app-id>", "Registered app ID to recover assets for").option("-m, --manifest <path>", "Source manifest path").option("--json", "Print a machine-readable result").action(async (r, n) => {
    const a = _({
      json: k(e, n),
      write: t.write
    });
    try {
      const o = g.parse(n.appId), c = q({
        root: r,
        manifest: n.manifest
      }), { client: d } = await ie(e, t), u = await d.assets.list(o), l = new Map(u.assets.map((m) => [m.id, m.registryUrl])), p = await bi(c.root, c.sourceManifest, l);
      f(a, {
        status: "assets_recovered",
        manifestPath: c.sourceManifest,
        updatedPaths: p,
        assets: u.assets
      }, `Recovered ${u.assets.length} Registry assets into ${p.join(", ")}.`);
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
  });
}
async function ui(e, t, s, r) {
  const n = await e.apps.get(s);
  return n.exists ? n.claim.claimedByCurrentUser ? !0 : (y(2), f(t, {
    status: "app_membership_required",
    appId: s,
    message: `The current account is not a member of Registry app ${s}.`
  }, `The current account is not a member of Registry app ${s}.`), !1) : (y(2), f(t, {
    status: "app_not_claimed",
    appId: s,
    nextCommand: `registry claim ${r}`,
    hint: `Run registry claim ${r} first.`
  }, `App ID "${s}" has not been claimed for this Registry.

Run registry claim ${r} first.`), !1);
}
async function li(e, t) {
  const { manifest: s, document: r } = await Y(t);
  return s.registryAssets.kind === "files" ? Promise.all(s.registryAssets.paths.map(async (n) => {
    const a = T(e, n);
    return {
      path: a,
      field: "assets",
      ...await Cs(a)
    };
  })) : s.registryAssets.kind === "inline" ? [{
    path: t,
    document: r,
    field: "registryAssets",
    assets: Us(r)
  }] : [{
    path: t,
    document: r,
    field: "registryAssets",
    assets: []
  }];
}
function Ct(e) {
  return e.flatMap((t) => t.assets.map((s) => ({
    ...s,
    documentPath: t.path
  })));
}
function pi(e) {
  const t = /* @__PURE__ */ new Map();
  for (const s of e) {
    const r = t.get(s.id);
    if (r) throw new Error(`Duplicate registry asset id: ${s.id} in ${r} and ${s.documentPath}`);
    t.set(s.id, s.documentPath);
  }
}
async function mi(e, t, s, r) {
  const n = [], a = [];
  for (const o of s) {
    const c = r.get(o.id);
    if (o.source) {
      await fi(e, o, n);
      const d = c && o.registryUrl === c ? "current" : c ? "repaired" : "materialized";
      a.push({
        id: o.id,
        registryUrl: c ?? o.registryUrl,
        action: d
      });
      continue;
    }
    if (!o.registryUrl) {
      n.push(`Registry asset is missing source or registryUrl: ${o.id}`), a.push({
        id: o.id,
        action: "repaired"
      });
      continue;
    }
    if (c !== o.registryUrl) {
      n.push(`Registry asset URL is not current for ${t}/${o.id}`), a.push({
        id: o.id,
        registryUrl: o.registryUrl,
        action: "repaired"
      });
      continue;
    }
    a.push({
      id: o.id,
      registryUrl: o.registryUrl,
      action: "validated"
    });
  }
  return {
    errors: n,
    assets: a
  };
}
async function fi(e, t, s) {
  if (!t.source) return;
  const r = me(t.source, `registryAssets.${t.id}.source`);
  if (r.kind === "httpsUrl") {
    await hi(r.url, t.id, s);
    return;
  }
  try {
    await re(T(e, r.path));
  } catch (n) {
    if (n instanceof Error && "code" in n && n.code === "ENOENT") {
      s.push(`Registry asset source not found for ${t.id}: ${r.path}`);
      return;
    }
    throw n;
  }
}
async function hi(e, t, s) {
  try {
    const r = await fetch(e, { method: "HEAD" });
    if (r.ok) return;
    if (r.status === 405 || r.status === 501) {
      const n = await fetch(e, {
        method: "GET",
        headers: { Range: "bytes=0-0" }
      });
      if (n.ok || n.status === 206) return;
    }
    s.push(`Registry asset HTTPS source is not reachable for ${t}: ${e}`);
  } catch (r) {
    const n = r instanceof Error ? r.message : String(r);
    s.push(`Registry asset HTTPS source is not reachable for ${t}: ${e} (${n})`);
  }
}
async function gi(e, t) {
  const s = /* @__PURE__ */ new Set(), r = [];
  for (const n of t) {
    if (!n.source) continue;
    const a = me(n.source, `registryAssets.${n.id}.source`);
    if (a.kind !== "artifactPath" || s.has(a.path)) continue;
    s.add(a.path);
    const o = T(e, a.path), c = await re(o);
    r.push({
      path: o,
      uploadPath: as(a.path),
      size: c.size,
      contentType: Ie(a.path)
    });
  }
  return r;
}
async function yi(e, t) {
  const s = new Map(t.map((n) => [n.id, n.registryUrl])), r = [];
  for (const n of e) {
    let a = !1;
    for (const o of n.assets) {
      const c = s.get(o.id);
      c && o.registryUrl !== c && (o.registryUrl = c, a = !0);
    }
    a && (n.document[n.field] = n.assets, await J(n.path, n.document), r.push(n.path));
  }
  return r;
}
async function bi(e, t, s) {
  const { manifest: r, document: n } = await Y(t);
  if (r.registryAssets.kind === "files") {
    const a = [], o = new Map(s);
    for (const d of r.registryAssets.paths) {
      const u = T(e, d), l = await Cs(u);
      xs(l.assets, s, o), a.push({
        path: u,
        ...l
      });
    }
    const c = a[0];
    if (c) {
      Ms(c.assets, o);
      for (const d of a) await J(d.path, d.document);
      return a.map((d) => d.path);
    }
  }
  if (r.registryAssets.kind === "inline") {
    const a = Us(n);
    return wi(a, s), n.registryAssets = a, await J(t, n), [t];
  }
  return n.registryAssets = [...s].map(([a, o]) => ({
    id: a,
    registryUrl: o
  })), await J(t, n), [t];
}
async function Cs(e) {
  const t = await I(e, "utf8");
  let s;
  try {
    s = JSON.parse(t);
  } catch {
    throw new Error("Registry assets manifest must be valid JSON");
  }
  if (!s || typeof s != "object" || Array.isArray(s)) throw new Error("Registry assets manifest must be a JSON object");
  const r = s.assets;
  if (!Array.isArray(r)) throw new Error("Registry assets manifest must include an assets array");
  return ds(s), {
    document: s,
    assets: r
  };
}
function Us(e) {
  const t = e.registryAssets;
  if (!Array.isArray(t)) throw new Error("assets helpers require inline registryAssets in the source manifest");
  return st(t), t;
}
function wi(e, t) {
  const s = new Map(t);
  xs(e, t, s), Ms(e, s);
}
function xs(e, t, s) {
  for (const r of e) {
    const n = t.get(r.id);
    n && (r.registryUrl = n, s.delete(r.id));
  }
}
function Ms(e, t) {
  for (const [s, r] of t) e.push({
    id: s,
    registryUrl: r
  });
}
function vi(e) {
  const t = e.registryAssets;
  if (t === void 0) return [];
  if (!Array.isArray(t)) throw new Error("assets helpers require inline registryAssets in the source manifest");
  try {
    return st(t);
  } catch {
    throw new Error("assets helpers require inline registryAssets in the source manifest");
  }
}
function Ri(e, t) {
  const s = t ?? "src/registry-assets.gen.ts";
  return Je(s) || pe(s, t ? "out" : "registryAssetsModule"), Je(s) ? T(s) : T(e, s);
}
async function Ut(e) {
  try {
    return await I(e, "utf8");
  } catch (t) {
    if (t instanceof Error && "code" in t && t.code === "ENOENT") return null;
    throw t;
  }
}
async function xt(e, t) {
  await Bt(sr(e), { recursive: !0 }), await Ge(e, t);
}
function Le(e, t) {
  const s = [...t].sort((c, d) => c.id.localeCompare(d.id)), r = s.filter((c) => !c.registryUrl).map((c) => c.id);
  if (r.length > 0) throw new Error(`Registry assets must be synced before generating TypeScript helpers: ${r.join(", ")}`);
  const n = /* @__PURE__ */ new Map();
  let a = `/apps/${e}`;
  for (const c of s) {
    const d = Si(e, c);
    if (a.startsWith("/"))
      a = d.appCdnUrl;
    else if (d.appCdnUrl !== a) throw new Error(`Registry asset ${c.id} registryUrl must share app CDN URL ${a}`);
    n.set(c.id, d.extension);
  }
  const o = ["// Generated by registry assets sync --generate-typescript. Do not edit manually.", ""];
  o.push(`export const APP_CDN_URL = ${Ve(a)} as const`), o.push(""), o.push("export const ASSET_EXTENSIONS = {");
  for (const c of s) o.push(`  ${Ve(c.id)}: ${Ve(n.get(c.id) ?? "")},`);
  return o.push("} as const"), o.push(""), o.push("export type RegistryAssetId = keyof typeof ASSET_EXTENSIONS"), o.push(""), o.push("export function registryAssetUrl(id: RegistryAssetId) {"), o.push("  return `${APP_CDN_URL}/assets/${id}.${ASSET_EXTENSIONS[id]}`"), o.push("}"), o.push(""), o.join(`
`);
}
function Si(e, t) {
  if (!t.registryUrl) throw new Error(`Registry asset ${t.id} must be synced before generating TypeScript helpers.`);
  const s = new URL(t.registryUrl), r = `/apps/${e}/assets/${t.id}.`;
  if (!s.pathname.startsWith(r) || s.search || s.hash) throw new Error(`Registry asset ${t.id} registryUrl must be canonical: /apps/${e}/assets/${t.id}.<extension>`);
  const n = s.pathname.slice(r.length);
  if (!n || n.includes("/")) throw new Error(`Registry asset ${t.id} registryUrl must be canonical: /apps/${e}/assets/${t.id}.<extension>`);
  return {
    appCdnUrl: `${s.origin}/apps/${e}`,
    extension: n
  };
}
function Ve(e) {
  return `'${e.replace(/\\/g, "\\\\").replace(/'/g, "\\'")}'`;
}
async function Ii(e) {
  if (e.query && e.queryFile) throw new Ae("Use either --query or --query-file, not both");
  const t = e.queryFile ? await I(e.queryFile, "utf8") : e.query;
  if (t)
    try {
      return JSON.parse(t);
    } catch (s) {
      throw new Ae(`Invalid Registry RQL JSON${s instanceof Error ? `: ${s.message}` : ""}`);
    }
}
var Ae = class extends Error {
};
function Os(e, t = {}) {
  const s = t.descriptionPrefix ? `${t.descriptionPrefix} ` : "";
  return e.option("--query <json>", `Filter ${s}with a Registry RQL JSON expr`).option("--query-file <path>", "Read a Registry RQL JSON expr from a file").option("--include-reserved", `Include registry-reserved versions${s ? ` in ${s.trim()}` : ""}`);
}
async function qs(e) {
  return {
    query: await Ii(e),
    includeReserved: e.includeReserved
  };
}
function Ai(e, t) {
  const s = e.command("channels").alias("c").description("Manage Registry distribution channels");
  Wa(s, e, t), s.command("list").option("--json", "Print a machine-readable result").action(async (r) => {
    await H(e, t, r, async ({ client: n }) => {
      const a = await n.channels.list();
      return {
        payload: {
          status: "channels_listed",
          channels: a.channels
        },
        message: Ti(a.channels)
      };
    });
  }), Os(s.command("show").argument("<channel-id>", "Distribution channel ID").option("--app-id <app-id>", "Filter assignments by app ID"), { descriptionPrefix: "public runtime listings" }).option("--json", "Print a machine-readable result").action(async (r, n) => {
    await H(e, t, n, async ({ client: a }) => {
      if (n.appId) {
        const c = await a.channels.assignments(r, { appId: n.appId });
        return {
          payload: {
            status: "channel_assignments_listed",
            channel: c.channel,
            assignments: c.assignments
          },
          message: Mt(c.assignments)
        };
      }
      const o = await a.channels.get(r, await qs(n));
      return {
        payload: {
          status: "channel_shown",
          channel: o.channel,
          apps: o.apps
        },
        message: $i(o.apps)
      };
    });
  }), s.command("current").requiredOption("--app-id <app-id>", "Filter assignments by app ID").option("--json", "Print a machine-readable result").action(async (r) => {
    await H(e, t, r, async ({ client: n }) => {
      const a = await n.channels.list(), o = [];
      for (const c of a.channels) {
        const d = await n.channels.assignments(c.id, { appId: r.appId });
        o.push(...d.assignments);
      }
      return {
        payload: {
          status: "channel_assignments_listed",
          appId: r.appId,
          assignments: o
        },
        message: Mt(o)
      };
    });
  }), s.command("connect").argument("<channel-id>", "Distribution channel ID").requiredOption("-v, --version-id <app-version-uuid>", "App version UUID").option("--reason <text>", "Connection reason").option("--json", "Print a machine-readable result").action(async (r, n) => {
    await H(e, t, n, async ({ client: a }) => {
      const o = await a.channels.connect(r, {
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
  }), s.command("disconnect").argument("<channel-id>", "Distribution channel ID").requiredOption("-v, --version-id <app-version-uuid>", "App version UUID").option("--reason <text>", "Disconnection reason").option("--json", "Print a machine-readable result").action(async (r, n) => {
    await H(e, t, n, async ({ client: a }) => {
      const o = await a.channels.disconnect(r, n.versionId, { reason: n.reason });
      return {
        payload: {
          status: "channel_disconnected",
          channel: o.channel,
          appVersion: o.appVersion
        },
        message: `Disconnected ${o.channel.id} from app version ${o.appVersion.id}.`
      };
    });
  }), s.command("rollback").argument("<channel-id>", "Distribution channel ID").option("--app-id <app-id>", "Registry app ID").option("--root <root>", "Primer app project root").option("--to-version <app-version-uuid>", "Target app version UUID").option("--reason <text>", "Rollback reason").option("--dry-run", "Preview rollback without mutating Registry state").option("--json", "Print a machine-readable result").action(async (r, n) => {
    await H(e, t, n, async ({ client: a }) => {
      const o = await Ei(n);
      if (r === "prod" && !n.toVersion) throw new oe("Production rollback requires --to-version");
      if (r === "prod" && !n.reason) throw new oe("Production rollback requires --reason");
      const c = await a.channels.rollback(r, {
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
        message: _i(c)
      };
    });
  });
}
async function H(e, t, s, r) {
  await O(e, t, s, r, {
    defaultErrorMessage: "Registry channels command failed",
    formatError: (n) => ({
      status: "error",
      message: Pi(n, ji(s))
    }),
    isUsageError: (n) => n instanceof oe || n instanceof Ae
  });
}
function Pi(e, t) {
  if (e instanceof oe) return e.message;
  if (e instanceof E && e.code === "prod_requires_approved") {
    const s = ki(e.rawPayload) || t, r = s ? ` Run: registry versions approve ${s}` : " Run registry versions approve <version-id> first.";
    return `${e.message}.${r}`;
  }
  return e instanceof Error ? e.message : "Registry channels command failed";
}
async function Ei(e) {
  if (!e.appId && !e.root) throw new oe("Provide an app context with --app-id or --root");
  const t = await at({
    appId: e.appId,
    root: e.root
  });
  if (t.appId && !K(t.diagnostics)) return t.appId;
  throw new Error(fe(t.diagnostics) || "Unable to resolve Registry app ID");
}
function _i(e) {
  return [
    `${e.status === "dry_run" ? "Dry run" : "Rolled back"} ${e.channel.id}.`,
    `Current assignment: ${e.currentAssignment.appVersionId}`,
    `Target version: ${e.targetAppVersion.id}`
  ].join(`
`);
}
var oe = class extends Error {
};
function ki(e) {
  if (!e || typeof e != "object") return null;
  const t = e;
  return typeof t.versionId == "string" ? t.versionId : null;
}
function ji(e) {
  return "versionId" in e && typeof e.versionId == "string" ? e.versionId : void 0;
}
function Mt(e) {
  return C({
    columns: [
      {
        header: "CHANNEL",
        value: (t) => t.channelId,
        color: b.id
      },
      {
        header: "APP ID",
        value: (t) => t.appId,
        color: b.id
      },
      {
        header: "VERSION ID",
        value: (t) => t.appVersionId,
        color: b.id
      }
    ],
    rows: e,
    emptyMessage: "No channel assignments found."
  });
}
function Ti(e) {
  return C({
    columns: [{
      header: "CHANNEL",
      value: (t) => t.id,
      color: b.id
    }],
    rows: e,
    emptyMessage: "No channels found."
  });
}
function $i(e) {
  return C({
    columns: [{
      header: "APP ID",
      value: (t) => t.id,
      color: b.id
    }, {
      header: "TITLE",
      value: (t) => t.title
    }],
    rows: e,
    emptyMessage: "No apps found."
  });
}
async function Ci(e) {
  const t = [];
  async function s(r) {
    for (const n of await er(r, { withFileTypes: !0 })) {
      const a = x(r, n.name);
      if (n.isDirectory()) await s(a);
      else if (n.isFile()) {
        const o = await re(a);
        t.push({
          path: rr(e, a).replace(/\\/g, "/"),
          size: o.size,
          contentType: Ie(a)
        });
      }
    }
  }
  return await s(e), t;
}
async function Ui(e = {}) {
  const t = q(e), s = [], r = await xi(t.sourceManifest, s), n = await nt(t.root);
  if (Mi(r.document, r.manifest, n, t.sourceManifest, s), !ze(t.artifactDirectory))
    return s.push({
      code: "artifact_dist_missing",
      severity: e.requireDist ? "error" : "warning",
      message: "Built app artifact directory was not found.",
      source: "artifact",
      target: t.artifactDirectory
    }), Ni(t, r, n, s);
  const a = await Oi(t.artifactManifest, s);
  r.manifest?.appId && a?.appId && r.manifest.appId !== a.appId && s.push({
    code: "artifact_app_id_mismatch",
    severity: "error",
    message: "Source and artifact manifest appId values must match.",
    source: "artifact",
    target: t.artifactManifest
  }), a && !a.appId && s.push({
    code: "manifest_missing_app_id",
    severity: "error",
    message: "Artifact manifest is missing appId.",
    source: "artifact",
    target: t.artifactManifest
  }), ze(t.artifactEntrypoint) || s.push({
    code: "artifact_entrypoint_missing",
    severity: "error",
    message: "Artifact entrypoint index.html is required.",
    source: "artifact",
    target: t.artifactEntrypoint
  });
  const o = await qi(t.artifactDirectory, s), c = o.reduce((d, u) => d + u.size, 0);
  return o.length === 0 && s.push({
    code: "artifact_empty",
    severity: "error",
    message: "Built app artifact directory is empty.",
    source: "artifact",
    target: t.artifactDirectory
  }), {
    paths: t,
    sourceDocument: r.document,
    sourceManifest: r.manifest,
    artifactManifest: a,
    files: o,
    totalBytes: c,
    detectedPrimerSdkVersion: n,
    diagnostics: s
  };
}
async function xi(e, t) {
  let s;
  try {
    s = await I(e, "utf8");
  } catch (a) {
    if (Ns(a))
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
  let r;
  try {
    r = JSON.parse(s);
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
  const n = r && typeof r == "object" && !Array.isArray(r) ? r : null;
  try {
    return {
      document: n,
      manifest: $e(r)
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
function Mi(e, t, s, r, n) {
  e && typeof e.title != "string" && n.push({
    code: "manifest_missing_title",
    severity: "error",
    message: "Source manifest is missing title.",
    source: "manifest",
    target: r
  }), t && !t.appId && n.push({
    code: "manifest_missing_app_id",
    severity: "error",
    message: "Source manifest is missing appId.",
    source: "manifest",
    target: r
  });
  const a = e?.primerSdkVersion;
  a === void 0 && s ? n.push({
    code: "manifest_primer_sdk_version_missing",
    severity: "warning",
    message: "Source manifest is missing primerSdkVersion.",
    source: "manifest",
    target: r
  }) : typeof a == "string" && !/^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/.test(a) && n.push({
    code: "manifest_primer_sdk_version_non_exact",
    severity: "warning",
    message: "Source manifest primerSdkVersion must be an exact version.",
    source: "manifest",
    target: r
  });
}
async function Oi(e, t) {
  try {
    return await $a(e);
  } catch (s) {
    return t.push({
      code: Ns(s) ? "artifact_manifest_missing" : "artifact_manifest_invalid",
      severity: "error",
      message: s instanceof Error ? s.message : "Artifact manifest is invalid.",
      source: "artifact",
      target: e
    }), null;
  }
}
async function qi(e, t) {
  try {
    const s = await Ci(e);
    return await Promise.all(s.map((r) => Vt(x(e, r.path)))), s;
  } catch (s) {
    return t.push({
      code: "artifact_file_unreadable",
      severity: "error",
      message: s instanceof Error ? s.message : "Artifact files could not be read.",
      source: "artifact",
      target: e
    }), [];
  }
}
function Ni(e, t, s, r) {
  return {
    paths: e,
    sourceDocument: t.document,
    sourceManifest: t.manifest,
    artifactManifest: null,
    files: [],
    totalBytes: 0,
    detectedPrimerSdkVersion: s,
    diagnostics: r
  };
}
function Ns(e) {
  return e instanceof Error && "code" in e && e.code === "ENOENT";
}
async function Ds(e) {
  const t = (e.mode ?? "publish-required") === "publish-required", s = Ce(e.registryOptions ?? {}), r = await Ui({
    root: e.root,
    manifest: e.manifest,
    dist: e.dist,
    requireDist: t || e.requireDist === !0
  }), n = [...r.diagnostics], a = r.sourceManifest?.appId ?? null, o = r.artifactManifest?.appId ?? null, c = a;
  if (K(n) || (!a && t && n.push({
    code: "manifest_missing_app_id",
    severity: "error",
    message: "Source manifest must include appId before publishing.",
    source: "manifest",
    target: r.paths.sourceManifest,
    nextCommand: "registry claim"
  }), !o && t && n.push({
    code: "manifest_missing_app_id",
    severity: "error",
    message: "Artifact manifest must include appId before publishing.",
    source: "artifact",
    target: r.paths.artifactManifest
  }), a && o && a !== o && n.push({
    code: "artifact_app_id_mismatch",
    severity: "error",
    message: "Source and artifact manifest appId values must match.",
    source: "artifact",
    target: r.paths.artifactManifest
  }), r.files.length === 0 && t && n.push({
    code: "artifact_empty",
    severity: "error",
    message: "Built app artifact directory is empty.",
    source: "artifact",
    target: r.paths.artifactDirectory
  }), K(n)) || !a) return W(r, n, c, s);
  const d = a;
  if (e.local) return He(r, n, d, s, null, null, { kind: "unknown" });
  const u = await Di(s, e.registryOptions, e.services, n, t ? "error" : "warning");
  if (!u) return Ot(r, n, a, s, t);
  const l = z(u.registryUrl, {
    token: u.accessToken,
    request: e.services.request
  });
  try {
    const p = await l.apps.get(d);
    return p.exists ? p.claim.claimedByCurrentUser ? He(r, n, d, s, u, l, {
      kind: "known",
      appExists: !0,
      role: p.claim.role
    }) : (n.push({
      code: "app_membership_required",
      severity: "error",
      message: `Current Registry account cannot publish app ID "${d}".`,
      source: "registry"
    }), W(r, n, d, s)) : (n.push({
      code: "app_not_claimed",
      severity: "error",
      message: `App ID "${d}" has not been claimed for this Registry.`,
      source: "registry",
      nextCommand: "registry claim"
    }), W(r, n, d, s));
  } catch (p) {
    return n.push(Ls(p, t ? "error" : "warning")), Ot(r, n, d, s, t);
  }
}
async function Di(e, t, s, r, n) {
  const a = Li(t);
  if (a) return Vi(e, a, s.now());
  const o = await s.readSession();
  if (!o || o.registryUrl !== e)
    return r.push({
      code: "auth_required",
      severity: n,
      message: "No Registry session found. Run `registry login`.",
      source: "auth",
      nextCommand: "registry login"
    }), null;
  if (new Date(o.expiresAt).getTime() > s.now() + 3e4) return o;
  try {
    const c = await z(e, { request: s.request }).auth.refresh({ refreshToken: o.refreshToken }), d = {
      registryUrl: e,
      accessToken: c.accessToken,
      refreshToken: c.refreshToken,
      expiresAt: new Date(s.now() + c.expiresIn * 1e3).toISOString(),
      account: c.account
    };
    return await s.saveSession(d), d;
  } catch (c) {
    return r.push(Ls(c, n)), null;
  }
}
function Li(e) {
  const t = e?.token?.trim();
  return t || process.env.REGISTRY_ACCESS_TOKEN?.trim() || void 0;
}
function Vi(e, t, s) {
  return {
    registryUrl: e,
    accessToken: t,
    refreshToken: "",
    expiresAt: new Date(s + 3600 * 1e3).toISOString(),
    account: {
      userId: "access-token",
      email: null
    }
  };
}
function Ls(e, t = "error") {
  if (e instanceof E) {
    if (e.status === 401) return {
      code: "auth_session_expired",
      severity: t,
      message: "Registry session is missing or expired. Run `registry login`.",
      source: "auth",
      nextCommand: "registry login"
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
function W(e, t, s, r) {
  return {
    ok: !1,
    diagnostics: t,
    paths: e.paths,
    inspection: e,
    appId: s,
    registryUrl: r,
    session: null,
    client: null,
    remoteState: { kind: "unknown" }
  };
}
function He(e, t, s, r, n, a, o) {
  return {
    ok: !0,
    diagnostics: t,
    paths: e.paths,
    inspection: e,
    appId: s,
    registryUrl: r,
    session: n,
    client: a,
    remoteState: o
  };
}
function Ot(e, t, s, r, n) {
  return n ? W(e, t, s, r) : He(e, t, s, r, null, null, { kind: "unknown" });
}
function Bi(e, t) {
  e.command("check").argument("[root]", "Primer app project root", ".").description("Check whether a Primer app project is ready for Registry publishing").option("-m, --manifest <path>", "Source manifest path").option("-d, --dist <path>", "Built app artifact directory").option("--local", "Skip Registry session and remote app checks").option("--require-dist", "Treat a missing built app artifact directory as an error").option("--json", "Print a machine-readable result").action(async (s, r) => {
    const n = _({
      json: k(e, r),
      write: t.write
    }), a = await Ds({
      root: s,
      manifest: r.manifest,
      dist: r.dist,
      registryOptions: e.opts(),
      services: t,
      local: r.local,
      requireDist: r.requireDist,
      mode: "check"
    }), o = !K(a.diagnostics);
    o || y(2), f(n, {
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
    }, Fi(a, o));
  });
}
function Fi(e, t) {
  const s = [t ? "Registry check completed." : "Registry check failed."];
  s.push(`Registry: ${e.registryUrl}`), e.appId && s.push(`App ID: ${e.appId}`), e.inspection.files.length > 0 && s.push(`Files: ${e.inspection.files.length} (${e.inspection.totalBytes} bytes)`), e.diagnostics.length > 0 && s.push("", fe(e.diagnostics));
  const r = Array.from(new Set(e.diagnostics.map((n) => n.nextCommand).filter(Boolean)));
  return r.length > 0 && s.push("", `Next: ${r.join(" && ")}`), s.join(`
`);
}
function Ji(e, t) {
  e.command("init").argument("[root]", "Primer app project root", ".").description("Initialize local Registry manifest metadata").option("-m, --manifest <path>", "Source manifest path").option("--json", "Print a machine-readable preview without writing").action(async (s, r) => {
    const n = k(e, r), a = _({
      json: n,
      write: t.write
    });
    try {
      const o = await _s({
        root: s,
        manifest: r.manifest,
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
function zi(e, t) {
  const s = e.command("members").description("Manage Registry app members");
  s.command("list").option("--app-id <app-id>", "Registry app ID").option("--root <root>", "Primer app project root", ".").option("--json", "Print a machine-readable result").action(async (r) => {
    await ye(e, t, r, async ({ client: n }) => {
      const a = await be(r), o = await n.members.list(a);
      return {
        payload: {
          status: "members_listed",
          appId: a,
          members: o.members
        },
        message: Qi(a, o.members)
      };
    });
  }), s.command("add").option("--app-id <app-id>", "Registry app ID").option("--root <root>", "Primer app project root", ".").option("--email <email>", "Registry account email").option("--user-id <user-id>", "Registry user ID").requiredOption("--role <role>", "App member role: owner or member").option("--json", "Print a machine-readable result").action(async (r) => {
    await ye(e, t, r, async ({ client: n }) => {
      Be(r);
      const a = await be(r), o = await n.members.add(a, {
        ...r.email ? { email: r.email } : { userId: r.userId },
        role: r.role
      });
      return {
        payload: {
          status: "member_added",
          appId: a,
          member: o.member
        },
        message: `Added ${G(r)} to ${a} as ${o.member.role}.`
      };
    });
  }), s.command("remove").option("--app-id <app-id>", "Registry app ID").option("--root <root>", "Primer app project root", ".").option("--email <email>", "Registry account email").option("--user-id <user-id>", "Registry user ID").option("--json", "Print a machine-readable result").action(async (r) => {
    await ye(e, t, r, async ({ client: n }) => {
      Be(r);
      const a = await be(r), o = r.userId ?? await qt(n, a, r.email);
      return o ? (await n.members.remove(a, o), {
        payload: {
          status: "member_removed",
          appId: a,
          userId: o,
          target: G(r)
        },
        message: `Removed ${G(r)} from ${a}.`
      }) : Nt(a, G(r));
    });
  }), s.command("set-role").option("--app-id <app-id>", "Registry app ID").option("--root <root>", "Primer app project root", ".").option("--email <email>", "Registry account email").option("--user-id <user-id>", "Registry user ID").requiredOption("--role <role>", "App member role: owner or member").option("--json", "Print a machine-readable result").action(async (r) => {
    await ye(e, t, r, async ({ client: n }) => {
      Be(r);
      const a = await be(r), o = r.userId ?? await qt(n, a, r.email);
      if (!o) return Nt(a, G(r));
      const c = await n.members.setRole(a, o, { role: r.role });
      return {
        payload: {
          status: "member_role_updated",
          appId: a,
          member: c.member
        },
        message: `Updated ${G(r)} on ${a} to ${c.member.role}.`
      };
    });
  });
}
async function ye(e, t, s, r) {
  await O(e, t, s, r, {
    defaultErrorMessage: "Registry members command failed",
    formatError: Gi,
    isUsageError: Hi
  });
}
async function be(e) {
  const t = await at({
    appId: e.appId,
    root: e.root
  });
  if (t.appId && !K(t.diagnostics)) return t.appId;
  throw new Error(fe(t.diagnostics) || "Unable to resolve Registry app ID");
}
function Be(e) {
  if (!!e.email == !!e.userId) throw new Vs("Provide exactly one member selector: --email or --user-id");
}
var Vs = class extends Error {
};
function Hi(e) {
  return e instanceof Vs;
}
async function qt(e, t, s) {
  return (await e.members.list(t)).members.find((r) => r.email?.toLowerCase() === s.toLowerCase())?.userId ?? null;
}
function Nt(e, t) {
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
function Gi(e) {
  return e instanceof E ? {
    status: Wi(e),
    message: e.message
  } : {
    status: "error",
    message: e instanceof Error ? e.message : "Registry members command failed"
  };
}
function Wi(e) {
  return e.code === "permission_denied" || e.status === 403 ? "permission_denied" : e.code === "user_not_found" ? "user_not_found" : e.code === "member_not_found" ? "member_not_found" : e.code === "last_owner_required" ? "last_owner_required" : "error";
}
function Qi(e, t) {
  return C({
    columns: [
      {
        header: "USER ID",
        value: (s) => s.userId,
        color: b.id
      },
      {
        header: "EMAIL",
        value: (s) => s.email
      },
      {
        header: "ROLE",
        value: (s) => s.role,
        color: Yi
      }
    ],
    rows: t,
    emptyMessage: `No members found for ${e}.`
  });
}
function Yi(e) {
  return e.trim() === "owner" ? b.success(e) : e;
}
function G(e) {
  return e.email ?? e.userId ?? "member";
}
function Ki(e) {
  const t = e.inspection.artifactManifest ?? e.inspection.sourceManifest;
  if (!t) throw new Error("Cannot create publish plan without a manifest.");
  const s = !!e.forceApprove;
  return {
    appId: e.appId,
    title: t.title,
    tags: t.tags,
    primerSdkVersion: t.primerSdkVersion ?? e.inspection.detectedPrimerSdkVersion,
    thumbnailAssetId: t.thumbnailAssetId ?? null,
    files: e.inspection.files,
    totalBytes: e.inspection.totalBytes,
    forceApprove: s,
    expectedStatus: s ? "approved" : "submitted",
    expectedChannel: s ? "prod" : "staging",
    remoteState: e.remoteState
  };
}
function Xi(e, t) {
  Bs(e.command("publish"), e, t);
}
function Zi(e, t, s) {
  Bs(e.command("publish"), t, s);
}
function Bs(e, t, s) {
  e.argument("[root]", "Primer app project root", ".").description("Publish a Primer app project root").option("-m, --manifest <path>", "Source manifest path").option("-d, --dist <path>", "Built app artifact directory").option("--force-approve", "Approve and connect the uploaded app version to production").option("--dry-run", "Validate and print the upload plan without creating an upload").option("--local", "Skip Registry preflight checks for dry-run validation").option("--json", "Print a machine-readable result").action(async (r, n) => {
    const a = _({
      json: k(t, n),
      write: s.write
    });
    try {
      if (n.local && !n.dryRun) {
        y(2), f(a, {
          status: "error",
          message: "Local publish is only supported with --dry-run."
        }, "Local publish is only supported with --dry-run.");
        return;
      }
      const o = await Ds({
        root: r,
        manifest: n.manifest,
        dist: n.dist,
        registryOptions: t.opts(),
        services: s,
        local: n.local,
        mode: "publish-required"
      });
      if (!o.ok) {
        ro(a, o.diagnostics, o.inspection, o.appId);
        return;
      }
      if (!o.appId) throw new Error("App ID is required before publishing.");
      const c = Ki({
        inspection: o.inspection,
        appId: o.appId,
        forceApprove: n.forceApprove,
        remoteState: o.remoteState
      });
      if (n.dryRun) {
        f(a, {
          status: "dry_run",
          ok: !0,
          diagnostics: o.diagnostics,
          plan: c
        }, no(c));
        return;
      }
      const d = o.client;
      if (!d) throw new Error("Registry validation did not create a publish client.");
      if (!o.inspection.artifactManifest) throw new Error("Artifact manifest is required before publishing.");
      const u = await to({
        artifactManifestPath: o.paths.artifactManifest,
        sourceManifest: o.inspection.sourceManifest
      }), l = await so({
        artifactFiles: c.files,
        sourceManifest: o.inspection.sourceManifest,
        artifactDirectory: o.paths.artifactDirectory,
        projectRoot: o.paths.root,
        artifactManifestBody: u.body
      }), p = await d.uploads.create({
        appId: o.appId,
        manifest: u.document,
        files: l.map((R) => ({
          path: R.uploadPath,
          size: R.size,
          contentType: R.contentType
        }))
      });
      for (const R of l) {
        const V = p.files.find((D) => D.path === R.uploadPath);
        if (!V) throw new Error(`No upload URL returned for ${R.uploadPath}`);
        const B = await fetch(V.url, {
          method: V.method,
          headers: V.headers,
          body: await eo(R)
        });
        if (!B.ok) throw new Error(`Upload failed for ${R.uploadPath}: ${B.status}`);
      }
      const m = await d.uploads.complete(p.uploadId, n.forceApprove ? { forceApprove: !0 } : void 0), A = m.status === "approved" ? `Approved app ${m.appId} version ${m.appVersionId} and connected it to production.` : `Submitted app ${m.appId} version ${m.appVersionId} to staging.`;
      f(a, {
        status: m.status === "approved" ? "publish_approved" : "publish_submitted",
        appId: m.appId,
        appVersionId: m.appVersionId,
        uploadId: p.uploadId,
        versionRootUrl: m.versionRootUrl,
        ...m.registryAssets.length > 0 ? { registryAssets: m.registryAssets } : {}
      }, A);
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
async function eo(e) {
  return e.body ? e.body : I(x(e.root, e.path));
}
async function to(e) {
  const t = await I(e.artifactManifestPath, "utf8");
  let s;
  try {
    s = JSON.parse(t);
  } catch {
    throw new Error("manifest.json must be valid JSON");
  }
  if (!s || typeof s != "object" || Array.isArray(s)) throw new Error("manifest.json must be a JSON object");
  const r = { ...s }, n = e.sourceManifest?.registryAssets;
  return !n || n.kind === "none" ? r.registryAssets === void 0 ? {
    document: r,
    body: void 0
  } : (delete r.registryAssets, {
    document: r,
    body: Dt(r)
  }) : (r.registryAssets = n.kind === "inline" ? n.assets : n.paths.length === 1 ? n.paths[0] : n.paths, {
    document: r,
    body: Dt(r)
  });
}
function Dt(e) {
  return Buffer.from(`${JSON.stringify(e, null, 2)}
`);
}
async function so(e) {
  const t = e.artifactFiles.map((a) => ({
    ...a,
    ...a.path === "manifest.json" && e.artifactManifestBody ? {
      size: e.artifactManifestBody.byteLength,
      body: e.artifactManifestBody
    } : {},
    uploadPath: a.path,
    root: e.artifactDirectory
  })), s = new Set(t.map((a) => a.uploadPath)), r = /* @__PURE__ */ new Set(), n = [];
  if (e.sourceManifest?.registryAssets.kind === "inline") n.push(...e.sourceManifest.registryAssets.assets);
  else if (e.sourceManifest?.registryAssets.kind === "files") for (const a of e.sourceManifest.registryAssets.paths) {
    const o = {
      path: a,
      uploadPath: a,
      size: (await re(x(e.projectRoot, a))).size,
      contentType: Ie(a),
      root: e.projectRoot
    }, c = t.findIndex((u) => u.uploadPath === a);
    c >= 0 ? t[c] = o : t.push(o), s.add(a);
    const d = rn(await I(x(e.projectRoot, a), "utf8"));
    n.push(...d.assets);
  }
  for (const a of n) {
    if (!a.source) continue;
    const o = me(a.source, `registryAssets.${a.id}.source`);
    if (o.kind !== "artifactPath" || r.has(o.path)) continue;
    r.add(o.path);
    const c = as(o.path);
    if (!s.has(c)) {
      const d = await re(x(e.projectRoot, o.path));
      t.push({
        path: o.path,
        uploadPath: c,
        size: d.size,
        contentType: Ie(o.path),
        root: e.projectRoot
      }), s.add(c);
    }
  }
  return t;
}
function ro(e, t, s, r) {
  const n = t.find((a) => a.severity === "error");
  if (y(2), n?.code === "app_not_claimed") {
    const a = r ?? "unknown";
    f(e, {
      status: "app_not_claimed",
      appId: a,
      nextCommand: "registry claim"
    }, `App ID "${a}" has not been claimed for this Registry.

Run:
  registry claim`);
    return;
  }
  if (n?.code === "manifest_missing_app_id" && n.source === "manifest") {
    f(e, {
      status: "manifest_missing_app_id",
      manifestPath: s.paths.sourceManifest,
      message: "Source manifest must include appId before publishing."
    }, `Source manifest ${s.paths.sourceManifest} must include appId before publishing.`);
    return;
  }
  if (n?.code === "manifest_missing_app_id" && n.source === "artifact") {
    f(e, {
      status: "manifest_missing_app_id",
      manifestPath: s.paths.artifactManifest,
      message: "Artifact manifest must include appId before publishing."
    }, `Artifact manifest ${s.paths.artifactManifest} must include appId before publishing.`);
    return;
  }
  if (n?.code === "artifact_app_id_mismatch") {
    f(e, {
      status: "manifest_app_id_mismatch",
      sourceAppId: s.sourceManifest?.appId ?? r,
      artifactAppId: s.artifactManifest?.appId ?? null,
      message: "Source and artifact manifest appId values must match."
    }, n.message);
    return;
  }
  f(e, {
    status: n?.code ?? "error",
    message: n?.message ?? "Registry publish validation failed.",
    diagnostics: t
  }, fe(t));
}
function no(e) {
  const t = e.remoteState.kind === "unknown" ? `
Remote state: unknown (local dry-run).` : "";
  return [
    `Dry run for app ${e.appId}.`,
    `Files: ${e.files.length} (${e.totalBytes} bytes).`,
    `Expected: ${e.expectedStatus} on ${e.expectedChannel}.`
  ].join(`
`) + t;
}
function ao(e, t) {
  e.command("status").argument("[root]", "Primer app project root", ".").description("Show Registry state for a Primer app").option("--app-id <app-id>", "Registry app ID").option("--json", "Print a machine-readable result").action(async (s, r) => {
    const n = _({
      json: k(e, r),
      write: t.write
    });
    try {
      const { client: a } = await ie(e, t), o = r.appId ? null : await io(s), c = r.appId || o;
      if (!c) {
        y(2), f(n, {
          status: "manifest_missing_app_id",
          manifestHasAppId: !1,
          nextCommand: "registry claim"
        }, "Source manifest is missing appId. Run: registry claim");
        return;
      }
      const d = rs.parse(await a.apps.get(c)), u = d.exists ? await oo(a, c) : null, l = u ? await co(a, c) : [], p = {
        status: "registry_status_shown",
        appId: c,
        manifestHasAppId: r.appId ? null : !!o,
        versionsAccessible: !!u,
        app: d,
        latestVersions: {
          submitted: u?.find((m) => m.status === "submitted") || null,
          approved: u?.find((m) => m.status === "approved") || null,
          rejected: u?.find((m) => m.status === "rejected") || null
        },
        channels: l,
        nextCommand: lo(d.exists, u?.length || 0)
      };
      f(n, p, po(p));
    } catch (a) {
      if (y(a instanceof E && a.status >= 400 && a.status < 500 ? 2 : 1), n.json) {
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
async function io(e) {
  return (await Ta(q({ root: e }).sourceManifest)).appId || null;
}
async function oo(e, t) {
  try {
    return (await e.versions.list({ appId: t })).appVersions;
  } catch (s) {
    if (s instanceof E && s.status === 403) return null;
    throw s;
  }
}
async function co(e, t) {
  try {
    return await uo(e, t);
  } catch (s) {
    if (s instanceof E && s.status === 403) return [];
    throw s;
  }
}
async function uo(e, t) {
  const s = (await e.channels.list()).channels, r = [];
  for (const n of s) {
    const a = await e.channels.assignments(n.id, { appId: t });
    r.push(...a.assignments);
  }
  return r;
}
function lo(e, t) {
  return e ? t === 0 ? "registry publish" : null : "registry claim";
}
function po(e) {
  const t = e.app.exists ? e.app.claim.claimedByCurrentUser ? `claimed by this account (${e.app.claim.role})` : "claimed by another account" : "available", s = e.versionsAccessible ? Object.entries(e.latestVersions).map(([a, o]) => `${a}: ${o ? o.id : "-"}`) : ["versions: not accessible"], r = e.versionsAccessible ? ["staging", "prod"].map((a) => {
    const o = e.channels.find((c) => c.channelId === a);
    return `${a}: ${o ? o.appVersionId : "-"}`;
  }) : [], n = e.nextCommand ? [`Next: ${e.nextCommand}`] : [];
  return [
    `App: ${e.appId}`,
    `Status: ${t}`,
    ...s,
    ...r,
    ...n
  ].join(`
`);
}
function mo(e, t) {
  const s = e.command("token").description("Manage long-lived Registry access tokens");
  s.command("create").description("Create a Registry access token and print its secret once").requiredOption("--title <title>", "Token title").option("-w, --write", "Create a write token").option("--reviewer", "Create a reviewer token").option("-a, --admin", "Create an admin token").option("--testing", "Create a testing token").option("-p, --permission <permission>", "Add a permission; repeat or use comma-separated/grouped values", bo, []).option("--expires-at <datetime>", "ISO 8601 expiry with timezone").option("--json", "Print JSON output").action(async (n) => {
    await U(e, t, n, async ({ client: a }) => {
      const o = fo(n), c = await a.tokens.create({
        title: n.title,
        permissions: o,
        expiresAt: n.expiresAt ? Lt(n.expiresAt, t.now()).toISOString() : null
      });
      return {
        payload: c,
        message: `Created Registry access token ${c.token.id}. Secret: ${c.secret}`
      };
    });
  }), s.command("update").argument("<token-id>").description("Update Registry access token metadata").option("--title <title>", "Token title").option("--expires-at <datetime>", "ISO 8601 expiry with timezone").option("--json", "Print JSON output").action(async (n, a) => {
    await U(e, t, a, async ({ client: o }) => {
      const c = {};
      if (a.title !== void 0 && (c.title = a.title), a.expiresAt !== void 0 && (c.expiresAt = Lt(a.expiresAt, t.now()).toISOString()), Object.keys(c).length === 0) throw new Error("Provide at least one token update option");
      const d = await o.tokens.update(n, c);
      return {
        payload: d,
        message: `Updated token ${d.token.id}.`
      };
    });
  }), s.command("list").description("List your Registry access tokens").option("--json", "Print JSON output").action(async (n) => {
    await U(e, t, n, async ({ client: a }) => {
      const o = await a.tokens.list();
      return {
        payload: o,
        message: Ro(o.tokens)
      };
    });
  }), s.command("status").argument("<token-id>").description("Show a Registry access token status").option("--json", "Print JSON output").action(async (n, a) => {
    await U(e, t, a, async ({ client: o }) => {
      const c = await o.tokens.status(n);
      return {
        payload: c,
        message: `Token ${c.token.id}: ${c.token.title}`
      };
    });
  }), s.command("grant").argument("<token-id>").requiredOption("--app-id <appId>", "App ID").description("Grant a Registry access token to an app").option("--json", "Print JSON output").action(async (n, a) => {
    await U(e, t, a, async ({ client: o }) => {
      const c = await o.tokens.grant(n, { appId: a.appId });
      return {
        payload: c,
        message: `Granted token ${n} to app ${c.grant.appId}.`
      };
    });
  }), s.command("ungrant").argument("<token-id>").requiredOption("--app-id <appId>", "App ID").description("Remove a Registry access token app grant").option("--json", "Print JSON output").action(async (n, a) => {
    await U(e, t, a, async ({ client: o }) => {
      const c = await o.tokens.ungrant(n, { appId: a.appId });
      return {
        payload: c,
        message: `Removed token ${n} grant for app ${c.grant.appId}.`
      };
    });
  }), s.command("delete").argument("<token-id>").description("Delete a Registry access token").option("--json", "Print JSON output").action(async (n, a) => {
    await U(e, t, a, async ({ client: o }) => {
      const c = await o.tokens.delete(n);
      return {
        payload: c,
        message: `Deleted token ${c.token.id}.`
      };
    });
  });
  const r = s.command("permissions").alias("p").description("Manage Registry access token permissions");
  r.command("list").argument("<token-id>").description("List canonical Registry access token permissions").option("--json", "Print JSON output").action(async (n, a) => {
    await U(e, t, a, async ({ client: o }) => {
      const c = await o.tokens.listPermissions(n);
      return {
        payload: c,
        message: zs(c.permissions)
      };
    });
  }), Fe(r, e, t, "set"), Fe(r, e, t, "add"), Fe(r, e, t, "remove");
}
function fo(e) {
  const t = go(e), s = ho(e);
  return s ? Ze([...kr(s), ...t]) : t;
}
function ho(e) {
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
function go(e) {
  return Ze(Fs(e.permission ?? []));
}
function yo(e) {
  return Ze(Fs(e));
}
function bo(e, t = []) {
  return [...t, e];
}
function Fe(e, t, s, r) {
  e.command(r).argument("<permissions...>", "Permissions; use space-separated, comma-separated, or grouped values").description(`${r[0].toUpperCase()}${r.slice(1)} Registry access token permissions`).requiredOption("-t, --token-id <token-id>", "Registry access token ID").option("--json", "Print JSON output").action(async (n, a) => {
    await U(t, s, a, async ({ client: o }) => {
      const c = { permissions: yo(n) }, d = r === "set" ? await o.tokens.setPermissions(a.tokenId, c) : r === "add" ? await o.tokens.addPermissions(a.tokenId, c) : await o.tokens.removePermissions(a.tokenId, c);
      return {
        payload: d,
        message: zs(d.permissions)
      };
    });
  });
}
function Fs(e) {
  return e.flatMap((t) => Js(t).flatMap(wo));
}
function Js(e, t = {}) {
  const s = [];
  let r = 0, n = 0;
  for (let o = 0; o < e.length; o += 1) {
    const c = e[o];
    if (c === "(" && (r += 1), c === ")") {
      if (r === 0) throw new Error("Permission list has an unmatched closing parenthesis");
      r -= 1;
    }
    c === "," && r === 0 && (s.push(e.slice(n, o)), n = o + 1);
  }
  if (r > 0) throw new Error("Permission list has an unmatched opening parenthesis");
  s.push(e.slice(n));
  const a = s.map((o) => o.trim());
  if (t.rejectEmpty && a.some((o) => !o)) throw new Error("Permission group contains an empty item");
  return a.filter(Boolean);
}
function wo(e) {
  vo(e);
  const t = /^([a-z]+(?:\.[a-z]+)*)\.\(([^()]+)\)$/.exec(e);
  if (!t) return [e];
  const [, s, r] = t;
  if (!s) throw new Error("Permission group has an empty prefix");
  return Js(r, { rejectEmpty: !0 }).map((n) => `${s}.${n}`);
}
function vo(e) {
  let t = 0;
  for (const s of e) {
    if (s === "(" && (t += 1, t > 1))
      throw new Error("Permission groups cannot be nested");
    if (s === ")") {
      if (t === 0) throw new Error("Permission list has an unmatched closing parenthesis");
      t -= 1;
    }
  }
  if (t > 0) throw new Error("Permission list has an unmatched opening parenthesis");
}
function Lt(e, t) {
  if (!/[zZ]|[+-]\d{2}:\d{2}$/.test(e)) throw new Error("--expires-at requires an explicit timezone or offset");
  const s = new Date(e);
  if (Number.isNaN(s.getTime())) throw new Error("--expires-at must be an ISO 8601 datetime");
  if (s.getTime() <= t) throw new Error("--expires-at must be in the future");
  return s;
}
function U(e, t, s, r) {
  return O(e, t, s, r, {
    defaultErrorMessage: "Registry token command failed",
    tokenPolicy: "browser-session-only"
  });
}
function Ro(e) {
  return C({
    columns: [
      {
        header: "TOKEN ID",
        value: (t) => t.id,
        color: b.id
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
        color: So
      }
    ],
    rows: e,
    emptyMessage: "No Registry access tokens found."
  });
}
function zs(e) {
  return C({
    columns: [{
      header: "PERMISSION",
      value: (t) => t
    }],
    rows: [...e],
    emptyMessage: "No Registry access token permissions found."
  });
}
function So(e) {
  return e.trim() === "active" ? b.success(e) : b.warning(e);
}
function Io(e, t) {
  const s = e.command("versions").alias("v").description("Manage Registry app versions");
  Zi(s, e, t), Ga(s, e, t), s.command("approve").argument("<version-id>", "App version UUID").option("--reason <text>", "Review reason").option("--json", "Print a machine-readable result").action(async (r, n) => {
    await se(e, t, n, async ({ client: a }) => {
      const o = await a.versions.approve(r, { reason: n.reason });
      return {
        payload: {
          status: "version_approved",
          appVersion: o.appVersion
        },
        message: `Approved app version ${o.appVersion.id}.`
      };
    });
  }), s.command("reject").argument("<version-id>", "App version UUID").requiredOption("--reason <text>", "Rejection reason").option("--json", "Print a machine-readable result").action(async (r, n) => {
    await se(e, t, n, async ({ client: a }) => {
      const o = await a.versions.reject(r, { reason: n.reason });
      return {
        payload: {
          status: "version_rejected",
          appVersion: o.appVersion
        },
        message: `Rejected app version ${o.appVersion.id}.`
      };
    });
  }), s.command("delete").argument("<version-id>", "App version UUID").option("--reason <text>", "Deletion reason").option("--json", "Print a machine-readable result").action(async (r, n) => {
    await se(e, t, n, async ({ client: a }) => {
      Ao(n);
      const o = await a.versions.delete(r, { reason: n.reason });
      return {
        payload: {
          status: "version_deleted",
          appVersion: o.appVersion,
          event: o.event
        },
        message: `Soft-deleted app version ${o.appVersion.id}.`
      };
    });
  }), Os(s.command("list").option("--app-id <app-id>", "Filter by app ID").option("--status <status>", "Filter by status: submitted, approved, or rejected").option("--channel <channel-id>", "Filter by current channel assignment")).option("--json", "Print a machine-readable result").action(async (r) => {
    await se(e, t, r, async ({ client: n }) => {
      const a = await qs(r), o = await n.versions.list({
        appId: r.appId,
        status: r.status,
        channel: r.channel,
        ...a
      });
      return {
        payload: {
          status: "versions_listed",
          appVersions: o.appVersions
        },
        message: $o(o.appVersions)
      };
    });
  }), s.command("show").argument("<version-id>", "App version UUID").option("--json", "Print a machine-readable result").action(async (r, n) => {
    await se(e, t, n, async ({ client: a }) => {
      const o = await a.versions.show(r);
      return {
        payload: {
          status: "version_shown",
          appVersion: o.appVersion
        },
        message: To(o.appVersion)
      };
    });
  });
}
async function se(e, t, s, r) {
  await O(e, t, s, r, {
    defaultErrorMessage: "Registry versions command failed",
    formatError: Eo,
    isUsageError: Po
  });
}
function Ao(e) {
  if (!e.reason?.trim()) throw new Hs("Provide a deletion reason with --reason <text>");
}
var Hs = class extends Error {
};
function Po(e) {
  return e instanceof Hs || e instanceof Ae;
}
function Eo(e) {
  if (e instanceof E) {
    const t = _o(e);
    return {
      status: t,
      message: ko(e, t),
      ...jo(e)
    };
  }
  return {
    status: "error",
    message: e instanceof Error ? e.message : "Registry versions command failed"
  };
}
function _o(e) {
  return e.code === "permission_denied" || e.code === "forbidden" || e.status === 403 ? "permission_denied" : e.code === "version_not_found" || e.status === 404 ? "version_not_found" : e.code === "version_already_deleted" ? "version_already_deleted" : e.code === "version_delete_blocked_by_channel" ? "version_delete_blocked_by_channel" : "error";
}
function ko(e, t) {
  if (t !== "version_delete_blocked_by_channel") return e.message;
  const s = Gs(e), r = s.length > 0 ? ` Blocking channels: ${s.join(", ")}.` : "";
  return `${e.message}.${r} Disconnect or reconnect the blocking channels before deleting this version.`;
}
function jo(e) {
  const t = Gs(e);
  return t.length > 0 ? { blockingChannels: t } : {};
}
function Gs(e) {
  return e instanceof Rs ? e.blockingChannelIds : [];
}
function To(e) {
  return `${e.id}
App: ${e.appId}
Status: ${e.status}
Channels: ${Ws(e)}
Title: ${e.title}`;
}
function $o(e) {
  return e.length === 0 ? "No app versions found." : C({
    columns: [
      {
        header: "VERSION ID",
        value: (t) => t.id,
        color: b.id
      },
      {
        header: "APP ID",
        value: (t) => t.appId,
        color: b.id
      },
      {
        header: "STATUS",
        value: (t) => t.status,
        color: Co
      },
      {
        header: "CHANNELS",
        value: Ws
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
function Co(e) {
  const t = e.trim();
  return t === "approved" ? b.success(e) : t === "rejected" ? b.warning(e) : e;
}
function Ws(e) {
  return e.channels && e.channels.length > 0 ? e.channels.map((t) => t.channelId).join(",") : "-";
}
async function Uo(e, t = {}) {
  const s = `${e} ${t.defaultValue === !1 ? "[y/N]" : "[Y/n]"} `, r = Ft({
    input: Jt,
    output: zt
  });
  try {
    const n = (await r.question(s)).trim().toLowerCase();
    return n ? n === "y" || n === "yes" : t.defaultValue !== !1;
  } finally {
    r.close();
  }
}
async function xo(e, t = {}) {
  const s = `${e}${t.defaultValue ? ` [${t.defaultValue}]` : ""} `, r = Ft({
    input: Jt,
    output: zt
  });
  try {
    return (await r.question(s)).trim() || t.defaultValue || "";
  } finally {
    r.close();
  }
}
var Qs = x(ar(), ".config", "primer-registry"), ce = x(Qs, "session.json");
async function Mo() {
  return ze(ce) ? JSON.parse(await I(ce, "utf8")) : null;
}
async function Oo(e) {
  await Bt(Qs, {
    recursive: !0,
    mode: 448
  }), await Ge(ce, JSON.stringify(e, null, 2), { mode: 384 }), await Zs(ce, 384);
}
async function qo() {
  await tr(ce, { force: !0 });
}
var No = "x-registry-cli-version", Ys = "0.2.0";
function Do(e = {}) {
  const t = {
    now: () => Date.now(),
    openBrowser: Vo,
    readSession: Mo,
    removeSession: qo,
    request: da,
    saveSession: Oo,
    sleep: Bo,
    write: (s) => console.log(s),
    confirm: Uo,
    promptText: xo,
    ...e
  };
  return {
    ...t,
    request: Lo(t.request)
  };
}
function Lo(e) {
  return (t, s, r) => e(t, s, {
    ...r,
    headers: {
      ...r?.headers,
      [No]: Ys
    }
  });
}
function Vo(e) {
  const t = process.platform === "darwin" ? "open" : process.platform === "win32" ? "cmd" : "xdg-open", s = process.platform === "win32" ? [
    "/c",
    "start",
    "",
    e
  ] : [e];
  return new Promise((r) => {
    const n = nr(t, s, {
      detached: !0,
      stdio: "ignore"
    });
    n.once("error", () => r(!1)), n.once("spawn", () => {
      n.unref(), r(!0);
    });
  });
}
function Bo(e) {
  return new Promise((t) => setTimeout(t, e));
}
function Fo(e = {}) {
  const t = Do(e), s = new Xs().name("registry").description("Primer Registry HTTP publishing CLI").version(Ys, "-V, --version", "Output the current version").option("-u, --registry-url <url>", "Registry URL").option("--token <access-token>", "Registry access token").option("--json", "Print machine-readable JSON output");
  return la(s, t), Bi(s, t), qa(s, t), Ji(s, t), Xi(s, t), ao(s, t), mo(s, t), di(s, t), za(s, t), ti(s, t), Io(s, t), Ai(s, t), zi(s, t), ba(s, t), s;
}
process.env.NODE_ENV !== "test" && await Fo().parseAsync().catch((e) => {
  console.error(e instanceof Error ? e.message : String(e)), process.exitCode = 1;
});
