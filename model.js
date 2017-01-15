var express = require('express');
var mongoose = require("mongoose");

var appoint_info_schema = new mongoose.Schema({
  episode : Number,
  court : Number,
  status : Number
});

var user_schema = new mongoose.Schema({
    id: mongoose.Schema.Types.ObjectId,
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

var appoint_schema = new mongoose.Schema({
    id:mongoose.Schema.Types.ObjectId,
    customer : user_schema,
    createTime : Date,
    updateTime : Date,
    appointDate: String,
    appointInfo : [appoint_info_schema],
    valid : Number,
    isPay : Number
},{collection: "appoint"});

var appoint_model = mongoose.model("appoint", appoint_schema);
var user_model = mongoose.model("user", user_schema);



var lantuModel = {
    appoint:appoint_model,
    user:user_model
}


module.exports = lantuModel;

