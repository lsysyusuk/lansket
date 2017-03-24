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
var schedule = require('node-schedule');

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
        return res.send({status: 0});
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

  		return res.send({"episode_court_map": episode_court_map, "appointJson": docs});
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
  appoint_model.find(q)
  .then(function (docs){
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
      var isPay = false;
      var episode_court_map = _.map(episodeList, function (_episode) {
        return {"episode" : _episode, "courtList" : _.map(courtList, function (_court) {
          var s = {"court" : _court, "status": 0};
          s.status = findDisable(_episode, _court, v, user._id);
          return s;
        })};
      })
      isPay = _.some(v, function(_ap) {
        if (_ap.customer._id.toString() == user._id.toString()) {
          return _ap.isPay
        }
      })
      episode_court_map_week[k] = {list: episode_court_map, isPay: isPay};
    });

    var result = {"episode_court_map_week": episode_court_map_week, "isBindPhone":isBindPhone, "isManager":isManager};
    if (req.query.ca == 'false') {
      result["customer"] = user;
    }

    res.send(result);
  })
  .then(function (error) {
    if (error) {
      res.send({status: 0}) 
    }
  })
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
  var q = {"customer._id":user._id,"appointDate":appointDate, valid:true}

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
      return res.send({status: 0});
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
              updateAppoint.code = insertAppoint.code;
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
      return res.send({status: 0});
    } else {
      logger.writeInfo(docs);
      if (docs.length != 1) {
        logger.writeErr("获取订单信息失败");
        return res.send({status: 0});
      } else {
        var appoint = docs[0];

        var ip = getClientIp(req);
        try {
          wxPay.getBrandWCPayRequestParams({
            openid: user.wechatOpenid,
            body: '篮途场地预定(' + appoint.appointDate + ')',
            detail: '篮途安全支付',
            out_trade_no: code,
            // total_fee: appoint.price * 100,
            total_fee: appoint.price,
            spbill_create_ip: ip,
            notify_url: 'http://' + config.domain + config.wechat.notifyUrl
          }, function(err, result){
            // in express
            // res.render('wxpay/jsapi', { payargs:result })
            var expire = registerJob(code);
            return res.send({status: 1, payargs:result , appoint: appoint, expire: expire});
          });
        } catch (err) {
          logger.writeErr(err)
        }
      }
    }
  });
})

router.use('/notify.json', wxPay.useWXCallback(function(msg, req, res, next){
    logger.writeInfo('notify —————— start')
    // 处理商户业务逻辑
    logger.writeInfo(msg);
    try {
      if (msg.result_code.toUpperCase() == 'SUCCESS') {
        var code = msg.out_trade_no;

        appoint_model.find({'code':code}, function (error, docs) {
          if (error) {
            logger.writeErr(error);
          } else {
            if (docs.length != 1) {
              logger.writeErr("获取订单信息失败");
            } else {
              var appoint = docs[0];
              //检查有效且未支付
              if (appoint.valid && !appoint.isPay) {
                appoint.isPay = true;
                appoint.save(function(err) {
                  if (err) {
                    return res.fail();
                  }
                })
              } else {
                return res.fail();
              }
            }
          }
        });
      } else {
        logger.writeErr(msg.out_trade_no);
      }
    } catch (err) {
      return res.fail();
    }
    
    return res.success();
  })
);

router.get('/my/orders.json', function (req, res, next) {
  var user = req.session.user;
  var page = req.query.page;
  var size = req.query.size;
  var count = 0;
  appoint_model.find().where('customer._id').equals(user._id).limit(size).skip(page * size).sort({'createTime':'desc'}).exec(function(err, docs) {
    if (err) {
      logger.writeErr('获取个人订单失败');
      return {status:0}
    } else {
      appoint_model.count({'customer._id':user._id}, function (err, count) {
        return res.send({status: 1, count: count, list: docs})
      })
    }
  })
});

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

var registerJob = function (code) {
  var date = new Date();
  date = new Date(date.valueOf() + config.wechat.expire * 60 * 1000);
  var j = schedule.scheduleJob(date, function(code){
    logger.writeInfo('excute—————————— ' + code);

    appoint_model.findOne({'code': code}, function (error, appoint) {
      if (error) {
        logger.writeErr('注销订单失败,未找到该订单——————' + code);
      } else {
        if (appoint && appoint.isPay) {
          logger.writeInfo('订单已支付，无需注销——————' + code);
        } else {
          wxPay.closeOrder({out_trade_no:code}, function(err, result){
            if (err) {
              logger.writeErr('注销订单失败，关闭微信订单失败——————' + code);
            } else {
              if (appoint) {
                appoint.valid = false;
                appoint.save(function(err) {
                  if (err) {
                    logger.writeErr('注销订单失败——————' + code);
                  } else {
                    logger.writeInfo('注销订单成功——————' + code);
                  }
                })
              }
            }
          });
        }
      }
    })
  }.bind(null, code));
  return date;
}

module.exports = router;
