const app = require('../src/app');
const knex = require('knex');
const { TEST_DATABASE_URL } = require('../src/config');
const { makeNotesArray, makeMaliciousNote } = require('./notes-fixtures');
const { makeFoldersArray } = require('./folders-fixtures');

let db;

before('make knex instance', () => {
    db = knex({
        client: 'pg',
        connection: TEST_DATABASE_URL
    })
    app.set('db', db);
});


after('disconnect from db', () => db.destroy());
before('clean the table', () => db.raw('TRUNCATE notes, folder RESTART IDENTITY CASCADE'));
afterEach('clean up', () => db.raw('TRUNCATE notes, folder RESTART IDENTITY CASCADE'));


const deleteTests = {
    emptyDB: () => {
        context('Given no notes', () => {
            it('returns 404 and an error message',() => {
                const noteId = 2;
                return supertest(app)
                    .delete(`/api/noteful/notes/${noteId}`)
                    .expect(404, {error: {message: `Note with id ${noteId} doesn't exist`}})
            })
        })
    },

    notesInsideDB: () => {
        context('Given notes in db', () => {
            const testFolder = makeFoldersArray();
            const testNotes = makeNotesArray();
            before('insert data', () => {
                return db
                    .insert(testFolder)
                    .into('folder')
                    .then(() => {
                        return db
                            .insert(testNotes)
                            .into('notes')
                    })
            })
            it('removes specified note', () => {
                const noteId = 2;
                const expectedNotes = testNotes.filter(note => note.id !== noteId)
                return supertest(app)
                    .delete(`/api/noteful/notes/${noteId}`)
                    .expect(204)
                    .then(res => {
                        return supertest(app)
                            .get('/api/noteful/notes')
                            .expect(expectedNotes)
                    })

            })
        })
    }
}

module.exports = deleteTests;