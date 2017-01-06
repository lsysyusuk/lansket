var express = require('express');
var router = express.Router();

var mongoose = require("mongoose");
var _ = require('underscore');

var episodeList = [10, 12, 14, 16, 18, 20];
var courtList = [1, 2, 3, 4];

var appoint_info_schema = new mongoose.Schema({
  episode : Number,
  court : Number,
  status : Number
});

var appoint_schema = new mongoose.Schema({
    customerId : Number,
    customerName : String,
    createTime : Date,
    updateTime : Date,
    appointDate: String,
    appointInfo : [appoint_info_schema],
    valid : Number,
    isPay : Number
},{collection: "appoint"});

var appoint_model = mongoose.model("appoint", appoint_schema);

// var testEntity = new tmodel({    name: "testUser"});
// testEntity.save(function (error, doc){    if(error){        console.log("error: "+error);    }else{        console.log(doc);    }});

var findDisable = function (episode, court, appointJson) {
   var _court = court;
    var _episode = episode;
    var map = _.some(appointJson, function (e) {
      return _.some(e.appointInfo, function (ee) {
        if (ee.status == 1 && ee.episode == _episode && ee.court == _court) {
          return true;
        } else {
          return false;
        }
      });	
    })
    return map;
}


router.get('/appointList.json', function(req, res, next) {
	var date = req.query.date;
	var q = {};
	if (typeof date != "undefined") {
		q.appointDate = date;
	}
	appoint_model.find(q, function (error, docs){
  	if(error){
     		console.log("error: " + error);
  	}else{
  		console.log(docs);

      var episode_court_map = _.map(episodeList, function (_episode) {
        return {"episode" : _episode, "courtList" : _.map(courtList, function (_court) {
          var s = {"court" : _court, "status": 0};
          if (findDisable(_episode, _court, docs)) {
            s.status = 2;
            console.log("----");
          }
          return s;
        })};
      })
      console.log(episode_court_map);

  		res.send({"episode_court_map": episode_court_map, "appointJson": docs});
  	}
	});
});

module.exports = router;
