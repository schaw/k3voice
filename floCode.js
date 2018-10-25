var viz, workbook, activeSheet, Worksheet, worksheet;
function initializeViz(){
	var placeholderDiv = document.getElementById("tableauViz");
	var url = "https://public.tableau.com/views/BetaMovie/Ratings";
	var options = {
		width: "100%",   
		height: "80%",
		hideTabs: true,
		hideToolbar: true,
		onFirstInteractive: function () {
			workbook = viz.getWorkbook();
			activeSheet = workbook.getActiveSheet();
		}
	};
	viz = new tableauSoftware.Viz(placeholderDiv, url, options);
}
$(document).ready(function() {
	initializeViz();
	$(document).keydown(function(event) { 
		var pressedKey = String.fromCharCode(event.keyCode).toLowerCase();
		if (event.ctrlKey && (pressedKey == "c" || pressedKey == "u")) {
			return false; 
		}
	});
	$(".disableEvent").on("contextmenu",function(){
		return false;
	}); 
	$('.disableEvent').bind('cut copy paste', function (e) {
		e.preventDefault();
	});
});

function floSays(str){
	responsiveVoice.speak(str);
}
floSays('Welcome to Flow');
function toPascalCase(str){
	var newStr = str.toLowerCase().replace(/\b[a-z]/g, function(txtVal) {
		return txtVal.toUpperCase(); });
	return newStr;
}
function addToHistory(prefix, str){
	$("<span><li>"+prefix+"&nbsp;"+str+"</li></span>").appendTo("#SearchHistory ul");
	$("#snackbar").html("We heard "+str);
	showSnackbar();
}
function showAlert(alertText){
	document.getElementById("dialog").innerHTML = alertText;
	//$(function() {
		$( "#dialog" ).dialog({
			open: function(event, ui){
				setTimeout("$('#dialog').dialog('close')",4000);
			}
        });
	//});
}

function showSnackbar() {
    var x = document.getElementById("snackbar");
    x.className = "show";
    setTimeout(function(){ x.className = x.className.replace("show", ""); }, 3000);
}
//functions to switch between sheets
function switchToSheetUsingIndexOrName(newSheetIndexOrName){
	try {
	workbook.activateSheetAsync(newSheetIndexOrName);
	}
	catch(err){
		console.log("-------------");
		console.log(err);
		console.log("-------------");
		//alert("Cannot switch sheets at the  moment!");	
		showAlert("Sorry. I can't perform the requested action");
		// You can make the above alert more decriptive by saying that its the last sheet or the first sheet or No such sheet.
	}
	/** Exception to be dealt with
			Exception$ {_message: "Hidden worksheets do not have a URL.", _innerException: null, _error: Error
			at new Exception$ (https://public.tableau.com/javascripts/api/tableau-2.2.2.min.js:4:30273…, tableauSoftwareErrorCode: "noUrlForHiddenWorksheet"}
	**/
}

