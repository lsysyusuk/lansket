var express = require('express');
var router = express.Router();
var lantuModel = require('../model');
var mongoose = require("mongoose");
var _ = require('underscore');
var logger = require('../logHelper').helper;  
var config = require('../config');
var util = require('../util');
var fs = require('fs')
var WXPay = require('weixin-pay');

var wxPay = WXPay({
  appid: config.wechat.appid,
  mch_id: config.wechat.mchId,
  partner_key: config.wechat.key, //微信商户平台API密钥
  pfx: fs.readFileSync('./' + config.wechat.keyfile), //微信商户平台证书
});


var episodeList = [10, 12, 14, 16, 18, 20];
var courtList = [1, 2, 3, 4];

var appoint_model = lantuModel.appoint;

var findDisable = function (episode, court, appointJson, userId) {
   var _court = court;
    var _episode = episode;
    var _self = false;
    var map = _.some(appointJson, function (e) {
      return _.some(e.appointInfo, function (ee) {
        if (ee.status == true && ee.episode == _episode && ee.court == _court) {
          if (e.customer && e.customer._id.toString() == userId.toString()) {
            _self = true;
          }
          
          return true;
        } else {
          return 0;
        }
      });	
    })
    if (map) {
      if(_self) {
        return 1;
      } else {
        return 2;
      }
    } else {
      return 0;
    }
}


router.get('/appointList.json', function(req, res, next) {
	var date = req.query.date;
	var q = {};
	if (typeof date != "undefined") {
		q.appointDate = date;
	}
	appoint_model.find(q, function (error, docs){
  	if(error){
     		logger.writeErr("error: " + error);
  	}else{
      var episode_court_map = _.map(episodeList, function (_episode) {
        return {"episode" : _episode, "courtList" : _.map(courtList, function (_court) {
          var s = {"court" : _court, "status": 0};
          if (findDisable(_episode, _court, docs) == 2) {
            s.status = 2;
          }
          return s;
        })};
      })

  		res.send({"episode_court_map": episode_court_map, "appointJson": docs});
  	}
	});
});

router.get('/appointList4week.json', function(req, res, next) {
  var user = req.session.user;
  var isBindPhone = 0;
  if (user && user.phone) {
    isBindPhone = 1;
  }
  var isManager = false;
  if (user && user.type && user.type == 1) {
    isManager = true;
  }
  var start = req.query.start;
  var end = req.query.end;
  var q = {appointDate:{$lte: end, $gte:start},valid:true};
  appoint_model.find(q, function (error, docs){
    if(error){
        console.log("error: " + error);
    }else{
      var episode_court_map_week = {};
      var appointList4week = {};
      _.each(docs, function(e) {
        if (appointList4week[e.appointDate]) {
          appointList4week[e.appointDate].push(e);
        } else {
          appointList4week[e.appointDate] = [e];
        }
      });
      _.mapObject(appointList4week, function(v,k) {
        var episode_court_map = _.map(episodeList, function (_episode) {
          return {"episode" : _episode, "courtList" : _.map(courtList, function (_court) {
            var s = {"court" : _court, "status": 0};
            s.status = findDisable(_episode, _court, v, user._id);
            return s;
          })};
        })
        episode_court_map_week[k] = episode_court_map;
      });

      res.send({"episode_court_map_week": episode_court_map_week, "appointList4week": appointList4week, isBindPhone:isBindPhone, isManager:isManager});
    }
  });
});

