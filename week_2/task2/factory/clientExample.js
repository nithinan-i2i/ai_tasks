const DBConnectionFactory = require('./dbConnectionFactory');

// Example configs
const sqliteConfig = { type: 'sqlite', file: 'data.db' };
const mysqlConfig = { type: 'mysql', host: 'localhost', port: 3306, user: 'root' };
const mongoConfig = { type: 'mongodb', url: 'mongodb://localhost:27017', dbName: 'testdb' };

// Create and use SQLite adapter
const sqliteAdapter = DBConnectionFactory.createAdapter(sqliteConfig);
console.log(sqliteAdapter.connect(sqliteConfig)); // Connected to SQLite at data.db

// Create and use MySQL adapter
const mysqlAdapter = DBConnectionFactory.createAdapter(mysqlConfig);
console.log(mysqlAdapter.connect(mysqlConfig)); // Connected to MySQL at localhost:3306 as root

// Create and use MongoDB adapter
const mongoAdapter = DBConnectionFactory.createAdapter(mongoConfig);
console.log(mongoAdapter.connect(mongoConfig)); // Connected to MongoDB at mongodb://localhost:27017/testdb 