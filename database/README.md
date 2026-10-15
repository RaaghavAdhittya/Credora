# Database Layer (MySQL)

Relational persistence layer for off-chain metadata, student institution registry mappings, audit logs, and transaction status caching.

## Structure

- `migrations/`: Version-controlled SQL migration scripts (table creation, indexes, foreign keys).
- `seeds/`: Initial reference data (e.g., supported degree types, authorized institutional verifier entities).

## Database Requirements

- **Engine**: MySQL 8.0+
- **Default Database Name**: `apaar_verifier_db`
- **Character Set**: `utf8mb4`
- **Collation**: `utf8mb4_unicode_ci`

*Note: Database schemas and migration scripts will be implemented in subsequent phases.*
