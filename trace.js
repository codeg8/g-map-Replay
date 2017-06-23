

var initialCoordinates = {lat:19.214100301235003, lng:72.87453687479768}
var map;
var icon;
var marker;
var interval;
var route=[];
var polySizeArray=[1,1,1,1.5,2,2,2.5,3,3,3,3,3,3,3,3,3,3.5,4,5,10,18,30];

function initMap() {
		google.maps.visualRefresh = true;
	map = new google.maps.Map(document.getElementById('map'), {
  		zoom: 13,
      	center: initialCoordinates,
    });

	marker = new google.maps.Marker({
  		position: initialCoordinates,
  		map: map
	});
	marker.setIcon(get_car_icon());
}

function get_car_icon(){

	var car = "M17.402,0H5.643C2.526,0,0,3.467,0,6.584v34.804c0,3.116,2.526,5.644,5.643,5.644h11.759c3.116,0,5.644-2.527,5.644-5.644 V6.584C23.044,3.467,20.518,0,17.402,0z M22.057,14.188v11.665l-2.729,0.351v-4.806L22.057,14.188z M20.625,10.773 c-1.016,3.9-2.219,8.51-2.219,8.51H4.638l-2.222-8.51C2.417,10.773,11.3,7.755,20.625,10.773z M3.748,21.713v4.492l-2.73-0.349 V14.502L3.748,21.713z M1.018,37.938V27.579l2.73,0.343v8.196L1.018,37.938z M2.575,40.882l2.218-3.336h13.771l2.219,3.336H2.575z M19.328,35.805v-7.872l2.729-0.355v10.048L19.328,35.805z";
	var vehicleSizeArray=[0.3,0.3,0.3,0.3,0.3,0.3,0.3,0.3,0.3,0.32,0.34,0.36,0.39,0.42,0.45,0.49,0.53,0.57,0.62,0.7,1.0,1.5];
	vehicleSize = 1.5;
	var vehicleSize=vehicleSizeArray[map.getZoom()];
	icon = {
		path: car,
		scale: vehicleSize,
		strokeColor: '#000000',
		strokeWeight: .10,
		fillOpacity: 1,
		fillColor: 'red',
		offset: '5%',
		anchor: new google.maps.Point(10, 40)
	};
	return icon;

}

