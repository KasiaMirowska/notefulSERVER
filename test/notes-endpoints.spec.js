const getTests = require('./notesGET.spec');
const getIdTests = require('./notesGET-ID.spec');
const postTests = require('./notesPOST.spec');
const patchTests = require('./notesPATCH.spec');
const deleteTests = require('./notesDELETE.spec');

describe.only('Notes endpoints', function() {
    
    describe('GET /notes', () => {
        getTests.emptyDB();
        getTests.notesInsideDB();
        getTests.xssAttack();
        
    })
    
    describe('POST/notes', () => {
        postTests.insertNote();
        postTests.missingField()
        postTests.xssAttack();
    })

    describe('GET /notes/note_id', () => {
        getIdTests.emptyDB();
        getIdTests.notesInsideDB();
        getIdTests.xssAttack();
    })

    describe('PATCH/notes/note_id',() => {
        patchTests.emptyDB();
        patchTests.notesInsideDB(); //issues with 2 tests in here
    })

    describe.only('DELETE/notes/note_id', () => {
        deleteTests.emptyDB()
        deleteTests.notesInsideDB()
     })
    
})