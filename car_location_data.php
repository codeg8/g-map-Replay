<?php


function randomFloat($min = 0, $max = 1) {
    return $min + mt_rand() / mt_getrandmax() * ($max - $min);
}


/**
 *
 * This is a function to generate Random Co-ordinates on Map.
 * thse co-ordinates should be very close to each other.
 * these co-ordinates will be passed to Snap-to-Roads Google API
 * 
 * In real Use case scenatio these co-ordinates may be obtained by
 * some GPS device installed in vehicle.
 * 
 * @param: $number (Number of Points to Generate)
 * @return: Array of generated Latitude, Longitude Pairs
 */
function generate_random_lat_lon($number){
	$resultArray = [];
	$max_deviation = 0.001;
	for($i=0; $i < $number; $i++){
		static $latitude = 19.213665;
		static $longitude = 72.873445;
		$resultArray[] = ["lat"=>round($latitude, 8), "lng" => round($longitude, 8)];
		$max_lat = (mt_rand(0,1)) ? $latitude+$max_deviation : $latitude-$max_deviation;
		$max_lng = (mt_rand(0,1)) ? $longitude+$max_deviation : $longitude-$max_deviation;
		$latitude = randomFloat($latitude,$latitude+$max_deviation);
		$longitude = randomFloat($longitude, $longitude+$max_deviation);
	}
	return $resultArray;
}


function snap_to_roads($raw_points){

	try {
	    $url = 'https://roads.googleapis.com/v1/snapToRoads?key=AIzaSyBCrrBit6nZBc_i2b66pCMkTI11Zi_vo1Y&interpolate=true&path=';
	    $points = [];
	    foreach ($raw_points as $pts) {
	    	$points[] = $pts['lat'].','.$pts['lng'];
	    }
	    $url .= implode('|', $points);

	    //echo $url;
		$ch = curl_init(); 
		curl_setopt($ch, CURLOPT_URL, $url); 
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1); 
		$output = curl_exec($ch); 
		curl_close($ch);      
        return $output;
	    // ...process $output now
	} catch(Exception $e) {

	    trigger_error(sprintf(
	        'Curl failed with error #%d: %s',
	        $e->getCode(), $e->getMessage()),
	        E_USER_ERROR);
	}
}

//echo randomFloat(4,3);

// echo mt_getrandmax()."<br>";
// echo mt_getrandmax()."<br>";
$resultArray = generate_random_lat_lon(1000);
echo "<pre>";
$response = [];
for($i = 0; $i < count($resultArray); $i+100){
	print_r(array_slice($resultArray,$i,100,true));
	/*$output = snap_to_roads();
	$data = json_decode($output);
	// var_dump($data);
	foreach ($data->snappedPoints as $d) {
		$response['calculatedPoints'][] = [
			"lat" => $d->location->latitude,
			"lng" => $d->location->longitude
		];
	}*/
}
//print_r($response);
echo json_encode($response);
// print_r($resultArray); die();