router.post('/doAppoint.json', function(req, res, next) {
  var user = req.session.user;
  var date = new Date();
  var appointDate = req.body.appointDate;
  var insertAppoint = {customer:user, createTime:date, updateTime:date, valid:true, isPay:false};
  insertAppoint.appointDate = req.body.appointDate;
  insertAppoint.hour = req.body.hour;
  insertAppoint.price = req.body.price;
  insertAppoint.appointInfo = JSON.parse(req.body.appointInfo);
  insertAppoint.code = util.generateCode();
  var q = {"customer._id":user._id,"appointDate":appointDate}

  var validateJson = {appointInfo:{$elemMatch:{$or:[]}}};
  validateJson.appointInfo.$elemMatch.$or = insertAppoint.appointInfo;
  validateJson.appointDate = appointDate;
  validateJson.valid = true;
  // validateJson.customer = {};
  // validateJson.customer._id = mongoose.Types.ObjectId(user._id);
  console.log(JSON.stringify(validateJson));

  appoint_model.find(validateJson, function (error, docs) {
    if (error) {
      logger.writeErr(error);
    } else {
      logger.writeInfo(docs);
      var validateResult = _.some(docs, function (n) {
        return n.customer._id.toString() != user._id.toString();
      })
      if (validateResult) {
        logger.writeInfo('预约场次重复');
        return res.send({status:0,msg:"预约场次重复，请刷新后重试"});
      } else {
        appoint_model.find(q, function (error, docs){
          if(error){
            console.log("error: " + error);
          }else{
            if (docs.length > 0) {
              // console.log(docs)
              var updateAppoint = docs[0];
              updateAppoint.appointInfo = insertAppoint.appointInfo;
              updateAppoint.hour = insertAppoint.hour;
              updateAppoint.price = insertAppoint.price;
              updateAppoint.save(function(err) {
                if (err) {
                  return res.send({status:0});
                } else {
                  return res.send({status:1, code: updateAppoint.code});
                }
              })
            } else {
              new appoint_model(insertAppoint).save(function(err) {
                if (err) {
                  return res.send({status:0});
                } else {
                  return res.send({status:1, code: insertAppoint.code});
                }
              })
            }
          }
        });
      }
    }
  });
})

router.get('/earnest/pay.json', function (req, res, next) {
  var user = req.session.user;
  var code = req.query.code;
  logger.writeInfo(code);

  appoint_model.find({'code':code}, function (error, docs) {
    if (error) {
      logger.writeErr(error);
    } else {
      logger.writeInfo(docs);
      if (docs.length != 1) {
        logger.writeErr("获取订单信息失败");
      } else {
        var appoint = docs[0];

        var ip = getClientIp(req);
        try {
          wxPay.getBrandWCPayRequestParams({
            openid: user.wechatOpenid,
            body: '公众号支付测试',
            detail: '公众号支付测试',
            out_trade_no: '20150331'+Math.random().toString().substr(2, 10),
            total_fee: appoint.price,
            spbill_create_ip: ip,
            notify_url: 'http://' + config.domain + config.wechat.notifyUrl
          }, function(err, result){
            // in express
            // res.render('wxpay/jsapi', { payargs:result })
            res.send({ payargs:result , appoint: appoint});
          });
        } catch (err) {
          logger.writeErr(err)
        }
      }
    }
  });
})

router.post('/notify.json', wxPay.useWXCallback(function(msg, req, res, next){
    // 处理商户业务逻辑

    // res.success() 向微信返回处理成功信息，res.fail()返回失败信息。
    res.success();
}));

var validateAppoint = function (userId, appointDate, appointInfo) {
  var validateJson = {appointInfo:{$elemMatch:{$or:[]}}};
  validateJson.appointInfo.$elemMatch.$or = appointInfo;
  validateJson.appointDate = appointDate;
  validateJson.valid = true;
  validateJson.isPay = true;

  appoint_model.find(validateJson, function (error, docs) {
    if (error) {
      logger.writeErr(error);
    } else {
      logger.writeInfo(docs);
      return _.some(docs, function (n) {
        return n.customer._id.toString() != userId.toString();
      })
    }
  });

}

var getClientIp = function (req) {
  return req.headers['x-forwarded-for'] ||
  req.connection.remoteAddress ||
  req.socket.remoteAddress ||
  req.connection.socket.remoteAddress;
};

module.exports = router;
