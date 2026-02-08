---
name: db-migrate
description: Creates and applies Alembic database migrations for the FastAPI backend. Use when creating migrations, upgrading schema, rolling back, or generating migration for new tables.
---

# Database Migration Skill

Creates and applies Alembic database migrations for the FastAPI backend.

## Description

This skill helps create new Alembic migrations for database schema changes and applies them to the PostgreSQL database. It wraps common Alembic commands with helpful prompts and validation.

## Use Cases

- "Create a database migration"
- "Apply database migrations"
- "Generate migration for new table"
- "Upgrade database schema"
- "Rollback last migration"

## Requirements

- FastAPI backend with Alembic configured
- PostgreSQL database accessible
- Backend directory: `backend/turnify-api/`

## Script

Ref: scripts/migrate.sh

## Parameters

- `create <message>` - Create a new migration with auto-generated changes
- `upgrade` - Apply all pending migrations
- `downgrade` - Rollback last migration
- `current` - Show current migration version
- `history` - Show migration history

## Output

Displays:
- Migration file created (if creating)
- Migrations applied (if upgrading)
- Current database version
- Any errors encountered

## Examples

```bash
# Create a new migration
bash scripts/migrate.sh create "add_tracking_number_to_returns"

# Apply all pending migrations
bash scripts/migrate.sh upgrade

# Rollback last migration
bash scripts/migrate.sh downgrade

# Show current version
bash scripts/migrate.sh current

# Show migration history
bash scripts/migrate.sh history
```

## Notes

- Always review auto-generated migrations before applying
- Test migrations in development before production
- Keep migration messages descriptive
- Never delete applied migrations
