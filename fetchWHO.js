$(document).ready(function (datasource) {

	var input = [];
	var match = [];
	
	////////////////////////////////////////////////////////////////////////////////
	//Gets list of Indicators by their natural name.  AKA 'display' property on JSON
	//This places JSON data into the 'input' array
	////////////////////////////////////////////////////////////////////////////////
	
	$.getJSON("http://localhost:8889/apps.who.int/gho/athena/api/gho.json", function (data) {
		console.log('loaded');

		$.each(data.dimension[0].code, function (index, code) {
			input.push(code.display);
		});
		console.log(input);
	});
	
	/////////////////////////////////////////////////////////////////////////////////
	//Gets list of Indicators by their natural name (AKA 'display' property on JSON) 
	//AND their code  (AKA 'label' property on JSON). 
	//
	//This places JSON data into the 'match' array where it will be used to match
	//what the input is.
	/////////////////////////////////////////////////////////////////////////////////
	
	$.getJSON("http://localhost:8889/apps.who.int/gho/athena/api/gho.json", function (data) {
		console.log('loaded');

		$.each(data.dimension[0].code, function (index, code) {
			match.push({
				name: code.display,
				label: code.label
			});
		});
		console.log(match);
	});

	////////////////////////////////////////////////////////////////////////////////
	//jquery autocomplete uses the 'input' array to find the name of the indicator
	////////////////////////////////////////////////////////////////////////////////
	
	$("#CSV").autocomplete({
		source: input
	});

	////////////////////////////////////////////////////////////////////////////////
	//Declare global variables
	////////////////////////////////////////////////////////////////////////////////
	
	var search = '';
	var indicator = '';
	var datasource = '';
	var result = '';
	var myConnector = tableau.makeConnector();

	////////////////////////////////////////////////////////////////////////////////
	//Creates the schema for Tableau by grabbing the top row of the CSV file.  This 
	//function gets called AFTER the submit button is pressed (below)
	////////////////////////////////////////////////////////////////////////////////
	
	myConnector.getSchema = function (schemaCallback) {

		var source = tableau.connectionData;

		$.ajax({
			url: source,
			dataType: "text"
		}).done(successFunction);

		function successFunction(data) {
			var data = data.replace(/\"/g, "");
			var data = data.replace(/ /g, '');
			var allRows = data.split(/\r?\n|\r/);
			var cols = [];
			for (var singleRow = 0; singleRow < allRows.length; singleRow++) {
				var rowCells = allRows[singleRow].split(',');
				for (var rowCell = 0; rowCell < rowCells.length; rowCell++) {
					if (singleRow === 0) {
						x = rowCells[rowCell];

						y = {
							id: x,
							alias: x,
							dataType: tableau.dataTypeEnum.string
						};
						cols.push(y);
					}
				}
			}
			console.log(cols);
			var tableInfo = {
				id: "WDCcsv",
				alias: "WDCcsv",
				columns: cols
			};

			schemaCallback([tableInfo]);
		}
	};

	//////////////////////////////////////////////////////////////////////////////////////////////////
	//Once schema is loaded into Tableau, the data is then grabbed by getting rows below the first row
	//This function gets called AFTER the submit button is pressed (below)
	//////////////////////////////////////////////////////////////////////////////////////////////////
	
	myConnector.getData = function (table, doneCallback) {

		var source = tableau.connectionData;

		$.ajax({
			url: source,
			dataType: "text",
		}).done(successFunction);

		function successFunction(data) {
			var data = data.replace(/\"/g, "");
			var allRows = data.split(/\r?\n|\r/);
			var tableData = [];
			var cols = [];
			for (var singleRow = 0; singleRow < allRows.length; singleRow++) {
				var rowCells = allRows[singleRow].split(',');
				for (var rowCell = 0; rowCell < rowCells.length; rowCell++) {
					if (singleRow === 0) {
						x = rowCells[rowCell];
						y = {
							id: x,
							alias: x,
							dataType: tableau.dataTypeEnum.string
						};
						cols.push(y);
					}
				}
				if (singleRow != 0) {
					x = rowCells;

					tableData.push(x);
				}
			}

			table.appendRows(tableData);
			doneCallback();
		}
	};
	
	////////////////////////////////////////////////////////////////////////////////
	//Registers connector with Tableau.  Not really sure what this does exactly.
	////////////////////////////////////////////////////////////////////////////////
	
	tableau.registerConnector(myConnector);
	
	////////////////////////////////////////////////////////////////////////////////
	//When the 'submit button'  is pushed, the indicator in the text box is grabbed 
	//and then grepped to the match[] where it finds its matching ID and placed into 
	//result[].  The ID or 'label' of the CSV is placed into the 'search' var.
	//'search' is then placed into the 'datasource' URL where it is passed through
	//getSchema and get getData functions above by being placed in connectionData.
	////////////////////////////////////////////////////////////////////////////////
	
	$(document).ready(function () {
		$("#submitButton").click(function () {
			indicator = $('#CSV').val();

			var result = $.grep(match, function (e) {
					return e.name === indicator;
				});

			search = result[0].label;
			datasource = "http://localhost:8889/apps.who.int/gho/athena/api/GHO/" + search + ".csv";
			tableau.connectionData = datasource;
			tableau.connectionName = "WDCcsv";
			tableau.submit();
		});
	});

});