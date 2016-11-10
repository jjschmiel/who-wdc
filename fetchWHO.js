$(document).ready(function (datasource) {



var input = [];
var match = []; // create array here

$.getJSON( "http://apps.who.int/gho/athena/api/gho.json", function( data ) {
    console.log('loaded');
	
    $.each(data.dimension[0].code, function (index, code) {
        input.push(code.display); //push values here
    });
    console.log(input); // see the output here
});

$.getJSON( "http://apps.who.int/gho/athena/api/gho.json", function( data ) {
    console.log('loaded');
	
    $.each(data.dimension[0].code, function (index, code) {
        match.push({name: code.display, label: code.label}); //push values here
    });
    console.log(match); // see the output here
});



$("#CSV").autocomplete({
  source: input
});


	var search = '';
	var indicator = $('#CSV').val();
	

			
	
	
	var datasource = "http://apps.who.int/gho/athena/api/GHO/" + search + ".csv";
	var myConnector = tableau.makeConnector();
	
	var result = $.grep(match, function(e){ return e.label == indicator; });
	
	// var search = result[0].name;
	
	$('#CSV').on('change keyup paste click', function() {
    indicator = $('#CSV').val();
	
	datasource = "http://apps.who.int/gho/athena/api/GHO/" + search + ".csv";
	tableau.connectionData = datasource;
	});
	
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

	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

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

	tableau.registerConnector(myConnector);

	$(document).ready(function () {
		$("#submitButton").click(function () {
			var display = '';
			//indicator = 'Yellow fever - number of reported cases';
			indicator = $('#CSV').val();
			
			var result = $.grep(match, function(e){ return e.name === indicator; });
	
	
	if (result.length == 0) { console.log("111111111");
  // not found
} else if (result.length == 1) {console.log("22222222" + result[0].label);
  // access the foo property using result[0].foo
} else {console.log("333333333");
  // multiple items found
}
	
	
	
			search = result[0].label;
			datasource = "http://apps.who.int/gho/athena/api/GHO/" + search + ".csv";
			tableau.connectionData = datasource;
			tableau.connectionName = "WDCcsv";
			tableau.connectionData = datasource;
			tableau.submit();
			console.log(search);
		});
	});

	

});
