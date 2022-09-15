module.exports = {
    test: {
        client: 'pg',
        version: '14.5',
        connection: {
            host: 'localhost',
            user: 'postgres',
            password: '1234',
            database: 'api-database',
        },
        // migrations: {
        //     directory: 'src/migrations',
        // },
        seeds: { directory: 'src/seeds' },
    },
};
