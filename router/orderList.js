const orderListRouter = require('express').Router();

module.exports = (app) => {

    orderListRouter.get('', (req, resp) => {
        if (req.cookies['cookieID']) {
            resp.status(200)
                .contentType('text/html; charset=utf8')
                .render('orderList', { cookieID: req.cookies['cookieID'] });
        } else {
            resp.redirect('/?status=false');
        }
    });

    orderListRouter.get('/userCheck', (req, resp) => {
        if (req.cookies['cookieID']) {
            resp.redirect('/orderList')
        } else {
            if (req.query['location']) {
                resp.redirect(`${req.query['location']}?status=false`)
            } else {
                resp.redirect('/?status=false');
            }
        }
    })

    return orderListRouter;
}