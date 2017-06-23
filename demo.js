
var initialCoordinates = {lat:19.214100301235003, lng:72.87453687479768}
var map;
var interval;
var polySizeArray=[1,1,1,1.5,2,2,2.5,3,3,3,3,3,3,3,3,3,3.5,4,5,10,18,30];
var swap_distance = 100;
var replay_speed = 10; 

function getIndexAtDistance(route,startIndex,metres) {
	//console.log(i+" : "+route);
	var dist=0;
	var i;
	for(i=startIndex; (i < route.length-1 && dist < metres); i++) {
		dist += getDistanceFromLatLonInKm(route[i].lat(),route[i].lng(),route[i+1].lat(),route[i+1].lng())*1000;
	}

	if (dist < metres){
		return -1;
	}
	return i+1;
}


function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);  // deg2rad below
  var dLon = deg2rad(lon2-lon1);
  var a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ;
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  var d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI/180)
}


function rad2deg(rad) {
	return rad * (180/Math.PI);
}



var Car = function(color ,pathData){
	
	//this.path = pathData;
	this.route = [];
	for(var sp= 0; sp< pathData.calculatedPoints.length; sp++){
		var p1 = new google.maps.LatLng(pathData.calculatedPoints[sp].lat,pathData.calculatedPoints[sp].lng);
		this.route.push(p1);
	}

	var svgPath = "M17.402,0H5.643C2.526,0,0,3.467,0,6.584v34.804c0,3.116,2.526,5.644,5.643,5.644h11.759c3.116,0,5.644-2.527,5.644-5.644 V6.584C23.044,3.467,20.518,0,17.402,0z M22.057,14.188v11.665l-2.729,0.351v-4.806L22.057,14.188z M20.625,10.773 c-1.016,3.9-2.219,8.51-2.219,8.51H4.638l-2.222-8.51C2.417,10.773,11.3,7.755,20.625,10.773z M3.748,21.713v4.492l-2.73-0.349 V14.502L3.748,21.713z M1.018,37.938V27.579l2.73,0.343v8.196L1.018,37.938z M2.575,40.882l2.218-3.336h13.771l2.219,3.336H2.575z M19.328,35.805v-7.872l2.729-0.355v10.048L19.328,35.805z";
	var vehicleSizeArray=[0.3,0.3,0.3,0.3,0.3,0.3,0.3,0.3,0.3,0.32,0.34,0.36,0.39,0.42,0.45,0.49,0.53,0.57,0.62,0.7,1.0,1.5];

	this.marker = new google.maps.Marker({
  		position: pathData.calculatedPoints[0],
  		map: map,
  		icon: {
			path: svgPath,
			scale: vehicleSizeArray[map.getZoom()],
			strokeColor: '#000000',
			strokeWeight: .10,
			fillOpacity: 1,
			fillColor: color,
			offset: '5%',
			anchor: new google.maps.Point(10, 40)
		}
  	});
	return this;
}

Car.prototype.move = function(){
	this.start_marker = new google.maps.Marker({
		'position': this.route[0],
		'map': map,
		title: ("Replay start"),
		draggable: false,
		icon: "http://maps.google.com/mapfiles/ms/icons/green-dot.png",
		scaledSize: new google.maps.Size(50, 50), // scaled size
		origin: new google.maps.Point(0,0), // origin
		anchor: new google.maps.Point(0, 0),
		//clickable: false
		zIndex: 8
	});
	var j=0; //p1h,p2h;
	
	return function(){
		if (this.route.length != 0){
			var k=getIndexAtDistance(this.route,j,swap_distance);
			// p1h=new google.maps.LatLng(this.route[j].lat(),this.route[j].lng());
			if(k != -1 && k < this.route.length) {
				//heading from start point to end point
				// p2h = new google.maps.LatLng(this.route[k-1].lat(),this.route[k-1].lng());
				var newroute=[];
				var tS=[];
				for(var l=0;l<k;l++) {
					newroute.push(this.route[l]);
				}
				this.drawreplaypolyline(newroute);
				j=k-1;
			} else {
				//heading from start point to end point
				// p2h=new google.maps.LatLng(this.route[this.route.length-1].lat(),this.route[this.route.length-1].lng());
				var newroute=[];
				var tS=[];
				for(var l=j;l<this.route.length;l++) {
					newroute.push(this.route[l]);
				}
				this.drawreplaypolyline(newroute);
				this.end_marker = new google.maps.Marker({
					'position': this.route[this.route.length-1],
					'map': map,
					title: ("Replay end"),
					draggable: false,
					icon: "http://maps.google.com/mapfiles/ms/icons/purple-dot.png",
					scaledSize: new google.maps.Size(50, 50), // scaled size
					origin: new google.maps.Point(0,0), // origin
					anchor: new google.maps.Point(0, 0),
					//clickable: false
					zIndex: 9
				});
				clearInterval(interval);
			}
		}
	}
}


Car.prototype.drawreplaypolyline = function(route){
	if(route.length!=0){
		if(route.length>3){
			var p1 = new google.maps.LatLng(route[route.length-3].lat(),route[route.length-3].lng());
		}
		else if (route.length>2){
			var p1 = new google.maps.LatLng(route[route.length-2].lat(),route[route.length-2].lng());
		}
		else{
			var p1 = new google.maps.LatLng(route[route.length-1].lat(),route[route.length-1].lng());
		}
		var p2 = new google.maps.LatLng(route[route.length-1].lat(),route[route.length-1].lng());
		var heading = google.maps.geometry.spherical.computeHeading(p1,p2);
		this.animate(p1,p2,heading);
		
		var snappedPolyline = new google.maps.Polyline({
			path: route,
			strokeColor: '#d3d3d3',
			strokeWeight: polySizeArray[map.getZoom()],
			zIndex: 1,
			clickable: true
		});
		snappedPolyline.setMap(map);
	}
}


Car.prototype.animate = function(p1,p2,heading){
	this.marker.setPosition(p2);
    this.marker.icon.rotation = heading;
    this.marker.setIcon(this.marker.icon);
    map.setCenter(p2);
}


Car.prototype.replay = function(){
	cb = this.move();
	interval = setInterval(cb.bind(this),replay_speed);
}


var initMap = function(){
	//google.maps.visualRefresh = true;
	map = new google.maps.Map(document.getElementById('map'), {
  		zoom: 13,
      	center: initialCoordinates,
    });
};
