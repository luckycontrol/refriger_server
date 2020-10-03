const purchasedListRouter = require('express').Router();

module.exports = (app) => {

    purchasedListRouter.get('', (req, resp) => {
        if (req.cookies['cookieID']) {
            resp.status(200)
                .contentType('text/html; charset=utf8')
                .render('purchasedList', { cookieID: req.cookies['cookieID'] });
        } else {
            resp.redirect('/?status=false')
        }
    });

    purchasedListRouter.get('/userCheck', (req, resp) => {
        if (req.cookies['cookieID']) {
            resp.redirect('/purchasedList');
        } else {
            if (req.query['location']) {
                resp.redirect(`${req.query['location']}?status=false`);
            } else {
                resp.redirect('/?status=false');
            }
        }
    })

    return purchasedListRouter;
}