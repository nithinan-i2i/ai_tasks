# Database Connection with Factory Pattern

## Why Factory Pattern Fits

The Factory Pattern is ideal for scenarios where an application needs to create objects (such as database clients) without specifying the exact class of object to create. In a system supporting multiple databases (SQLite, MySQL, MongoDB), the connection logic and syntax differ for each. The Factory Pattern allows:

- **Abstraction:** Client code does not need to know the details of each DB connection.
- **Flexibility:** Easily add support for new databases by extending the factory and adding new adapters.
- **Centralized Creation:** All connection logic is managed in one place, reducing duplication and errors.

## Implementation Summary

- `DBConnectionFactory`: Factory class that creates DB adapters based on config.
- `SQLiteAdapter`, `MySQLAdapter`, `MongoDBAdapter`: Concrete adapters for each DB type, each with its own connection logic.
- `clientExample.js`: Demonstrates dynamic creation and usage of DB adapters.
- `dbConnectionFactory.test.js`: Unit tests for factory and adapters. 