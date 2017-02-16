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