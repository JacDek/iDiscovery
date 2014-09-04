var map;
var highlight_area = null;
var growing = null;
var mouseup = true;
var overlay;
var growRate = 5;
var staticCenter = new google.maps.LatLng(-27.494768,153.002453);
var globalRadius = 50;
function initialize() {
  var myLatlng = new google.maps.LatLng(-27.494768,153.002453);
  var mapOptions = {
    zoom: 14,
    center: myLatlng
  }

  map = new google.maps.Map(document.getElementById("map_container"), mapOptions);  
  
  overlay = new google.maps.OverlayView();
  overlay.draw = function() {};
  overlay.setMap(map); // 'map' is new google.maps.Map(...)
  
  
  
  google.maps.event.addListener(map, 'mousedown', function(event) {
  mouseup = false;
	setTimeout(function(){
		makeHighlight(event)
		}, 340);
  });
  

  
  
/*
  google.maps.event.addListener(map, 'mousedown', function(event) {
	if (highlight_area != null && distanceFromCenter(event.latLng) <= highlight_area.getRadius()) {    	
		growing = setInterval(grow, 100);	    
    }
  });
*/
  
  
  
  
  google.maps.event.addListener(map, 'mouseup', function(event) {
  	if (growing != null) {
  		setPanning(true);
    	clearInterval(growing);
    	growing = null;
    }
    mouseup = true;
  });
  google.maps.event.addListener(map, 'mouseout', function(event) {
    if (growing != null) {
    	setPanning(true);
    	clearInterval(growing);
    }
    mouseup = true;
  });
  
  
  

	// right click to clear
	google.maps.event.addListener(map, 'click', function(event) {
		if (highlight_area != null) {
			if (distanceFromCenter(event.latLng) > highlight_area.getRadius()) {	    		
			    	clearHighlight();	    
			}
		} else {
			start_highlight(event.latLng);
		}
	});
	
	// right click to clear
	google.maps.event.addListener(map, 'rightclick', function(event) {
		if (highlight_area != null) {
			if (distanceFromCenter(event.latLng) <= highlight_area.getRadius()) {	    		
			    	clearHighlight();	    
			}
		}
	});
	
	
	google.maps.event.addListener(map, 'drag', function(event) {
			if (growing == null) {
				mouseup = true;
			}
	});
	
	  
	  
}


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
highlight_area = new google.maps.Circle(a);


}


function makeHighlight(event) {
	if (mouseup == false) {
		setPanning(false);
		if (highlight_area == null) {
		    start_highlight(event.latLng);
		    growing = setInterval(function(){grow(5);}, 30);		    
	    } else {
	    	/* alert(event.latLng.toString()); */
	    	//alert(highlight_area.getCenter().toString());
	    	if (distanceFromCenter(event.latLng) > highlight_area.getRadius()) {
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
  if (freeze) {
  	map.setOptions(options);
  } else {
  		map = new google.maps.Map(document.getElementById("map_container"), mapOptions);
  		addResizeListener();
	  
		  
		  google.maps.event.addListener(map, 'mousedown', function(event) {
		  mouseup = false;
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
		    mouseup = true;
		  });
		  google.maps.event.addListener(map, 'mouseout', function(event) {
		    if (growing != null) {
		    	setPanning(true);
		    	clearInterval(growing);
		    }
		    mouseup = true;
		  });
		  
		  	// right click to clear
	google.maps.event.addListener(map, 'rightclick', function(event) {
		if (highlight_area != null) {
			if (distanceFromCenter(event.latLng) <= highlight_area.getRadius()) {	    		
			    	clearHighlight();	    
			}
		}
	});
		  
		
			// right click to clear
			google.maps.event.addListener(map, 'click', function(event) {
				if (highlight_area != null) {
					if (distanceFromCenter(event.latLng) > highlight_area.getRadius()) {
					    	clearHighlight();	    
					}
				} else {
					start_highlight(event.latLng);
				}
			});
			
			
			google.maps.event.addListener(map, 'drag', function(event) {
					if (growing == null) {
						mouseup = true;
					}
			});
			
			
			
			if (highlight_area != null) {
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
				highlight_area = new google.maps.Circle(a);
				
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
		if (!mouseup) {
		  //var projection = overlay.getProjection(); 
		  //var mouseLatLng = projection.fromContainerPixelToLatLng(new google.maps.Point(x, y));
		  document.getElementById('rad').innerHTML = staticCenter.lng();
		  document.getElementById('dist').innerHTML = event.latLng.lng();

		  growRate = (-1000 * ((staticCenter.lng() + globalRadius / 111340) - event.latLng.lng()));
		  //alert(-10000 * (staticCenter.lng() - event.latLng.lng()));
		} else {
			growRate = 5;			
		}
	});
}


function grow() {
	if (mouseup == false) {
		highlight_area.setRadius(globalRadius+growRate);
		globalRadius = highlight_area.getRadius();
	}
}


function clearHighlight() {
	highlight_area.setVisible(false);
	highlight_area = null;
}

function distanceFromCenter(clickPoint) {
	/*
document.getElementById('rad').innerHTML = highlight_area.getRadius();
	document.getElementById('dist').innerHTML = google.maps.geometry.spherical.computeDistanceBetween(clickPoint, highlight_area.getCenter(), 		6378137);

*/
	return google.maps.geometry.spherical.computeDistanceBetween(clickPoint, staticCenter, 6378137);
}
google.maps.event.addDomListener(window, 'load', initialize);

// long press event listener
// start and cancel/grow circle while held
//mouse up cancel
//right click cancel
//double click cancel   -- double mouse press later



