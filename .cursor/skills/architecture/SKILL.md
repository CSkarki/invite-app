---
name: architecture
description: Guides software architecture and system design including structure, patterns, and separation of concerns. Use when designing systems, reviewing architecture, discussing patterns, APIs, data flow, or when the user asks about structure, scalability, or how to organize code.
---

# Architecture Skill

Apply when designing or reviewing system structure and code organization.

## Structure

- Clear separation: UI, business logic, data access, and shared utilities in distinct layers or modules.
- Single responsibility: modules and components do one thing well.
- Dependencies point inward: core logic does not depend on UI or framework details where possible.

## Patterns

- Prefer composition over deep inheritance.
- Use established patterns (e.g. repository for data, service layer for use cases) when they fit; avoid over-engineering for small scope.
- APIs and boundaries: define clear contracts (types, interfaces) at module and service boundaries.

## Data Flow

- Unidirectional data flow where applicable (e.g. state down, events up).
- Shared state in few, well-defined places; avoid prop drilling or scattered globals.
- Async and side effects: isolate in services or hooks; keep components mostly synchronous and pure where possible.

## APIs & Integration

- REST or GraphQL: consistent conventions (naming, errors, versioning).
- Client code: typed requests/responses; centralize API client and error handling.
- Consider caching, loading, and error states at the boundary.

## Checklist

- [ ] Layers/dependencies are clear and point in the right direction
- [ ] New code fits existing structure; no one-off patterns without reason
- [ ] Public APIs (modules, services, routes) have clear contracts
- [ ] State and side effects are localized and predictable
