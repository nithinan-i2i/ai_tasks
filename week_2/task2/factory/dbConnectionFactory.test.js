const DBConnectionFactory = require('./dbConnectionFactory');

const sqliteConfig = { type: 'sqlite', file: 'test.db' };
const mysqlConfig = { type: 'mysql', host: 'localhost', port: 3306, user: 'admin' };
const mongoConfig = { type: 'mongodb', url: 'mongodb://localhost:27017', dbName: 'mydb' };

describe('DBConnectionFactory', () => {
    test('Creates SQLiteAdapter and connects', () => {
        const adapter = DBConnectionFactory.createAdapter(sqliteConfig);
        expect(adapter.connect(sqliteConfig)).toBe('Connected to SQLite at test.db');
    });
    test('Creates MySQLAdapter and connects', () => {
        const adapter = DBConnectionFactory.createAdapter(mysqlConfig);
        expect(adapter.connect(mysqlConfig)).toBe('Connected to MySQL at localhost:3306 as admin');
    });
    test('Creates MongoDBAdapter and connects', () => {
        const adapter = DBConnectionFactory.createAdapter(mongoConfig);
        expect(adapter.connect(mongoConfig)).toBe('Connected to MongoDB at mongodb://localhost:27017/mydb');
    });
    test('Throws error for unsupported type', () => {
        expect(() => DBConnectionFactory.createAdapter({ type: 'oracle' })).toThrow('Unsupported database type');
    });
}); 