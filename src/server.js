const app = require('../src/app');
const knex = require('knex');
const { PORT , DATABASE_URL } = require('./config');


const db = knex({
    client: 'pg',
    connection: DATABASE_URL,
})

app.set('db', db);
app.listen(PORT, () => {
    console.log(`server listening at http:localhost:${PORT}`)
});
