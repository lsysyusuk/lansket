var express = require('express');
var router = express.Router();
var lantuModel = require('../model');
var mongoose = require("mongoose");
var _ = require('underscore');

var episodeList = [10, 12, 14, 16, 18, 20];
var courtList = [1, 2, 3, 4];

var appoint_model = lantuModel.appoint;

var findDisable = function (episode, court, appointJson, userId) {
   var _court = court;
    var _episode = episode;
    var _self = false;
    var map = _.some(appointJson, function (e) {
      return _.some(e.appointInfo, function (ee) {
        if (ee.status == 1 && ee.episode == _episode && ee.court == _court) {
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


router.get('/appointList4week.json', function(req, res, next) {
  var user = req.session.user;
  var isManager = 0;
  if (user && user.type && user.type == 1) {
    isManager = 1;
  }
  var start = req.query.start;
  var end = req.query.end;
  var q = {appointDate:{$lte: end, $gte:start}};
  appoint_model.find(q, function (error, docs){
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
      

      res.send({"appointList4week": appointList4week, isManager:isManager});
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
