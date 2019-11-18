const express = require('express');
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
    })
};

notesRouter
    .route('/api/notes')
    .get((req, res, next) => {
        const knexInstance = req.app.get('db');
        NotesService.getAllNotes(knexInstance)
            .then(notes => {
                res.status(200).json(notes.map(serializeNote))
            })
            .catch(next)
    });

    module.exports = notesRouter;