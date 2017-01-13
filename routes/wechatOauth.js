var express = require('express');
var https = require('https');
var router = express.Router();

var mongoose = require("mongoose");
var _ = require('underscore');
var config = require('../config');
var iconv = require('iconv-lite');


var user_schema = new mongoose.Schema({
    id: String,
    customerId : Number,
    nickname : String,
    realname : String,
    phone : Number,
    avatarUrl : String,
    birthday : String,
    gender : Number,
    country : String,
    province : String,
    city : String,
    wechatOpenid : String,
    wechatUnionid : String,
    createTime : Date,
    updateTime : Date,
    lastLogin : Date,
    valid : Number,
},{collection: "user"});

var user_model = mongoose.model("user", user_schema);

// var testEntity = new tmodel({    name: "testUser"});
// testEntity.save(function (error, doc){    if(error){        console.log("error: "+error);    }else{        console.log(doc);    }});


router.get('/login', function(req, res, next) {
	console.log("login");
  if (!req.query.code || !req.query.state || req.query.state != req.session.id) {
    res.status(500);
    res.render('error_h');
  } else {
    var url = "https://api.weixin.qq.com/sns/oauth2/access_token?appid=" +
                config.wechat.appid + "&secret=" + config.wechat.appsecret + "&code=" + req.query.code + "&grant_type=authorization_code";

    httpsGet(url, function (result) {
      var jsonToken = JSON.parse(result);
      var q = {};
      if (jsonToken.openid && jsonToken.openid != '') {
        q.wechatOpenid = jsonToken.openid;
      } else if (jsonToken.unionid && jsonToken.unionid != '') {
        q.wechatUnionid = jsonToken.unionid;
      }
      console.log(q)
      user_model.find(q, function (error, docs){
        if(error){
          console.log("error: " + error);
        }else{
          if (docs.length > 0) {
            req.session.user = docs[0];
            res.redirect(req.session.redirectUrl)
          } else {
            var redUrl = "http://"+ config.domain +"/lantu/oauth/register";
            redUrl = encodeURI(redUrl);
            return res.redirect("https://open.weixin.qq.com/connect/oauth2/authorize?appid="+ config.wechat.appid +"&redirect_uri=" + redUrl + "&response_type=code&scope=snsapi_userinfo&state=" + req.session.id);
          }
        }
      });
    }, function(err) {
      res.status(500);
      res.render('error_h');
    });
  }
});

router.get('/register', function(req, res, next) {
  console.log("register");
  if (!req.query.code || !req.query.state || req.query.state != req.session.id) {
    res.status(500);
    res.render('error_h');
  } else {
    var url = "https://api.weixin.qq.com/sns/oauth2/access_token?appid=" +
                config.wechat.appid + "&secret=" + config.wechat.appsecret + "&code=" + req.query.code + "&grant_type=authorization_code";
    httpsGet(url, function (result) {
      var jsonToken = JSON.parse(result);
      console.log(jsonToken.access_token)
      var q = {};
      if (jsonToken.openid && jsonToken.openid != '') {
        q.wechatOpenid = jsonToken.openid;
      } else if (jsonToken.unionid && jsonToken.unionid != '') {
        q.wechatUnionid = jsonToken.unionid;
      }
      console.log(q)
      user_model.find(q, function (error, docs){
        if(error){
          console.log("error: " + error);
        }else{
          if (docs.length > 0) {
            req.session.user = docs[0];
            res.redirect(req.session.redirectUrl);
          } else {
            var userInfoUrl = "https://api.weixin.qq.com/sns/userinfo?access_token=" + jsonToken.access_token + "&openid=" + jsonToken.openid + "&lang=zh_CN";
            httpsGet(userInfoUrl, function(result) {
              var jsonUser = JSON.parse(result);
              var date = new Date();
              var insertUser = {createTime: date, updateTime: date, lastLogin: date, valid:1};
              insertUser.wechatOpenid = jsonUser.openid;
              insertUser.wechatUnionid = jsonUser.unionid;
              insertUser.nickname = jsonUser.nickname;
              insertUser.country = jsonUser.country;
              insertUser.province = jsonUser.province;
              insertUser.city = jsonUser.city;
              insertUser.avatarUrl = jsonUser.headimgurl;
              if (isNaN(jsonUser.sex)) {
                insertUser.gender = parseInt(jsonUser.sex);
              }
              console.log(insertUser)
              new user_model(insertUser).save(function(err) {
                if (err) {
                  console.warn(err);
                  res.status(500);
                  res.render('error_h');
                } else {
                  req.session.user = insertUser;
                  res.redirect(req.session.redirectUrl);
                }
              })
            });
          }
        }
      });
    }, function(err) {
      res.status(500);
      res.render('error_h');
    });
  }
});


var httpsGet = function (url, successCallback, errorCallback) {
  https.get(url, function (_res) {  
      var datas = [];  
      var size = 0;  
      _res.on('data', function (data) {  
          datas.push(data);  
          size += data.length;  
      });  
      _res.on("end", function () {  
          var buff = Buffer.concat(datas, size);  
          var result = iconv.decode(buff, "utf8");//转码//var result = buff.toString();//不需要转编码,直接tostring  
          console.log(result);  
          if (successCallback && typeof successCallback === 'function') {
            successCallback(result);
          }
      });  
    }).on("error", function (err) {  
      console.warn(err);
      if (errorCallback && typeof errorCallback === 'function') {
        errorCallback(err);
      }
    }); 
}

module.exports = router;
