# Deploy without losing runtime data

Project data written from the admin UI is runtime data and must stay outside Git:

- `server/data/*.json`
- `server/data/*.log`
- `public/uploads/*`

Seed/example files are stored in `server/data-example/*.json`. On server startup, missing runtime JSON files in `server/data` are created from the matching example file. If no example exists, the server creates an empty JSON array.

## First deploy or clone

```bash
npm install
npm run build
npm run admin:setup
npm run start
```

The server creates these folders automatically if they are missing:

```bash
server/data
public/uploads
```

## Before pulling code on VPS

Always back up runtime data before changing code:

```bash
mkdir -p backups
tar -czf backups/runtime-$(date +%Y%m%d-%H%M%S).tar.gz server/data public/uploads
```

Then pull code:

```bash
git pull
npm install
npm run build
```

Restart the Node/PM2 service after build.

For the first deploy of the commit that stops tracking runtime files, Git may remove the old tracked copies from the working tree. Restore the backup immediately after `git pull` if `server/data` or `public/uploads` is missing or incomplete:

```bash
tar -xzf backups/runtime-YYYYMMDD-HHMMSS.tar.gz
```

After this one-time transition, future `git pull` or `git reset` will not overwrite runtime data because those paths are ignored and no longer tracked.

## If the VPS still tracks old runtime files

Run this once on the VPS after pulling the commit that updates `.gitignore`:

```bash
git rm --cached -r server/data public/uploads
git commit -m "Stop tracking runtime data"
```

This removes the files from Git tracking only. It does not delete the real files from disk.

If you do not commit on the VPS, run the same `git rm --cached` locally, commit it, push, then pull that commit on the VPS.

## Restore backup

If a deploy ever changes runtime data unexpectedly:

```bash
tar -xzf backups/runtime-YYYYMMDD-HHMMSS.tar.gz
```

After restore, restart the server.
