const express = require('express');
const http = require('http');

const app = express();

app.set('port', 3000);

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

app.engine('html', require('ejs').renderFile);

app.use(express.static(__dirname + '/static'));

let cookieParser = require("cookie-parser");
app.use(cookieParser());

// let cookieSession = require("cookie-session");
// app.use(cookieSession());

function startExpress() {

    http.createServer(app).listen(app.get('port'), () => {
        console.log('Web server is running on ', app.get('port'));
    });
}

const indexRouter = require('./router/index')(app);
app.use('/', indexRouter);

const loginRouter = require('./router/login')(app);
app.use('/login', loginRouter);

const orderListRouter = require('./router/orderList')(app);
app.use('/orderList', orderListRouter);

const purchasedListRouter = require('./router/purchasedList')(app);
app.use('/purchasedList', purchasedListRouter);

const siteInfoRouter = require('./router/siteInfo')(app);
app.use('/siteInfo', siteInfoRouter);

startExpress();