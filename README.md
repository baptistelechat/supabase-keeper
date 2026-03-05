# Supabase Keeper

A CLI tool to manage Supabase projects locally.

## Installation

```bash
pnpm install
pnpm build
npm link # To run globally as supabase-keeper
```

## Usage

### Initialization

Initialize a new configuration file in the current directory:

```bash
supabase-keeper init
```

Or specify a directory:

```bash
supabase-keeper init ./my-config-dir
```

This command will guide you through the setup process, allowing you to add your first project.

## Configuration

The configuration is stored in `supabase-keeper.config.json`.

Example:

```json
{
  "projects": [
    {
      "name": "my-project",
      "path": "/absolute/path/to/project",
      "supabaseProjectUrl": "https://xyz.supabase.co",
      "supabasePublishableKey": "sb_publishable_..."
    }
  ]
}
```
