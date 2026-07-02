#!/usr/bin/env node
import { Command as tr } from "commander";
import { z as i } from "zod";
import { access as Ht, chmod as sr, mkdir as Gt, readFile as I, readdir as rr, rm as nr, stat as Ee, writeFile as Ke } from "node:fs/promises";
import { dirname as ar, isAbsolute as He, join as B, relative as ir, resolve as T } from "node:path";
import { existsSync as Ge } from "node:fs";
import { spawn as or } from "node:child_process";
import { createInterface as Wt } from "node:readline/promises";
import { stdin as Qt, stdout as Yt } from "node:process";
import { homedir as cr } from "node:os";
import "node:module";
var dr = Object.create, Kt = Object.defineProperty, lr = Object.getOwnPropertyDescriptor, ur = Object.getOwnPropertyNames, pr = Object.getPrototypeOf, mr = Object.prototype.hasOwnProperty, fr = (e, t) => () => (t || (e((t = { exports: {} }).exports, t), e = null), t.exports), hr = (e, t, s, r) => {
  if (t && typeof t == "object" || typeof t == "function")
    for (var n = ur(t), a = 0, o = n.length, c; a < o; a++)
      c = n[a], !mr.call(e, c) && c !== s && Kt(e, c, {
        get: ((d) => t[d]).bind(null, c),
        enumerable: !(r = lr(t, c)) || r.enumerable
      });
  return e;
}, gr = (e, t, s) => (s = e != null ? dr(pr(e)) : {}, hr(t || !e || !e.__esModule ? Kt(s, "default", {
  value: e,
  enumerable: !0
}) : s, e));
var Xt = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/, g = i.string().max(80).regex(Xt, "must be a safe app ID"), N = i.uuid(), Xe = i.uuid();
function yr(e) {
  return e.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").replace(/-{2,}/g, "-").slice(0, 80).replace(/-+$/g, "");
}
var wr = [
  "submitted",
  "approved",
  "rejected"
], Se = i.enum(wr), br = ["prod", "staging"], L = i.enum(br), vr = i.object({
  id: i.string().min(1),
  registryUrl: i.url(),
  materialized: i.boolean(),
  sourceManifestPath: i.string().min(1).optional()
}), Rr = ["owner", "member"], ue = i.enum(Rr).describe("Role granted to a user on a claimed app."), Ze = i.object({
  channelId: L.describe("Distribution channel receiving this version."),
  appId: g.describe("Stable app identifier for this assignment."),
  appVersionId: N.describe("Version currently connected to the channel."),
  updatedAt: i.iso.datetime().nullable().describe("Time the channel assignment last changed.")
}).describe("Current app version assigned to a distribution channel."), Z = i.object({
  id: N.describe("Stable app version identifier."),
  appId: g.describe("Stable app identifier that owns this version."),
  title: i.string().min(1),
  tags: i.array(i.string()),
  primerSdkVersion: i.string().nullable(),
  status: Se.describe("Review lifecycle state for this version."),
  channels: i.array(Ze).default([]).describe("Channels currently connected to this version.")
}).describe("Submitted app version and its review state.");
var k = i.string().trim().min(1).max(500).describe("Short audit reason recorded with the change."), et = "channels.write:", Zt = "apps.members.read:", es = "apps.members.write:", _e = "tokens.read:", ke = "tokens.update:", je = "tokens.delete:", Te = "tokens.permissions.write:", Sr = [
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
], Ir = [
  "apps.claim",
  "apps.delete",
  "versions.publish",
  "versions.reserved.read",
  "versions.reserved.write",
  "versions.delete",
  "versions.review",
  "allowlist.read",
  "users.read"
], ts = [
  "read",
  "write",
  "reviewer",
  "admin",
  "testing"
], oc = i.enum(ts), Ar = i.enum(Sr), Pr = i.enum(Ir), tt = i.custom((e) => ss(e), "Expected channels.write:<channel-slug>"), Er = i.custom((e) => xr(e), "Expected apps.members.read:<app-id> or apps.members.write:<app-id>"), cc = i.custom((e) => ns(e), "Expected apps.members.read:<app-id>"), dc = i.custom((e) => as(e), "Expected apps.members.write:<app-id>"), _r = i.custom((e) => Ur(e), "Expected a token-scoped Registry permission"), lc = i.custom((e) => me(e, _e), "Expected tokens.read:<token-id>"), uc = i.custom((e) => me(e, ke), "Expected tokens.update:<token-id>"), pc = i.custom((e) => me(e, je), "Expected tokens.delete:<token-id>"), mc = i.custom((e) => me(e, Te), "Expected tokens.permissions.write:<token-id>"), Ie = i.union([
  Ar,
  tt,
  Er,
  _r
]), st = i.union([Pr, tt]), pt = /* @__PURE__ */ new Map([
  ["apps.claim", 0],
  ["apps.delete", 1],
  [Zt, 2],
  [es, 3],
  ["versions.publish", 4],
  ["versions.reserved.read", 5],
  ["versions.reserved.write", 6],
  ["versions.delete", 7],
  ["versions.review", 8],
  [et, 9],
  ["allowlist.read", 10],
  ["allowlist.write", 11],
  ["users.read", 12],
  ["users.permissions.read", 13],
  ["users.permissions.write", 14],
  ["sessions.revoke", 15],
  ["tokens.create", 16],
  [_e, 17],
  [ke, 18],
  [je, 19],
  [Te, 20]
]);
function mt(e) {
  const t = kr(e);
  return t ? [pt.get(t) ?? 0, e] : [pt.get(e) ?? Number.MAX_SAFE_INTEGER, e];
}
function kr(e) {
  if (ss(e)) return et;
  if (e.startsWith("apps.members.read:")) return Zt;
  if (e.startsWith("apps.members.write:")) return es;
  if (e.startsWith("tokens.read:")) return _e;
  if (e.startsWith("tokens.update:")) return ke;
  if (e.startsWith("tokens.delete:")) return je;
  if (e.startsWith("tokens.permissions.write:")) return Te;
}
function ss(e) {
  if (typeof e != "string" || !e.startsWith("channels.write:")) return !1;
  const t = e.slice(15);
  return Xt.test(t);
}
function jr(e) {
  return tt.parse(`${et}${e}`);
}
function F(e) {
  return Array.from(new Set(e.map((t) => Ie.parse(t)))).sort((t, s) => {
    const [r, n] = mt(t), [a, o] = mt(s);
    return r - a || n.localeCompare(o);
  });
}
function rs(e) {
  return F((Array.isArray(e) ? e : [e]).flatMap((t) => t.split(",")).map((t) => t.trim()).filter(Boolean));
}
function Tr(e) {
  return F(e).map((t) => st.parse(t));
}
function rt(e) {
  return rs(e).map((t) => st.parse(t));
}
function $r(e, t = {}) {
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
        ...Ne(s ?? ["staging", "prod"])
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
        ...Ne(s ?? ["staging", "prod"]),
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
        ...Ne(s ?? ["staging"])
      ]);
  }
}
var Cr = i.array(Ie).transform(F), pe = i.array(st).transform(Tr);
function Ne(e) {
  return e.map(jr);
}
function xr(e) {
  return ns(e) || as(e);
}
function ns(e) {
  return typeof e != "string" ? !1 : e.startsWith("apps.members.read:") && g.safeParse(e.slice(18)).success;
}
function as(e) {
  return typeof e != "string" ? !1 : e.startsWith("apps.members.write:") && g.safeParse(e.slice(19)).success;
}
function Ur(e) {
  return [
    _e,
    ke,
    je,
    Te
  ].some((t) => me(e, t));
}
function me(e, t) {
  return typeof e == "string" && e.startsWith(t) && Or(e.slice(t.length));
}
function Or(e) {
  return /^[A-Za-z0-9][A-Za-z0-9_-]*$/.test(e);
}
var ae = ts, Ae = {
  email: "email",
  domain: "domain"
}, V = {
  listed: "listed",
  found: "found",
  created: "created",
  enabled: "enabled",
  disabled: "disabled",
  updated: "updated",
  revoked: "revoked"
}, Mr = [
  V.created,
  V.enabled,
  V.disabled
], ft = i.enum(ae).describe("Named shortcut expanded to concrete Registry user permissions."), is = i.enum([Ae.email, Ae.domain]).describe("Whether an allowlist entry matches one email or an email domain."), os = i.object({
  id: i.string().min(1).describe("Stable email allowlist entry identifier."),
  entryType: is,
  value: i.string().min(1).describe("Email address or domain matched by the entry."),
  description: i.string().nullable().describe("Optional admin note for the entry."),
  disabledAt: i.iso.datetime().nullable().describe("Time the entry was disabled, if inactive."),
  createdAt: i.iso.datetime().describe("Time the entry was created."),
  updatedAt: i.iso.datetime().describe("Time the entry last changed.")
}).describe("Email allowlist entry used for Registry account access."), fc = i.object({
  entryType: is,
  value: i.string().trim().min(1).max(320),
  description: i.string().trim().max(500).optional().nullable(),
  reason: k
}), hc = i.object({
  enabled: i.boolean(),
  reason: k
}), Nr = i.object({
  status: i.literal(V.listed),
  entries: i.array(os)
}), ht = i.object({
  status: i.enum(Mr),
  entry: os
}), nt = i.object({
  id: i.string().min(1).describe("Stable Registry user identifier."),
  email: i.email().nullable().describe("User email address, when available."),
  permissions: Cr.describe("Concrete Registry permissions granted to the user.")
}).describe("Registry user visible to admin workflows."), qr = i.object({
  status: i.literal(V.listed),
  users: i.array(nt)
}), gt = i.object({
  status: i.literal(V.found),
  user: nt
}), gc = i.object({
  grantPermissions: i.array(Ie).optional().default([]),
  revokePermissions: i.array(Ie).optional().default([]),
  grantPreset: ft.optional(),
  revokePreset: ft.optional(),
  reason: k
}).refine((e) => e.grantPermissions.length > 0 || e.revokePermissions.length > 0 || !!e.grantPreset || !!e.revokePreset, { message: "Grant or revoke at least one permission or preset." }), Dr = i.object({
  status: i.literal(V.updated),
  user: nt,
  revokedSessionCount: i.number().int().nonnegative().describe("Number of user sessions revoked after permissions were removed.")
}), yc = i.object({ reason: k }), Lr = i.object({
  status: i.literal(V.revoked),
  userId: i.string().min(1).describe("Stable Registry user identifier."),
  revokedSessionCount: i.number().int().nonnegative().describe("Number of user sessions revoked.")
}), Vr = class {
  transport;
  constructor(e) {
    this.transport = e;
  }
  listEmailAllowlistEntries() {
    return this.transport.request("/api/admin/email-allowlist", Nr);
  }
  createEmailAllowlistEntry(e) {
    return this.transport.request("/api/admin/email-allowlist", ht, {
      method: "POST",
      body: e
    });
  }
  updateEmailAllowlistEntry(e, t) {
    return this.transport.request(`/api/admin/email-allowlist/${encodeURIComponent(e)}`, ht, {
      method: "PATCH",
      body: t
    });
  }
  listUsers() {
    return this.transport.request("/api/admin/users", qr);
  }
  getUser(e) {
    return this.transport.request(`/api/admin/users/${encodeURIComponent(e)}`, gt);
  }
  getUserByEmail(e) {
    const t = new URLSearchParams({ email: e });
    return this.transport.request(`/api/admin/users?${t}`, gt);
  }
  updateUserPermissions(e, t) {
    return this.transport.request(`/api/admin/users/${encodeURIComponent(e)}`, Dr, {
      method: "PATCH",
      body: t
    });
  }
  revokeUserSessions(e, t) {
    return this.transport.request(`/api/admin/users/${encodeURIComponent(e)}/revoke-sessions`, Lr, {
      method: "POST",
      body: t
    });
  }
}, cs = i.discriminatedUnion("exists", [i.object({
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
    role: ue.describe("Current account role on the claimed app.")
  }), i.object({
    claimedByCurrentUser: i.literal(!1).describe("Whether the current account has this claim."),
    role: i.null().describe("No app role is available for the current account.")
  })])
})]), Br = i.object({
  appId: g.describe("Stable app identifier being checked."),
  available: i.boolean().describe("Whether this app ID can be claimed."),
  exists: i.boolean().describe("Whether the app is already claimed.")
}), Fr = i.object({ apps: i.array(i.object({
  appId: g.describe("Stable app identifier."),
  visibility: i.enum(["private", "public"]).describe("Registry app visibility."),
  status: i.enum(["active", "deleted"]).describe("Registry app lifecycle status."),
  latestVersionId: i.string().nullable().describe("Latest non-deleted app version ID, when one exists.")
})) }), wc = i.object({
  appId: g.describe("Stable app identifier to claim."),
  title: i.string().trim().min(1)
}), zr = i.object({
  appId: g.describe("Stable app identifier that was claimed."),
  created: i.boolean().describe("Whether a new app claim was created."),
  role: ue.describe("Role assigned to the acting app claimant.")
}), bc = i.object({
  reason: k,
  force: i.literal(!1).optional().describe("Hard delete is deferred and unsupported.")
}), Jr = i.object({
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
function ds(e = {}, t = new URLSearchParams()) {
  return e.query && t.set("query", JSON.stringify(e.query)), e.includeReserved && t.set("includeReserved", "true"), t;
}
function se(e, t) {
  return t.size ? `${e}?${t}` : e;
}
var S = encodeURIComponent, R = {
  apps: {
    collection: () => "/api/apps",
    item: (e) => `/api/apps/${S(e)}`,
    availability: (e) => `/api/apps/${S(e)}/availability`,
    history: (e) => `/api/apps/${S(e)}/history`,
    versions: (e, t = new URLSearchParams()) => se(`/api/apps/${S(e)}/versions`, t)
  },
  versions: {
    collection: (e = new URLSearchParams()) => se("/api/versions", e),
    item: (e) => `/api/versions/${S(e)}`,
    approve: (e) => `/api/versions/${S(e)}/approve`,
    reject: (e) => `/api/versions/${S(e)}/reject`,
    history: (e) => `/api/versions/${S(e)}/history`
  },
  channels: {
    collection: () => "/api/channels",
    item: (e, t = new URLSearchParams()) => se(`/api/channels/${S(e)}`, t),
    versions: (e, t = new URLSearchParams()) => se(`/api/channels/${S(e)}/versions`, t),
    version: (e, t) => `/api/channels/${S(e)}/versions/${S(t)}`,
    rollback: (e) => `/api/channels/${S(e)}/rollback`,
    history: (e, t = new URLSearchParams()) => se(`/api/channels/${S(e)}/history`, t)
  }
}, Hr = class {
  transport;
  constructor(e) {
    this.transport = e;
  }
  get(e) {
    return this.transport.request(R.apps.item(e), cs);
  }
  availability(e) {
    return this.transport.request(R.apps.availability(e), Br);
  }
  list() {
    return this.transport.request(R.apps.collection(), Fr);
  }
  create(e) {
    return this.transport.request(R.apps.collection(), zr, {
      method: "POST",
      body: e
    });
  }
  delete(e, t) {
    return this.transport.request(R.apps.item(e), Jr, {
      method: "DELETE",
      body: t
    });
  }
}, at = i.object({
  userId: i.string().min(1).describe("Stable user identifier for the authenticated account."),
  email: i.email().nullable().describe("Account email address, when available.")
}).describe("Authenticated Registry account returned to the CLI."), Gr = i.object({
  deviceCode: i.string().min(32),
  userCode: i.string().min(4),
  verificationUri: i.url(),
  verificationUriComplete: i.url(),
  expiresIn: i.number().int().positive(),
  interval: i.number().int().positive()
}), vc = i.object({ deviceCode: i.string().min(32) }), Wr = i.discriminatedUnion("status", [i.object({ status: i.literal("pending") }), i.object({
  status: i.literal("approved"),
  accessToken: i.string().min(1),
  expiresIn: i.number().int().positive(),
  refreshToken: i.string().min(32),
  account: at
})]), Rc = i.object({ refreshToken: i.string().min(32) }), Qr = i.object({
  accessToken: i.string().min(1),
  expiresIn: i.number().int().positive(),
  refreshToken: i.string().min(32),
  account: at
}), Yr = i.object({ account: at }), Sc = i.object({ refreshToken: i.string().min(32).optional() }), Ic = i.object({ userCode: i.string().min(4) }), Kr = class {
  transport;
  constructor(e) {
    this.transport = e;
  }
  start() {
    return this.transport.request("/api/cli/auth/start", Gr, { method: "POST" });
  }
  poll(e) {
    return this.transport.request("/api/cli/auth/poll", Wr, {
      method: "POST",
      body: e
    });
  }
  refresh(e) {
    return this.transport.request("/api/cli/auth/refresh", Qr, {
      method: "POST",
      body: e
    });
  }
  whoami() {
    return this.transport.request("/api/cli/auth/whoami", Yr);
  }
  revoke(e = {}) {
    return this.transport.requestJson("/api/cli/auth/revoke", {
      method: "POST",
      body: e
    });
  }
}, Xr = "index.html", ve = "manifest.json";
var Zr = ".registry-assets/";
function yt(e) {
  return sn(Zr, e, "registryAssets.source");
}
function en(e, t) {
  if (!e.startsWith(t)) throw new Error(`Object key is outside expected prefix: ${e}`);
  tn(e);
}
function tn(e) {
  if (e.startsWith("/") || e.includes("\\")) throw new Error(`Unsafe object key: ${e}`);
  for (const t of e.split("/")) if (t === ".." || t === ".") throw new Error(`Unsafe object key segment: ${e}`);
}
function ee(e, t = "relativePath") {
  if (!e || e.startsWith("/") || /^[a-z][a-z0-9+.-]*:/i.test(e) || e.includes("\\")) throw new Error(`${t} must be a safe relative path`);
  for (const s of e.split("/")) if (!s || s === "." || s === "..") throw new Error(`${t} must be a safe relative path`);
}
function sn(e, t, s) {
  ee(t, s);
  const r = `${e}${t}`;
  return en(r, e), r;
}
var ls = i.string().trim().min(1), $e = i.string().trim().min(1).regex(/^[a-zA-Z0-9][a-zA-Z0-9._-]*$/), Ce = i.object({
  id: $e,
  source: i.string().trim().min(1).optional(),
  registryUrl: i.url().optional()
}).refine((e) => !!(e.source || e.registryUrl), { message: "registryAssets entries must include source or registryUrl" }), rn = i.object({ assets: i.array(Ce) }), us = i.object({
  title: i.string().trim().min(1),
  appId: g.optional(),
  tags: i.array(ls).default([]),
  primerSdkVersion: i.string().trim().min(1).nullable().optional(),
  thumbnailAssetId: $e.optional(),
  registryAssets: i.unknown().optional(),
  registryAssetsModule: i.string().trim().min(1).optional()
}).passthrough(), nn = us.superRefine((e, t) => {
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
function xe(e) {
  const t = nn.parse(e);
  t.registryAssetsModule && ee(t.registryAssetsModule, "registryAssetsModule");
  const s = t.primerSdkVersion ?? null;
  return {
    title: t.title,
    appId: t.appId,
    tags: t.tags,
    primerSdkVersion: s,
    thumbnailAssetId: t.thumbnailAssetId,
    registryAssets: dn(t.registryAssets),
    registryAssetsModule: t.registryAssetsModule
  };
}
function an(e) {
  let t;
  try {
    t = JSON.parse(e);
  } catch {
    throw new Error("manifest.json must be valid JSON");
  }
  return xe(t);
}
function ps(e) {
  const t = rn.parse(e);
  return ms(t.assets), t;
}
function on(e) {
  let t;
  try {
    t = JSON.parse(e);
  } catch {
    throw new Error("Registry assets manifest must be valid JSON");
  }
  return ps(t);
}
function ie(e, t = "source") {
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
    return ee(e, t), {
      kind: "artifactPath",
      path: e
    };
  }
}
function cn(e, t = "registryUrl") {
  const s = new URL(e);
  if (s.protocol !== "https:" || s.username || s.password) throw new Error(`${t} must be an HTTPS URL`);
  return s.toString();
}
function it(e) {
  const t = i.array(Ce).parse(e);
  return ms(t), t;
}
function dn(e) {
  if (e === void 0) return { kind: "none" };
  if (typeof e == "string") return {
    kind: "files",
    paths: [wt(e)]
  };
  if (!Array.isArray(e)) throw new Error("registryAssets must be a path, path array, or inline asset array");
  if (e.length === 0) return {
    kind: "inline",
    assets: []
  };
  if (e.every((t) => typeof t == "string")) return {
    kind: "files",
    paths: e.map((t) => wt(t))
  };
  if (e.every((t) => typeof t == "object" && t !== null && !Array.isArray(t))) return {
    kind: "inline",
    assets: it(e)
  };
  throw new Error("registryAssets arrays cannot mix manifest paths and inline assets");
}
function wt(e) {
  return ee(e, "registryAssets"), e;
}
function ms(e) {
  for (const t of e)
    t.source && ie(t.source, "source"), t.registryUrl && cn(t.registryUrl, "registryUrl");
}
var fs = i.object({
  id: $e,
  registryUrl: i.url()
}), ln = i.object({
  appId: g,
  assets: i.array(fs)
}), Ac = i.object({
  assets: i.array(Ce).min(1),
  files: i.array(i.object({
    path: i.string().min(1),
    size: i.number().int().nonnegative(),
    contentType: i.string().min(1)
  }))
}), un = i.object({
  appId: g,
  uploadId: Xe,
  expiresAt: i.iso.datetime(),
  files: i.array(i.object({
    path: i.string().min(1),
    method: i.literal("PUT"),
    url: i.url(),
    headers: i.record(i.string().min(1), i.string())
  }))
}), pn = i.enum([
  "materialized",
  "current",
  "repaired",
  "validated"
]), Pc = i.object({ assets: i.array(Ce).min(1) }), mn = i.object({
  appId: g,
  assets: i.array(fs.extend({ action: pn }))
}), fn = class {
  transport;
  constructor(e) {
    this.transport = e;
  }
  list(e) {
    return this.transport.request(`/api/apps/${encodeURIComponent(e)}/assets`, ln);
  }
  createUpload(e, t) {
    return this.transport.request(`/api/apps/${encodeURIComponent(e)}/assets/uploads`, un, {
      method: "POST",
      body: t
    });
  }
  completeUpload(e, t, s) {
    return this.transport.request(`/api/apps/${encodeURIComponent(e)}/assets/uploads/${encodeURIComponent(t)}/complete`, mn, {
      method: "POST",
      body: s
    });
  }
}, hn = i.object({
  id: g,
  title: i.string().trim().min(1),
  tags: i.array(ls),
  primerSdkVersion: i.string().nullable(),
  versionRootUrl: i.url(),
  thumbnailUrl: i.url().nullable()
});
function v(e, t, s, r = {}) {
  return {
    code: e,
    message: t,
    path: s,
    ...r
  };
}
var gn = i.union([
  i.string(),
  i.number(),
  i.boolean(),
  i.null()
]), oe = i.lazy(() => i.union([
  gn,
  i.array(oe),
  i.record(i.string(), oe)
])), Ec = i.record(i.string(), oe), hs = [
  "eq",
  "ne",
  "in",
  "nin",
  "contains",
  "exists",
  "matches"
], gs = i.enum(hs), ys = i.strictObject({
  pointer: i.string(),
  op: gs,
  value: oe.optional()
}), qe = i.lazy(() => i.union([
  ys,
  i.strictObject({ all: i.array(qe) }),
  i.strictObject({ any: i.array(qe) }),
  i.strictObject({ not: qe })
]));
function yn(e, t) {
  const s = t.allowedPointers;
  return s ? typeof s == "function" ? s(e) : s.includes(e) : !0;
}
function wn(e, t, s) {
  const r = s.allowedOperators;
  return r ? typeof r == "function" ? r(e, t) : r.includes(e) : !0;
}
function bn(e) {
  return {
    success: !0,
    data: e
  };
}
function vn(e) {
  return {
    success: !1,
    error: e
  };
}
var ws = /^(?:\/(?:[^~/]|~0|~1)*)*$/, _c = i.string().nonempty().regex(ws);
function Rn(e) {
  return ws.test(e);
}
var Sn = new Set(ys.keyof().options), In = /* @__PURE__ */ new Set([
  "eq",
  "ne",
  "in",
  "nin",
  "contains",
  "matches"
]);
function An(e, t = {}) {
  const s = [], r = ot(e, [], s, t);
  return s.length > 0 || r === void 0 ? vn(s) : bn(r);
}
function ot(e, t, s, r) {
  if (!En(e)) {
    s.push(v("invalid_expr", "RQL expr must be an object.", t));
    return;
  }
  const n = [
    "all",
    "any",
    "not"
  ].filter((o) => o in e), a = "pointer" in e || "op" in e;
  if (n.length > 0 && a) {
    s.push(v("invalid_composition", "RQL expr cannot mix predicate and composition keys.", t));
    return;
  }
  if (n.length > 1) {
    s.push(v("invalid_composition", "RQL expr must use only one composition key.", t));
    return;
  }
  if (n[0] === "all") return bt(e.all, "all", t, s, r);
  if (n[0] === "any") return bt(e.any, "any", t, s, r);
  if (n[0] === "not") {
    const o = ot(e.not, [...t, "not"], s, r);
    return o === void 0 ? void 0 : { not: o };
  }
  return Pn(e, t, s, r);
}
function bt(e, t, s, r, n) {
  if (!Array.isArray(e)) {
    r.push(v("invalid_composition", `RQL ${t} composition must be an array.`, [...s, t]));
    return;
  }
  if (e.length === 0) {
    r.push(v("empty_composition", `RQL ${t} composition must contain at least one expr.`, [...s, t]));
    return;
  }
  const a = e.map((o, c) => ot(o, [
    ...s,
    t,
    String(c)
  ], r, n)).filter((o) => o !== void 0);
  if (a.length === e.length)
    return t === "all" ? { all: a } : { any: a };
}
function Pn(e, t, s, r) {
  const n = Object.keys(e).filter((h) => !Sn.has(h));
  if (n.length > 0) {
    s.push(v("invalid_expr", `Unknown RQL predicate keys: ${n.join(", ")}.`, t));
    return;
  }
  const a = e.pointer, o = e.op, c = gs.safeParse(o);
  let d = !1;
  if (typeof a != "string" ? s.push(v("invalid_pointer", "RQL predicate pointer must be a JSON Pointer string.", [...t, "pointer"])) : Rn(a) ? a === "" ? s.push(v("root_pointer_disallowed", "RQL predicates cannot target the root JSON Pointer.", [...t, "pointer"], { pointer: a })) : yn(a, r) ? d = !0 : s.push(v("pointer_not_allowed", "RQL predicate pointer is not allowed by policy.", [...t, "pointer"], { pointer: a })) : s.push(v("invalid_pointer", "RQL predicate pointer must use RFC 6901 JSON Pointer syntax.", [...t, "pointer"], { pointer: a })), c.success ? typeof a == "string" && d && !wn(c.data, a, r) && s.push(v("operator_not_allowed", "RQL predicate operator is not allowed by policy.", [...t, "op"], {
    pointer: a,
    op: c.data
  })) : s.push(v("unknown_operator", "RQL predicate operator is not supported.", [...t, "op"], { op: String(o) })), !c.success || typeof a != "string") return;
  const l = c.data, u = Object.hasOwn(e, "value");
  l === "exists" && u && s.push(v("unexpected_value", "RQL exists predicates must not include a value.", [...t, "value"], {
    pointer: a,
    op: l
  })), In.has(l) && !u && s.push(v("missing_value", `RQL ${l} predicates require a value.`, [...t, "value"], {
    pointer: a,
    op: l
  }));
  const p = e.value;
  if (u && !oe.safeParse(p).success && s.push(v("invalid_value", "RQL predicate value must be JSON-serializable.", [...t, "value"], {
    pointer: a,
    op: l
  })), (l === "in" || l === "nin") && u && !Array.isArray(p) && s.push(v("invalid_value", `RQL ${l} predicates require an array value.`, [...t, "value"], {
    pointer: a,
    op: l
  })), l === "matches" && u && typeof p != "string" && s.push(v("invalid_value", "RQL matches predicates require a string regex pattern value.", [...t, "value"], {
    pointer: a,
    op: l
  })), l === "matches" && typeof p == "string" && r.maxRegexPatternLength !== void 0 && p.length > r.maxRegexPatternLength && s.push(v("regex_pattern_too_long", "RQL matches pattern exceeds the policy maximum length.", [...t, "value"], {
    pointer: a,
    op: l
  })), s.length === 0 || !vt(s, t)) {
    const h = u ? {
      pointer: a,
      op: l,
      value: p
    } : {
      pointer: a,
      op: l
    }, b = r.validateValue?.({
      pointer: a,
      op: l,
      value: p,
      predicate: h,
      path: t
    });
    (b === !1 || typeof b == "string") && s.push(v("value_rejected", typeof b == "string" ? b : "RQL predicate value is not allowed by policy.", [...t, "value"], {
      pointer: a,
      op: l
    }));
  }
  if (!vt(s, t))
    return u ? {
      pointer: a,
      op: l,
      value: p
    } : {
      pointer: a,
      op: l
    };
}
function vt(e, t) {
  return e.some((s) => t.every((r, n) => s.path[n] === r));
}
function En(e) {
  return typeof e == "object" && e !== null && !Array.isArray(e);
}
var _n = {
  allowedPointers: [
    "/appId",
    "/id",
    "/primerSdkVersion",
    "/status",
    "/tags",
    "/title"
  ],
  allowedOperators: (e, t) => $n[t]?.includes(e) ?? !1,
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
}, Re = i.lazy(() => i.union([
  i.object({
    pointer: i.string(),
    op: i.enum(hs),
    value: i.any().optional()
  }),
  i.object({ all: i.array(Re) }),
  i.object({ any: i.array(Re) }),
  i.object({ not: Re })
])), kn = Re.superRefine((e, t) => {
  const s = An(e, _n);
  if (!s.success)
    for (const r of s.error) t.addIssue({
      code: "custom",
      message: r.message,
      path: r.path
    });
}), jn = i.preprocess((e) => {
  if (typeof e != "string") return e;
  try {
    return JSON.parse(e);
  } catch {
    return e;
  }
}, kn), Tn = i.preprocess((e) => {
  if (e !== void 0)
    return e === !0 || e === "true" ? !0 : e === !1 || e === "false" ? !1 : e;
}, i.boolean().optional()), $n = {
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
}, Cn = i.object({ query: jn.describe("Registry RQL expr encoded as JSON.").optional() }), xn = Cn.extend({ includeReserved: Tn.describe("Include registry-reserved versions.").optional() }), Un = i.object({
  channel: i.object({ id: L.describe("Stable distribution channel identifier.") }),
  apps: i.array(hn)
}), On = i.object({ channels: i.array(i.object({ id: L.describe("Stable distribution channel identifier.") })) }), Mn = i.object({
  channel: i.object({ id: L.describe("Stable distribution channel identifier.") }).optional(),
  assignments: i.array(Ze)
}), kc = i.object({
  appVersionId: N.describe("Version to connect to the channel."),
  reason: k.optional()
}).describe("Assigns a channel to a specific app version."), jc = i.object({ reason: k.optional() }).describe("Removes the current app version assignment from a channel."), Nn = ["rolled_back", "dry_run"], Rt = i.object({
  channel: i.object({ id: L.describe("Stable distribution channel identifier.") }),
  appVersion: Z
}), Tc = i.object({
  appId: g.describe("Stable app identifier whose channel is rolled back."),
  toVersionId: N.describe("Specific version to reconnect, if selected.").optional(),
  reason: k.optional(),
  dryRun: i.boolean().describe("Preview rollback eligibility without changing the channel.").optional()
}), qn = i.object({
  status: i.enum(Nn).describe("Whether rollback was applied or previewed."),
  channel: i.object({ id: L.describe("Stable distribution channel identifier.") }),
  currentAssignment: Ze.describe("Assignment before rollback is applied."),
  targetAppVersion: Z.describe("Version selected as the rollback target."),
  eligibility: i.object({
    channelId: L.describe("Channel evaluated for rollback."),
    targetStatus: Se.describe("Review state of the rollback target."),
    allowedStatuses: i.array(Se).describe("Version states allowed on this channel.")
  }),
  reason: k.optional()
}), Dn = class {
  transport;
  constructor(e) {
    this.transport = e;
  }
  list() {
    return this.transport.request(R.channels.collection(), On);
  }
  get(e, t = {}) {
    return this.transport.request(R.channels.item(e, ds(t)), Un);
  }
  assignments(e, t = {}) {
    const s = new URLSearchParams();
    return t.appId && s.set("appId", t.appId), this.transport.request(R.channels.versions(e, s), Mn);
  }
  connect(e, t) {
    return this.transport.request(R.channels.versions(e), Rt, {
      method: "POST",
      body: t
    });
  }
  disconnect(e, t, s = {}) {
    return this.transport.request(R.channels.version(e, t), Rt, {
      method: "DELETE",
      body: s
    });
  }
  rollback(e, t) {
    return this.transport.request(R.channels.rollback(e), qn, {
      method: "POST",
      body: t
    });
  }
}, Ln = i.enum([
  "version_submitted",
  "version_approved",
  "version_rejected",
  "version_deleted",
  "channel_connected",
  "channel_disconnected",
  "channel_reconnected"
]).describe("Audit event kind for version review and channel changes."), Vn = i.object({
  eventId: i.string().min(1).describe("Stable audit event identifier."),
  eventType: Ln,
  appId: g.describe("Stable app identifier for the event."),
  appVersionId: N.nullable().describe("Version affected by the event, when any."),
  channelId: L.nullable().describe("Channel affected by the event, when any."),
  actorUserId: i.string().min(1).nullable().describe("User ID that performed the event."),
  actorEmail: i.email().nullable().describe("Email for the actor, when available."),
  reason: i.string().nullable().describe("Audit reason recorded with the event."),
  previousAppVersionId: N.nullable().describe("Prior channel version, when changed."),
  nextAppVersionId: N.nullable().describe("Next channel version, when changed."),
  createdAt: i.iso.datetime().describe("Time the audit event was recorded.")
}).describe("Audit event for version review or channel assignment changes."), De = i.object({ events: i.array(Vn) }), Bn = class {
  transport;
  constructor(e) {
    this.transport = e;
  }
  app(e) {
    return this.transport.request(R.apps.history(e), De);
  }
  version(e) {
    return this.transport.request(R.versions.history(e), De);
  }
  channel(e, t) {
    const s = new URLSearchParams({ appId: t.appId });
    return this.transport.request(R.channels.history(e, s), De);
  }
}, bs = i.object({
  userId: i.string().min(1).describe("Stable user identifier for the member."),
  email: i.email().nullable().describe("Member email address, when available."),
  role: ue.describe("Role granted to the app member."),
  createdAt: i.iso.datetime().nullable().describe("Time the membership was created."),
  updatedAt: i.iso.datetime().nullable().describe("Time the membership last changed.")
}).describe("User membership on a claimed app."), Fn = i.object({ members: i.array(bs) }), $c = i.object({
  email: i.email().optional(),
  userId: i.string().min(1).describe("Stable user identifier for the member.").optional(),
  role: ue
}).refine((e) => !!e.email != !!e.userId, {
  message: "Provide exactly one member selector: email or userId",
  path: ["email"]
}), Cc = i.object({ role: ue }), St = i.object({ member: bs }), zn = class {
  transport;
  constructor(e) {
    this.transport = e;
  }
  list(e) {
    return this.transport.request(`/api/apps/${encodeURIComponent(e)}/members`, Fn);
  }
  add(e, t) {
    return this.transport.request(`/api/apps/${encodeURIComponent(e)}/members`, St, {
      method: "POST",
      body: t
    });
  }
  setRole(e, t, s) {
    return this.transport.request(`/api/apps/${encodeURIComponent(e)}/members/${encodeURIComponent(t)}`, St, {
      method: "PATCH",
      body: s
    });
  }
  async remove(e, t) {
    await this.transport.requestJson(`/api/apps/${encodeURIComponent(e)}/members/${encodeURIComponent(t)}`, { method: "DELETE" });
  }
}, Jn = [
  "created",
  "title_changed",
  "permissions_changed",
  "apps.access.granted",
  "apps.access.revoked",
  "deleted",
  "auth_failed"
], xc = i.enum(Jn), Hn = i.string().regex(/^prt_[A-Za-z0-9_-]{43}$/, "Expected a Registry access token secret"), Uc = i.object({
  title: i.string().trim().min(1).max(80).refine(vs, { message: "Title cannot contain control characters" }),
  expiresAt: i.iso.datetime({ offset: !0 }).nullable().optional(),
  permissions: pe.default([])
}), Oc = i.object({
  title: i.string().trim().min(1).max(80).refine(vs, { message: "Title cannot contain control characters" }).optional(),
  expiresAt: i.iso.datetime({ offset: !0 }).nullable().optional()
}), Mc = i.object({ permissions: pe });
function vs(e) {
  return Array.from(e).every((t) => {
    const s = t.codePointAt(0) ?? 0;
    return s > 31 && s !== 127;
  });
}
var Nc = i.object({ appId: g }), te = i.object({
  id: i.string(),
  ownerId: i.string(),
  title: i.string(),
  tokenPrefix: i.string(),
  permissions: pe,
  expiresAt: i.string().nullable(),
  deletedAt: i.string().nullable(),
  lastUsedAt: i.string().nullable(),
  createdAt: i.string(),
  updatedAt: i.string()
}), Rs = i.object({
  tokenId: i.string(),
  appId: g,
  grantedBy: i.string(),
  deletedAt: i.string().nullable(),
  createdAt: i.string(),
  updatedAt: i.string()
}), Gn = i.object({
  token: te,
  secret: Hn
}), Wn = i.object({
  token: te,
  removedPermissions: pe.optional()
}), Qn = i.object({ tokens: i.array(te) }), Yn = i.object({
  token: te,
  grants: i.array(Rs)
}), It = i.object({ grant: Rs }), ge = i.object({
  token: te.optional(),
  permissions: pe
}), Kn = i.object({ token: te }), Xn = class {
  transport;
  constructor(e) {
    this.transport = e;
  }
  create(e) {
    return this.transport.request("/api/tokens", Gn, {
      method: "POST",
      body: e
    });
  }
  list() {
    return this.transport.request("/api/tokens", Qn);
  }
  status(e) {
    return this.transport.request(`/api/tokens/${encodeURIComponent(e)}`, Yn);
  }
  update(e, t) {
    return this.transport.request(`/api/tokens/${encodeURIComponent(e)}`, Wn, {
      method: "PATCH",
      body: t
    });
  }
  listPermissions(e) {
    return this.transport.request(`/api/tokens/${encodeURIComponent(e)}/permissions`, ge);
  }
  setPermissions(e, t) {
    return this.transport.request(`/api/tokens/${encodeURIComponent(e)}/permissions`, ge, {
      method: "PUT",
      body: t
    });
  }
  addPermissions(e, t) {
    return this.transport.request(`/api/tokens/${encodeURIComponent(e)}/permissions`, ge, {
      method: "POST",
      body: t
    });
  }
  removePermissions(e, t) {
    return this.transport.request(`/api/tokens/${encodeURIComponent(e)}/permissions`, ge, {
      method: "DELETE",
      body: t
    });
  }
  grant(e, t) {
    return this.transport.request(`/api/tokens/${encodeURIComponent(e)}/apps`, It, {
      method: "POST",
      body: t
    });
  }
  ungrant(e, t) {
    return this.transport.request(`/api/tokens/${encodeURIComponent(e)}/apps`, It, {
      method: "DELETE",
      body: t
    });
  }
  delete(e) {
    return this.transport.request(`/api/tokens/${encodeURIComponent(e)}`, Kn, { method: "DELETE" });
  }
}, Zn = i.object({
  path: i.string().min(1),
  size: i.number().int().nonnegative(),
  contentType: i.string().min(1)
}), qc = i.object({
  appId: g.describe("Stable app identifier receiving the upload."),
  manifest: us.partial().optional(),
  files: i.array(Zn).min(1)
}), ea = i.object({
  uploadId: Xe.describe("Stable upload session identifier."),
  expiresAt: i.iso.datetime().describe("Time the upload URLs expire."),
  files: i.array(i.object({
    path: i.string().min(1),
    method: i.literal("PUT"),
    url: i.url(),
    headers: i.record(i.string().min(1), i.string())
  }))
}), Dc = i.object({ forceApprove: i.boolean().optional() }), ta = i.object({
  appId: g.describe("Stable app identifier for the completed upload."),
  appVersionId: N.describe("Version created from the upload."),
  status: i.enum(["submitted", "approved"]).describe("Initial review state for the uploaded version."),
  versionRootUrl: i.url(),
  registryAssets: i.array(vr).default([]),
  receipt: i.object({
    uploadId: Xe.describe("Stable upload session identifier."),
    appId: g.describe("Stable app identifier for the completed upload."),
    appVersionId: N.describe("Version created from the upload.")
  })
}), sa = class {
  transport;
  constructor(e) {
    this.transport = e;
  }
  create(e) {
    return this.transport.request("/api/uploads", ea, {
      method: "POST",
      body: e
    });
  }
  complete(e, t) {
    return this.transport.request(`/api/uploads/${encodeURIComponent(e)}/complete`, ta, {
      method: "POST",
      body: t
    });
  }
}, Lc = i.object({ reason: k.optional() }), Vc = i.object({ reason: k }), Bc = i.object({ reason: k }), Fc = xn.extend({
  appId: g.describe("Filter versions by stable app identifier.").optional(),
  status: Se.describe("Filter versions by review lifecycle state.").optional(),
  channel: L.describe("Filter versions by connected channel.").optional()
}), At = i.object({ appVersion: Z }), ra = i.object({
  appVersion: Z.extend({ deletedAt: i.iso.datetime().describe("Time this version was deleted.") }),
  event: i.object({
    eventId: i.string().min(1).describe("Stable audit event identifier."),
    eventType: i.literal("version_deleted").describe("Audit event type for the deletion."),
    actorUserId: i.string().min(1).nullable().describe("User ID that performed the deletion."),
    actorEmail: i.email().nullable().describe("Email for the actor, when available."),
    reason: i.string().min(1).describe("Audit reason recorded with the deletion."),
    createdAt: i.iso.datetime().describe("Time the audit event was recorded.")
  })
}), na = i.object({ appVersions: i.array(Z) }), aa = i.object({ appVersion: Z });
var P = class extends Error {
  status;
  code;
  rawPayload;
  constructor(e) {
    super(e.message), this.name = "RegistryHttpError", this.status = e.status, this.code = e.code, this.rawPayload = e.rawPayload;
  }
}, Ss = class {
  registryUrl;
  token;
  tokenProvider;
  fetchImplementation;
  constructor(e = {}) {
    this.registryUrl = Is(e.registryUrl), this.token = e.token, this.tokenProvider = e.tokenProvider, this.fetchImplementation = e.fetch ?? fetch;
  }
  async request(e, t, s = {}) {
    const r = await this.requestJson(e, s);
    return t.parse(r);
  }
  async requestJson(e, t = {}) {
    const s = await this.fetchImplementation(`${this.registryUrl}${ia(e)}`, {
      method: t.method || "GET",
      headers: await this.createHeaders(t.headers),
      body: t.body === void 0 ? void 0 : JSON.stringify(t.body)
    }), r = s.status === 204 ? null : await oa(s);
    if (!s.ok) throw new P({
      status: s.status,
      code: ca(r),
      message: da(r) || `Registry request failed: ${s.status}`,
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
function Is(e) {
  return (e?.trim() || "https://registry.primerlearn.dev").replace(/\/+$/, "");
}
function ia(e) {
  return e.startsWith("/") ? e : `/${e}`;
}
async function oa(e) {
  if ((e.headers.get("content-type") || "").includes("application/json")) return e.json();
  const t = await e.text();
  if (!t) return null;
  try {
    return JSON.parse(t);
  } catch {
    return t;
  }
}
function ca(e) {
  if (!e || typeof e != "object") return null;
  const t = e;
  return typeof t.code == "string" ? t.code : typeof t.error == "string" ? t.error : null;
}
function da(e) {
  if (!e || typeof e != "object") return null;
  const t = e;
  return typeof t.message == "string" ? t.message : typeof t.error == "string" ? t.error : null;
}
var As = class extends P {
  blockingChannelIds;
  constructor(e, t) {
    super({
      status: e.status,
      code: e.code,
      message: e.message,
      rawPayload: e.rawPayload
    }), this.name = "RegistryVersionDeleteBlockedError", this.blockingChannelIds = t;
  }
}, la = class {
  transport;
  constructor(e) {
    this.transport = e;
  }
  approve(e, t = {}) {
    return this.transport.request(`/api/versions/${encodeURIComponent(e)}/approve`, At, {
      method: "POST",
      body: t
    });
  }
  reject(e, t) {
    return this.transport.request(`/api/versions/${encodeURIComponent(e)}/reject`, At, {
      method: "POST",
      body: t
    });
  }
  async delete(e, t) {
    try {
      return await this.transport.request(R.versions.item(e), ra, {
        method: "DELETE",
        body: t
      });
    } catch (s) {
      throw s instanceof P && s.code === "version_delete_blocked_by_channel" ? new As(s, ua(s.rawPayload)) : s;
    }
  }
  list(e = {}) {
    const t = new URLSearchParams();
    e.status && t.set("status", e.status), e.channel && t.set("channel", e.channel), ds(e, t);
    const s = e.appId, r = s ? R.apps.versions(s, t) : R.versions.collection(t);
    return this.transport.request(r, na);
  }
  show(e) {
    return this.transport.request(R.versions.item(e), aa);
  }
};
function ua(e) {
  if (!e || typeof e != "object") return [];
  const t = e.details;
  if (!t || typeof t != "object") return [];
  const s = t.blockingChannelIds;
  return Array.isArray(s) ? s.filter((r) => typeof r == "string") : [];
}
var Pt = class {
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
    this.transport = e.transport ?? new Ss(e), this.auth = new Kr(this.transport), this.apps = new Hr(this.transport), this.assets = new fn(this.transport), this.uploads = new sa(this.transport), this.versions = new la(this.transport), this.channels = new Dn(this.transport), this.members = new zn(this.transport), this.tokens = new Xn(this.transport), this.history = new Bn(this.transport), this.admin = new Vr(this.transport);
  }
};
async function pa(e, t, s = {}) {
  return new Ss({ registryUrl: e }).requestJson(t, s);
}
function Ue(e, t = process.env) {
  return Is(e.registryUrl || t.VITE_REGISTRY_URL);
}
function J(e, t = {}) {
  return t.request ? new Pt({
    registryUrl: e,
    token: t.token,
    fetch: async (s, r) => {
      const n = new URL(String(s)), a = await t.request(e, `${n.pathname}${n.search}`, {
        method: r?.method === "GET" ? void 0 : r?.method,
        headers: ma(r?.headers),
        body: typeof r?.body == "string" ? JSON.parse(r.body) : void 0
      });
      return new Response(JSON.stringify(a), { headers: { "content-type": "application/json" } });
    }
  }) : new Pt({
    registryUrl: e,
    token: t.token
  });
}
function ma(e) {
  if (!e) return;
  const t = Object.fromEntries(new Headers(e));
  return delete t["content-type"], Object.keys(t).length > 0 ? t : void 0;
}
function E(e) {
  return {
    json: e.json === !0,
    human(t) {
      e.json || e.write(t);
    },
    result(t) {
      e.write(Ps(t));
    }
  };
}
function _(e, t) {
  return t.json === !0 || e.opts().json === !0;
}
function Ps(e) {
  return JSON.stringify(e, null, 2);
}
function m(e, t, s) {
  if (e.json) {
    e.result(t);
    return;
  }
  e.human(s);
}
function Es(e, t, s = t.message) {
  y(2), m(e, t, s);
}
function y(e) {
  process.exitCode = e;
}
function fa(e, t) {
  const s = e.command("auth").description("Manage Registry CLI authentication");
  Et(s, e, t), _t(s, e, t), kt(s, e, t), Et(e, e, t), _t(e, e, t), kt(e, e, t);
}
function Et(e, t, s) {
  e.command("login").description("Sign in through the Registry browser flow").option("-u, --registry-url <url>", "Registry URL").option("--json", "Print a machine-readable result").action(async (r) => {
    const n = E({
      json: _(t, r),
      write: s.write
    });
    if (n.json) {
      y(2), n.result({
        status: "interactive_auth_required",
        message: "Interactive browser auth is not available in JSON mode. Run `registry login` without --json."
      });
      return;
    }
    const a = Ue({
      ...t.opts(),
      ...r
    }), o = J(a, { request: s.request }), c = await o.auth.start(), d = await s.openBrowser(c.verificationUriComplete);
    s.write(d ? "Attempted to open Registry login in your browser:" : "Could not open Registry login in your browser. Open this URL manually:"), s.write(c.verificationUriComplete), s.write(`Confirm code ${c.userCode} in the browser.`);
    const l = s.now() + c.expiresIn * 1e3;
    for (; s.now() < l; ) {
      await s.sleep(c.interval * 1e3);
      const u = await o.auth.poll({ deviceCode: c.deviceCode });
      if (u.status !== "pending") {
        await s.saveSession({
          registryUrl: a,
          accessToken: u.accessToken,
          refreshToken: u.refreshToken,
          expiresAt: new Date(s.now() + u.expiresIn * 1e3).toISOString(),
          account: u.account
        }), s.write(`Signed in as ${u.account.email || u.account.userId}.`);
        return;
      }
    }
    throw new Error("Login timed out");
  });
}
function _t(e, t, s) {
  e.command("whoami").description("Print the current Registry identity").option("-u, --registry-url <url>", "Registry URL").option("--json", "Print a machine-readable result").action(async (r) => {
    const n = E({
      json: _(t, r),
      write: s.write
    }), a = Ue({
      ...t.opts(),
      ...r
    }), o = ha(t), c = process.env.REGISTRY_ACCESS_TOKEN, d = o || c, l = d ? {
      registryUrl: a,
      accessToken: d,
      refreshToken: "",
      expiresAt: new Date(s.now() + 3600 * 1e3).toISOString(),
      account: {
        userId: "access-token",
        email: null
      }
    } : await _s(a, s), u = await J(l.registryUrl, {
      token: l.accessToken,
      request: s.request
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
  });
}
function kt(e, t, s) {
  e.command("logout").description("Revoke the stored CLI session").option("-y, --yes", "Approve non-interactive session mutation").option("--json", "Print a machine-readable result").action(async (r) => {
    const n = E({
      json: _(t, r),
      write: s.write
    });
    if (n.json && !r.yes) {
      Es(n, {
        status: "mutation_requires_confirmation",
        message: "Logout mutates the stored CLI session. Re-run with --yes --json to confirm.",
        nextCommand: "registry logout --yes --json"
      });
      return;
    }
    const a = await s.readSession();
    a && await J(a.registryUrl, { request: s.request }).auth.revoke({ refreshToken: a.refreshToken }).catch(() => {
    }), await s.removeSession(), n.json ? n.result({ status: "logged_out" }) : n.human("Logged out.");
  });
}
function ha(e) {
  const t = e.opts().token;
  return typeof t == "string" && t.trim() ? t.trim() : void 0;
}
async function _s(e, t) {
  const s = await t.readSession();
  if (!s || s.registryUrl !== e) throw new Error("No Registry session found. Run `registry login`.");
  if (new Date(s.expiresAt).getTime() > t.now() + 3e4) return s;
  const r = await J(e, { request: t.request }).auth.refresh({ refreshToken: s.refreshToken }), n = {
    registryUrl: e,
    accessToken: r.accessToken,
    refreshToken: r.refreshToken,
    expiresAt: new Date(t.now() + r.expiresIn * 1e3).toISOString(),
    account: r.account
  };
  return await t.saveSession(n), n;
}
async function q(e, t, s, r, n) {
  const a = E({
    json: _(e, s),
    write: t.write
  });
  try {
    const { session: o, client: c } = await ce(e, t, { tokenPolicy: n.tokenPolicy }), d = await r({
      session: o,
      client: c,
      output: a
    });
    m(a, d.payload, d.message);
  } catch (o) {
    y(n.isUsageError?.(o) || o instanceof P && o.status >= 400 && o.status < 500 ? 2 : 1);
    const c = n.formatError?.(o) ?? wa(o, n.defaultErrorMessage);
    if (a.json) {
      a.result(c);
      return;
    }
    throw new Error(c.message);
  }
}
async function ce(e, t, s = {}) {
  const r = Ue(e.opts()), n = s.tokenPolicy || "allow-access-token", a = ga(e), o = process.env.REGISTRY_ACCESS_TOKEN, c = n === "browser-session-only" ? void 0 : a || o, d = c ? ya(r, c, t.now()) : await _s(r, t);
  return {
    session: d,
    client: J(d.registryUrl, {
      token: d.accessToken,
      request: t.request
    })
  };
}
function ga(e) {
  const t = e.opts().token;
  return typeof t == "string" && t.trim() ? t.trim() : void 0;
}
function ya(e, t, s) {
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
function wa(e, t) {
  return {
    status: "error",
    message: e instanceof Error ? e.message : t
  };
}
var ba = /* @__PURE__ */ fr(((e, t) => {
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
})), re = /* @__PURE__ */ gr(ba(), 1), w = {
  heading: re.default.bold,
  id: re.default.cyan,
  success: re.default.green,
  warning: re.default.yellow,
  placeholder: re.default.dim
};
function x({ columns: e, rows: t, emptyMessage: s }) {
  if (t.length === 0) return s;
  const r = t.map((a) => e.map((o) => va(o, a))), n = e.map((a, o) => Math.max(a.header.length, ...r.map((c) => c[o]?.raw.length ?? 0)));
  return [e.map((a, o) => w.heading(jt(a.header, n[o], o, e))).join("  "), ...r.map((a) => a.map((o, c) => (o.color || ks)(jt(o.raw, n[c], c, a))).join("  "))].join(`
`);
}
function jt(e, t, s, r) {
  return s === r.length - 1 ? e : e.padEnd(t);
}
function va(e, t) {
  const s = e.value(t);
  return s && typeof s == "object" && "value" in s ? {
    raw: Tt(s.value),
    color: s.color ?? ((r) => $t(r, e, t))
  } : {
    raw: Tt(s),
    color: (r) => $t(r, e, t)
  };
}
function Tt(e) {
  return e == null || e === "" ? "-" : String(e);
}
function ks(e) {
  return e.trim() === "-" ? w.placeholder(e) : e;
}
function $t(e, t, s) {
  return e.trim() === "-" ? ks(e) : t.color?.(e, s) ?? e;
}
function Ra(e, t) {
  Sa(e, t), Ia(e, t);
}
function Sa(e, t) {
  const s = e.command("allowlist").description("Manage Registry CLI login allowlist entries");
  s.command("list").option("--json", "Print a machine-readable result").action(async (r) => {
    await C(e, t, r, async ({ client: n }) => {
      const a = await n.admin.listEmailAllowlistEntries();
      return {
        payload: a,
        message: Ea(a.entries)
      };
    });
  }), s.command("add-email").argument("<email>", "Email address to allow").option("--description <text>", "Allowlist description").option("--json", "Print a machine-readable result").action(async (r, n) => {
    await C(e, t, n, async ({ client: a }) => {
      const o = await a.admin.createEmailAllowlistEntry({
        entryType: Ae.email,
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
    await C(e, t, n, async ({ client: a }) => {
      const o = await a.admin.createEmailAllowlistEntry({
        entryType: Ae.domain,
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
    await C(e, t, n, async ({ client: a }) => {
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
    await C(e, t, n, async ({ client: a }) => {
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
function Ia(e, t) {
  const s = e.command("users").description("Manage Registry users");
  s.command("list").option("--json", "Print a machine-readable result").action(async (r) => {
    await C(e, t, r, async ({ client: n }) => {
      const a = await n.admin.listUsers();
      return {
        payload: a,
        message: _a(a.users)
      };
    });
  }), s.command("show").option("--email <email>", "Find a user by email").option("--user-id <user-id>", "Find a user by durable user ID").option("--json", "Print a machine-readable result").action(async (r) => {
    await C(e, t, r, async ({ client: n }) => {
      ye(r);
      const a = r.userId ? await n.admin.getUser(r.userId) : await n.admin.getUserByEmail(r.email);
      return {
        payload: a,
        message: ka(a.user)
      };
    });
  }), s.command("grant-permissions").argument("[permissions...]", "Concrete permissions to grant").option("--email <email>", "Find a user by email").option("--user-id <user-id>", "Find a user by durable user ID").option("--preset <preset>", `Permission preset to grant: ${ae.join(", ")}`).requiredOption("--reason <text>", "Permission grant reason").option("--json", "Print a machine-readable result").action(async (r, n) => {
    await C(e, t, n, async ({ client: a }) => {
      ye(n), Ct(n.preset);
      const o = xt(r);
      if (o.length === 0 && !n.preset) throw new Q("Grant at least one permission or --preset");
      const c = await Le(n, a.admin), d = await a.admin.updateUserPermissions(c, {
        grantPermissions: o,
        grantPreset: n.preset,
        reason: n.reason
      });
      return {
        payload: d,
        message: `Granted permissions to ${d.user.id}.`
      };
    });
  }), s.command("revoke-permissions").argument("[permissions...]", "Concrete permissions to revoke").option("--email <email>", "Find a user by email").option("--user-id <user-id>", "Find a user by durable user ID").option("--preset <preset>", `Permission preset to revoke: ${ae.join(", ")}`).requiredOption("--reason <text>", "Permission revocation reason").option("--json", "Print a machine-readable result").action(async (r, n) => {
    await C(e, t, n, async ({ client: a }) => {
      ye(n), Ct(n.preset);
      const o = xt(r);
      if (o.length === 0 && !n.preset) throw new Q("Revoke at least one permission or --preset");
      const c = await Le(n, a.admin), d = await a.admin.updateUserPermissions(c, {
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
    await C(e, t, r, async ({ client: n }) => {
      ye(r);
      const a = await Le(r, n.admin), o = await n.admin.revokeUserSessions(a, { reason: r.reason });
      return {
        payload: o,
        message: `Revoked ${o.revokedSessionCount} session(s) for ${o.userId}.`
      };
    });
  });
}
async function C(e, t, s, r) {
  await q(e, t, s, r, {
    defaultErrorMessage: "Registry admin command failed",
    formatError: Aa,
    isUsageError: Ta
  });
}
function Aa(e) {
  return e instanceof P ? {
    status: Pa(e),
    message: e.message
  } : {
    status: "error",
    message: e instanceof Error ? e.message : "Registry admin command failed"
  };
}
function Pa(e) {
  return e.code === "validation_failed" || e.status === 400 ? "validation_failed" : e.code === "forbidden" || e.status === 403 ? "permission_denied" : e.code === "unauthorized" || e.status === 401 ? "unauthorized" : e.code === "user_not_found" || e.status === 404 ? "user_not_found" : e.code === "email_allowlist_entry_not_found" ? "email_allowlist_entry_not_found" : e.code === "email_allowlist_entry_already_exists" ? "email_allowlist_entry_already_exists" : e.code === "last_admin_required" ? "last_admin_required" : "error";
}
function ye(e) {
  if (e.email && e.userId) throw new Q("Provide either --email or --user-id, not both");
  if (!e.email && !e.userId) throw new Q("Provide a user selector with --email or --user-id");
}
function Ct(e) {
  if (e && !ae.includes(e)) throw new Q(`Preset must be one of: ${ae.join(", ")}`);
}
function xt(e) {
  return e.length === 0 ? [] : rs(e);
}
async function Le(e, t) {
  return e.userId ? e.userId : (await t.getUserByEmail(e.email)).user.id;
}
function Ea(e) {
  return x({
    columns: [
      {
        header: "ENTRY ID",
        value: (t) => t.id,
        color: w.id
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
        color: ja
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
function _a(e) {
  return x({
    columns: [
      {
        header: "USER ID",
        value: (t) => t.id,
        color: w.id
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
function ka(e) {
  return [
    e.id,
    e.email || "",
    e.permissions.join(",")
  ].join("	");
}
function ja(e) {
  return e.trim() === "enabled" ? w.success(e) : w.warning(e);
}
var Q = class extends Error {
};
function Ta(e) {
  return e instanceof Q;
}
var $a = "@superbuilders/primer-tives", Ca = /^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/;
async function xa(e) {
  return an(await I(e, "utf8"));
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
    manifest: xe(s),
    document: s
  };
}
async function z(e, t) {
  await Ke(e, `${JSON.stringify(t, null, 2)}
`);
}
function js(e) {
  return yr(e);
}
async function ct(e) {
  let t;
  try {
    t = JSON.parse(await I(B(e, "package.json"), "utf8"));
  } catch (r) {
    if (Oa(r)) return null;
    throw r;
  }
  const s = Ua(t, $a);
  return s && Ca.test(s) ? s : null;
}
function Ua(e, t) {
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
function Oa(e) {
  return e instanceof Error && "code" in e && e.code === "ENOENT";
}
function D(e = {}) {
  const t = T(e.cwd ?? process.cwd(), e.root ?? "."), s = Ut(t, e.manifest ?? "manifest.json"), r = Ut(t, e.dist ?? "dist");
  return {
    root: t,
    sourceManifest: s,
    artifactDirectory: r,
    artifactManifest: T(r, ve),
    artifactEntrypoint: T(r, Xr)
  };
}
function Ut(e, t) {
  return He(t) ? T(t) : T(e, t);
}
async function Ts(e, t) {
  const s = D({
    root: e.root,
    manifest: e.manifest
  }), r = await $s(s.sourceManifest), n = [];
  let a = {};
  if (r) try {
    a = { ...(await Y(s.sourceManifest)).document };
  } catch (l) {
    if (e.json) throw l;
    if (a = { ...await Na(s.sourceManifest) }, typeof a.title != "string" || a.title.trim() === "") delete a.title;
    else throw l;
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
    const l = await t.promptText("App title?");
    if (!l.trim())
      return n.push("Manifest title is required."), {
        status: "cancelled",
        manifestPath: s.sourceManifest,
        manifestExists: r,
        wrote: !1,
        suggestedFields: {},
        diagnostics: n,
        nextCommands: []
      };
    a.title = l.trim();
  }
  Array.isArray(a.tags) || (a.tags = []);
  const o = {};
  if ((typeof a.appId != "string" || a.appId.trim() === "") && (o.appId = js(String(a.title))), a.primerSdkVersion === void 0 || a.primerSdkVersion === null) {
    const l = await ct(s.root);
    l && (o.primerSdkVersion = l);
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
  if (t.write(qa(s.sourceManifest, c, s.artifactDirectory)), Object.keys(o).length === 0 && r)
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
  if (await z(s.sourceManifest, c), t.write(`Wrote ${s.sourceManifest}.`), !e.suppressFinalClaimPrompt) {
    const l = await t.confirm("Claim this app now?", { defaultValue: !1 });
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
async function Ma(e, t) {
  return $s(D({
    root: e,
    manifest: t
  }).sourceManifest);
}
async function Na(e) {
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
async function $s(e) {
  try {
    return await Ht(e), !0;
  } catch (t) {
    if (t instanceof Error && "code" in t && t.code === "ENOENT") return !1;
    throw t;
  }
}
function qa(e, t, s) {
  return `Registry manifest preview

Path: ${e}

${Ps(t)}

Expected build output:
  ${s}/index.html
  ${s}/manifest.json`;
}
function Da(e, t) {
  Cs(e.command("claim"), e, t);
}
function La(e, t, s) {
  Cs(e.command("claim"), t, s);
}
function Cs(e, t, s) {
  e.argument("[root]", "Primer app project root", ".").description("Claim a Primer app ID in the Registry").option("-m, --manifest <path>", "Source manifest path").option("--dry-run", "Validate claim readiness without creating Registry state").option("-y, --yes", "Approve non-interactive claim creation").option("--json", "Print a machine-readable result").action(async (r, n) => {
    const a = E({
      json: _(t, n),
      write: s.write
    });
    try {
      const o = D({
        root: r,
        manifest: n.manifest
      });
      if (!await Ma(r, n.manifest)) {
        if (a.json || n.dryRun) {
          y(2), m(a, {
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
        const $ = await Ts({
          root: r,
          manifest: n.manifest,
          suppressFinalClaimPrompt: !0
        }, s);
        if ($.status !== "initialized" && $.status !== "unchanged") {
          a.human("Claim cancelled.");
          return;
        }
        if (!await s.confirm("Continue claiming this app?", { defaultValue: !0 })) {
          a.human("Claim cancelled.");
          return;
        }
      }
      const { client: c } = await ce(t, s), { manifest: d, document: l } = await Y(o.sourceManifest), u = d.appId || js(d.title), p = await Fa(o.root, l);
      if (!d.appId && (a.json || n.dryRun)) {
        y(2), m(a, {
          status: "needs_manifest_update",
          manifestPath: o.sourceManifest,
          suggestedFields: Ot(u, p),
          message: "Update manifest.json, then rerun registry claim."
        }, "Update manifest.json, then rerun registry claim.");
        return;
      }
      const h = await c.apps.availability(u);
      if (h.exists || !h.available) {
        if (!n.dryRun) {
          const $ = await Ba(c, u);
          if ($?.exists && "claim" in $ && $.claim.claimedByCurrentUser) {
            m(a, {
              status: "already_claimed",
              appId: u
            }, `App ${u} is already claimed by this account.`);
            return;
          }
        }
        y(3), m(a, {
          status: "app_id_unavailable",
          appId: u,
          message: "Edit manifest.json with a different appId, then rerun registry claim."
        }, `App ID ${u} is unavailable. Edit manifest.json with a different appId, then rerun registry claim.`);
        return;
      }
      if (n.dryRun) {
        m(a, {
          status: "claim_ready",
          appId: u,
          available: !0,
          exists: !1
        }, `App ID ${u} is available to claim.`);
        return;
      }
      if (a.json && !n.yes) {
        Es(a, {
          status: "claim_requires_confirmation",
          appId: u,
          nextCommand: `registry claim ${r} --yes --json`,
          message: "Claiming this app creates Registry state. Re-run with --yes to confirm."
        });
        return;
      }
      if (!a.json && !n.yes && (a.human(Va(d, u)), !await s.confirm("Create app?", { defaultValue: !0 }))) {
        a.human("Claim cancelled.");
        return;
      }
      const b = await c.apps.create({
        appId: u,
        title: d.title
      });
      d.appId || await z(o.sourceManifest, {
        ...l,
        ...Ot(b.appId, p)
      }), m(a, {
        status: "claimed",
        appId: b.appId,
        created: b.created
      }, `Claimed app ${b.appId}.`);
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
function Va(e, t) {
  return `Create new app?

Title: ${e.title}
App ID: ${t}`;
}
function Ot(e, t) {
  return t ? {
    appId: e,
    primerSdkVersion: t
  } : { appId: e };
}
async function Ba(e, t) {
  try {
    return await e.apps.get(t);
  } catch {
    return null;
  }
}
async function Fa(e, t) {
  return t.primerSdkVersion !== void 0 && t.primerSdkVersion !== null ? null : ct(e);
}
function K(e) {
  return e.some((t) => t.severity === "error");
}
function fe(e) {
  return e.map(za).join(`
`);
}
function za(e) {
  const t = e.target ? ` (${e.target})` : "", s = e.nextCommand ? ` Run: ${e.nextCommand}` : "";
  return `${e.severity}: ${e.message}${t}${s}`;
}
async function dt(e = {}) {
  const t = D({
    cwd: e.cwd,
    root: e.root,
    manifest: e.manifest
  });
  if (e.appId) return {
    paths: t,
    appId: e.appId,
    diagnostics: []
  };
  const s = [], r = await Ja(t.sourceManifest, s);
  if (!r) return {
    paths: t,
    appId: null,
    diagnostics: s
  };
  try {
    const n = xe(r);
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
async function Ja(e, t) {
  let s;
  try {
    s = await I(e, "utf8");
  } catch (r) {
    if (Ha(r))
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
function Ha(e) {
  return e instanceof Error && "code" in e && e.code === "ENOENT";
}
function Ga(e, t) {
  e.command("history").description("List app-scoped Registry history").option("--app-id <app-id>", "Registry app ID").option("--root <root>", "Primer app project root").option("--json", "Print a machine-readable result").action(async (s) => {
    await Oe(e, t, s, async ({ client: r }) => {
      const n = await xs(s);
      return Me({
        appId: n,
        events: (await r.history.app(n)).events
      });
    });
  });
}
function Wa(e, t, s) {
  e.command("history").argument("<app-id>", "Registry app ID").option("--json", "Print a machine-readable result").action(async (r, n) => {
    await Oe(t, s, n, async ({ client: a }) => Me({
      appId: r,
      events: (await a.history.app(r)).events
    }));
  });
}
function Qa(e, t, s) {
  e.command("history").argument("<version-id>", "App version UUID").option("--json", "Print a machine-readable result").action(async (r, n) => {
    await Oe(t, s, n, async ({ client: a }) => Me({
      versionId: r,
      events: (await a.history.version(r)).events
    }));
  });
}
function Ya(e, t, s) {
  e.command("history").argument("<channel-id>", "Distribution channel ID").option("--app-id <app-id>", "Registry app ID").option("--root <root>", "Primer app project root").option("--json", "Print a machine-readable result").action(async (r, n) => {
    await Oe(t, s, n, async ({ client: a }) => {
      const o = await xs(n);
      return Me({
        appId: o,
        channelId: r,
        events: (await a.history.channel(r, { appId: o })).events
      });
    });
  });
}
async function Oe(e, t, s, r) {
  await q(e, t, s, r, {
    defaultErrorMessage: "Registry history command failed",
    formatError: Xa,
    isUsageError: Ka
  });
}
async function xs(e) {
  if (!e.appId && !e.root) throw new lt("Provide an app context with --app-id or --root");
  const t = await dt({
    appId: e.appId,
    root: e.root
  });
  if (t.appId && !K(t.diagnostics)) return t.appId;
  throw new Error(fe(t.diagnostics) || "Unable to resolve Registry app ID");
}
function Me(e) {
  return {
    payload: {
      status: "history_listed",
      ...e
    },
    message: ei(e.events)
  };
}
var lt = class extends Error {
};
function Ka(e) {
  return e instanceof lt;
}
function Xa(e) {
  return e instanceof lt ? {
    status: "app_id_required",
    message: e.message
  } : e instanceof P ? {
    status: Za(e),
    message: e.message
  } : {
    status: "error",
    message: e instanceof Error ? e.message : "Registry history command failed"
  };
}
function Za(e) {
  return e.code === "permission_denied" || e.status === 403 ? "permission_denied" : e.code === "history_not_found" || e.status === 404 ? "history_not_found" : "error";
}
function ei(e) {
  return e.length === 0 ? "No history events found." : e.map(ti).join(`
`);
}
function ti(e) {
  const t = e.actorEmail ?? e.actorUserId ?? "system", s = si(e), r = e.reason ? ` - ${e.reason}` : "";
  return `${e.createdAt}	${e.eventType}	${s}	${t}${r}`;
}
function si(e) {
  return e.channelId ? `${e.appId}/${e.channelId}` : e.appVersionId ? `${e.appId}/${e.appVersionId}` : e.appId;
}
function ri(e, t) {
  const s = e.command("apps").description("Inspect Registry apps");
  La(s, e, t), Wa(s, e, t), s.command("list").option("--json", "Print a machine-readable result").action(async (r) => {
    await q(e, t, r, async ({ client: n }) => {
      const a = await n.apps.list();
      return {
        payload: {
          status: "apps_listed",
          apps: a.apps
        },
        message: ai(a.apps)
      };
    }, { defaultErrorMessage: "Registry apps command failed" });
  }), s.command("delete").argument("<app-id>", "Registry app ID").requiredOption("--reason <text>", "Deletion reason").option("--force", "Hard delete an already-soft-deleted app (unsupported)").option("--json", "Print a machine-readable result").action(async (r, n) => {
    await q(e, t, n, async ({ client: a }) => {
      if (n.force) throw new Us("Hard delete is deferred; omit --force to soft-delete the app");
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
      formatError: ci,
      isUsageError: oi
    });
  }), s.command("show").argument("<app-id>", "Registry app ID").option("--json", "Print a machine-readable result").action(async (r, n) => {
    await q(e, t, n, async ({ client: a }) => {
      const o = await a.apps.get(r);
      return {
        payload: {
          status: "app_shown",
          app: o
        },
        message: ni(o)
      };
    }, { defaultErrorMessage: "Registry apps command failed" });
  });
}
function ni(e) {
  if (!e.exists) return `${e.appId}
Status: available`;
  if (e.deletedAt) return `${e.appId}
Status: deleted
Deleted at: ${e.deletedAt}`;
  const t = e.claim.claimedByCurrentUser ? `claimed by this account (${e.claim.role})` : "claimed by another account";
  return `${e.appId}
Status: ${t}`;
}
function ai(e) {
  return x({
    columns: [
      {
        header: "APP ID",
        value: (t) => t.appId,
        color: w.id
      },
      {
        header: "VISIBILITY",
        value: (t) => t.visibility
      },
      {
        header: "STATUS",
        value: (t) => t.status,
        color: ii
      },
      {
        header: "LATEST VERSION ID",
        value: (t) => t.latestVersionId,
        color: w.id
      }
    ],
    rows: e,
    emptyMessage: "No apps found."
  });
}
function ii(e) {
  return e.trim() === "active" ? w.success(e) : w.warning(e);
}
var Us = class extends Error {
};
function oi(e) {
  return e instanceof Us;
}
function ci(e) {
  return {
    status: "error",
    message: e instanceof Error ? e.message : "Registry apps command failed"
  };
}
var Ve = 1024 * 1024, Mt = {
  maxVersionFiles: 1e3,
  maxVersionBytes: 250 * Ve,
  maxFileBytes: 50 * Ve,
  maxThumbnailBytes: 10 * Ve
}, di = /* @__PURE__ */ new Map([
  [".html", /* @__PURE__ */ new Set(["text/html"])],
  [".js", /* @__PURE__ */ new Set([
    "text/javascript",
    "application/javascript",
    "application/x-javascript"
  ])],
  [".mjs", /* @__PURE__ */ new Set(["text/javascript", "application/javascript"])],
  [".css", /* @__PURE__ */ new Set(["text/css"])],
  [".json", /* @__PURE__ */ new Set(["application/json"])],
  [".png", /* @__PURE__ */ new Set(["image/png"])],
  [".jpg", /* @__PURE__ */ new Set(["image/jpeg"])],
  [".jpeg", /* @__PURE__ */ new Set(["image/jpeg"])],
  [".webp", /* @__PURE__ */ new Set(["image/webp"])],
  [".gif", /* @__PURE__ */ new Set(["image/gif"])],
  [".svg", /* @__PURE__ */ new Set(["image/svg+xml"])],
  [".avif", /* @__PURE__ */ new Set(["image/avif"])],
  [".mp4", /* @__PURE__ */ new Set(["video/mp4"])],
  [".wasm", /* @__PURE__ */ new Set(["application/wasm"])],
  [".txt", /* @__PURE__ */ new Set(["text/plain"])]
]), li = /* @__PURE__ */ new Map([
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
  [".mp4", "video/mp4"],
  [".wasm", "application/wasm"],
  [".txt", "text/plain; charset=utf-8"]
]);
function X(e) {
  return li.get(Os(e)) ?? "application/octet-stream";
}
function ui(e) {
  return e?.split(";")[0]?.trim().toLowerCase() || "";
}
function Os(e) {
  const t = e.split("/").pop() || "", s = t.lastIndexOf(".");
  return s > 0 ? t.slice(s).toLowerCase() : "";
}
async function We(e, t) {
  const s = /* @__PURE__ */ new Set(), r = [], n = [], a = /* @__PURE__ */ new Set();
  for (const o of t) {
    if (!o.source) continue;
    const c = ie(o.source, `registryAssets.${o.id}.source`);
    c.kind === "artifactPath" && a.add(c.path);
  }
  for (const o of t) {
    if (!o.source) {
      n.push(o);
      continue;
    }
    const c = ie(o.source, `registryAssets.${o.id}.source`);
    if (c.kind === "httpsUrl") {
      const u = await pi(o.id, c.url), p = mi(a, o.id, u.extension);
      n.push({
        ...o,
        source: p
      }), r.push({
        kind: "remote",
        bytes: u.bytes,
        uploadPath: yt(p),
        size: u.bytes.byteLength,
        contentType: u.contentType
      });
      continue;
    }
    if (n.push(o), s.has(c.path)) continue;
    s.add(c.path);
    const d = T(e, c.path), l = await Ee(d);
    r.push({
      kind: "local",
      path: d,
      uploadPath: yt(c.path),
      size: l.size,
      contentType: X(c.path)
    });
  }
  return {
    assets: n,
    files: r
  };
}
async function pi(e, t) {
  const s = Os(new URL(t).pathname), r = s ? di.get(s) : void 0;
  if (!s || !r) throw new Error(`Registry asset HTTPS source for ${e} must use a supported file extension: ${t}`);
  const n = await fetch(t);
  if (!n.ok) throw new Error(`Registry asset HTTPS source fetch failed for ${e}: ${t} (${n.status})`);
  const a = n.headers.get("content-length");
  if (a) {
    const d = Number(a);
    if (Number.isFinite(d) && d > Mt.maxFileBytes) throw new Error(`Registry asset HTTPS source exceeds maximum byte size for ${e}: ${t}`);
  }
  const o = ui(n.headers.get("content-type") ?? void 0);
  if (o && !r.has(o)) throw new Error(`Registry asset HTTPS source has unsupported content type for ${e}: ${o}`);
  const c = new Uint8Array(await n.arrayBuffer());
  if (c.byteLength > Mt.maxFileBytes) throw new Error(`Registry asset HTTPS source exceeds maximum byte size for ${e}: ${t}`);
  return {
    bytes: c,
    extension: s,
    contentType: X(`asset${s}`)
  };
}
function mi(e, t, s) {
  const r = t.replace(/[^a-zA-Z0-9._-]/g, "-") || "asset";
  let n = `remote/${r}${s}`;
  for (let a = 2; e.has(n); a += 1) n = `remote/${r}-${a}${s}`;
  return ee(n, "registryAssets.source"), e.add(n), n;
}
function fi(e, t) {
  const s = e.command("assets").description("Manage reusable Registry asset manifest declarations");
  s.command("sync").argument("[root]", "Package root", ".").option("--check", "Verify Registry asset URLs are current without uploading or writing").option("-g, --generate-typescript", "Generate synced Registry asset TypeScript helper").option("--out <path>", "Generated TypeScript helper output path").option("--json", "Print a machine-readable result").action(async (r, n) => {
    const a = E({
      json: _(e, n),
      write: t.write
    });
    try {
      if (n.out && !n.generateTypescript) throw new Error("--out requires --generate-typescript");
      const o = D({ root: r }), { manifest: c } = await Y(o.sourceManifest);
      if (!c.appId) throw new Error("Source manifest must include appId before syncing assets.");
      const d = g.parse(c.appId), l = await gi(o.root, o.sourceManifest), u = Nt(l);
      yi(u);
      const p = Pi(o.root, n.out ?? c.registryAssetsModule);
      if (u.length === 0) {
        if (n.generateTypescript) {
          const f = Be(d, []);
          if (n.check) {
            if (await qt(p) !== f) {
              y(1), m(a, {
                status: "assets_module_outdated",
                appId: d,
                modulePath: p,
                assetCount: 0,
                assets: []
              }, `Registry assets module is out of date: ${p}. Run registry assets sync ${r} --generate-typescript.`);
              return;
            }
            m(a, {
              status: "assets_current",
              appId: d,
              modulePath: p,
              assetCount: 0,
              assets: []
            }, `Registry assets for ${d} and generated module are current.`);
            return;
          }
          await Dt(p, f), m(a, {
            status: "assets_module_generated",
            appId: d,
            modulePath: p,
            assetCount: 0,
            assets: []
          }, `Generated Registry assets module at ${p}.`);
          return;
        }
        m(a, {
          status: "assets_current",
          appId: d,
          assetCount: 0,
          assets: []
        }, `No Registry assets declared for ${d}.`);
        return;
      }
      const { client: h } = await ce(e, t);
      if (!await hi(h, a, d, r)) return;
      const b = await h.assets.list(d), $ = new Map(b.assets.map((f) => [f.id, f.registryUrl]));
      if (n.check) {
        const f = await wi(o.root, d, u, $);
        if (f.errors.length > 0) {
          y(2), m(a, {
            status: "assets_sync_failed",
            appId: d,
            errors: f.errors,
            assets: f.assets
          }, f.errors.join(`
`));
          return;
        }
        if (f.assets.some((j) => j.action !== "current" && j.action !== "validated")) {
          y(1), m(a, {
            status: "assets_outdated",
            appId: d,
            assets: f.assets
          }, `Registry assets for ${d} are not fully synced. Run registry assets sync ${r}.`);
          return;
        }
        if (n.generateTypescript) {
          const j = Be(d, u);
          if (await qt(p) !== j) {
            y(1), m(a, {
              status: "assets_module_outdated",
              appId: d,
              modulePath: p,
              assetCount: u.length,
              assets: f.assets
            }, `Registry assets module is out of date: ${p}. Run registry assets sync ${r} --generate-typescript.`);
            return;
          }
          m(a, {
            status: "assets_current",
            appId: d,
            modulePath: p,
            assetCount: u.length,
            assets: f.assets
          }, `Registry assets for ${d} and generated module are current.`);
          return;
        }
        m(a, {
          status: "assets_current",
          appId: d,
          assets: f.assets
        }, `Registry assets for ${d} are current.`);
        return;
      }
      const A = await We(o.root, u.map(({ documentPath: f, ...j }) => j)), U = await h.assets.createUpload(d, {
        assets: A.assets,
        files: A.files.map((f) => ({
          path: f.uploadPath,
          size: f.size,
          contentType: f.contentType
        }))
      });
      for (const f of A.files) {
        const j = U.files.find((er) => er.path === f.uploadPath);
        if (!j) throw new Error(`No upload URL returned for ${f.uploadPath}`);
        const ut = await fetch(j.url, {
          method: j.method,
          headers: j.headers,
          body: f.kind === "local" ? await I(f.path) : f.bytes
        });
        if (!ut.ok) throw new Error(`Upload failed for ${f.uploadPath}: ${ut.status}`);
      }
      const O = await h.assets.completeUpload(d, U.uploadId, { assets: A.assets }), he = await Ri(l, O.assets);
      if (n.generateTypescript) {
        await Dt(p, Be(d, Nt(l))), m(a, {
          status: "assets_module_generated",
          appId: d,
          uploadId: U.uploadId,
          updatedPaths: he,
          modulePath: p,
          assetCount: O.assets.length,
          assets: O.assets
        }, `Synced ${O.assets.length} Registry assets for ${d} and generated ${p}.`);
        return;
      }
      m(a, {
        status: "assets_synced",
        appId: d,
        uploadId: U.uploadId,
        updatedPaths: he,
        assets: O.assets
      }, `Synced ${O.assets.length} Registry assets for ${d}.`);
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
    const a = E({
      json: _(e, n),
      write: t.write
    });
    try {
      const o = $e.parse(n.id);
      ie(r, "path-or-url");
      const c = D({ manifest: n.manifest }), { document: d } = await Y(c.sourceManifest), l = Ai(d), u = l.findIndex((h) => h.id === o), p = {
        id: o,
        source: r
      };
      u >= 0 ? l[u] = {
        ...l[u],
        ...p
      } : l.push(p), d.registryAssets = l, await z(c.sourceManifest, d), m(a, {
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
    const a = E({
      json: _(e, n),
      write: t.write
    });
    try {
      const o = g.parse(n.appId), c = D({
        root: r,
        manifest: n.manifest
      }), { client: d } = await ce(e, t), l = await d.assets.list(o), u = new Map(l.assets.map((h) => [h.id, h.registryUrl])), p = await Si(c.root, c.sourceManifest, u);
      m(a, {
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
  });
}
async function hi(e, t, s, r) {
  const n = await e.apps.get(s);
  return n.exists ? n.claim.claimedByCurrentUser ? !0 : (y(2), m(t, {
    status: "app_membership_required",
    appId: s,
    message: `The current account is not a member of Registry app ${s}.`
  }, `The current account is not a member of Registry app ${s}.`), !1) : (y(2), m(t, {
    status: "app_not_claimed",
    appId: s,
    nextCommand: `registry claim ${r}`,
    hint: `Run registry claim ${r} first.`
  }, `App ID "${s}" has not been claimed for this Registry.

Run registry claim ${r} first.`), !1);
}
async function gi(e, t) {
  const { manifest: s, document: r } = await Y(t);
  return s.registryAssets.kind === "files" ? Promise.all(s.registryAssets.paths.map(async (n) => {
    const a = T(e, n);
    return {
      path: a,
      field: "assets",
      ...await Ms(a)
    };
  })) : s.registryAssets.kind === "inline" ? [{
    path: t,
    document: r,
    field: "registryAssets",
    assets: Ns(r)
  }] : [{
    path: t,
    document: r,
    field: "registryAssets",
    assets: []
  }];
}
function Nt(e) {
  return e.flatMap((t) => t.assets.map((s) => ({
    ...s,
    documentPath: t.path
  })));
}
function yi(e) {
  const t = /* @__PURE__ */ new Map();
  for (const s of e) {
    const r = t.get(s.id);
    if (r) throw new Error(`Duplicate registry asset id: ${s.id} in ${r} and ${s.documentPath}`);
    t.set(s.id, s.documentPath);
  }
}
async function wi(e, t, s, r) {
  const n = [], a = [];
  for (const o of s) {
    const c = r.get(o.id);
    if (o.source) {
      await bi(e, o, n);
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
async function bi(e, t, s) {
  if (!t.source) return;
  const r = ie(t.source, `registryAssets.${t.id}.source`);
  if (r.kind === "httpsUrl") {
    await vi(r.url, t.id, s);
    return;
  }
  try {
    await Ee(T(e, r.path));
  } catch (n) {
    if (n instanceof Error && "code" in n && n.code === "ENOENT") {
      s.push(`Registry asset source not found for ${t.id}: ${r.path}`);
      return;
    }
    throw n;
  }
}
async function vi(e, t, s) {
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
async function Ri(e, t) {
  const s = new Map(t.map((n) => [n.id, n.registryUrl])), r = [];
  for (const n of e) {
    let a = !1;
    for (const o of n.assets) {
      const c = s.get(o.id);
      c && o.registryUrl !== c && (o.registryUrl = c, a = !0);
    }
    a && (n.document[n.field] = n.assets, await z(n.path, n.document), r.push(n.path));
  }
  return r;
}
async function Si(e, t, s) {
  const { manifest: r, document: n } = await Y(t);
  if (r.registryAssets.kind === "files") {
    const a = [], o = new Map(s);
    for (const d of r.registryAssets.paths) {
      const l = T(e, d), u = await Ms(l);
      qs(u.assets, s, o), a.push({
        path: l,
        ...u
      });
    }
    const c = a[0];
    if (c) {
      Ds(c.assets, o);
      for (const d of a) await z(d.path, d.document);
      return a.map((d) => d.path);
    }
  }
  if (r.registryAssets.kind === "inline") {
    const a = Ns(n);
    return Ii(a, s), n.registryAssets = a, await z(t, n), [t];
  }
  return n.registryAssets = [...s].map(([a, o]) => ({
    id: a,
    registryUrl: o
  })), await z(t, n), [t];
}
async function Ms(e) {
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
  return ps(s), {
    document: s,
    assets: r
  };
}
function Ns(e) {
  const t = e.registryAssets;
  if (!Array.isArray(t)) throw new Error("assets helpers require inline registryAssets in the source manifest");
  return it(t), t;
}
function Ii(e, t) {
  const s = new Map(t);
  qs(e, t, s), Ds(e, s);
}
function qs(e, t, s) {
  for (const r of e) {
    const n = t.get(r.id);
    n && (r.registryUrl = n, s.delete(r.id));
  }
}
function Ds(e, t) {
  for (const [s, r] of t) e.push({
    id: s,
    registryUrl: r
  });
}
function Ai(e) {
  const t = e.registryAssets;
  if (t === void 0) return [];
  if (!Array.isArray(t)) throw new Error("assets helpers require inline registryAssets in the source manifest");
  try {
    return it(t);
  } catch {
    throw new Error("assets helpers require inline registryAssets in the source manifest");
  }
}
function Pi(e, t) {
  const s = t ?? "src/registry-assets.gen.ts";
  return He(s) || ee(s, t ? "out" : "registryAssetsModule"), He(s) ? T(s) : T(e, s);
}
async function qt(e) {
  try {
    return await I(e, "utf8");
  } catch (t) {
    if (t instanceof Error && "code" in t && t.code === "ENOENT") return null;
    throw t;
  }
}
async function Dt(e, t) {
  await Gt(ar(e), { recursive: !0 }), await Ke(e, t);
}
function Be(e, t) {
  const s = [...t].sort((c, d) => c.id.localeCompare(d.id)), r = s.filter((c) => !c.registryUrl).map((c) => c.id);
  if (r.length > 0) throw new Error(`Registry assets must be synced before generating TypeScript helpers: ${r.join(", ")}`);
  const n = /* @__PURE__ */ new Map();
  let a = `/apps/${e}`;
  for (const c of s) {
    const d = Ei(e, c);
    if (a.startsWith("/"))
      a = d.appCdnUrl;
    else if (d.appCdnUrl !== a) throw new Error(`Registry asset ${c.id} registryUrl must share app CDN URL ${a}`);
    n.set(c.id, d.extension);
  }
  const o = ["// Generated by registry assets sync --generate-typescript. Do not edit manually.", ""];
  o.push(`export const APP_CDN_URL = ${Fe(a)} as const`), o.push(""), o.push("export const ASSET_EXTENSIONS = {");
  for (const c of s) o.push(`  ${Fe(c.id)}: ${Fe(n.get(c.id) ?? "")},`);
  return o.push("} as const"), o.push(""), o.push("export type RegistryAssetId = keyof typeof ASSET_EXTENSIONS"), o.push(""), o.push("export function registryAssetUrl(id: RegistryAssetId) {"), o.push("  return `${APP_CDN_URL}/assets/${id}.${ASSET_EXTENSIONS[id]}`"), o.push("}"), o.push(""), o.join(`
`);
}
function Ei(e, t) {
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
function Fe(e) {
  return `'${e.replace(/\\/g, "\\\\").replace(/'/g, "\\'")}'`;
}
async function _i(e) {
  if (e.query && e.queryFile) throw new Pe("Use either --query or --query-file, not both");
  const t = e.queryFile ? await I(e.queryFile, "utf8") : e.query;
  if (t)
    try {
      return JSON.parse(t);
    } catch (s) {
      throw new Pe(`Invalid Registry RQL JSON${s instanceof Error ? `: ${s.message}` : ""}`);
    }
}
var Pe = class extends Error {
};
function Ls(e, t = {}) {
  const s = t.descriptionPrefix ? `${t.descriptionPrefix} ` : "";
  return e.option("--query <json>", `Filter ${s}with a Registry RQL JSON expr`).option("--query-file <path>", "Read a Registry RQL JSON expr from a file").option("--include-reserved", `Include registry-reserved versions${s ? ` in ${s.trim()}` : ""}`);
}
async function Vs(e) {
  return {
    query: await _i(e),
    includeReserved: e.includeReserved
  };
}
function ki(e, t) {
  const s = e.command("channels").alias("c").description("Manage Registry distribution channels");
  Ya(s, e, t), s.command("list").option("--json", "Print a machine-readable result").action(async (r) => {
    await H(e, t, r, async ({ client: n }) => {
      const a = await n.channels.list();
      return {
        payload: {
          status: "channels_listed",
          channels: a.channels
        },
        message: Ui(a.channels)
      };
    });
  }), Ls(s.command("show").argument("<channel-id>", "Distribution channel ID").option("--app-id <app-id>", "Filter assignments by app ID"), { descriptionPrefix: "public runtime listings" }).option("--json", "Print a machine-readable result").action(async (r, n) => {
    await H(e, t, n, async ({ client: a }) => {
      if (n.appId) {
        const c = await a.channels.assignments(r, { appId: n.appId });
        return {
          payload: {
            status: "channel_assignments_listed",
            channel: c.channel,
            assignments: c.assignments
          },
          message: Lt(c.assignments)
        };
      }
      const o = await a.channels.get(r, await Vs(n));
      return {
        payload: {
          status: "channel_shown",
          channel: o.channel,
          apps: o.apps
        },
        message: Oi(o.apps)
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
        message: Lt(o)
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
      const o = await Ti(n);
      if (r === "prod" && !n.toVersion) throw new de("Production rollback requires --to-version");
      if (r === "prod" && !n.reason) throw new de("Production rollback requires --reason");
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
        message: $i(c)
      };
    });
  });
}
async function H(e, t, s, r) {
  await q(e, t, s, r, {
    defaultErrorMessage: "Registry channels command failed",
    formatError: (n) => ({
      status: "error",
      message: ji(n, xi(s))
    }),
    isUsageError: (n) => n instanceof de || n instanceof Pe
  });
}
function ji(e, t) {
  if (e instanceof de) return e.message;
  if (e instanceof P && e.code === "prod_requires_approved") {
    const s = Ci(e.rawPayload) || t, r = s ? ` Run: registry versions approve ${s}` : " Run registry versions approve <version-id> first.";
    return `${e.message}.${r}`;
  }
  return e instanceof Error ? e.message : "Registry channels command failed";
}
async function Ti(e) {
  if (!e.appId && !e.root) throw new de("Provide an app context with --app-id or --root");
  const t = await dt({
    appId: e.appId,
    root: e.root
  });
  if (t.appId && !K(t.diagnostics)) return t.appId;
  throw new Error(fe(t.diagnostics) || "Unable to resolve Registry app ID");
}
function $i(e) {
  return [
    `${e.status === "dry_run" ? "Dry run" : "Rolled back"} ${e.channel.id}.`,
    `Current assignment: ${e.currentAssignment.appVersionId}`,
    `Target version: ${e.targetAppVersion.id}`
  ].join(`
`);
}
var de = class extends Error {
};
function Ci(e) {
  if (!e || typeof e != "object") return null;
  const t = e;
  return typeof t.versionId == "string" ? t.versionId : null;
}
function xi(e) {
  return "versionId" in e && typeof e.versionId == "string" ? e.versionId : void 0;
}
function Lt(e) {
  return x({
    columns: [
      {
        header: "CHANNEL",
        value: (t) => t.channelId,
        color: w.id
      },
      {
        header: "APP ID",
        value: (t) => t.appId,
        color: w.id
      },
      {
        header: "VERSION ID",
        value: (t) => t.appVersionId,
        color: w.id
      }
    ],
    rows: e,
    emptyMessage: "No channel assignments found."
  });
}
function Ui(e) {
  return x({
    columns: [{
      header: "CHANNEL",
      value: (t) => t.id,
      color: w.id
    }],
    rows: e,
    emptyMessage: "No channels found."
  });
}
function Oi(e) {
  return x({
    columns: [{
      header: "APP ID",
      value: (t) => t.id,
      color: w.id
    }, {
      header: "TITLE",
      value: (t) => t.title
    }],
    rows: e,
    emptyMessage: "No apps found."
  });
}
async function Mi(e) {
  const t = [];
  async function s(r) {
    for (const n of await rr(r, { withFileTypes: !0 })) {
      const a = B(r, n.name);
      if (n.isDirectory()) await s(a);
      else if (n.isFile()) {
        const o = await Ee(a);
        t.push({
          path: ir(e, a).replace(/\\/g, "/"),
          size: o.size,
          contentType: X(a)
        });
      }
    }
  }
  return await s(e), t;
}
async function Ni(e = {}) {
  const t = D(e), s = [], r = await qi(t.sourceManifest, s), n = await ct(t.root);
  if (Di(r.document, r.manifest, n, t.sourceManifest, s), !Ge(t.artifactDirectory))
    return s.push({
      code: "artifact_dist_missing",
      severity: e.requireDist ? "error" : "warning",
      message: "Built app artifact directory was not found.",
      source: "artifact",
      target: t.artifactDirectory
    }), Bi(t, r, n, s);
  Ge(t.artifactEntrypoint) ? await Li(t.artifactEntrypoint, s) : s.push({
    code: "artifact_entrypoint_missing",
    severity: "error",
    message: "Artifact entrypoint index.html is required.",
    source: "artifact",
    target: t.artifactEntrypoint
  });
  const a = await Vi(t.artifactDirectory, s), o = a.reduce((c, d) => c + d.size, 0);
  return a.length === 0 && s.push({
    code: "artifact_empty",
    severity: "error",
    message: "Built app artifact directory is empty.",
    source: "artifact",
    target: t.artifactDirectory
  }), {
    paths: t,
    sourceDocument: r.document,
    sourceManifest: r.manifest,
    files: a,
    totalBytes: o,
    detectedPrimerSdkVersion: n,
    diagnostics: s
  };
}
async function qi(e, t) {
  let s;
  try {
    s = await I(e, "utf8");
  } catch (a) {
    if (Fi(a))
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
      manifest: xe(r)
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
function Di(e, t, s, r, n) {
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
async function Li(e, t) {
  let s;
  try {
    s = await I(e, "utf8");
  } catch {
    return;
  }
  /(?:\b(?:src|href)\s*=\s*["']|url\(\s*["']?)\/(?!\/)/i.test(s) && t.push({
    code: "artifact_absolute_urls",
    severity: "warning",
    message: 'Entrypoint references root-absolute URLs (for example /assets/…). App versions are served from a path prefix, so use relative URLs (a Vite build sets this with base: "./").',
    source: "artifact",
    target: e
  });
}
async function Vi(e, t) {
  try {
    const s = await Mi(e);
    return await Promise.all(s.map((r) => Ht(B(e, r.path)))), s;
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
function Bi(e, t, s, r) {
  return {
    paths: e,
    sourceDocument: t.document,
    sourceManifest: t.manifest,
    files: [],
    totalBytes: 0,
    detectedPrimerSdkVersion: s,
    diagnostics: r
  };
}
function Fi(e) {
  return e instanceof Error && "code" in e && e.code === "ENOENT";
}
async function Bs(e) {
  const t = (e.mode ?? "publish-required") === "publish-required", s = Ue(e.registryOptions ?? {}), r = await Ni({
    root: e.root,
    manifest: e.manifest,
    dist: e.dist,
    requireDist: t || e.requireDist === !0
  }), n = [...r.diagnostics], a = r.sourceManifest?.appId ?? null, o = a;
  if (K(n) || (!a && t && n.push({
    code: "manifest_missing_app_id",
    severity: "error",
    message: "Source manifest must include appId before publishing.",
    source: "manifest",
    target: r.paths.sourceManifest,
    nextCommand: "registry claim"
  }), r.files.length === 0 && t && n.push({
    code: "artifact_empty",
    severity: "error",
    message: "Built app artifact directory is empty.",
    source: "artifact",
    target: r.paths.artifactDirectory
  }), K(n)) || !a) return W(r, n, o, s);
  const c = a;
  if (e.local) return Qe(r, n, c, s, null, null, { kind: "unknown" });
  const d = await zi(s, e.registryOptions, e.services, n, t ? "error" : "warning");
  if (!d) return Vt(r, n, a, s, t);
  const l = J(d.registryUrl, {
    token: d.accessToken,
    request: e.services.request
  });
  try {
    const u = await l.apps.get(c);
    return u.exists ? u.claim.claimedByCurrentUser ? Qe(r, n, c, s, d, l, {
      kind: "known",
      appExists: !0,
      role: u.claim.role
    }) : (n.push({
      code: "app_membership_required",
      severity: "error",
      message: `Current Registry account cannot publish app ID "${c}".`,
      source: "registry"
    }), W(r, n, c, s)) : (n.push({
      code: "app_not_claimed",
      severity: "error",
      message: `App ID "${c}" has not been claimed for this Registry.`,
      source: "registry",
      nextCommand: "registry claim"
    }), W(r, n, c, s));
  } catch (u) {
    return n.push(Fs(u, t ? "error" : "warning")), Vt(r, n, c, s, t);
  }
}
async function zi(e, t, s, r, n) {
  const a = Ji(t);
  if (a) return Hi(e, a, s.now());
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
    const c = await J(e, { request: s.request }).auth.refresh({ refreshToken: o.refreshToken }), d = {
      registryUrl: e,
      accessToken: c.accessToken,
      refreshToken: c.refreshToken,
      expiresAt: new Date(s.now() + c.expiresIn * 1e3).toISOString(),
      account: c.account
    };
    return await s.saveSession(d), d;
  } catch (c) {
    return r.push(Fs(c, n)), null;
  }
}
function Ji(e) {
  const t = e?.token?.trim();
  return t || process.env.REGISTRY_ACCESS_TOKEN?.trim() || void 0;
}
function Hi(e, t, s) {
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
function Fs(e, t = "error") {
  if (e instanceof P) {
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
function Qe(e, t, s, r, n, a, o) {
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
function Vt(e, t, s, r, n) {
  return n ? W(e, t, s, r) : Qe(e, t, s, r, null, null, { kind: "unknown" });
}
function Gi(e, t) {
  e.command("check").argument("[root]", "Primer app project root", ".").description("Check whether a Primer app project is ready for Registry publishing").option("-m, --manifest <path>", "Source manifest path").option("-d, --dist <path>", "Built app artifact directory").option("--local", "Skip Registry session and remote app checks").option("--require-dist", "Treat a missing built app artifact directory as an error").option("--json", "Print a machine-readable result").action(async (s, r) => {
    const n = E({
      json: _(e, r),
      write: t.write
    }), a = await Bs({
      root: s,
      manifest: r.manifest,
      dist: r.dist,
      registryOptions: e.opts(),
      services: t,
      local: r.local,
      requireDist: r.requireDist,
      mode: "check"
    }), o = !K(a.diagnostics);
    o || y(2), m(n, {
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
    }, Wi(a, o));
  });
}
function Wi(e, t) {
  const s = [t ? "Registry check completed." : "Registry check failed."];
  s.push(`Registry: ${e.registryUrl}`), e.appId && s.push(`App ID: ${e.appId}`), e.inspection.files.length > 0 && s.push(`Files: ${e.inspection.files.length} (${e.inspection.totalBytes} bytes)`), e.diagnostics.length > 0 && s.push("", fe(e.diagnostics));
  const r = Array.from(new Set(e.diagnostics.map((n) => n.nextCommand).filter(Boolean)));
  return r.length > 0 && s.push("", `Next: ${r.join(" && ")}`), s.join(`
`);
}
function Qi(e, t) {
  e.command("init").argument("[root]", "Primer app project root", ".").description("Initialize local Registry manifest metadata").option("-m, --manifest <path>", "Source manifest path").option("--json", "Print a machine-readable preview without writing").action(async (s, r) => {
    const n = _(e, r), a = E({
      json: n,
      write: t.write
    });
    try {
      const o = await Ts({
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
function Yi(e, t) {
  const s = e.command("members").description("Manage Registry app members");
  s.command("list").option("--app-id <app-id>", "Registry app ID").option("--root <root>", "Primer app project root", ".").option("--json", "Print a machine-readable result").action(async (r) => {
    await we(e, t, r, async ({ client: n }) => {
      const a = await be(r), o = await n.members.list(a);
      return {
        payload: {
          status: "members_listed",
          appId: a,
          members: o.members
        },
        message: eo(a, o.members)
      };
    });
  }), s.command("add").option("--app-id <app-id>", "Registry app ID").option("--root <root>", "Primer app project root", ".").option("--email <email>", "Registry account email").option("--user-id <user-id>", "Registry user ID").requiredOption("--role <role>", "App member role: owner or member").option("--json", "Print a machine-readable result").action(async (r) => {
    await we(e, t, r, async ({ client: n }) => {
      ze(r);
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
    await we(e, t, r, async ({ client: n }) => {
      ze(r);
      const a = await be(r), o = r.userId ?? await Bt(n, a, r.email);
      return o ? (await n.members.remove(a, o), {
        payload: {
          status: "member_removed",
          appId: a,
          userId: o,
          target: G(r)
        },
        message: `Removed ${G(r)} from ${a}.`
      }) : Ft(a, G(r));
    });
  }), s.command("set-role").option("--app-id <app-id>", "Registry app ID").option("--root <root>", "Primer app project root", ".").option("--email <email>", "Registry account email").option("--user-id <user-id>", "Registry user ID").requiredOption("--role <role>", "App member role: owner or member").option("--json", "Print a machine-readable result").action(async (r) => {
    await we(e, t, r, async ({ client: n }) => {
      ze(r);
      const a = await be(r), o = r.userId ?? await Bt(n, a, r.email);
      if (!o) return Ft(a, G(r));
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
async function we(e, t, s, r) {
  await q(e, t, s, r, {
    defaultErrorMessage: "Registry members command failed",
    formatError: Xi,
    isUsageError: Ki
  });
}
async function be(e) {
  const t = await dt({
    appId: e.appId,
    root: e.root
  });
  if (t.appId && !K(t.diagnostics)) return t.appId;
  throw new Error(fe(t.diagnostics) || "Unable to resolve Registry app ID");
}
function ze(e) {
  if (!!e.email == !!e.userId) throw new zs("Provide exactly one member selector: --email or --user-id");
}
var zs = class extends Error {
};
function Ki(e) {
  return e instanceof zs;
}
async function Bt(e, t, s) {
  return (await e.members.list(t)).members.find((r) => r.email?.toLowerCase() === s.toLowerCase())?.userId ?? null;
}
function Ft(e, t) {
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
function Xi(e) {
  return e instanceof P ? {
    status: Zi(e),
    message: e.message
  } : {
    status: "error",
    message: e instanceof Error ? e.message : "Registry members command failed"
  };
}
function Zi(e) {
  return e.code === "permission_denied" || e.status === 403 ? "permission_denied" : e.code === "user_not_found" ? "user_not_found" : e.code === "member_not_found" ? "member_not_found" : e.code === "last_owner_required" ? "last_owner_required" : "error";
}
function eo(e, t) {
  return x({
    columns: [
      {
        header: "USER ID",
        value: (s) => s.userId,
        color: w.id
      },
      {
        header: "EMAIL",
        value: (s) => s.email
      },
      {
        header: "ROLE",
        value: (s) => s.role,
        color: to
      }
    ],
    rows: t,
    emptyMessage: `No members found for ${e}.`
  });
}
function to(e) {
  return e.trim() === "owner" ? w.success(e) : e;
}
function G(e) {
  return e.email ?? e.userId ?? "member";
}
function so(e) {
  const t = e.inspection.sourceManifest;
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
function ro(e, t) {
  Js(e.command("publish"), e, t);
}
function no(e, t, s) {
  Js(e.command("publish"), t, s);
}
function Js(e, t, s) {
  e.argument("[root]", "Primer app project root", ".").description("Publish a Primer app project root").option("-m, --manifest <path>", "Source manifest path").option("-d, --dist <path>", "Built app artifact directory").option("--force-approve", "Approve and connect the uploaded app version to production").option("--dry-run", "Validate and print the upload plan without creating an upload").option("--local", "Skip Registry preflight checks for dry-run validation").option("--json", "Print a machine-readable result").action(async (r, n) => {
    const a = E({
      json: _(t, n),
      write: s.write
    });
    try {
      if (n.local && !n.dryRun) {
        y(2), m(a, {
          status: "error",
          message: "Local publish is only supported with --dry-run."
        }, "Local publish is only supported with --dry-run.");
        return;
      }
      const o = await Bs({
        root: r,
        manifest: n.manifest,
        dist: n.dist,
        registryOptions: t.opts(),
        services: s,
        local: n.local,
        mode: "publish-required"
      });
      if (!o.ok) {
        uo(a, o.diagnostics, o.inspection, o.appId);
        return;
      }
      if (!o.appId) throw new Error("App ID is required before publishing.");
      const c = so({
        inspection: o.inspection,
        appId: o.appId,
        forceApprove: n.forceApprove,
        remoteState: o.remoteState
      });
      if (n.dryRun) {
        m(a, {
          status: "dry_run",
          ok: !0,
          diagnostics: o.diagnostics,
          plan: c
        }, po(c));
        return;
      }
      const d = o.client;
      if (!d) throw new Error("Registry validation did not create a publish client.");
      const l = await co({
        sourceManifest: o.inspection.sourceManifest,
        projectRoot: o.paths.root
      }), u = await io({
        artifactManifestPath: o.paths.sourceManifest,
        registryAssets: l.artifactManifestRegistryAssets
      }), p = await oo({
        artifactFiles: c.files,
        sourceManifest: o.inspection.sourceManifest,
        artifactDirectory: o.paths.artifactDirectory,
        projectRoot: o.paths.root,
        artifactManifestBody: u.body,
        registryAssetsFiles: l.files
      }), h = await d.uploads.create({
        appId: o.appId,
        manifest: u.document,
        files: p.map((A) => ({
          path: A.uploadPath,
          size: A.size,
          contentType: A.contentType
        }))
      });
      for (const A of p) {
        const U = h.files.find((he) => he.path === A.uploadPath);
        if (!U) throw new Error(`No upload URL returned for ${A.uploadPath}`);
        const O = await fetch(U.url, {
          method: U.method,
          headers: U.headers,
          body: await ao(A)
        });
        if (!O.ok) throw new Error(`Upload failed for ${A.uploadPath}: ${O.status}`);
      }
      const b = await d.uploads.complete(h.uploadId, n.forceApprove ? { forceApprove: !0 } : void 0), $ = b.status === "approved" ? `Approved app ${b.appId} version ${b.appVersionId} and connected it to production.` : `Submitted app ${b.appId} version ${b.appVersionId} to staging.`;
      m(a, {
        status: b.status === "approved" ? "publish_approved" : "publish_submitted",
        appId: b.appId,
        appVersionId: b.appVersionId,
        uploadId: h.uploadId,
        versionRootUrl: b.versionRootUrl,
        ...b.registryAssets.length > 0 ? { registryAssets: b.registryAssets } : {}
      }, $);
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
async function ao(e) {
  return e.body ? e.body : I(B(e.root, e.path));
}
async function io(e) {
  const t = await I(e.artifactManifestPath, "utf8");
  let s;
  try {
    s = JSON.parse(t);
  } catch {
    throw new Error("manifest.json must be valid JSON");
  }
  if (!s || typeof s != "object" || Array.isArray(s)) throw new Error("manifest.json must be a JSON object");
  const r = { ...s }, n = e.registryAssets;
  return n.kind === "none" ? (delete r.registryAssets, {
    document: r,
    body: Ye(r)
  }) : (r.registryAssets = n.kind === "inline" ? n.assets : n.paths.length === 1 ? n.paths[0] : n.paths, {
    document: r,
    body: Ye(r)
  });
}
function Ye(e) {
  return Buffer.from(`${JSON.stringify(e, null, 2)}
`);
}
async function oo(e) {
  const t = e.artifactFiles.map((r) => ({
    ...r,
    ...r.path === "manifest.json" && e.artifactManifestBody ? {
      size: e.artifactManifestBody.byteLength,
      body: e.artifactManifestBody
    } : {},
    uploadPath: r.path,
    root: e.artifactDirectory
  }));
  e.artifactManifestBody && !t.some((r) => r.uploadPath === "manifest.json") && t.push({
    path: ve,
    uploadPath: ve,
    size: e.artifactManifestBody.byteLength,
    contentType: X(ve),
    root: e.artifactDirectory,
    body: e.artifactManifestBody
  });
  const s = new Set(t.map((r) => r.uploadPath));
  for (const r of e.registryAssetsFiles) {
    const n = t.findIndex((a) => a.uploadPath === r.uploadPath);
    n >= 0 ? t[n] = r : t.push(r), s.add(r.uploadPath);
  }
  if (e.sourceManifest?.registryAssets.kind === "files") for (const r of e.sourceManifest.registryAssets.paths) {
    if (s.has(r)) continue;
    const n = {
      path: r,
      uploadPath: r,
      size: (await Ee(B(e.projectRoot, r))).size,
      contentType: X(r),
      root: e.projectRoot
    }, a = t.findIndex((o) => o.uploadPath === r);
    a >= 0 ? t[a] = n : t.push(n), s.add(r);
  }
  return t;
}
async function co(e) {
  const t = e.sourceManifest?.registryAssets;
  if (!t || t.kind === "none") return {
    artifactManifestRegistryAssets: { kind: "none" },
    files: []
  };
  if (t.kind === "inline") {
    const c = await We(e.projectRoot, t.assets);
    return {
      artifactManifestRegistryAssets: {
        kind: "inline",
        assets: c.assets
      },
      files: c.files.map((d) => zt(d, e.projectRoot))
    };
  }
  const s = [], r = [];
  for (const c of t.paths) {
    const d = lo(await I(B(e.projectRoot, c), "utf8"));
    s.push({
      path: c,
      document: d.document,
      assets: d.assets
    }), r.push(...d.assets);
  }
  const n = await We(e.projectRoot, r), a = n.files.map((c) => zt(c, e.projectRoot));
  let o = 0;
  for (const c of s) {
    const d = n.assets.slice(o, o + c.assets.length);
    o += c.assets.length;
    const l = Ye({
      ...c.document,
      assets: d
    });
    a.push({
      path: c.path,
      uploadPath: c.path,
      size: l.byteLength,
      contentType: X(c.path),
      root: e.projectRoot,
      body: l
    });
  }
  return {
    artifactManifestRegistryAssets: {
      kind: "files",
      paths: t.paths
    },
    files: a
  };
}
function lo(e) {
  let t;
  try {
    t = JSON.parse(e);
  } catch {
    throw new Error("Registry assets manifest must be valid JSON");
  }
  if (!t || typeof t != "object" || Array.isArray(t)) throw new Error("Registry assets manifest must be a JSON object");
  const s = on(e);
  return {
    document: t,
    assets: s.assets
  };
}
function zt(e, t) {
  return e.kind === "remote" ? {
    path: e.uploadPath,
    uploadPath: e.uploadPath,
    size: e.size,
    contentType: e.contentType,
    root: t,
    body: Buffer.from(e.bytes)
  } : {
    path: e.path,
    uploadPath: e.uploadPath,
    size: e.size,
    contentType: e.contentType,
    root: "/"
  };
}
function uo(e, t, s, r) {
  const n = t.find((a) => a.severity === "error");
  if (y(2), n?.code === "app_not_claimed") {
    const a = r ?? "unknown";
    m(e, {
      status: "app_not_claimed",
      appId: a,
      nextCommand: "registry claim"
    }, `App ID "${a}" has not been claimed for this Registry.

Run:
  registry claim`);
    return;
  }
  if (n?.code === "manifest_missing_app_id") {
    m(e, {
      status: "manifest_missing_app_id",
      manifestPath: s.paths.sourceManifest,
      message: "Source manifest must include appId before publishing."
    }, `Source manifest ${s.paths.sourceManifest} must include appId before publishing.`);
    return;
  }
  m(e, {
    status: n?.code ?? "error",
    message: n?.message ?? "Registry publish validation failed.",
    diagnostics: t
  }, fe(t));
}
function po(e) {
  const t = e.remoteState.kind === "unknown" ? `
Remote state: unknown (local dry-run).` : "";
  return [
    `Dry run for app ${e.appId}.`,
    `Files: ${e.files.length} (${e.totalBytes} bytes).`,
    `Expected: ${e.expectedStatus} on ${e.expectedChannel}.`
  ].join(`
`) + t;
}
function mo(e, t) {
  e.command("status").argument("[root]", "Primer app project root", ".").description("Show Registry state for a Primer app").option("--app-id <app-id>", "Registry app ID").option("--json", "Print a machine-readable result").action(async (s, r) => {
    const n = E({
      json: _(e, r),
      write: t.write
    });
    try {
      const { client: a } = await ce(e, t), o = r.appId ? null : await fo(s), c = r.appId || o;
      if (!c) {
        y(2), m(n, {
          status: "manifest_missing_app_id",
          manifestHasAppId: !1,
          nextCommand: "registry claim"
        }, "Source manifest is missing appId. Run: registry claim");
        return;
      }
      const d = cs.parse(await a.apps.get(c)), l = d.exists ? await ho(a, c) : null, u = l ? await go(a, c) : [], p = {
        status: "registry_status_shown",
        appId: c,
        manifestHasAppId: r.appId ? null : !!o,
        versionsAccessible: !!l,
        app: d,
        latestVersions: {
          submitted: l?.find((h) => h.status === "submitted") || null,
          approved: l?.find((h) => h.status === "approved") || null,
          rejected: l?.find((h) => h.status === "rejected") || null
        },
        channels: u,
        nextCommand: wo(d.exists, l?.length || 0)
      };
      m(n, p, bo(p));
    } catch (a) {
      if (y(a instanceof P && a.status >= 400 && a.status < 500 ? 2 : 1), n.json) {
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
async function fo(e) {
  return (await xa(D({ root: e }).sourceManifest)).appId || null;
}
async function ho(e, t) {
  try {
    return (await e.versions.list({ appId: t })).appVersions;
  } catch (s) {
    if (s instanceof P && s.status === 403) return null;
    throw s;
  }
}
async function go(e, t) {
  try {
    return await yo(e, t);
  } catch (s) {
    if (s instanceof P && s.status === 403) return [];
    throw s;
  }
}
async function yo(e, t) {
  const s = (await e.channels.list()).channels, r = [];
  for (const n of s) {
    const a = await e.channels.assignments(n.id, { appId: t });
    r.push(...a.assignments);
  }
  return r;
}
function wo(e, t) {
  return e ? t === 0 ? "registry publish" : null : "registry claim";
}
function bo(e) {
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
function vo(e, t) {
  const s = e.command("token").description("Manage long-lived Registry access tokens");
  s.command("create").description("Create a Registry access token and print its secret once").requiredOption("--title <title>", "Token title").option("-w, --write", "Create a write token").option("--reviewer", "Create a reviewer token").option("-a, --admin", "Create an admin token").option("--testing", "Create a testing token").option("-p, --permission <permission>", "Add a permission; repeat or use comma-separated/grouped values", Po, []).option("--expires-at <datetime>", "ISO 8601 expiry with timezone").option("--json", "Print JSON output").action(async (n) => {
    await M(e, t, n, async ({ client: a }) => {
      const o = Ro(n), c = await a.tokens.create({
        title: n.title,
        permissions: o,
        expiresAt: n.expiresAt ? Jt(n.expiresAt, t.now()).toISOString() : null
      });
      return {
        payload: c,
        message: `Created Registry access token ${c.token.id}. Secret: ${c.secret}`
      };
    });
  }), s.command("update").argument("<token-id>").description("Update Registry access token metadata").option("--title <title>", "Token title").option("--expires-at <datetime>", "ISO 8601 expiry with timezone").option("--json", "Print JSON output").action(async (n, a) => {
    await M(e, t, a, async ({ client: o }) => {
      const c = {};
      if (a.title !== void 0 && (c.title = a.title), a.expiresAt !== void 0 && (c.expiresAt = Jt(a.expiresAt, t.now()).toISOString()), Object.keys(c).length === 0) throw new Error("Provide at least one token update option");
      const d = await o.tokens.update(n, c);
      return {
        payload: d,
        message: `Updated token ${d.token.id}.`
      };
    });
  }), s.command("list").description("List your Registry access tokens").option("--json", "Print JSON output").action(async (n) => {
    await M(e, t, n, async ({ client: a }) => {
      const o = await a.tokens.list();
      return {
        payload: o,
        message: ko(o.tokens)
      };
    });
  }), s.command("status").argument("<token-id>").description("Show a Registry access token status").option("--json", "Print JSON output").action(async (n, a) => {
    await M(e, t, a, async ({ client: o }) => {
      const c = await o.tokens.status(n);
      return {
        payload: c,
        message: `Token ${c.token.id}: ${c.token.title}`
      };
    });
  }), s.command("grant").argument("<token-id>").requiredOption("--app-id <appId>", "App ID").description("Grant a Registry access token to an app").option("--json", "Print JSON output").action(async (n, a) => {
    await M(e, t, a, async ({ client: o }) => {
      const c = await o.tokens.grant(n, { appId: a.appId });
      return {
        payload: c,
        message: `Granted token ${n} to app ${c.grant.appId}.`
      };
    });
  }), s.command("ungrant").argument("<token-id>").requiredOption("--app-id <appId>", "App ID").description("Remove a Registry access token app grant").option("--json", "Print JSON output").action(async (n, a) => {
    await M(e, t, a, async ({ client: o }) => {
      const c = await o.tokens.ungrant(n, { appId: a.appId });
      return {
        payload: c,
        message: `Removed token ${n} grant for app ${c.grant.appId}.`
      };
    });
  }), s.command("delete").argument("<token-id>").description("Delete a Registry access token").option("--json", "Print JSON output").action(async (n, a) => {
    await M(e, t, a, async ({ client: o }) => {
      const c = await o.tokens.delete(n);
      return {
        payload: c,
        message: `Deleted token ${c.token.id}.`
      };
    });
  });
  const r = s.command("permissions").alias("p").description("Manage Registry access token permissions");
  r.command("list").argument("<token-id>").description("List canonical Registry access token permissions").option("--json", "Print JSON output").action(async (n, a) => {
    await M(e, t, a, async ({ client: o }) => {
      const c = await o.tokens.listPermissions(n);
      return {
        payload: c,
        message: Ws(c.permissions)
      };
    });
  }), Je(r, e, t, "set"), Je(r, e, t, "add"), Je(r, e, t, "remove");
}
function Ro(e) {
  const t = Io(e), s = So(e);
  return s ? rt([...$r(s), ...t]) : t;
}
function So(e) {
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
function Io(e) {
  return rt(Hs(e.permission ?? []));
}
function Ao(e) {
  return rt(Hs(e));
}
function Po(e, t = []) {
  return [...t, e];
}
function Je(e, t, s, r) {
  e.command(r).argument("<permissions...>", "Permissions; use space-separated, comma-separated, or grouped values").description(`${r[0].toUpperCase()}${r.slice(1)} Registry access token permissions`).requiredOption("-t, --token-id <token-id>", "Registry access token ID").option("--json", "Print JSON output").action(async (n, a) => {
    await M(t, s, a, async ({ client: o }) => {
      const c = { permissions: Ao(n) }, d = r === "set" ? await o.tokens.setPermissions(a.tokenId, c) : r === "add" ? await o.tokens.addPermissions(a.tokenId, c) : await o.tokens.removePermissions(a.tokenId, c);
      return {
        payload: d,
        message: Ws(d.permissions)
      };
    });
  });
}
function Hs(e) {
  return e.flatMap((t) => Gs(t).flatMap(Eo));
}
function Gs(e, t = {}) {
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
function Eo(e) {
  _o(e);
  const t = /^([a-z]+(?:\.[a-z]+)*)\.\(([^()]+)\)$/.exec(e);
  if (!t) return [e];
  const [, s, r] = t;
  if (!s) throw new Error("Permission group has an empty prefix");
  return Gs(r, { rejectEmpty: !0 }).map((n) => `${s}.${n}`);
}
function _o(e) {
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
function Jt(e, t) {
  if (!/[zZ]|[+-]\d{2}:\d{2}$/.test(e)) throw new Error("--expires-at requires an explicit timezone or offset");
  const s = new Date(e);
  if (Number.isNaN(s.getTime())) throw new Error("--expires-at must be an ISO 8601 datetime");
  if (s.getTime() <= t) throw new Error("--expires-at must be in the future");
  return s;
}
function M(e, t, s, r) {
  return q(e, t, s, r, {
    defaultErrorMessage: "Registry token command failed",
    tokenPolicy: "browser-session-only"
  });
}
function ko(e) {
  return x({
    columns: [
      {
        header: "TOKEN ID",
        value: (t) => t.id,
        color: w.id
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
        color: jo
      }
    ],
    rows: e,
    emptyMessage: "No Registry access tokens found."
  });
}
function Ws(e) {
  return x({
    columns: [{
      header: "PERMISSION",
      value: (t) => t
    }],
    rows: [...e],
    emptyMessage: "No Registry access token permissions found."
  });
}
function jo(e) {
  return e.trim() === "active" ? w.success(e) : w.warning(e);
}
function To(e, t) {
  const s = e.command("versions").alias("v").description("Manage Registry app versions");
  no(s, e, t), Qa(s, e, t), s.command("approve").argument("<version-id>", "App version UUID").option("--reason <text>", "Review reason").option("--json", "Print a machine-readable result").action(async (r, n) => {
    await ne(e, t, n, async ({ client: a }) => {
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
    await ne(e, t, n, async ({ client: a }) => {
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
    await ne(e, t, n, async ({ client: a }) => {
      $o(n);
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
  }), Ls(s.command("list").option("--app-id <app-id>", "Filter by app ID").option("--status <status>", "Filter by status: submitted, approved, or rejected").option("--channel <channel-id>", "Filter by current channel assignment")).option("--json", "Print a machine-readable result").action(async (r) => {
    await ne(e, t, r, async ({ client: n }) => {
      const a = await Vs(r), o = await n.versions.list({
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
        message: qo(o.appVersions)
      };
    });
  }), s.command("show").argument("<version-id>", "App version UUID").option("--json", "Print a machine-readable result").action(async (r, n) => {
    await ne(e, t, n, async ({ client: a }) => {
      const o = await a.versions.show(r);
      return {
        payload: {
          status: "version_shown",
          appVersion: o.appVersion
        },
        message: No(o.appVersion)
      };
    });
  });
}
async function ne(e, t, s, r) {
  await q(e, t, s, r, {
    defaultErrorMessage: "Registry versions command failed",
    formatError: xo,
    isUsageError: Co
  });
}
function $o(e) {
  if (!e.reason?.trim()) throw new Qs("Provide a deletion reason with --reason <text>");
}
var Qs = class extends Error {
};
function Co(e) {
  return e instanceof Qs || e instanceof Pe;
}
function xo(e) {
  if (e instanceof P) {
    const t = Uo(e);
    return {
      status: t,
      message: Oo(e, t),
      ...Mo(e)
    };
  }
  return {
    status: "error",
    message: e instanceof Error ? e.message : "Registry versions command failed"
  };
}
function Uo(e) {
  return e.code === "permission_denied" || e.code === "forbidden" || e.status === 403 ? "permission_denied" : e.code === "version_not_found" || e.status === 404 ? "version_not_found" : e.code === "version_already_deleted" ? "version_already_deleted" : e.code === "version_delete_blocked_by_channel" ? "version_delete_blocked_by_channel" : "error";
}
function Oo(e, t) {
  if (t !== "version_delete_blocked_by_channel") return e.message;
  const s = Ys(e), r = s.length > 0 ? ` Blocking channels: ${s.join(", ")}.` : "";
  return `${e.message}.${r} Disconnect or reconnect the blocking channels before deleting this version.`;
}
function Mo(e) {
  const t = Ys(e);
  return t.length > 0 ? { blockingChannels: t } : {};
}
function Ys(e) {
  return e instanceof As ? e.blockingChannelIds : [];
}
function No(e) {
  return `${e.id}
App: ${e.appId}
Status: ${e.status}
Channels: ${Ks(e)}
Title: ${e.title}`;
}
function qo(e) {
  return e.length === 0 ? "No app versions found." : x({
    columns: [
      {
        header: "VERSION ID",
        value: (t) => t.id,
        color: w.id
      },
      {
        header: "APP ID",
        value: (t) => t.appId,
        color: w.id
      },
      {
        header: "STATUS",
        value: (t) => t.status,
        color: Do
      },
      {
        header: "CHANNELS",
        value: Ks
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
function Do(e) {
  const t = e.trim();
  return t === "approved" ? w.success(e) : t === "rejected" ? w.warning(e) : e;
}
function Ks(e) {
  return e.channels && e.channels.length > 0 ? e.channels.map((t) => t.channelId).join(",") : "-";
}
async function Lo(e, t = {}) {
  const s = `${e} ${t.defaultValue === !1 ? "[y/N]" : "[Y/n]"} `, r = Wt({
    input: Qt,
    output: Yt
  });
  try {
    const n = (await r.question(s)).trim().toLowerCase();
    return n ? n === "y" || n === "yes" : t.defaultValue !== !1;
  } finally {
    r.close();
  }
}
async function Vo(e, t = {}) {
  const s = `${e}${t.defaultValue ? ` [${t.defaultValue}]` : ""} `, r = Wt({
    input: Qt,
    output: Yt
  });
  try {
    return (await r.question(s)).trim() || t.defaultValue || "";
  } finally {
    r.close();
  }
}
var Xs = B(cr(), ".config", "primer-registry"), le = B(Xs, "session.json");
async function Bo() {
  return Ge(le) ? JSON.parse(await I(le, "utf8")) : null;
}
async function Fo(e) {
  await Gt(Xs, {
    recursive: !0,
    mode: 448
  }), await Ke(le, JSON.stringify(e, null, 2), { mode: 384 }), await sr(le, 384);
}
async function zo() {
  await nr(le, { force: !0 });
}
var Jo = "x-registry-cli-version", Zs = "0.3.0";
function Ho(e = {}) {
  const t = {
    now: () => Date.now(),
    openBrowser: Wo,
    readSession: Bo,
    removeSession: zo,
    request: pa,
    saveSession: Fo,
    sleep: Qo,
    write: (s) => console.log(s),
    confirm: Lo,
    promptText: Vo,
    ...e
  };
  return {
    ...t,
    request: Go(t.request)
  };
}
function Go(e) {
  return (t, s, r) => e(t, s, {
    ...r,
    headers: {
      ...r?.headers,
      [Jo]: Zs
    }
  });
}
function Wo(e) {
  const t = process.platform === "darwin" ? "open" : process.platform === "win32" ? "cmd" : "xdg-open", s = process.platform === "win32" ? [
    "/c",
    "start",
    "",
    e
  ] : [e];
  return new Promise((r) => {
    const n = or(t, s, {
      detached: !0,
      stdio: "ignore"
    });
    n.once("error", () => r(!1)), n.once("spawn", () => {
      n.unref(), r(!0);
    });
  });
}
function Qo(e) {
  return new Promise((t) => setTimeout(t, e));
}
function Yo(e = {}) {
  const t = Ho(e), s = new tr().name("registry").description("Primer Registry HTTP publishing CLI").version(Zs, "-V, --version", "Output the current version").option("-u, --registry-url <url>", "Registry URL").option("--token <access-token>", "Registry access token").option("--json", "Print machine-readable JSON output");
  return fa(s, t), Gi(s, t), Da(s, t), Qi(s, t), ro(s, t), mo(s, t), vo(s, t), fi(s, t), Ga(s, t), ri(s, t), To(s, t), ki(s, t), Yi(s, t), Ra(s, t), s;
}
process.env.NODE_ENV !== "test" && await Yo().parseAsync().catch((e) => {
  console.error(e instanceof Error ? e.message : String(e)), process.exitCode = 1;
});
