#!/bin/bash

##
# Database Migration Script for Turnify B2B Return Portal
#
# Wraps Alembic commands with helpful prompts and validation
##

set -e  # Exit on error

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Directories
BACKEND_DIR="backend/turnify-api"
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../../.." && pwd)"

# Print header
print_header() {
    echo "======================================================================"
    echo "🗄️  Database Migration Tool - Turnify B2B Return Portal"
    echo "======================================================================"
    echo ""
}

# Print help
print_help() {
    echo "Usage: $0 <command> [options]"
    echo ""
    echo "Commands:"
    echo "  create <message>   Create a new migration with auto-generated changes"
    echo "  upgrade           Apply all pending migrations"
    echo "  downgrade         Rollback last migration"
    echo "  current           Show current migration version"
    echo "  history           Show migration history"
    echo ""
    echo "Examples:"
    echo "  $0 create \"add tracking number to returns\""
    echo "  $0 upgrade"
    echo "  $0 downgrade"
    echo "  $0 current"
    echo ""
}

# Check if backend directory exists
check_backend() {
    if [ ! -d "$PROJECT_ROOT/$BACKEND_DIR" ]; then
        echo -e "${RED}❌ Error: Backend directory not found${NC}"
        echo "   Expected: $PROJECT_ROOT/$BACKEND_DIR"
        exit 1
    fi

    if [ ! -f "$PROJECT_ROOT/$BACKEND_DIR/alembic.ini" ]; then
        echo -e "${RED}❌ Error: Alembic not configured${NC}"
        echo "   alembic.ini not found in backend directory"
        exit 1
    fi
}

# Create migration
create_migration() {
    local message="$1"

    if [ -z "$message" ]; then
        echo -e "${RED}❌ Error: Migration message required${NC}"
        echo "   Usage: $0 create <message>"
        exit 1
    fi

    echo -e "${BLUE}📝 Creating migration: ${message}${NC}"
    echo ""

    cd "$PROJECT_ROOT/$BACKEND_DIR"

    # Generate migration
    alembic revision --autogenerate -m "$message"

    echo ""
    echo -e "${GREEN}✅ Migration created!${NC}"
    echo ""
    echo -e "${YELLOW}⚠️  Important:${NC}"
    echo "   1. Review the generated migration file in alembic/versions/"
    echo "   2. Make any necessary manual adjustments"
    echo "   3. Test the migration in development"
    echo "   4. Run: $0 upgrade"
    echo ""
}

# Upgrade database
upgrade_database() {
    echo -e "${BLUE}⬆️  Applying migrations...${NC}"
    echo ""

    cd "$PROJECT_ROOT/$BACKEND_DIR"

    # Apply migrations
    alembic upgrade head

    echo ""
    echo -e "${GREEN}✅ Database upgraded to latest version!${NC}"
    echo ""
}

# Downgrade database
downgrade_database() {
    echo -e "${YELLOW}⬇️  Rolling back last migration...${NC}"
    echo ""

    read -p "Are you sure you want to rollback? (y/N): " -n 1 -r
    echo ""

    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Rollback cancelled."
        exit 0
    fi

    cd "$PROJECT_ROOT/$BACKEND_DIR"

    # Rollback one migration
    alembic downgrade -1

    echo ""
    echo -e "${GREEN}✅ Rolled back last migration${NC}"
    echo ""
}

# Show current version
show_current() {
    echo -e "${BLUE}📍 Current database version:${NC}"
    echo ""

    cd "$PROJECT_ROOT/$BACKEND_DIR"
    alembic current

    echo ""
}

# Show history
show_history() {
    echo -e "${BLUE}📜 Migration history:${NC}"
    echo ""

    cd "$PROJECT_ROOT/$BACKEND_DIR"
    alembic history --verbose

    echo ""
}

# Main
main() {
    print_header
    check_backend

    local command="$1"

    case "$command" in
        create)
            shift
            create_migration "$*"
            ;;
        upgrade)
            upgrade_database
            ;;
        downgrade)
            downgrade_database
            ;;
        current)
            show_current
            ;;
        history)
            show_history
            ;;
        help|--help|-h)
            print_help
            ;;
        *)
            echo -e "${RED}❌ Error: Unknown command${NC}"
            echo ""
            print_help
            exit 1
            ;;
    esac
}

# Run main if script is executed directly
if [ "${BASH_SOURCE[0]}" -ef "$0" ]; then
    main "$@"
fi
