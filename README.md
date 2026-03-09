# ⚡⌚ Supabase Keeper

A CLI tool to manage Supabase projects locally.

## Installation

```bash
pnpm install
pnpm build
npm link # To run globally as supabase-keeper
```

## Usage

### Initialization

Initialize a new configuration file.

```bash
supabase-keeper init [directory]
```

Examples:

```bash
supabase-keeper init
supabase-keeper init ./my-config-dir
```

This command will guide you through the setup process, allowing you to add your first project.

### Add a Project

Add a new Supabase project to your configuration.

```bash
supabase-keeper add [directory]
```

Examples:

```bash
supabase-keeper add
supabase-keeper add ./my-config-dir
```

This command will prompt you for the project name, Supabase URL, and Publishable Key. It validates the connection before adding the project.

### List Projects

List all configured projects.

```bash
supabase-keeper list [directory]
```

Alias: `ls`

Examples:

```bash
supabase-keeper list
supabase-keeper list ./my-config-dir
```

This will display a table with project details (Name, URL, Status, Created At, Last Ping) and the API Key (masked).

### Remove a Project

Remove a project from your configuration.

```bash
supabase-keeper remove <project-name> [directory]
```

Aliases: `rm`, `delete`

Examples:

```bash
supabase-keeper remove my-project
supabase-keeper rm my-project
supabase-keeper delete my-project ./my-config-dir
```

Options:

- `--force` (`-f`): Skip confirmation prompt.

### Pause a Project

Pause monitoring for a Supabase project.

```bash
supabase-keeper pause <project-name> [directory]
```

Aliases: `stop`, `suspend`

Examples:

```bash
supabase-keeper pause my-project
supabase-keeper stop my-project
```

### Activate a Project

Active monitoring for a Supabase project.

```bash
supabase-keeper active <project-name> [directory]
```

Aliases: `resume`, `start`, `unpause`

Examples:

```bash
supabase-keeper active my-project
supabase-keeper resume my-project
```

### Background Execution (Daemon Mode)

Run Supabase Keeper in the background to automatically ping your projects daily.

**Prerequisites:**

- [PM2](https://pm2.keymetrics.io/) must be installed globally:
  ```bash
  npm install pm2 -g
  ```

**Start the Daemon:**

```bash
supabase-keeper ping --daemon
```

This command will:
1. Verify PM2 installation.
2. Start a background process named `supabase-keeper`.
3. Configure the internal scheduler (runs daily at 09:00 AM).
4. Persist the process list (`pm2 save`).

**Manage the Daemon:**

- **View Logs:** Check execution logs and ping results.
  ```bash
  pm2 logs supabase-keeper
  ```

- **Stop Daemon:** Stop the background process.
  ```bash
  pm2 stop supabase-keeper
  ```

- **Restart Daemon:** Apply code updates or restart the process.
  ```bash
  pm2 restart supabase-keeper
  ```

### Manual Ping

Manually trigger a ping for all active projects (useful for testing).

```bash
supabase-keeper ping [directory]
```

Options:

- `--all`: Ping all projects regardless of status (not implemented yet).

## Configuration

The configuration is stored in `supabase-keeper.config.json`.

Example:

```json
{
  "projects": [
    {
      "name": "my-project",
      "supabaseProjectUrl": "https://xyz.supabase.co",
      "supabasePublishableKey": "sb_publishable_...",
      "createdAt": "2026-01-01T12:00:00.000Z",
      "status": "active"
    }
  ]
}
```

