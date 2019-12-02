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


const getIdTests = {
    emptyDB: () => {
        context('given no notes', () => {
            const idToFind = 2
            it('returns 404 and an error', () => {
                return supertest(app)
                    .get(`/api/noteful/notes/${idToFind}`)
                    .expect(404, { error: { message: `Note with id ${idToFind} doesn't exist` } })
            })
        })
    },

    notesInsideDB: () => {
        context('given notes', () => {
            const idToFind = 2
            const testFolder = makeFoldersArray();
            const testNotes = makeNotesArray();
            
            beforeEach('insert notes', () => {
                return db
                    .into('folder')
                    .insert(testFolder)
                    .then(() => {
                        return db
                            .into('notes')
                            .insert(testNotes)
                    })
            })
            it('returns 200 and selected note', () => {
                return supertest(app)
                    .get(`/api/noteful/notes/${idToFind}`)
                    .expect(200)
                    .expect(res => {
                        expect(res.body).to.eql(testNotes[idToFind - 1])
                    })
            })
        })
    },
    xssAttack: () => {
        context('given xss attack', () => {
            const testFolder = makeFoldersArray();
            const { maliciousNote, expectedNote } = makeMaliciousNote();
            beforeEach('insert malicious note', () => {
                return db
                    .into('folder')
                    .insert(testFolder)
                    .then(() => {
                        return db
                            .into('notes')
                            .insert(maliciousNote)
                    })
            })
            it('removes the attack', () => {
                return supertest(app)
                    .get(`/api/noteful/notes/${maliciousNote.id}`)
                    .expect(200)
                    .expect(res => {
                        expect(res.body.name).to.eql(expectedNote.name)
                        expect(res.body.content).to.eql(expectedNote.content)
                    })
            })
        })
    }
}

module.exports = getIdTests;