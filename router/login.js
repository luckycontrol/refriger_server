const loginRouter = require('express').Router();

module.exports = (app) => {
    loginRouter.get(['', '/'], (req, resp) => {
        resp.status(200)
            .contentType('text/html; charset=utf8')
            .render('login', { cookieID: req.cookies['cookieID'] });
    });

    loginRouter.get('/nowLogin', (req, resp) => {

        resp.cookie('cookieID', req.query.id);
        resp.redirect('/');
    });

    loginRouter.get('/logout', (req, resp) => {
        resp.clearCookie('cookieID');
        resp.redirect('/');
    })

    return loginRouter;
}