var show_replay = function(){

	var startMarker = new google.maps.Marker({
		'position': new google.maps.LatLng(parseFloat(data.actualPoints[0].latitude),parseFloat(data.actualPoints[0].longitude)),
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
	var i=0,j=0,p1h,p2h;
	var calPoints = data.calculatedPoints;
		for(var sp= 0 ; sp<calPoints.length; sp++){
		var p1 = new google.maps.LatLng(calPoints[sp].lat,calPoints[sp].lng);
		route.push(p1);
	}

	return function(){
		var metres=100;  // Constant Value to check for meteres.
		if(i==calPoints.length && calPoints.length > 0){
			new google.maps.Marker({
				'position': new google.maps.LatLng(data.actualPoints[data.actualPoints.length-1].latitude,data.actualPoints[data.actualPoints.length-1].longitude),
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
			var p1e =  new google.maps.LatLng(data.actualPoints[data.actualPoints.length-1].latitude,data.actualPoints[data.actualPoints.length-1].longitude);
			var p2e =  new google.maps.LatLng(data.actualPoints[data.actualPoints.length-1].latitude,data.actualPoints[data.actualPoints.length-1].longitude);
			clearInterval(interval);
		}


		var newroute =[];
		if (route.length != 0){
			var k=getIndexAtDistance(route,j,metres);
			p1h=new google.maps.LatLng(route[j].lat(),route[j].lng());
			if(k!=-1 && k<route.length) {
				//heading from start point to end point
				p2h=new google.maps.LatLng(route[k-1].lat(),route[k-1].lng());
				var newroute=[];
				var tS=[];
				for(var l=0;l<k;l++) {
					newroute.push(route[l]);
				}
				drawreplaypolyline(newroute);
				j=k-1;
			} else {
				//heading from start point to end point
				p2h=new google.maps.LatLng(route[route.length-1].lat(),route[route.length-1].lng());
				var newroute=[];
				var tS=[];
				for(var l=j;l<route.length;l++) {
					newroute.push(route[l]);
				}
				drawreplaypolyline(newroute);
				i=calPoints.length;
				//break;
				//i+=1;
			}
		}
	};

}

	function replay(){
		interval = setInterval(show_replay(),100);
	}


function getIndexAtDistance(route,startIndex,metres) {
	//console.log(i+" : "+route);
	var dist=0;
	var olddist=0;
	var i;
	for (i=startIndex; (i < route.length-1 && dist < metres); i++) {
		olddist = dist;
		dist += getDistanceFromLatLonInKm(route[i].lat(),route[i].lng(),route[i+1].lat(),route[i+1].lng())*1000;
	}
	if (dist < metres) //if no point found
	{
		//console.log(dist);
		return -1;
	}
	//console.log(startIndex+" to "+i+" = "+dist);
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


	function drawreplaypolyline(route){
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
		animate(p1,p2,heading);
		//map.addListener('click', function() {shouldIPan=0;$("#panbtn").show();});
		// google.maps.event.addListener(map, 'dragend', function() { shouldIPan=0;$("#panbtn").show(); } );
		// if(shouldIPan==1)
		// {
		// 	if (!isNaN(route[route.length-1].lat()) && !isNaN(route[route.length-1].lng()))
		// 	map.panTo(new google.maps.LatLng(route[route.length-1].lat(),route[route.length-1].lng()));
		// }
		var snappedPolyline = new google.maps.Polyline({
			path: route,
			strokeColor: '#d3d3d3',
			strokeWeight: polySizeArray[map.getZoom()],
			zIndex: 1,
			clickable: true
		});
		snappedPolyline.setMap(map);
		//snappedPolyline.tS=tS[tS.length-1];
		// polylines.push(snappedPolyline);
		/*google.maps.event.addListener(polylines[polylines.length-1], "click",function(evt){polyClick(evt);});
		google.maps.event.addListener(polylines[polylines.length-1], "rightclick",function(){if(this.zIndex==1){this.setOptions({zIndex:0});window.alert(this.zIndex);}else{this.setOptions({zIndex:1}); window.alert(this.zIndex);}});*/
		/*if(polyLinesCount++>=polyLinesUpdateFrequency)
		{
			polyLinesCount=0;
		}*/
	}
}


function animate(p1,p2,heading){
	/*if (!isNaN(p1.lat()) && !isNaN(p1.lng()) && !isNaN(p2.lat()) && !isNaN(p2.lng())){
		polylineLengths += google.maps.geometry.spherical.computeDistanceBetween(p1, p2);
	}*/
	marker.setPosition(p2);
    icon.rotation = heading;
    marker.setIcon(icon);//http://maps.google.com/mapfiles/ms/icons/cabs.png
    map.setCenter(p2);
}

function deg2rad(deg) {
  return deg * (Math.PI/180)
}


function rad2deg(rad)
{
	return rad * (180/Math.PI);
}


	function night_mode(){
		map.setOptions({styles: [
            {elementType: 'geometry', stylers: [{color: '#242f3e'}]},
        {elementType: 'labels.text.stroke', stylers: [{color: '#242f3e'}]},
        {elementType: 'labels.text.fill', stylers: [{color: '#746855'}]},
        {
          featureType: 'administrative.locality',
          elementType: 'labels.text.fill',
          stylers: [{color: '#d59563'}]
        },
        {
          featureType: 'poi',
          elementType: 'labels.text.fill',
          stylers: [{color: '#d59563'}]
        },
        {
          featureType: 'poi.park',
          elementType: 'geometry',
          stylers: [{color: '#263c3f'}]
        },
        {
          featureType: 'poi.park',
          elementType: 'labels.text.fill',
          stylers: [{color: '#6b9a76'}]
        },
        {
          featureType: 'road',
          elementType: 'geometry',
          stylers: [{color: '#38414e'}]
        },
        {
          featureType: 'road',
          elementType: 'geometry.stroke',
          stylers: [{color: '#212a37'}]
        },
        {
          featureType: 'road',
          elementType: 'labels.text.fill',
          stylers: [{color: '#9ca5b3'}]
        },
        {
          featureType: 'road.highway',
          elementType: 'geometry',
          stylers: [{color: '#746855'}]
        },
        {
          featureType: 'road.highway',
          elementType: 'geometry.stroke',
          stylers: [{color: '#1f2835'}]
        },
        {
          featureType: 'road.highway',
          elementType: 'labels.text.fill',
          stylers: [{color: '#f3d19c'}]
        },
        {
          featureType: 'transit',
          elementType: 'geometry',
          stylers: [{color: '#2f3948'}]
        },
        {
          featureType: 'transit.station',
          elementType: 'labels.text.fill',
          stylers: [{color: '#d59563'}]
        },
        {
          featureType: 'water',
          elementType: 'geometry',
          stylers: [{color: '#17263c'}]
        },
        {
          featureType: 'water',
          elementType: 'labels.text.fill',
          stylers: [{color: '#515c6d'}]
        },
        {
          featureType: 'water',
          elementType: 'labels.text.stroke',
          stylers: [{color: '#17263c'}]
        }
    ]});
}