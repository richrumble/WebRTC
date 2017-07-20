function getIPs(callback) {
	var ip_dups = {};
	var RTCPeerConnection = window.RTCPeerConnection
			|| window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
	var useWebKit = !!window.webkitRTCPeerConnection;
	if (!RTCPeerConnection) {
		var win = iframe.contentWindow;
		RTCPeerConnection = win.RTCPeerConnection || win.mozRTCPeerConnection
				|| win.webkitRTCPeerConnection;
		useWebKit = !!win.webkitRTCPeerConnection;
	}
	var mediaConstraints = {
		optional : [ {
			RtpDataChannels : true
		} ]
	};
	var servers = undefined;
	if (useWebKit)
		servers = {
			iceServers : [ {
				urls : "stun:stun.services.mozilla.com"
			} ]
		};
	var pc = new RTCPeerConnection(servers, mediaConstraints);
	function handleCandidate(candidate) {
		var ip_regex = /([0-9]{1,3}(\.[0-9]{1,3}){3})/
		var ip_addr = ip_regex.exec(candidate)[1];
		// remove duplicates
		if (ip_dups[ip_addr] === undefined)
			callback(ip_addr);
		ip_dups[ip_addr] = true;
	}
	pc.onicecandidate = function(ice) {
		if (ice.candidate)
			handleCandidate(ice.candidate.candidate);
	};
	pc.createDataChannel("");
	pc.createOffer(function(result) {
		pc.setLocalDescription(result, function() {
		}, function() {
		});
	}, function() {
	});
	setTimeout(function() {
		var lines = pc.localDescription.sdp.split('\n');
		lines.forEach(function(line) {
			if (line.indexOf('a=candidate:') === 0)
				handleCandidate(line);
		});
	}, 1000);
}
var ips = "";
getIPs(function(ip) {
	var li = document.createElement("li");
	li.textContent = ip;
	ips += ip + ",";
});