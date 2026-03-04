require('./env');

//global development setting
developmentMode = (process.env.NODE_ENV == 'development')

console.log('Startup in development mode:' + developmentMode);

const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const path = require('path');
const fs = require('fs');
const compression = require('compression');
const cors = require('cors');

var url = require('url');
var cookieParser = require('cookie-parser');

var gptroutes = require('./routes/gptroutes');
var gpthp = require ('./includes/gptHelper');
var version = require ('./includes/gptVersion');
var server = require ('./controllers/gptServer');

// Render pug to html
server.renderHTMLFile('KWBBall');

// all database functions
server.processDatabaseFunctions();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

//app.use(express.json());

//app.use(bodyParser.json());
app.use(bodyParser.json({limit: '150mb'}));
app.use(bodyParser.urlencoded({limit: '150mb', extended:true})); 
app.use(express.json());

app.use(cookieParser());

app.use(compression());

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'data')));
app.use(express.static(path.join(__dirname, 'node_modules')));

var pathpublic = path.join(__dirname, 'public');
var pathdata = path.join(__dirname, 'data');

app.use('/', gptroutes);
app.use('/kwbball', gptroutes);
app.use('/kwbball/api', gptroutes);

//const version = require ('./includes/gptVersion');
app.use('/', (req, res) => 
  {
console.log(req.url);
console.log(req.headers.host);
  if (! req.headers.host.includes(version.client_subdomain()))
    {
    console.log('REQUEST HOST: ' + req.headers.host)
    console.log('SERVICE HOST: ' + version.client_subdomain())
    var err = new Error('Bad host');
    err.status = 502;
    
    gpthp.sendMsg(req, res, 'ERROR 502', null)
    }
})
app.use('/kwbball', (req, res) => 
    {
  //  res.setHeader('Cache-Control', 'max-age=' + 365 * 24 * 60 * 60 * 1000); //one year 
    })

// catch 404 and forward to error handler
app.use(function(req, res, next) {
	gpthp.writeDebug("pathpublic : " + pathpublic);
	gpthp.writeDebug("pathdata : " + pathdata);
	gpthp.writeDebug("hostname : " + req.headers.host);
	gpthp.writeDebug("__dirname : " + __dirname);
	gpthp.writeDebug("Url : " + req.url);
	gpthp.writeDebug("OriginalUrl : " + req.originalUrl);
	gpthp.writeDebug("PathUrl : " + url.parse(req.url).pathname);

	gpthp.writeDebug("Hostname : " + req.headers.host);
	gpthp.writeDebug("ERROR: PathUrl: " + req.url + " Not Found");

	var err = new Error(msg);
	err.status = 404;
	next(err);
});

// error handler
app.use(function(err, req, res, next) {

	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = developmentMode == true ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.render('error');
});

const shouldCompress = (req, res) => {
  if (req.headers['x-no-compression']) {
    // don't compress responses if this request header is present
    return false;
  }

  // fallback to standard compression
  return compression.filter(req, res);
};

app.use(compression({
  // filter decides if the response should be compressed or not, 
  // based on the `shouldCompress` function above
  filter: shouldCompress,
  // threshold is the byte threshold for the response body size
  // before compression is considered, the default is 1kb
  threshold: 0
}));


module.exports = app;
