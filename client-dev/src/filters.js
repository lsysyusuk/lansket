import { _ } from 'underscore/underscore-min';
var holiday = ['2017-01-27','2017-01-28','2017-01-29','2017-01-30','2017-01-31','2017-02-01','2017-02-02','2017-04-02','2017-04-03','2017-04-04','2017-04-29','2017-04-30','2017-05-01'];
var general = 220;
var special = 270;

exports.formateDateTime = function (date) {
	if (date) {
		date = new Date(date);
	    var y = date.getFullYear();
	    var m = date.getMonth() + 1;
	    m = m < 10 ? ('0' + m) : m;
	    var d = date.getDate();
	    d = d < 10 ? ('0' + d) : d;
	    var h = date.getHours();
	    var minute = date.getMinutes();
	    minute = minute < 10 ? ('0' + minute) : minute;
	    return y + '-' + m + '-' + d + ' ' + h + ':' + minute;
	} else {
		return;
	}
	
};

exports.episode = function (num) {
	return (num +':00-' + (parseInt(num)+2) + ':00');
};

exports.episodeCourt = function (num, court) {
	return exports.episode(num) + " | " + court + "号场";
};

exports.getPrice = function (episode, date) {
	var week = new Date(date).getDay();
	if (parseInt(episode) >= 18 || week == 0 || week == 6 || _.some(holiday, function(n){return date == n})) {
		return special;
	} else {
		return general;
	}
};

exports.getTotal = function (appoint) {
  var court = _.reduce(appoint.appointInfo, function (m,n) {
    return {hour:(m.hour + 2), price:(m.price + exports.getPrice(n.episode, appoint.appointDate))}
  },{hour:0, price:0})
  return court;
}

exports.status = function (isPay, valid) {
	if (!valid) {
		return '已失效';
	} else {
		if (isPay) {
			return '已支付';
		} else {
			return '未支付'
		}
	}
}

exports.week = function (date) {
	var week_map = ['周日', '周一','周二','周三','周四','周五','周六'];
	var week = new Date(date).getDay();
	return week_map[week]
}