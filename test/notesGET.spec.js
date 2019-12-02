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
        app.set('db',db);
    });
    

    after('disconnect from db', () => db.destroy());
    before('clean the table', () => db.raw('TRUNCATE notes, folder RESTART IDENTITY CASCADE'));
    afterEach('clean up', () => db.raw('TRUNCATE notes, folder RESTART IDENTITY CASCADE'));

const getTests = {
    emptyDB: () => {
        context('given no notes', () => {
            it('returns status 200 and an empty array', ()=> {
                return supertest(app)
                    .get('/api/noteful/notes')
                    .expect(200, [])
            })
        })
    },
    notesInsideDB: () => {
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
                    .get('/api/noteful/notes')
                    .expect(200, testNotes)
            })
        })
    },
    xssAttack: () => {
        context('given malicious attack',() => {
            const { maliciousNote, expectedNote } = makeMaliciousNote();
            const testFolder = makeFoldersArray();
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
            it('removes xss attack content', () => {
                return supertest(app)
                    .get('/api/noteful/notes')
                    .expect(200)
                    .expect(res => {
                        expect(res.body[0].name).to.eql(expectedNote.name)
                        expect(res.body[0].content).to.eql(expectedNote.content)
                    })
            })
        })
    }
}

module.exports = getTests;