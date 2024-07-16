// Extract domain name (DN) from URL
function url2dn(url) {
	var tmpa = document.createElement('a');
	tmpa.href = url;
	return tmpa.host;
}

// get IP using webRequest
var currentIPList = {};
browser.webRequest.onCompleted.addListener(
	function(info) {
		// summary:
		//		retieve IP
		currentIPList[url2dn(info.url)] = info.ip;
	}, {
		"urls": ["http://*/*", "https://*/*"]
	}
);

// Listeners
browser.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		switch(request.name) {
		case 'setEnabled':
			// request from the content script to set the options.
			localStorage.setItem('websiteIPEnabled', request.status ? 'true' : 'false');
			break;
		case 'isEnabled':
			// request from the content script to get the options.
			sendResponse(localStorage.getItem('websiteIPEnabled') === 'true' || localStorage.getItem('websiteIPEnabled') === null);
			break;
		case 'getIP':
			sendResponse({
				ip: currentIPList[url2dn(sender.tab.url)] || null
			});
			break;
		case 'copyIP':
			browser.tabs.getSelected(null, function(tab) {
				var input = document.createElement('input');
				document.body.appendChild(input);
				input.value = currentIPList[url2dn(tab.url)] || browser.i18n.getMessage('notFound');
				input.focus();
				input.select();
				document.execCommand('Copy');
				input.remove();
			});
			break;
		default:
			sendResponse({});
		}
	}
);