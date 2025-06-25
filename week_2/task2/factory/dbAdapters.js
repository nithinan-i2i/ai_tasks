// SQLite Adapter
class SQLiteAdapter {
    connect(config) {
        // Simulate SQLite connection
        return `Connected to SQLite at ${config.file}`;
    }
}

// MySQL Adapter
class MySQLAdapter {
    connect(config) {
        // Simulate MySQL connection
        return `Connected to MySQL at ${config.host}:${config.port} as ${config.user}`;
    }
}

// MongoDB Adapter
class MongoDBAdapter {
    connect(config) {
        // Simulate MongoDB connection
        return `Connected to MongoDB at ${config.url}/${config.dbName}`;
    }
}

module.exports = {
    SQLiteAdapter,
    MySQLAdapter,
    MongoDBAdapter
}; 