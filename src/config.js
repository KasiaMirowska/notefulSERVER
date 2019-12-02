module.exports = {
    PORT: process.env.PORT || 8000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    DB_URL: process.env.DATABASE_URL || 'postgresql://kamirska@localhost/noteful',
    TEST_DB_URL: process.env.TEST_DATABASE_URL || 'postgresql://kamirska@localhost/noteful-test'
}