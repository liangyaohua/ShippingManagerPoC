/*
* Author: Yaohua Liang @ Capgemini
*/

//	include MessageBox class
jQuery.sap.require("sap.m.MessageBox");

// 	create a mobile App
// 	it initializes the HTML page for mobile use and provides animated page handling
var app = new sap.m.App("ShippingManager", {initialPage:"homepage"});

//	shipment number and the path to the shipment detail
var aShipment = "";
var oPath = "";

//	create two busy dialogs
var oBusyDialog = new sap.m.BusyDialog({text: "Loading..."});
var oBusyDialog2 = new sap.m.BusyDialog({text: "Updating..."});

//	create a search field
var oSearchField = new sap.m.SearchField({
	placeholder: "please enter a shipment number",
	width: "100%",
	search: function(oEvent){
		//	get the shipment number
		aShipment = oEvent.getParameter("query");
		
		//	helper function
		displayDetail(aShipment);
	}
});

// 	create a list for displaying the detail of a shipment
//	bind values to the data model
var oList = new sap.m.List({
	items: [
		new sap.m.StandardListItem({
			title: "Shipment",
			info: "{Tknum}",
			infoState: "Success"
		}),
		new sap.m.StandardListItem({
			title: "Shipment type",
			description: "{Bezei1}",
			icon: "sap-icon://product",
			info: "{Shtyp}"
	    }),
	    new sap.m.StandardListItem({
	    	title: "Shipping type",
	    	description: "{Bezei2}",
	    	icon: "sap-icon://travel-itinerary",
	    	info: "{Vsart}"
	    }),
	    new sap.m.StandardListItem({
	    	title: "Overall status",
	    	description: "{Ddtext}",
	    	icon: "sap-icon://step",
	    	info: "{Sttrg}",
	    	infoState: "Warning"
	    }),
	    new sap.m.StandardListItem({
	    	title: "Forwarding agent",
	    	description: "{Name1}",
	    	icon: "sap-icon://person-placeholder",
	    	info: "{Tdlnr}"
	    })
	]
});

//	create a button for barcode scanner
var oBarcode = new sap.m.Button({
	icon: "sap-icon://bar-code",
	press: scanBarcode
});

// 	create a button for updating the status of a shipment 
var oButton = new sap.m.Button({
	icon: "sap-icon://shipping-status",
	enabled: false,
	press: updateStatus
});

//	turn to page about
var oLight = new sap.m.Button({
	icon: "sap-icon://lightbulb",
	press: function(){
		app.to("about", "show");
	}
});

// 	create a page
//	add oSearchField to subHeader
//	add oList to content
//	add oBarcode, oButton, oLight to footer
var homepage = new sap.m.Page("homepage", {
	title: "Shipping Manager",
	subHeader: new sap.m.Bar({
		contentMiddle: [oSearchField]
	}),
	content: [oList],
	footer: new sap.m.Bar({
		contentLeft: [
		    new sap.m.Label({
		    	text: "Created by Capgemini"
	        })
    	],
    	contentRight: [oBarcode, oButton, oLight]
	})           
});

//	create a page for introducing this App
var about = new sap.m.Page("about", {
	title: "About me",
	content: [
	    new sap.m.Text({
	    	text:"\nHi, I'm a hybrid application, my father is SAPUI5, my mother is PhoneGap and I drink the milk from SAP NetWeaver Gateway OData Service.\n\n",
	    	textAlign: "Center"
	    }),
        new sap.m.FlexBox({
        	justifyContent: "Center",
	        alighItems: "Center",
	        items: [
	            new sap.m.Image({src: "qrcode.png"})
	        ]  
        }),
        new sap.m.Text({
        	text:"\nScan the QRCode above to download me!\n\nI'm only available for Android device, if you wanna have me on iOS, please contact my babysister: yaohua.liang@capgemini.com",
        	textAlign: "Center"
        })
    ],
    footer: new sap.m.Bar({
    	contentLeft: [
    	    new sap.m.Label({
    	        text: "Created by Capgemini"
    	    })
    	],
    	contentRight: [
    	    new sap.m.Button({
    	        icon: "sap-icon://home",
    	       	press: function(){
    	       		app.to("homepage", "show");
    	       	}
    		})
    	]
    })
});

// 	add homepage, about to the App
app.addPage(homepage).addPage(about); 

// 	place the App into the HTML document
app.placeAt("content"); 

/*============================== my helper functions ==============================*/

