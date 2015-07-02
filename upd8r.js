(function () {
	"use strict";
	
	function htmlspecialchars_decode(string, quote_style) {
		//       discuss at: http://phpjs.org/functions/htmlspecialchars_decode/
		//      original by: Mirek Slugen
		//      improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
		//      bugfixed by: Mateusz "loonquawl" Zalega
		//      bugfixed by: Onno Marsman
		//      bugfixed by: Brett Zamir (http://brett-zamir.me)
		//      bugfixed by: Brett Zamir (http://brett-zamir.me)
		//         input by: ReverseSyntax
		//         input by: Slawomir Kaniecki
		//         input by: Scott Cariss
		//         input by: Francois
		//         input by: Ratheous
		//         input by: Mailfaker (http://www.weedem.fr/)
		//       revised by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
		// reimplemented by: Brett Zamir (http://brett-zamir.me)
		//        example 1: htmlspecialchars_decode("<p>this -&gt; &quot;</p>", 'ENT_NOQUOTES');
		//        returns 1: '<p>this -> &quot;</p>'
		//        example 2: htmlspecialchars_decode("&amp;quot;");
		//        returns 2: '&quot;'

		var optTemp = 0,
		    i = 0,
		    noquotes = false;
		if (typeof quote_style === 'undefined') {
			quote_style = 2;
		}
		string = string.toString()
			.replace(/&lt;/g, '<')
			.replace(/&gt;/g, '>');
		var OPTS = {
			'ENT_NOQUOTES': 0,
			'ENT_HTML_QUOTE_SINGLE': 1,
			'ENT_HTML_QUOTE_DOUBLE': 2,
			'ENT_COMPAT': 2,
			'ENT_QUOTES': 3,
			'ENT_IGNORE': 4
		};
		if (quote_style === 0) {
			noquotes = true;
		}
		if (typeof quote_style !== 'number') { // Allow for a single string or an array of string flags
			quote_style = [].concat(quote_style);
			for (i = 0; i < quote_style.length; i++) {
				// Resolve string input to bitwise e.g. 'PATHINFO_EXTENSION' becomes 4
				if (OPTS[quote_style[i]] === 0) {
					noquotes = true;
				} else if (OPTS[quote_style[i]]) {
					optTemp = optTemp | OPTS[quote_style[i]];
				}
			}
			quote_style = optTemp;
		}
		if (quote_style & OPTS.ENT_HTML_QUOTE_SINGLE) {
			string = string.replace(/&#0*39;/g, "'"); // PHP doesn't currently escape if more than one 0, but it should
			// string = string.replace(/&apos;|&#x0*27;/g, "'"); // This would also be useful here, but not a part of PHP
		}
		if (!noquotes) {
			string = string.replace(/&quot;/g, '"');
		}
		// Put this in last place to avoid escape being double-decoded
		string = string.replace(/&amp;/g, '&');

		return string;
	}
	
	function padDigits(number, digits) {
		return Array(Math.max(digits - String(number).length + 1, 0)).join(0) + number;
	}
	
	function naivePluralize(word, number) {
		if (number == 1)
			return word;
		else
			return word + "s";
	}
	
	var init = function() {
		var upd8Status        = document.getElementById("upd8-status"),
		    dismissBtn         = document.getElementById("dismiss-upd8"),
		    upd8Command         = document.getElementById("upd8-command"),
		    upd8NumberOfPages    = document.getElementById("upd8-number-of-pages"),
		    soundPlayer           = document.getElementById("sound-player"),
		    faviconLink            = document.querySelector("link[rel*='icon']"),
		    elementsToShowOnUpd8    = document.getElementsByClassName("show-on-upd8"),
		    upd8CurrentlyDisplayed  = false;
		
		function queryNewPage() {
			var promise = new Promise(function(resolve, reject) {
				fetch('new-page.json', {
					headers: {
						// Prevent browser from serving cached version
						'Cache-Control': 'no-cache'
					}
				})
					.then(function(response) {
						return response.json();
					}).then(function(json) {
						resolve(json);
					}).catch(function(err) {
						reject(Error("Query failed! " + err));
					});
			});
			
			return promise;
		}
		
		function playAlert() {
			soundPlayer.play();
		}
		
		function stopAlert() {
			soundPlayer.pause();
			soundPlayer.currentTime = 0;
		}
		
		function showUpd8(pageInfo) {
			upd8CurrentlyDisplayed = true;
			upd8Status.textContent = "NEW UPD8!!!!!!!!";
			
			Array.prototype.forEach.call(elementsToShowOnUpd8, function(el) {
				el.hidden = false;
			});
			
			upd8Command.textContent = htmlspecialchars_decode(pageInfo.page.command);
			upd8Command.href = "http://www.mspaintadventures.com/?s=6&p=" + padDigits(pageInfo.page.number, 6);
			
			upd8NumberOfPages.textContent =
				"(" + pageInfo.numberOfPages + " " +
				naivePluralize("page", pageInfo.numberOfPages) + ")";
			
			playAlert();
			faviconLink.href = "upd8-favicon.ico";
		}
		
		function showNoUpd8() {
			upd8CurrentlyDisplayed = false;
			upd8Status.textContent = "No upd8 found.";
		}
		
		function dismissUpd8() {
			upd8CurrentlyDisplayed = false;
			showNoUpd8();
			stopAlert();
			
			Array.prototype.forEach.call(elementsToShowOnUpd8, function(el) {
				el.hidden = true;
			});
			
			upd8Command.textContent = "";
			upd8Command.href = "";
			
			upd8NumberOfPages.textContent = "";
			
			faviconLink.href = "favicon.ico";
		}
		
		function checkPeriodically(seconds, callback) {
			var origTime = seconds;
			var interval = setInterval(function() {
				if (!upd8CurrentlyDisplayed) {
					upd8Status.textContent = "Checking in " + seconds + " " + naivePluralize("second", seconds) + "...";
					
					if (seconds === 0) {
						seconds = origTime;
						callback();
					} else {
						seconds--;
					}
				}
			}, 1000);
		}
		
		dismissBtn.addEventListener("click", dismissUpd8, false);
		document.getElementById("simulate-upd8").addEventListener("click", function() {
			showUpd8({
				"page": {
					"number": 9000,
					"command": "ACT 7 ACT 8 ACT 9 INTERMISSION 34.2"
				},
				"numberOfPages": 1
			});
		}, false);
		Array.prototype.forEach.call(document.getElementsByClassName("no-js"), function(el) {
			el.hidden = true;
		});
		
		queryNewPage()
			.then(function(initialJson) {
				showNoUpd8();
				
				return initialJson.page.number;
			}).then(function(prevNumber) {
				// Count down to upd8 every 10s
				checkPeriodically(10, function() {
					upd8Status.textContent = "Checking for upd8...";
					
					queryNewPage()
						.then(function(newJson) {
							if (newJson.page.number > prevNumber) {
								prevNumber = newJson.page.number;
								showUpd8(newJson);
							} else {
								showNoUpd8();
							}
						}).catch(function(err) {
							console.log(err);
							upd8Status.textContent = "Error while getting upd8! " + err;
						});
				});
				
			}).catch(function(err) {
				console.log(err);
				upd8Status.textContent = "Error while doing initial page grab! Try reloading the page.";
			});
	}
	
	if (document.readyState === "interactive" || document.readyState === "complete")
		// Kinda missed the boat on the DOMContentLoaded event,
		// the document is already loaded
		init();
	else
		window.addEventListener("DOMContentLoaded", init, false);
}());