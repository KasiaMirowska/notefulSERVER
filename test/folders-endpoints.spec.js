const app = require('../src/app');
const knex = require('knex');
const { TEST_DATABASE_URL } = require('../src/config');
const { makeFoldersArray } = require('./folders-fixtures');
const { makeNotesArray } = require('./notes-fixtures');
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

describe('Folder endpoints', () => {
    describe('GET/folder', () => {
        context('given no folders in db', () => {
            it('returns empty array', () => {
                return supertest(app)
                    .get('/api/noteful/folder')
                    .expect(200, [])
            })
        })

        context('folders in db', () => {
            const testFolders = makeFoldersArray();
            beforeEach('insert folders', () => {
                return db
                    .insert(testFolders)
                    .into('folder')
            })

            it('returns all the folders', () => {
                return supertest(app)
                    .get('/api/noteful/folder')
                    .expect(200, testFolders)
            })

        })
    })

    describe('POST/folder', () => {
        it('returns 200 and posted folder', () => {
            const newFolder = { name: 'new name' }
            return supertest(app)
                .post('/api/noteful/folder')
                .send(newFolder)
                .expect(201)
                .expect(res => {
                    expect(res.body.name).to.eql(newFolder.name)
                    expect(res.body).to.have.property('id')
                    expect(res.headers.location).to.eql(`/api/noteful/folder/${res.body.id}`)
                })
                .then(res => {
                    return supertest(app)
                        .get(`/api/noteful/folder/${res.body.id}`)
                        .expect(res.body)
                })
        })
    })
    describe('GET/folder/folder_id', () => {
        context('given no folders in db', () => {
            it('returns an error', () => {
                const folderID = 4;
                return supertest(app)
                    .get(`/api/noteful/folder/${folderID}`)
                    .expect(404, { error: { message: `Folder with id ${folderID} doesn't exist` } })
            })
        })
        context('given folders in db', () => {
            const testFolders = makeFoldersArray();
            beforeEach('insert folders', () => {
                return db
                    .insert(testFolders)
                    .into('folder')
                    
            })
            it('returns specified folder', () => {
                const folderId = 1;
                return supertest(app)
                    .get(`/api/noteful/folder/${folderId}`)
                    .expect(200)
                    .expect(res => {
                        expect(res.body).to.eql(testFolders[folderId - 1])
                    })
            })
        })
    })

    describe('DELETE/folder/folder_id', () => {
        context('given no folders in db', () => {
            it('returns error', () => {
                const folderId = 2;
                return supertest(app)
                    .delete(`/api/noteful/folder/${folderId}`)
                    .expect(404, { error: { message: `Folder with id ${folderId} doesn't exist` } })
            })
        })
        context('given folders in db', () => {
            const testFolders = makeFoldersArray();
            beforeEach('insert folders', () => {
                return db
                    .insert(testFolders)
                    .into('folder')
            })
            it('deletes specified folder', () => {
                const folderId = 2;
                const expectedFolders = testFolders.filter(folder => folder.id !== folderId)
                return supertest(app)
                    .delete(`/api/noteful/folder/${folderId}`)
                    .expect(204)
                    .then(() => {
                        return supertest(app)
                            .get('/api/noteful/folder')
                            .expect(res => {
                                expect(res.body).to.eql(expectedFolders)
                            })
                    })
            })
        })
    })
    describe('PATCH/folder/folder_id', () => {
        context('given no folders in db',() => {
            it('returns an error', () => {
                const folderId = 2;
                return supertest(app)
                    .patch(`/api/noteful/folder/${folderId}`)
                    .expect(404, {error: {message: `Folder with id ${folderId} doesn't exist`}})
            })
        })
        context('given full db', () => {
            const testFolders = makeFoldersArray();
            beforeEach('inserts folders', () => {
                return db
                    .insert(testFolders)
                    .into('folder')
            })
            it('updates selected folder', () => {
                const idToUpdate = 2;
                const updatedFolder = {id: String(idToUpdate), name: 'updated name'}
                const expectedData = {
                    ...testFolders[idToUpdate-1],
                    ...updatedFolder
                }
                return supertest(app)
                    .patch(`/api/noteful/folder/${idToUpdate}`)
                    .send(updatedFolder)
                    .expect(200)
                    .expect(res => {
                        expect(res.body).to.eql(expectedData)
                    })
            })
            it('ignores unlisted fields', () => {
                const idToUpdate = 2;
                const updatedFolder = {id: String(idToUpdate), name: 'updated name'}
                const expectedData = {
                    ...testFolders[idToUpdate-1],
                    ...updatedFolder
                }
                return supertest(app)
                    .patch(`/api/noteful/folder/${idToUpdate}`)
                    .send({...updatedFolder, b: 'ignored property'})
                    .expect(200)
                    .expect(res => {
                        expect(res.body).to.eql(expectedData)
                    })
            })
        })
        
    })
})