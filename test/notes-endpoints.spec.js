const app = require('../src/app');
const knex = require('knex');
const { TEST_DB_URL } = require('../src/config');
const { makeNotesArray, makeMaliciousNote } = require('./notes-fixtures');
const { makeFoldersArray } = require('./folders-fixtures');


describe.only('Notes endpoints', function() {
    let db;

    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: TEST_DB_URL
        })
        app.set('db',db);
    });
    

    after('disconnect from db', () => db.destroy());
    before('clean the table', () => db.raw('TRUNCATE notes, folder RESTART IDENTITY CASCADE'));
    afterEach('clean up', () => db.raw('TRUNCATE notes, folder RESTART IDENTITY CASCADE'));

    describe('GET /notes', () => {
        context('given no notes', () => {
            it('returns status 200 and an empty array', ()=> {
                console.log()
                return supertest(app)
                    .get('/api/notes')
                    .expect(200, [])
            })
        })

        context('Given notes in db', () => {
            const testNotes = makeNotesArray();
            const testFolder = makeFoldersArray()

            beforeEach('insert articles', () => {
                return db 
                    .into('folder')
                    .insert(testFolder)
                    .then(() => {
                        return db
                            .into('notes')
                            .insert(testNotes)
                    })
            })
            it('returns 200 and all the notes', () => {
                return supertest(app)
                    .get('/api/notes')
                    .expect(200, testNotes)
            })
        })
    })

})