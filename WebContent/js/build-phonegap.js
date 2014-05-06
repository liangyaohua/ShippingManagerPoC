/*
* Initialization of the data models when building PhoneGap hybrid App
* Author: Yaohua Liang @ Capgemini
*/

//	OData service for displaying shipment detail
var sUrl = "http://frparssm71.corp.capgemini.com:8000/sap/opu/odata/sap/Z_READ_VTTK_SRV";
var oModel = null;	

// 	OData service for updating the status of a shipment
var sUrl2 = "http://frparssm71.corp.capgemini.com:8000/sap/opu/odata/sap/Z_UPDATE_VTTK_SRV/";
var oModel2 = null;

//	construct and models when device is ready			
function onDeviceReady() {
	//	construct OData model
	oModel = new sap.ui.model.odata.ODataModel(sUrl, false, "SOLMAN_ADMIN", "SolMan71");
	
	//	bind data model to Core
	sap.ui.getCore().setModel(oModel);
	
	oModel2 = new sap.ui.model.odata.ODataModel(sUrl2, false, "SOLMAN_ADMIN", "SolMan71");
	
	//	hide splash screen when device is ready
	navigator.splashscreen.hide();
	
	//	hide the status bar for iOS 7
	window.plugin.statusbarOverlay.hide();
}

// 	bind to the deviceready event
document.addEventListener('deviceready', onDeviceReady, false);