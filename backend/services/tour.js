const express = require('express');
const serviceRouter = express.Router();
const upload = require('../upload');
const helper = require('../helper.js');
const TourDao = require('../dao/tourDao.js');

console.log('- Service Tour');

serviceRouter.get('/api/tour/:id', function(request, response) {
    console.log('Service Tour: Client requested one record, id=' + request.params.id);

    const tourDao = new TourDao(request.app.locals.dbConnection);
    try {
        var obj = tourDao.loadById(request.params.id);
        console.log('Service Tour: Record loaded');
        response.status(200).json({
            message: 'success',
            data: obj
        })
    } catch (ex) {
        console.error('Service Tour: Error loading record by id. Exception occured: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }
});
/*---------------------------------- */
/*
serviceRouter.get('/api/tours', function(request, response) {
    console.log('Service Tour: Client requested all records');

    const tourDao = new TourDao(request.app.locals.dbConnection);
    try {
        var arr = tourDao.loadAll();
        console.log('Service Tour: Records loaded, count=' + arr.length);
        response.status(200).json({
            message: 'success',
            data: arr
        });
    } catch (ex) {
        console.error('Service Tour: Error loading all records. Exception occured: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }
});

serviceRouter.post('/api/tour/', upload.single('file'), function(request, response) {
    console.log('Service Tour: Client requested creation of new record');

    const errorMsgs = [];
    if (helper.isUndefined(request.body.adminBuchtitel)) 
        errorMsgs.push('Buchtitel fehlt');
    if (helper.isUndefined(request.body.adminAutor)) 
        errorMsgs.push('Autor fehlt');
    if (helper.isUndefined(request.body.adminGenre)) 
        errorMsgs.push('Genre fehlt');
    if (helper.isUndefined(request.body.adminKlappentext)) 
        request.body.adminKlappentext = '';
    if (helper.isUndefined(request.body.adminArtNr)) 
        errorMsgs.push('ArtNr fehlt');
    if (helper.isUndefined(request.body.adminLagerbestand)) 
        errorMsgs.push('Lagerbestand fehlt');
    if (!helper.isNumeric(request.body.adminLagerbestand)) 
        errorMsgs.push('Lagerbestand muss eine Zahl sein');
    if (helper.isUndefined(request.body.adminPreis)) 
        errorMsgs.push('Preis fehlt');
    if (!helper.isNumeric(request.body.adminPreis)) 
        errorMsgs.push('Preis muss eine Zahl sein');
    const bookPath = request.file ? request.file.filename : null;
    if (helper.isNull(bookPath)) 
        errorMsgs.push('bookPath fehlt');
    
    if (errorMsgs.length > 0) {
        console.log('Service Tour: Creation not possible, data missing');
        console.log(errorMsgs);
        response.status(400).json({ 'fehler': true, 'nachricht': 'Funktion nicht möglich. Fehlende Daten: ' + helper.concatArray(errorMsgs) });
        return;
    }

    try {
        const genresDao = new GenresDao(request.app.locals.dbConnection);
        let genre;
        
        try {
            genre = genresDao.loadByType(request.body.adminGenre);
            console.log('Found genre:', genre);
        } catch (error) {
            if (error.message.includes('No Record found by type')) {
                console.log('Genre not found, creating new genre');
                genre = genresDao.create(request.body.adminGenre);
                console.log('Created new genre:', genre);
            } else {
                throw error;
            }
        }

        const genreId = parseInt(genre.genre_id, 10);
        const bookDao = new TourDao(request.app.locals.dbConnection);
        const obj = bookDao.create(
            request.body.adminBuchtitel,
            request.body.adminAutor,
            genreId,
            request.body.adminKlappentext,
            request.body.adminArtNr,
            request.body.adminLagerbestand,
            request.body.adminPreis,
            bookPath
        );
        console.log('Service Tour: Record created');
        response.status(200).json(obj);
    } catch (ex) {
            console.error('Service Tour: Error creating record. Exception occurred: ' + ex.message);
            response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }
});

serviceRouter.post('/api/tour/:id', upload.single('file'), function(request, response) {
    console.log('Service Tour: Client requested update of record, id=' + request.params.id);

    const bookDao = new TourDao(request.app.locals.dbConnection);
    const currentBook = bookDao.loadById(request.params.id);


    const errorMsgs = [];
    if (helper.isUndefined(request.body.adminBuchtitel)) 
        errorMsgs.push('Buchtitel fehlt');
    if (helper.isUndefined(request.body.adminAutor)) 
        errorMsgs.push('Autor fehlt');
    if (helper.isUndefined(request.body.adminGenre)) 
        errorMsgs.push('Genre fehlt');
    if (helper.isUndefined(request.body.adminKlappentext)) 
        request.body.adminKlappentext = '';
    if (helper.isUndefined(request.body.adminArtNr)) 
        errorMsgs.push('ArtNr fehlt');
    if (helper.isUndefined(request.body.adminLagerbestand)) 
        errorMsgs.push('Lagerbestand fehlt');
    if (!helper.isNumeric(request.body.adminLagerbestand)) 
        errorMsgs.push('Lagerbestand muss eine Zahl sein');
    if (helper.isUndefined(request.body.adminPreis)) 
        errorMsgs.push('Preis fehlt');
    if (!helper.isNumeric(request.body.adminPreis)) 
        errorMsgs.push('Preis muss eine Zahl sein');
    const bookPath = request.file ? request.file.filename : currentBook.book_path;
    if (helper.isNull(bookPath)) 
        errorMsgs.push('bookPath fehlt');
    
    if (errorMsgs.length > 0) {
        console.log('Service Tour: Update not possible, data missing');
        console.log(errorMsgs);
        response.status(400).json({ 'fehler': true, 'nachricht': 'Funktion nicht möglich. Fehlende Daten: ' + helper.concatArray(errorMsgs) });
        return;
    }

    try {
        const genresDao = new GenresDao(request.app.locals.dbConnection);
        let genre;
        
        try {
            genre = genresDao.loadByType(request.body.adminGenre);
            console.log('Found genre:', genre);
        } catch (error) {
            if (error.message.includes('No Record found by type')) {
                console.log('Genre not found, creating new genre');
                genre = genresDao.create(request.body.adminGenre);
                console.log('Created new genre:', genre);
            } else {
                throw error;
            }
        }
        const genreId = parseInt(genre.genre_id, 10);
        const bookDao = new TourDao(request.app.locals.dbConnection);
        const obj = bookDao.update(
            request.params.id,
            request.body.adminBuchtitel,
            request.body.adminAutor,
            genreId,
            request.body.adminKlappentext,
            request.body.adminArtNr,
            request.body.adminLagerbestand,
            request.body.adminPreis,
            bookPath
        );
        console.log('Service Tour: Record updated');
        response.status(200).json(obj);
    } catch (ex) {
            console.error('Service Tour: Error updating record. Exception occurred: ' + ex.message);
            response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }
});


serviceRouter.delete('/api/tour/:id', function(request, response) {
    console.log('Service Tour: Client requested deletion of record, id=' + request.params.id);

    const bookDao = new TourDao(request.app.locals.dbConnection);
    try {
        var obj = bookDao.loadById(request.params.id);
        bookDao.delete(request.params.id);
        console.log('Service Tour: Deletion of record successfull, id=' + request.params.id);
        response.status(200).json({ 'gelöscht': true, 'eintrag': obj });
    } catch (ex) {
        console.error('Service Tour: Error deleting record. Exception occured: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }
});
/*---------------------------------- */
module.exports = serviceRouter;