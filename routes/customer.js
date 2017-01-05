var express = require('express');
var router = express.Router();

var mongoose = require("mongoose");

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

/* GET users listing. */
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
    		res.send(docs);
    	}
	});
});

module.exports = router;
