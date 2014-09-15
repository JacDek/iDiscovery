var map;
var highlightArea = null;
var growing = null;
var mouseUp = true;
var overlay;
var growRate = 5;
var staticCenter = new google.maps.LatLng(-27.494768,153.002453);
var globalRadius = 50;


// INITIALISE MAP ##################################################

function initialize() {
  var myLatlng = new google.maps.LatLng(-27.494768,153.002453);
  var mapOptions = {
    zoom: 14,
    center: myLatlng
  }

  map = new google.maps.Map(document.getElementById("map_container"), 
							mapOptions);  
  overlay = new google.maps.OverlayView();
  overlay.draw = function() {};
  overlay.setMap(map); // 'map' is new google.maps.Map(...) 
  
  google.maps.event.addListener(map, 'mousedown', function(event) {
  mouseUp = false;
	setTimeout(function(){
		makeHighlight(event)
		}, 340);
  }); 
  
  google.maps.event.addListener(map, 'mousedown', function(event) {
	if (highlightArea != null && distanceFromCenter(event.latLng) <= 
			highlightArea.getRadius()) {    	
		growing = setInterval(grow, 100);	    
    }
  }); 
  
  google.maps.event.addListener(map, 'mouseup', function(event) {
  	if (growing != null) {
  		setPanning(true);
    	clearInterval(growing);
    	growing = null;
    }
    mouseUp = true;
  });
  google.maps.event.addListener(map, 'mouseout', function(event) {
    if (growing != null) {
    	setPanning(true);
    	clearInterval(growing);
    }
    mouseUp = true;
  });
  
	// right click to clear
	google.maps.event.addListener(map, 'click', function(event) {
		if (highlightArea != null) {
			if (distanceFromCenter(event.latLng) > highlightArea.getRadius()) {	    		
			    	clearHighlight();	    
			}
		} else {
			start_highlight(event.latLng);
		}
	});
	
	// right click to clear
	google.maps.event.addListener(map, 'rightclick', function(event) {
		if (highlightArea != null) {
			if (distanceFromCenter(event.latLng) <= 
					highlightArea.getRadius()) {	    		
			    clearHighlight();	    
			}
		}
	});
		
	google.maps.event.addListener(map, 'drag', function(event) {
			if (growing == null) {
				mouseUp = true;
			}
	});
	 
}

// ON DOCUMENT READY #################################################

//Experimental function for using crimemap.info data
/* $(document).ready( function () {
	//addCrimeMarkersByName("ST LUCIA");
	//Not currently working due to access control of crimemap.info server
	$.getJSON("http://www.crimemap.info/api/offences/near?location=" +
			"-27.49%2C153.008&distance=1000m", function (json) {
	        
	        alert("test");
			alert(json.Result[0].QldSuburbId);
			alert(json);
			
	    }).done(function(d) {
                alert("success");
            }).fail(function(jqxhr, textStatus, error ) {
    var err = textStatus + ", " + error;
    console.log( "Request Failed: " + err );
    });	
    //loadCrimeByRadius('-27.49', '153.008', '1000'); 
} */
	
$(document).ready(drawFunction); 



function drawFunction() {
	//QPS api version for st lucia:
	suburb = "ST LUCIA";
	polyList = [];
    if (suburb == "") {
        alert("Invalid Input");
        return;
    }
    
    suburb = suburb.replace(" ", "%20");
    $.getJSON('https://data.police.qld.gov.au/api/boundary?name=' + suburb + 
			"&returngeometry=true", function (json) {
        if (json.ResultCount == 0) {
            alert("Error: Suburb not found.");
            return;
        }
        //map.setCenter(averageGeoWKT(json.Result[0].GeometryWKT));

        var offenceQuery = "https://data.police.qld.gov.au/api/qpsmeshblock" +
			"?boundarylist=1_" + json.Result[0].QldSuburbId + 
			"&startdate=1356998400&enddate=1433408400&offences=" +
			"1,8,14,17,21,27,28,29,30,35,39,45,47,51,52,54,55";
		
        $.getJSON(offenceQuery, function (json) {
            addPolygons(json, map, polyList);
        }); 
    });
}


function addPolygons(json, map, polyList) {
    //This function is a callback function used to add the crime markers onto 
	//the map	
    if (json.ResultCount == 0) {
        alert("No Crime Results Were Found.");
        return;
    }

    for (var i = 0; i < json.ResultCount; i++) {
        //Add the markers
        polygon = new google.maps.Polygon({
            paths: polyGeoWKT(json.Result[i].GeometryWKT),
            strokeColor: '#000000',
            strokeOpacity: 0.8,
            strokeWeight: 0.5,
            fillColor: resolveColour(json.Result[i].OffenceInfo.length),
            fillOpacity: 0.35,
            polyContent: formatOffences(json.Result[i].OffenceInfo),
            polyLatLong: averageGeoWKT(json.Result[i].GeometryWKT)
        });

        polygon.setMap(map);
        google.maps.event.addListener(polygon, 'click', function () {
            // Set the content of the InfoBubble or InfoWindow
            // They both have a function called setContent
            var infowindow = new google.maps.InfoWindow();
            infowindow.setContent(this.polyContent);
            infowindow.setPosition(this.polyLatLong);
            infowindow.open(map);
        });

        polyList.push(polygon);
    }
}

