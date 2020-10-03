const siteInfoRouter = require('express').Router();

module.exports = (app) => {
    siteInfoRouter.get('', (req, resp) => {
        resp.status(200)
            .contentType('text/html; charset=utf8')
            .render('siteInfo', { cookieID: req.cookies['cookieID'] });
    });

    return siteInfoRouter;
}