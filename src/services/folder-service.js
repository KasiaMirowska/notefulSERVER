const FolderService = {
    getAllFolders: (knex) => {
        return knex.select('*').from('folder');
    },
    insertFolder: (knex, newFolder) => {
        return knex.insert(newFolder).into('folder').returning('*').then(rows => rows[0]);
    },
    getFolderById: (knex, folderId) => {
        return knex.from('folder').select('*').where({id: folderId}).first();
    },
    deleteFolder: (knex, idToRemove) => {
        return knex.from('folder').select('*').where({id: idToRemove}).delete();
    },
    updateFolder: (knex, idToUdate, fieldsToUpdate) => {
        return knex.from('folder').where({id: idToUdate}).update(fieldsToUpdate);
    }

};

module.exports = FolderService;