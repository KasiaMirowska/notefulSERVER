const express = require('express');
const path = require('path');
const notesRouter = express.Router();
const jsonParser = express.json();
const NotesService = require('../services/notes-service');
const xss = require('xss');

const serializeNote = (note) => {
    return ({
        id: note.id,
        name: xss(note.name),
        content: xss(note.content),
        date_created: note.date_created,
        folder: note.folder
    });
};

notesRouter
    .route('/api/noteful/notes')
    .get((req, res, next) => {
        const knexInstance = req.app.get('db');
        NotesService.getAllNotes(knexInstance)
            .then(notes => {
                res.status(200).json(notes.map(serializeNote));
            })
            .catch(next);
    })
    .post(jsonParser, (req, res, next) => {
        const knexInstance = req.app.get('db');
        const { name, content, folder } = req.body;
        const newNote = { 
            name: name, 
            content: content, 
            folder: folder };
        
        for (const [key, value] of Object.entries(newNote)) {
            if (value == null) {
                return res.status(404).send({ error: { message: `Missing ${key}` } });
            }
        }

        NotesService.insertNote(knexInstance, newNote)
            .then(note => {
                res
                    .status(201)
                    .location(path.posix.join(req.originalUrl, `/${note.id}`))
                    .json(serializeNote(note))
            })
            .catch(next);
    });

notesRouter
    .route('/api/noteful/notes/:note_id')
    .all((req, res, next) => {
        const knexInstance = req.app.get('db');
        const id = req.params.note_id;
        NotesService.getNoteById(knexInstance, id)
            .then(note => {
                if (!note) {
                    return res.status(404).send({ error: { message: `Note with id ${id} doesn't exist` } });
                }
                res.note = note;
                next();
            })
            .catch(next);
    })
    .get((req, res, next) => {
        res.status(200).json(serializeNote(res.note));
    })
    .delete((req, res, next) => {
        const knexInstance = req.app.get('db');
        const idToRemove = req.params.note_id;
        NotesService.deleteNote(knexInstance, idToRemove)
            .then(() => {
                res.status(204).send(`deleted note ${idToRemove}`);
            })
            .catch(next)
    })
    .patch(jsonParser, (req, res, next) => {
        const knexInstance = req.app.get('db');
        const idToUpdate = req.params.note_id;
        const { name, content, date_created, folder } = req.body;
        const updatedNote = { id:idToUpdate, name, content, date_created, folder };
        
        const numberOfValues = Object.values(updatedNote).filter(Boolean).length
        if (numberOfValues === 0 ) {
            return res.status(400).json({
                error: { message: 'Must contain only note name, content or folder id' }
            });
        }

        NotesService.updateNote(knexInstance, idToUpdate, updatedNote)
            .then(() => {
                res.status(200).json(serializeNote(updatedNote));
            })
            .catch(next);
    });

module.exports = notesRouter;