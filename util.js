var util = {}

util.generateCode = function () {
	var date = new Date();
  var y = date.getFullYear();
  var m = date.getMonth() + 1;
  m = m < 10 ? ('0' + m) : m;
  var d = date.getDate();
  d = d < 10 ? ('0' + d) : d;
  return y + m + d + Math.random().toString().substr(2, 10)
} 

module.exports = util;