const { SQLiteAdapter, MySQLAdapter, MongoDBAdapter } = require('./dbAdapters');

class DBConnectionFactory {
    static createAdapter(config) {
        switch (config.type) {
            case 'sqlite':
                return new SQLiteAdapter();
            case 'mysql':
                return new MySQLAdapter();
            case 'mongodb':
                return new MongoDBAdapter();
            default:
                throw new Error('Unsupported database type');
        }
    }
}

module.exports = DBConnectionFactory; 