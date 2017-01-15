var express = require('express');
var config = require('../config');
var router = express.Router();
var md5 = require('MD5'); //MD5模块
var https = require('https'); //https模块 用来发送异步请求

//补位
var pad = function (s, c) {
  while(s.toString().length < c) {
    s = "0" + s;
  }
  return s;
}

var creatSid = function (phone, code, count, callback) {
  if (count > 0) {
    console.log("重新发送验证码" + count + "次");
  }
  try {
    var accountSid = config.sms.accountSid;
  //生成时间 因为new Date生成的时间戳与 容联云API接口要求的不同 所以自己组合
    var dates = new Date();
    var year = dates.getYear() % 100 + 2000;
    var month = pad(dates.getMonth() + 1, 2);
    var day = pad(dates.getDate(), 2);
    var hours = pad(dates.getHours(), 2);
    var second = pad(dates.getSeconds(), 2);
    var minute = pad(dates.getMinutes(), 2);
    var time = year + "" + month + "" + day + hours + minute + second;
  //生成base64格式 Authorization 字符串
    var b = new Buffer(accountSid + ":" + time);
    var s = b.toString('base64');
  //生成加密字符串Sig
    var SigParameter = md5(accountSid + config.sms.token + "1" + time).toUpperCase();
    var Authorization = s;
  //post数据包
    var data = {'appId': config.sms.appid, 'to': phone, 'templateId':1,'datas':[code, "1"]};
  //转JSON字符串
    data = JSON.stringify(data);
  //POST PATH路径（域名后路径）
    var url = "/2013-12-26/Accounts/" + accountSid + "/SMS/TemplateSMS?sig=" + SigParameter;
  //POST参数设置
    var opt = {
      method: "POST",
      host: "sandboxapp.cloopen.com",
      port: 8883,
      path: url,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json;charset=utf-8',
        'Content-Length': data.length,
        Authorization: Authorization
      }
    };
    var req = https.request(opt, function (serverFeedback) { //建立POSTL链接
      if (serverFeedback.statusCode == 200) {
        var body = "";
        serverFeedback.on('data', function (data) {
          body += data;
        }).on('end', function () { //获取返回数据
          body = JSON.parse(body);
          console.log(body)
          if (body.statusCode == 000000) {
            return callback(body);
          } else {
            console.log("短信发送失败，状态码:" + body.statusCode);
            return callback("error");
          }
        });
      } else {
        if (count < 3) {
          creatSid(phone, code, ++count, callback)
        } else {
          return callback("error");
        }
      }
    }); 
    req.write(data); //发送 POST数据包
    req.end(); //发送结束
  } catch (err) {
    console.log(err)
  }
}
  
//路由器方法下调用
router.get('/sendCode', function (req, res, next) {
  var phone = req.query.phone;
  var code = Math.round(Math.random()*10000).toString();
  creatSid(phone, code, 0, function (body) {
    if (body == 'error') {
      console.log("验证码发送失败");
      res.send({status:0});
    } else {
      res.send({status:1});
    }
  });
});
module.exports = router;