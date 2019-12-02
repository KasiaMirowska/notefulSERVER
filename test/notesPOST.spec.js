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

const postTests = {
    insertNote: () => {
        const testFolder = makeFoldersArray();
        beforeEach('insert folders', () => {
            return db
                .into('folder')
                .insert(testFolder)
        })

        it('creates new note', () => {
            const newNote = {
                name: 'test note',
                content: 'serrdfhgjkl',
                folder: 1
            }

            return supertest(app)
                .post('/api/noteful/notes')
                .send(newNote)
                .expect(201)
                .expect(res => {
                    expect(res.body.name).to.eql(newNote.name)
                    expect(res.body.content).to.eql(newNote.content)
                    expect(res.body.folder).to.eql(newNote.folder)
                    expect(res.body).to.have.property('id')
                    expect(res.headers.location).to.eql(`/api/noteful/notes/${res.body.id}`)
                    const expected = new Date().toLocaleString()
                    const actual = new Date(res.body.date_created).toLocaleString()
                    expect(actual).to.eql(expected)
                })
                .then(res => {
                    supertest(app)
                        .get(`/api/noteful/notes/${res.body.id}`)
                        .expect(res.body)
                })
        })
    },
    missingField: () => {
        const requiredField = ['name', 'content', 'folder']
        requiredField.forEach(field => {
            const newNote = {
                name: 'test note',
                content: 'serrdfhgjkl',
                folder: 1
            }
            it('responds with error if field missing', () => {
                delete newNote[field]
                return supertest(app)
                    .post('/api/noteful/notes/')
                    .send(newNote)
                    .expect(404, {error: {message: `Missing ${field}`}})
            })
        })
    },
    xssAttack: () => {
        it('removes xss attack content', () => {
            const {maliciousNote, expectedNote } = makeMaliciousNote();
            return supertest(app)
                .post('/api/noteful/notes')
                .send(maliciousNote)
                .expect(201)
                .expect(res => {
                    expect(res.body.name).to.eql(expectedNote.name)
                    expect(res.body.content).to.eql(expectedNote.content)
                })
        })  
    }
}

module.exports = postTests;