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

### Add a Project

Add a new Supabase project to your configuration:

```bash
supabase-keeper add
```

This command will prompt you for the project name, Supabase URL, and Publishable Key. It validates the connection before adding the project.

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
      "createdAt": "2026-01-01T12:00:00.000Z"
    }
  ]
}
```
