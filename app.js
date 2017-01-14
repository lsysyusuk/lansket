var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var MongoStore = require('connect-mongo')(session);
var bodyParser = require('body-parser');

var index = require('./routes/index');
var customer = require('./routes/customer');
var oauth = require('./routes/wechatOauth');
var config = require('./config');
console.log(config.db.host);

var hbs = require('hbs');


var app = express();

// view engine setup
// app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.engine('html', hbs.__express);

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'dist')));

app.use(session({
     secret: 'lantu123',
     name: 'lantu',
     cookie: {maxAge: 80000 },
     resave: false,
     saveUninitialized: true,
     store: new MongoStore({   //创建新的mongodb数据库
         // host: '127.0.0.1',    //数据库的地址，本机的话就是127.0.0.1，也可以是网络主机
         // port: 27017,          //数据库的端口号
         // db: 'session',        //数据库的名称。
         // username: 'lantu',
         // password: 'lantu123'
         // url: 'mongodb://lantu:lantu123@127.0.0.1:27017/lantu'
         url: 'mongodb://'+ config.db.username +':'+ config.db.password +'@'+ config.db.host +':'+ config.db.port +'/'+ config.db.database
     })
}));

app.use(function (req, res, next) {   
  if (req.originalUrl.indexOf('/lantu/oauth/login') > -1 || req.originalUrl.indexOf('/lantu/oauth/register') > -1) {
    next();
  } else {
    console.log("intercepter1");
    var url = req.originalUrl;//获取url
    req.session.redirectUrl = url;
    if(!req.session.user && false){
      var redUrl = "http://"+ config.domain +"/lantu/oauth/login";
      redUrl = encodeURI(redUrl);
      return res.redirect("https://open.weixin.qq.com/connect/oauth2/authorize?appid="+ config.wechat.appid +"&redirect_uri=" + redUrl + "&response_type=code&scope=snsapi_base&state=" + req.session.id);
    } else {
      next();
    }
  }   
  
});

app.use('/lantu/', index);
app.use('/lantu/customer', customer);
app.use('/lantu/oauth', oauth);

// mongo start

var mongoose = require("mongoose");

mongoose.connect('mongodb://'+ config.db.username +':'+ config.db.password +'@'+ config.db.host +':'+ config.db.port +'/'+ config.db.database);

mongoose.connection.on("error", function (error){
    console.log("连接数据库失败"+error);
}).on("open", function (){
    console.log("数据库连接成功！！！");
});

// mongo end

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error_h');
});

module.exports = app;
