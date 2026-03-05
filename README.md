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

### Resume a Project

Resume monitoring for a Supabase project.

```bash
supabase-keeper resume <project-name> [directory]
```

Aliases: `active`, `start`, `unpause`

Examples:

```bash
supabase-keeper resume my-project
supabase-keeper start my-project
```

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

