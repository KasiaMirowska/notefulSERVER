const express = require('express');
const folderRouter = express.Router();
const jsonParser = express.json();
//const xss = require('xss');
const path = require('path');
const FolderService = require('../services/folder-service');

// const serializeFolder = (folder) => {
//     return ({
//         id: folder.id,
//         name: xss(folder.name)
//     })
// };

folderRouter
    .route('/api/noteful/folder')
    .get((req, res, next) => {
        const knexInstance = req.app.get('db');
        FolderService.getAllFolders(knexInstance)
            .then(folders => {
                res.status(200).json(folders)
            })
            .catch(next)
    })
    .post(jsonParser, (req, res, next) => {
        const knexInstance = req.app.get('db');
        const { name } = req.body;
        const newFolder = { name };
        
        if (!name) {
            console.log( name, 'HHHHHHHHHHH')
            return res.status(404).send({ error: { message: 'Missing folder name' } })
        }
       
        FolderService.insertFolder(knexInstance, newFolder)
            .then(newFolder => {
                res
                    .status(201)
                    .location(path.posix.join(req.originalUrl, `/${newFolder.id}`))
                    .json(newFolder)
            })
            .catch(next)
    })

folderRouter
    .route('/api/noteful/folder/:folder_id')
    .all((req, res, next) => {
        const knexInstance = req.app.get('db');
        const id = req.params.folder_id;
        FolderService.getFolderById(knexInstance, id)
            .then(folder => {
                if (!folder) {
                    return res.status(404).send({ error: { message: `Folder with id ${id} doesn't exist` } })
                }
                res.folder = folder;
                next()
            })
            .catch(next)
    })
    .get((req, res, next) => {
        res.status(200).json(res.folder)
    })
    .delete((req, res, next) => {
        const knexInstance = req.app.get('db');
        const idToRemove = req.params.folder_id;
        FolderService.deleteFolder(knexInstance, idToRemove)
            .then(() => {
                res.status(204).end()
            })
            .catch(next)
    })
    .patch(jsonParser, (req, res, next) => {
        const knexInstance = req.app.get('db');
        const idToUpdate = req.params.folder_id;
        const name = req.body.name;
        const updatedFolder = { id: idToUpdate, name };
        
        if(!name) {
            return res.status(404).send({error: {message: 'Missing name'}})
        }
        
        FolderService.updateFolder(knexInstance, idToUpdate, updatedFolder)
            .then(() => {
                res.status(200).send(updatedFolder)
            })
            .catch(next)
    })




module.exports = folderRouter;