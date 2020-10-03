const indexRouter = require('express').Router();

module.exports = (app) => {
    indexRouter.get(['', '/'], (req, resp) => {
        resp.status(200)
            .contentType('text/html; charset=utf8')
            .render('index', { cookieID: req.cookies['cookieID'] });
    });

    return indexRouter;
}