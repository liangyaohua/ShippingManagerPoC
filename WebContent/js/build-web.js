/*
* Initialization of the data models when testing on Eclipse
* Author: Yaohua Liang @ Capgemini
*/

function getServiceUrl(sUrl) {
	//	for local testing prefix with proxy
	//	if you and your team use a special host name or IP like 127.0.0.1 for localhost please adapt the statement below 
	if (window.location.hostname == "localhost") {
		return "proxy" + sUrl;
	} else {
		return sUrl;
	}
}

//	OData service for displaying shipment detail
var sUrl = getServiceUrl("/sap/opu/odata/sap/Z_READ_VTTK_SRV/");

//	construct OData model
var oModel = new sap.ui.model.odata.ODataModel(sUrl, false, "SOLMAN_ADMIN", "SolMan71");

//	bind data model to Core
sap.ui.getCore().setModel(oModel);

// 	OData service for updating the status of a shipment
var sUrl2 = getServiceUrl("/sap/opu/odata/sap/Z_UPDATE_VTTK_SRV/");
var oModel2 = new sap.ui.model.odata.ODataModel(sUrl2, false, "SOLMAN_ADMIN", "SolMan71");