function averageGeoWKT(string) {

    //Returns google latlong object that is the statistical average of all 
	//coords in list.
    var coordList = [];

    string = string.slice(10, -2);
    coordList = string.split(", ");
    var latsum = 0;
    var longsum = 0;
    for (var i = 0; i < coordList.length; i++) {
        latsum += Number(coordList[i].split(" ")[1])
        longsum += Number(coordList[i].split(" ")[0])
    }

    return new google.maps.LatLng((latsum / coordList.length), 
		(longsum / coordList.length));
}

function polyGeoWKT(string) {

    //Returns array of google latlong objects
    var coordList = [];
    var googleCoordList = [];
    string = string.slice(10, -2);
    coordList = string.split(", ");

    for (var i = 0; i < coordList.length; i++) {
        //latsum += Number(coordList[i].split(" ")[1])
        //longsum += Number(coordList[i].split(" ")[0])
        googleCoordList.push(new google.maps.LatLng(coordList[i].split(" ")[1],
			coordList[i].split(" ")[0]));
    }
    return googleCoordList;
}

function resolveColour(num){
//Give a colour based on number of offences
	
		  if(num <= 5){
			return '#0000ff';
			}
		  else if(num <= 10){
			return '#00a4ff';
			}
		  else if(num <= 20){
			return '#00d4ff';
			}
		  else if(num <= 30){
			return '#00fff4';
			}
		  else if(num <= 40){
			return '#00ff10';
			}
		  else if(num <= 50){
			return '#8aff00';
			}
		  else if(num <= 60){
			return '#FFfa00';
			}
		  else if(num <= 70){
			return '#FFb400';
			}
		  else if(num <= 80){
			return '#FF6e00';
			}
		  else if(num <= 90){
			return '#FF0000';
			}
		  else if(num >= 90){
			return '#FF0000';
			}
		  else{
			return '#000000';
			}
		
}

function formatOffences(array) {
    //Formats the array of offences each marker has into a table format to be
	//put into the marker popup
    var output = "<div style='margin:0 0 20px 20px;color:black;'>Total: " + 
		String(array.length) + "<br><table cellpadding='5'><tr><th>Offence" +
		"</th><th>Num</th></tr>";
    var offenceArray = [];
    var found = false;

    //Makes array of array where 0=OffenceID and 1=countofoffences
    for (var i = 0; i < array.length; i++) {
        found = false;
        for (var j = 0; j < offenceArray.length; j++) {
            if (array[i].QpsOffenceCode == offenceArray[j][0]) {
                offenceArray[j][1] += 1;
                found = true;

                break;
            }
        }
        if (found == false) {
            offenceArray.push([array[i].QpsOffenceCode, 1]);

        }
    }

    //sort decending
    offenceArray.sort(function (a, b) {
        return b[1] - a[1]
    });

    for (var j = 0; j < offenceArray.length; j++) {
        output += "<tr><td>" + resolveOffenseCode(offenceArray[j][0]) +
			"</td><td>" + String(offenceArray[j][1]) + "</td></tr>"
    }

    output += "</table></div>"
    return output;
}


function resolveOffenseCode(id) {
    //Give it an offenceid and it will return the name of the offence
    switch (id) {
    case 1:
        return 'Homicide';
    case 8:
        return 'Assault';
    case 14:
        return 'Robbery';
    case 17:
        return 'Other Offences Against the Person';
    case 21:
        return 'Unlawful Entry';
    case 27:
        return 'Arson';
    case 28:
        return 'Other Property Damage';
    case 29:
        return 'Unlawful Use of Motor Vehicle';
    case 30:
        return 'Other Theft';
    case 35:
        return 'Fraud';
    case 39:
        return 'Handling Stolen Goods';
    case 45:
        return 'Drug Offence';
    case 47:
        return 'Liquor (excl. Drunkenness)';
    case 51:
        return 'Weapons Act Offences';
    case 52:
        return 'Good Order Offence';
    case 54:
        return 'Traffic and Related Offences';
    case 55:
        return 'Other';
    default:
        return 'Unknown';
    }
}

// MAP HIGHLIGHTING FUNCTIONS #####################################

 function start_highlight(location) {
 var a = {
      strokeColor: '#DE1B1B',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#2B2B2B',
      fillOpacity: 0.35,
      map: map,
      center: location,
      radius: 50,
      clickable: false
}
	staticCenter = location;
	globalRadius = 50;
// Add the circle
highlightArea = new google.maps.Circle(a);


}


