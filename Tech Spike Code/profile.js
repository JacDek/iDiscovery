// Load the Visualization API and the piechart package.
google.load('visualization', '1.0', {'packages':['corechart']});

// Set a callback to run when the Google Visualization API is loaded.
google.setOnLoadCallback(setSuburbQuery); //Calls setSububrQuery on load

function setSuburbQuery() {
	//Prepares qps api query
	var suburb = "ST LUCIA";//Default suburb ST LUCIA. In future will take
	//value from searchbar (autocomplete.php-->ajax)
	suburb = suburb.replace(" ", "%20");
	var suburbQuery = "https://data.police.qld.gov.au/api/boundary?name=" + 
		suburb;
	suburbID(suburbQuery);//JSON functions at bottom of page.
}

function setDataQuery(id) {
	// Takes suburb id returned from suburbID query 
	
	var dataQuery = "https://data.police.qld.gov.au/api/qpsmeshblock?boundarylist=1_" + id + "&startdate=1364466223&enddate=1372415023&offences=1,8,14,30,45";
	//document.getElementById('placeholder').innerHTML = dataQuery;
	crimeType(dataQuery);
}

function suburbID(query) {
	/* $.ajaxSetup({
		async: false
	}); Attempt at dealing with async issues*/
	$.getJSON(query, function (data) { 
		var result = data.Result[0].QldSuburbId;
		setDataQuery(result);
        //getJSON executes query and runs asynchronous function that fetches
		//the qld suburb idea returned within the JSON file.
    });
}

function crimeType(query) {
//Takes a query that returns a JSON and parses through the JSON, displaying 
//certain crime types on google charts piechart
	var homCount = 0;
	var assCount = 0;
	var robCount = 0;
	var theCount = 0;
	var drugCount = 0;//variables for storing instances of each crime type
	$.getJSON(query, function (data) {
		var dataLength = data.Result.length;
		for (var i = 0; i < dataLength; i++) {
			var type = data.Result[i].OffenceInfo[0].QpsOffenceCode	
			//checks each data entry for crime type. Switch statement updates
			//count of crime type (implemented for only 5 types)
			switch (type) {
				case 1:
					homCount++;
					break;
				case 8:
					assCount++;
					break;
				case 14:
					robCount++;
					break;
				case 30:
					theCount++;
					break;
				case 45:
					drugCount++;
					break;
			}
		}
		var data = new google.visualization.DataTable();
		data.addColumn('string', 'Crime Type');
		data.addColumn('number', 'Instances');
		//set up table. Add data to DataTable
		data.addRows([
			['Homicide', homCount],
			['Assault', assCount],
			['Robbery', robCount],
			['Other Theft', theCount],
			['Drug', drugCount]
		]);
		// Set chart options
		var options = {'title':'Crime by type',
				   'width':540,
				   'height':410};

		// Instantiate and draw our chart, passing in some options.
		var chart = new google.visualization.PieChart(document.getElementById('chart_div'));
		chart.draw(data, options);
    });
}