if (annyang) {
	var startOver = function() { 
		viz.revertAllAsync(); responsiveVoice.speak('starting over'); 
		}
	var selectStudio =  function(tag) {
		var new_tag = toPascalCase(tag);
		addToHistory("",new_tag);
		activeSheet.getWorksheets()[1].selectMarksAsync('Lead Studio', new_tag, 'REPLACE'); 
	};
	var unSelectStudio =  function(tag) {
		var new_tag = toPascalCase(tag);
		addToHistory("",new_tag);
		activeSheet.getWorksheets()[1].selectMarksAsync('Lead Studio', new_tag, 'REMOVE'); 
	};
	var addSelectStudio =  function(tag) {
		var new_tag = toPascalCase(tag);
		addToHistory("",new_tag);
		activeSheet.getWorksheets()[1].selectMarksAsync('Lead Studio', new_tag, 'ADD'); 
	};
	var clearSelect =  function() {
		activeSheet.getWorksheets()[1].clearSelectedMarksAsync(); 
	};

	var filterGenre =  function(tag) {
		var new_tag = toPascalCase(tag);
		addToHistory("",new_tag);
		activeSheet.getWorksheets()[1].applyFilterAsync("Genre", new_tag, 'REPLACE'); 
	};
	var addFilterGenre =  function(tag) {
		var new_tag = toPascalCase(tag);
		addToHistory("",new_tag);
		activeSheet.getWorksheets()[1].applyFilterAsync("Genre", new_tag, 'ADD'); 
	};
	var removeFilterGenre =  function(tag) {
		var new_tag = toPascalCase(tag);
		addToHistory("",new_tag);
		activeSheet.getWorksheets()[1].applyFilterAsync("Genre", new_tag, 'REMOVE');
	};
	var clearFilterGenre =  function(tag) {
		var new_tag = toPascalCase(tag);
		addToHistory("",new_tag);
		if(new_tag == "Type"){
			new_tag = "Genre";
		}
		activeSheet.getWorksheets()[1].clearFilterAsync(new_tag);
	};
	var exportPDF = function() {
		addToHistory("","Heard Export PDF");
		viz.showExportPDFDialog();
		responsiveVoice.speak('Exporting this dashboard as PDF');
	};
	var exportImage = function() {
		addToHistory("","Heard Export Image");
		viz.showExportImageDialog();
		responsiveVoice.speak('Exporting this dashboard as Image');
	};
	var switchTo = function(tag) {
		var currSheetIndex = workbook.getActiveSheet().getIndex();
		var new_tag = toPascalCase(tag);
		addToHistory("",new_tag);
		if (new_tag == "Next")
			switchToSheetUsingIndexOrName(currSheetIndex + 1);
		else if (new_tag == "Previous")
			switchToSheetUsingIndexOrName(currSheetIndex - 1);
		else		
			switchToSheetUsingIndexOrName(new_tag);	
	}
	var switchToCreateViz = function(tag) {
		addToHistory("","Opening Blank Slate");
		switchToSheetUsingIndexOrName("Create View");	
	}
	var putFactAndDim = function(tag) {
		var new_tag = toPascalCase(tag);
		if(workbook.getActiveSheet().getName() != "Create View"){
			console.log("Not the right page for the command");
			showAlert("This page does not support the command");
			return; //continue;
		}
		//Get Dimensions and Metrics
		var dim = '';
		var fact = '';
		var i = 0;
		var dimAndFactPresent = false;
		for(; i <= new_tag.length;i++){
			var tempCheck = new_tag[i]+new_tag[i+1]+new_tag[i+2]+new_tag[i+3];
			if (tempCheck == ' By '){
				dimAndFactPresent = true;
				break;
			}
		}
		if (dimAndFactPresent){
			var fact = new_tag.substring(0,i).trim();
			var dim = new_tag.substring(i+4,new_tag.length).trim();
			addToHistory("", dim+" vs. "+fact);
			//activeSheet = workbook.getActiveSheet();
			workbook.changeParameterValueAsync('Dimensions',dim).then(function(t) {
				workbook.changeParameterValueAsync('Metrics',fact);
			});
		}
		else {
			addToHistory("", new_tag);
			workbook.changeParameterValueAsync('Dimensions',new_tag).otherwise(function(){
				workbook.changeParameterValueAsync('Metrics',new_tag).otherwise(function(err){
					showAlert("Cannot process desired visual.\n Error: "+err);
				});
			});
		}
		// console.log("")
	}
	var putColor = function(tag) {
		var new_tag = toPascalCase(tag);
		if(workbook.getActiveSheet().getName() != "Create View"){
			console.log("Not the right page for the command");
			showAlert("This page does not support the command");
			return; //continue;
		}
		workbook.changeParameterValueAsync('Color by',new_tag).otherwise(function(err){
			showAlert("Cannot add the color.\n Error: "+err);
		});
	}
	var removeColor = function() {
		//workbook = viz.getWorkbook();
		if(workbook.getActiveSheet().getName() != "Create View"){
			console.log("Not the right page for the command");
			showAlert("This page does not support the command");
			return; //continue;
		}
		workbook.changeParameterValueAsync('Color by','None').otherwise(function(err){
			showAlert("Cannot remove the color.\n Error: "+err);
		});
	}

	var commands = {
	'select *search' : selectStudio,
	'unselect *search' : unSelectStudio,
	'add to selection *search' : addSelectStudio,
	'clear selection' : clearSelect,
	'filter *genre' : filterGenre,
	'add filter *genre' : addFilterGenre,
	'remove filter *genre' : removeFilterGenre,
	'clear filter *filtername' : clearFilterGenre,//
	'export to PDF' : exportPDF,
	'export to image' : exportImage,
	'start over': startOver,
	'Reset': startOver,    
	//switching sheets expecting that input can be one of the following: 1.Next 2.Previous 3.A Sheet Name
	//'show *moveDirectionOrName' : switchTo,
	'switch (to) *moveDirectionOrName' : switchTo,
	'go (to) *moveDirectionOrName' : switchTo,
	'create (new) *ViewOrViz' : switchToCreateViz,
	'show *DimensionVsMetric': putFactAndDim,
	'plot *DimensionVsMetric': putFactAndDim,
	'(add) color (using)(by) *colorDimension': putColor,
	'(add) colour (using)(by) *colorDimension': putColor,
	'remove color': removeColor,
	'remove colour': removeColor
	};
	annyang.debug();
	annyang.addCommands(commands);
	annyang.setLanguage('en');
	annyang.start();
}
else {
	$(document).ready(function() {
		$('#unsupported').fadeIn('fast');
	});
}
