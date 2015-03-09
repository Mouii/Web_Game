function pausecomp(millis) {
			var date = new Date();
			var curdate = null;
			do {
				curDate = new Date();
			} while(curDate-date < millis);
}

function moveElem(carre, time) {
	var elem = document.getElementById(carre);
	var left = 0;
	var timer = setInterval(function() {
		elem.style.left += 10 + "px";
		if ( left > 400 ) {
			clearInterval(timer);
		}
	}, pausecomp(time));
}

moveElem("carre", 1000);
