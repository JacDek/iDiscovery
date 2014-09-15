var crimeCount = 
	Array.apply(null, new Array(17)).map(Number.prototype.valueOf,0);
//Initialise crimeCount as an array of 17 zeros. Each element for a crime type

function setSuburbQuery() {
//See comments in profile.js
	var suburb = "ST LUCIA";
	suburb = suburb.replace(" ", "%20");
	var suburbQuery = "https://data.police.qld.gov.au/api/boundary?name=" + suburb;
	suburbID(suburbQuery);
	alert(suburbQuery);
}

function setDataQuery(id) {
	// See comments in profile.js
	
	var dataQuery = "https://data.police.qld.gov.au/api/qpsmeshblock?boundarylist=1_" + id + "&startdate=1364466223&enddate=1372415023&offences=1,8,14,30,45";
	//document.getElementById('placeholder').innerHTML = dataQuery;
	crimeType(dataQuery);
}

function suburbID(query) {
	//See comments in profile.js
	
	$.getJSON(query, function (data) {
		var result = data.Result[0].QldSuburbId;
		setDataQuery(result);
    });
}

function crimeType(query) {
	//See comments in profile.js
	
	$.getJSON(query, function (data) {
		var dataLength = data.Result.length;
		for (var i = 0; i < dataLength; i++) {
			var id = data.Result[i].OffenceInfo[0].QpsOffenceCode
			resolveOffenseCode(id);
			alert(crimeCount);
		} 
    });
}

function resolveOffenseCode(id) {
    //Used for resolving crime type from id. Used for counting crimes by type.
    switch (id) {
    case 1:
        crimeCount[0]++;
		break;
    case 8:
        crimeCount[1]++;
		break;
    case 14:
        crimeCount[2]++;
		break;
    case 17:
        crimeCount[3]++;
		break;
    case 21:
        crimeCount[4]++;
		break;
    case 27:
        crimeCount[5]++;
		break;
    case 28:
        crimeCount[6]++;
		break;
    case 29:
        crimeCount[7]++;
		break;
    case 30:
        crimeCount[8]++;
		break;
    case 35:
        crimeCount[9]++;
		break;
    case 39:
        crimeCount[10]++;
		break;
    case 45:
        crimeCount[11]++;
		break;
    case 47:
        crimeCount[12]++;
		break;
    case 51:
        crimeCount[13]++;
		break;
    case 52:
        crimeCount[14]++;
		break;
    case 54:
        crimeCount[15]++;
		break;
    case 55:
        crimeCount[16]++;
		break;
	}
}