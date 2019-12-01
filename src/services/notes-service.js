const NotesService = {
    getAllNotes: (knex) => {
        return knex.select('*').from('notes');
    },
    getNoteById: (knex, idToFind) => {
        return knex.from('notes').select('*').where({id: idToFind}).first();
    },
    insertNote: (knex, newNote) => {
        return knex.insert(newNote).into('notes').returning('*')
            .then(rows => rows[0]);
    },
    deleteNote: (knex, idToRemove) => {
        return knex.from('notes').select('*').where({id: idToRemove}).delete();
    },
    updateNote: (knex, idToUdate, fieldsToUpdate) => {
        return knex.from('notes').where({id: idToUdate}).update(fieldsToUpdate);
    }
};
module.exports = NotesService;