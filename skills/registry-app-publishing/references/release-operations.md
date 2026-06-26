# Release Operations

Registry separates version publishing from channel availability. Versions move through two channels: `staging` (accepts `submitted` or `approved` versions) and `prod` (accepts only `approved` versions). `registry publish` connects the new version to `staging`; approving it promotes it to `prod`.

## Inspect Versions

Inspect versions before approval or channel changes:

```bash
registry versions list --app-id <app-id>
registry versions show <app-version-uuid>
```

## Review Versions

Approve or reject a version when you have operator permissions:

```bash
registry versions approve <app-version-uuid>
registry versions reject <app-version-uuid>
```

Approving both marks the version `approved` and connects it to the `prod` channel in a single step — you do not need a separate `channels connect prod` to release it. Rejecting marks the version `rejected`.

## Manage Channels

Inspect channel state:

```bash
registry channels list
registry channels show staging --app-id <app-id>
registry channels current --app-id <app-id>
```

Adjust assignments after approval with operator permissions — for example to move a different version onto a channel or to roll back:

```bash
registry channels connect staging --version-id <app-version-uuid>
registry channels connect prod --version-id <app-version-uuid> --reason "Release approved"
registry channels rollback prod --app-id <app-id> --to-version <app-version-uuid> --reason "Rollback"
```

`prod` accepts only `approved` versions; `staging` accepts `submitted` or `approved` versions. Production rollback additionally requires a `--reason`.