//	scan barcode for the shipment number
function scanBarcode(){
	if(sap.ui.Device.os.android == true || sap.ui.Device.os.ios == true) {
		cordova.plugins.barcodeScanner.scan(
			function (result) {
				oSearchField.setValue(result.text);
			}, 
			function (error) {
				sap.m.MessageBox.show("Scanning failed: " + error, sap.m.MessageBox.Icon.WARNING);
			}
	  	);
	} else {
		sap.m.MessageBox.show("Sorry, your system or device currently doesn't support Barcode scanner", sap.m.MessageBox.Icon.WARNING);
	}
	
}

//	refresh the shipment detail
function refreshDetail(){
	// 	refresh OData model 
	//	in case that service has been modified
	oModel.refresh();
	
	//	clear old list, rebind data, add new list
	homepage.removeContent(oList);
	oList.bindElement(oPath);
	homepage.addContent(oList);
}

//	display the shipment detail
function displayDetail(aShipment){
	//	set path to this shipment
	oPath = "/SHIPMENT('"+ aShipment +"')";
	
	//	refresh shipment detail (helper function)
	// 	clear old list, rebind data, add new list
	refreshDetail();
	
	//	make sure that user has entered a shipment number
	if(aShipment != "") {
		//	open busy dialog and block the UI during loading data
		oBusyDialog.open();
		
		//	read shipment detail
		oModel.read(oPath, null, null, true, function(oData){
			//	read successful, close busy dialog
			oBusyDialog.close();
			
			//	if shipment exist, Tknum returned (shipment number) should not be empty
			if(JSON.stringify(oData.Tknum) != '""' && oData.Tknum != undefined) {
				//	if status is "5" (be careful, not 5, it's "5"), enable oButton 
				if(JSON.stringify(oData.Sttrg) == '"5"') {
					oButton.setEnabled();
				} else {
					oButton.setEnabled(false);
				}
			} else {
				//	if shipment doesn't exist, oList is empty, oButton should be disabled
				oButton.setEnabled(false);
				sap.m.MessageBox.show(aShipment + " doesn't exist", sap.m.MessageBox.Icon.WARNING);
			}
		},function(){
			//	read failed, close busy dialog
			oBusyDialog.close();
			
			sap.m.MessageBox.show("Couldn't find the service, please verify your network connection", sap.m.MessageBox.Icon.ERROR);
		});		
	} else {
		//	search field is empty, no data, oButton should be disabled
		oButton.setEnabled(false);
	}
}

// 	update the status of a shipment
function updateStatus() {
	//	ask for confirmation before update
	sap.m.MessageBox.show("Update status to Shipment start?", sap.m.MessageBox.Icon.WARNING, "", [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.CANCEL], function(oAction){
		//	if user pressed YES, do update
		if(oAction == sap.m.MessageBox.Action.YES) {
			//	open busy dialog and disable the UI during updating
			oBusyDialog2.open();
			
			// 	read update result
			oModel2.read(oPath, null, null, true, function(oData){
				//	if update successful, Status returned should be "6" 
				if(JSON.stringify(oData.Status) == '"6"') {			
					//	reload shipment detail and verify if update is successful
					oModel.read(oPath, null, null, true, function(oData){
						refreshDetail();
						
						//	read oModel and oModel2 successful, close busy dialog
						oBusyDialog2.close();
						
						//	if Sttrg (status) is still "5", means someone has updated the status (to 6) before you
						//	your click just rolled back the status to 5
						//	because the update request performs like clicking the button Shipment start in SAP system
						if(JSON.stringify(oData.Sttrg) == '"5"') {
							//	someone has already updated the status, but you rolled it back
							sap.m.MessageBox.show("Please try it again", sap.m.MessageBox.Icon.WARNING);
						} else if(JSON.stringify(oData.Sttrg) == '"6"') {
							//	status is updated to 6
							sap.m.MessageBox.show("Update successful", sap.m.MessageBox.Icon.SUCCESS);
							oButton.setEnabled(false);
						} else {
							//	someone has modified the status
							sap.m.MessageBox.show("Update failed, the status has been modified", sap.m.MessageBox.Icon.WARNING);
							oButton.setEnabled(false);
						}
					},function(){
						//	reload shipment detail failed, close busy dialog
						oBusyDialog2.close();
					});
				} else {
					//	Status returned is not 6, update failed, close busy dialog
					oBusyDialog2.close();
					
					if(JSON.stringify(oData.Message) != '""') {
						//	show error message returned from SAP
						sap.m.MessageBox.show(JSON.stringify(oData.Message), sap.m.MessageBox.Icon.ERROR);
					} else {
						sap.m.MessageBox.show("Uncaught error, please try it later", sap.m.MessageBox.Icon.ERROR);
					}
				}
			},function(){
				//	read update result failed
				oBusyDialog2.close();
				sap.m.MessageBox.show("Couldn't find the service, please verify your network connection", sap.m.MessageBox.Icon.ERROR);
			});
		}
	});
}