function makeHighlight(event) {
	if (mouseUp == false) {
		setPanning(false);
		if (highlightArea == null) {
		    start_highlight(event.latLng);
		    growing = setInterval(function(){grow(5);}, 30);		    
	    } else {
	    	/* alert(event.latLng.toString()); */
	    	//alert(highlightArea.getCenter().toString());
	    	if (distanceFromCenter(event.latLng) > highlightArea.getRadius()) {
		    	clearHighlight();
			    start_highlight(event.latLng);
			    growing = setInterval(function(){grow(5);}, 30);
		    } else {
			    growing = setInterval(function(){grow(5);}, 30);
			    

		    }
	    }
	}
	event.stop();

}




function setPanning(freeze) {

	var options = {
        draggable: freeze,
        panControl: freeze, 
        scrollwheel: freeze 
    };
	
  var mapOptions = {
    zoom: map.getZoom(),
    center: map.getCenter(),
    draggable: freeze,
    panControl: freeze
  }
  drawFunction();
  if (freeze) {
  	map.setOptions(options);
  } else {
  		map = new google.maps.Map(document.getElementById("map_container"), 
			mapOptions);
  		addResizeListener();
	    google.maps.event.addListener(map, 'mousedown', function(event) {
			mouseUp = false;
			setTimeout(function(){
				makeHighlight(event)
				}, 340);
		  });
		    
		  google.maps.event.addListener(map, 'mouseup', function(event) {
		  	if (growing != null) {
		  		setPanning(true);
		    	clearInterval(growing);
		    	growing = null;
		    }
		    mouseUp = true;
		  });
		  google.maps.event.addListener(map, 'mouseout', function(event) {
		    if (growing != null) {
		    	setPanning(true);
		    	clearInterval(growing);
		    }
		    mouseUp = true;
		  });
		  
		// right click to clear
		google.maps.event.addListener(map, 'rightclick', function(event) {
			if (highlightArea != null) {
				if (distanceFromCenter(event.latLng) <= 
					highlightArea.getRadius()) {	    		
					clearHighlight();	    
				}
			}
		});
		
		// right click to clear
		google.maps.event.addListener(map, 'click', function(event) {
			if (highlightArea != null) {
				if (distanceFromCenter(event.latLng) > highlightArea.getRadius()) {
					   	clearHighlight();	    
				}
			} else {
				start_highlight(event.latLng);
			}
		});
			
		google.maps.event.addListener(map, 'drag', function(event) {
			if (growing == null) {
				mouseUp = true;
			}
		});
			
		if (highlightArea != null) {
			var a = {
			  strokeColor: '#DE1B1B',
			  strokeOpacity: 0.8,
			  strokeWeight: 2,
			  fillColor: '#2B2B2B',
			  fillOpacity: 0.35,
			  map: map,
			  center: staticCenter,
			  radius: globalRadius,
			  clickable: false
			}
			// Add the circle
			highlightArea = new google.maps.Circle(a);
		}
	
	}	  
}



function startResize() {
	//decide principle direction
		// center to point (always in circle)
		// decide principle line
	//calc distance from line
	// proportional movement
}



function addResizeListener() {
	google.maps.event.addListener(map, 'mousemove', function(event) {
		if (!mouseUp) {
		  /*var projection = overlay.getProjection(); 
			var mouseLatLng = projection.fromContainerPixelToLatLng(
				new google.maps.Point(x, y));
			  document.getElementById('rad').innerHTML = staticCenter.lng();
			  document.getElementById('dist').innerHTML = event.latLng.lng();
			  */

		    growRate = (-1000 * ((staticCenter.lng() + globalRadius / 111340) - 
				event.latLng.lng()));
		  //alert(-10000 * (staticCenter.lng() - event.latLng.lng()));
		} else {
			growRate = 5;			
		}
	});
}


function grow() {
	if (mouseUp == false) {
		highlightArea.setRadius(globalRadius+growRate);
		globalRadius = highlightArea.getRadius();
	}
}


function clearHighlight() {
	highlightArea.setVisible(false);
	highlightArea = null;
}



function distanceFromCenter(clickPoint) {
	/*
document.getElementById('rad').innerHTML = highlightArea.getRadius();
	document.getElementById('dist').innerHTML = 
		google.maps.geometry.spherical.computeDistanceBetween(clickPoint, 
			highlightArea.getCenter(), 		6378137);

*/
	return google.maps.geometry.spherical.computeDistanceBetween(clickPoint, 
		staticCenter, 6378137);
}
google.maps.event.addDomListener(window, 'load', initialize);

// long press event listener
// start and cancel/grow circle while held
//mouse up cancel
//right click cancel
//double click cancel   -- double mouse press later

// AUTOCOMPLETE -----------------------------------------------




