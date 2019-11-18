const NotesService = {
    getAllNotes: (knex) => {
        return knex.select('*').from('notes');
    }
};
module.exports = NotesService;