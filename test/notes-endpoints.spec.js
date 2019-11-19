const getTests = require('./notesGET.spec');
const getIdTests = require('./notesGET-ID.spec');
const postTests = require('./notesPOST.spec');

describe.only('Notes endpoints', function() {
    
    describe.skip('GET /notes', () => {
        getTests.emptyDB();
        getTests.notesInsideDB();
        getTests.xssAttack();
        
    })
    
    describe('POST/notes', () => {
        postTests.insertNote();
        postTests.missingField()
        postTests.xssAttack();
    })

    describe.skip('GET /notes/note_id', () => {
        getIdTests.emptyDB();
        getIdTests.notesInsideDB();
        getIdTests.xssAttack();
    })

    describe.skip('PATCH/notes/note_id',() => {

    })

    describe.skip('DELETE/notes/note_id', () => {

    })
    
})