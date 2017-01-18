var express = require('express');
var router = express.Router();
var lantuModel = require('../model');
var mongoose = require("mongoose");
var _ = require('underscore');

var episodeList = [10, 12, 14, 16, 18, 20];
var courtList = [1, 2, 3, 4];

var appoint_model = lantuModel.appoint;

var next_week = function (d) {
  if (d) {
    d = new Date(d)
  } else {
    d = new Date()
  }
  d = +d + 1000*60*60*24*7;
  d = new Date(d);
  var month = (d.getMonth()+1);
  var day = d.getDate();
  if (month < 10) {
    month = "0" + month;
  }
  if (day < 10) {
    day = "0" + day;
  }
  var s = d.getFullYear()+"-"+month+"-"+day;
  return s;
}


router.get('/appointList4week.json', function(req, res, next) {
  var user = req.session.user;
  var isManager = 0;
  if (user && user.type && user.type == 1) {
    isManager = 1;
  }
  var start = req.query.start;
  var end = next_week(start);
  var q = {appointDate:{$lte: end, $gte:start}};
  appoint_model.find(q).sort('appointDate').exec(function (error, docs){
    if(error){
        console.log("error: " + error);
    }else{
      var appointList4week = [];
      _.each(docs, function(e) {
        var week = _.find(appointList4week, function (w) {
          return w.date == e.appointDate;
        });
        if (week && week.appoint) {
          week.appoint.push(e);
        } else {
          appointList4week.push({date:e.appointDate,appoint:[e]})
        }
      });
      appoint_model.count({appointDate:{$gte:end}}, function(err, docs) {
        if (err) {
          console.log(err);
        } else {
          if (docs > 0) {
            return res.send({"appointList4week": appointList4week, isManager:isManager, isComplete:false, current:end});
          } else {
            return res.send({"appointList4week": appointList4week, isManager:isManager, isComplete:true, current:end});
          }
        }
      })
    }
  });
});

router.post('/updateAppoint.json', function(req, res, next) {
  var user = req.session.user;
  var appoint = req.body.appoint;
  appoint = JSON.parse(appoint)

  var entity = new appoint_model(appoint);
  
  appoint_model.update({_id:appoint._id},{$set:{valid:appoint.valid, isPay:appoint.isPay, appointInfo:appoint.appointInfo}}, function(err) {
    if (err) {
      console.log(err);
      res.send({status:0});
    } else {
      res.send({status:1})
    }
  });
});
module.exports = router;
