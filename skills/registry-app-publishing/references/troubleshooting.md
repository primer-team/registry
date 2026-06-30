# Troubleshooting

Start with structured checks:

```bash
registry whoami
registry status
registry check --json
```

If authentication fails, run:

```bash
registry login
```

For CI, confirm `REGISTRY_ACCESS_TOKEN` is present and has the permissions required by the command. See `ci-publishing.md` for token setup.

If validation fails, read the `registry check` diagnostics and run the suggested next command. Common fixes include initializing the manifest, claiming the app ID, building the artifact directory, or adding missing reusable assets.

If publish fails, try a dry run:

```bash
registry publish --dry-run
```

If a channel command fails, inspect current assignments and version review state:

```bash
registry versions show <app-version-uuid>
registry channels current --app-id <app-id>
```

See `release-operations.md` for review and channel commands.

Use the `registry` commands shown in these skill docs; there is no app-local admin path.
