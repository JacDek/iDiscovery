// Load the Visualization API and the piechart package.
var crimeCount = 
	Array.apply(null, new Array(17)).map(Number.prototype.valueOf,0);
//Initialise crimeCount as an array of 17 zeros. Each element for a crime type
google.load('visualization', '1.0', {'packages':['corechart']});

// Set a callback to run when the Google Visualization API is loaded.
google.setOnLoadCallback(drawChart);

// Callback that creates and populates a data table,
// instantiates the pie chart, passes in the data and
// draws it.

function drawChart() {
//Draws chart based on crimeCount values. Will be all zeros as not properly
//communicating with crimeapi.js
	var data = new google.visualization.DataTable();
	data.addColumn('string', 'Crime Type');
	data.addColumn('number', 'Instances');
	data.addRows([
		['Homicide', crimeCount[0]],
		['Assault', crimeCount[1]],
		['Robbery', crimeCount[2]],
		['Other Theft', crimeCount[8]],
		['Drug', crimeCount[11]]
	]);
	// Set chart options
	var options = {'title':'Crime by type',
			   'width':540,
			   'height':410};

	// Instantiate and draw our chart, passing in some options.
	var chart = 
	   new google.visualization.PieChart(document.getElementById('chart_div'));
	chart.draw(data, options);
}