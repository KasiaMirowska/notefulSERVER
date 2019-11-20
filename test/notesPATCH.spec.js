const app = require('../src/app');
const knex = require('knex');
const { TEST_DB_URL } = require('../src/config');
const { makeNotesArray, makeMaliciousNote } = require('./notes-fixtures');
const { makeFoldersArray } = require('./folders-fixtures');

let db;

before('make knex instance', () => {
    db = knex({
        client: 'pg',
        connection: TEST_DB_URL
    })
    app.set('db', db);
});


after('disconnect from db', () => db.destroy());
before('clean the table', () => db.raw('TRUNCATE notes, folder RESTART IDENTITY CASCADE'));
afterEach('clean up', () => db.raw('TRUNCATE notes, folder RESTART IDENTITY CASCADE'));


const patchTests = {
    emptyDB: () => {
        context('Given no notes', () => {
            it('returns error massage', () => {
                const idToUpdate = 2;
                return supertest(app)
                    .patch(`/api/notes/${idToUpdate}`)
                    .expect(404, { error: { message: `Note with id ${idToUpdate} doesn't exist` } })
            })
        })
    },

    notesInsideDB: () => {
        context('Given notes in db', () => {
            const testNotes = makeNotesArray();
            const testFolders = makeFoldersArray();
            beforeEach('insert data', () => {
                return db
                    .insert(testFolders)
                    .into('folder')
                    .then(() => {
                        return db
                            .insert(testNotes)
                            .into('notes')
                    })
            })
            it('returns 200 and updates note', () => {
                const noteId = 2;
                const updatedFields = {
                    id: String(noteId),
                    name: 'update test',
                    content: 'drfgjhkl',
                    date_created: testNotes[noteId - 1].date_created,
                    folder: 2
                }
                const expectedNote = {
                    ...testNotes[noteId - 1],
                    ...updatedFields
                }
                return supertest(app)
                    .patch(`/api/notes/${noteId}`)
                    .send(updatedFields)
                    .expect(200)
                    .expect(res => {
                        expect(res.body).to.eql(expectedNote)
                    })
            })

            it('responds with an error when no required field supplied', () => {
                const idToUpdate = 2;
                const updatedFields = {}
                return supertest(app)
                    .patch(`/api/notes/${idToUpdate}`)
                    .send(updatedFields)
                    .expect(400, { error: { message: `Must contain only note name, content or folder id` } })
            })
            
            it('updates only a subset of fields', () => {
                const idToUpdate = 3
                const updatedNote = { title: 'updated title'}
                const expectedNote = {
                  ...testNotes[idToUpdate - 1],
                  ...updatedNote
                }
        
                return supertest(app)
                  .patch(`/api/notes/${idToUpdate}`)
                  .send({...updatedNote, fieldToIgnore: 'should not be in GET res'})
                  .expect(204)
                  .then(res => {
                    supertest(app)
                      .get(`/api/articles/${idToUpdate}`)
                      .expect(expectedArticle)
                  })
              })
        })
    },

}

module.exports = patchTests;