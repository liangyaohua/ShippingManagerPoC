// 	create a mobile App
// 	it initializes the HTML page for mobile use and provides animated page handling
var app = new sap.m.App("ShippingManager", {initialPage:"homepage"});

//	shipment number and the path to the shipment detail
var aShipment = "";
var oPath = "";

//	create two busy dialogs
var oBusyDialog = new sap.m.BusyDialog({text: "Loading..."});
var oBusyDialog2 = new sap.m.BusyDialog({text: "Updating..."});

//	include MessageBox class
jQuery.sap.require("sap.m.MessageBox");

// 	create a list for displaying the detail of a shipment
//	bind values to the data model
var oList = new sap.m.List({
	items: [
	    new sap.m.DisplayListItem({
	    	label: "Shipment type",
	    	value: "{Shtyp}"
	    }),
	    new sap.m.DisplayListItem({
	    	label: "Shipping type",
	    	value: "{Vsart}"
	    }),
	    new sap.m.DisplayListItem({
	    	label: "Overall status",
	    	value: "{Sttrg}"
	    })
	]
});

// 	create a button for updating the status of a shipment 
var oButton = new sap.m.Button({
	text: "Shipment start",
	icon: "sap-icon://shipping-status",
	enabled: false,
	press: updateStatus
});

// 	create a search field
var oSearchField = new sap.m.SearchField({
	placeholder: "shipment number",
	width: "100%",
	search: function(oEvent){
		//	get the shipment number
		aShipment = oEvent.getParameter("query");
		
		//	make sure that user has entered a shipment number
		if(aShipment != "") {
			//	set path to this shipment
			oPath = "/SHIPMENT('"+ aShipment +"')";
	 		
			//	show busy dialog
			oBusyDialog.open();
			
			// 	refresh OData model before reading it 
			//	in case that service has been modified
			oModel.refresh();
			
			//	read shipment detail
			oModel.read(oPath, null, null, true, function(oData){
				//	if success and shipment exist, Tknum returned (shipment number) should not be empty
				if(JSON.stringify(oData.Tknum) != '""' && oData.Tknum != undefined) {
					// clear old list, rebind data, add new list
					/* not efficient, will be reviewed later */
					homepage.removeContent(oList);
					oList.bindElement(oPath);
    				homepage.addContent(oList);
    				
					//	if status is "5" (be careful, not 5, it's "5") 
    				if(JSON.stringify(oData.Sttrg) == '"5"') {
    					oButton.setEnabled();
					} else {
    					oButton.setEnabled(false);
					}
				} else {
					sap.m.MessageBox.show(aShipment + " doesn't exist", sap.m.MessageBox.Icon.WARNING);
				}
			    
				//	hide busy dialog
				oBusyDialog.close();
			},function(){
				//	read failed
				sap.m.MessageBox.show("Couldn't find the service, please verify your network connection", sap.m.MessageBox.Icon.ERROR);
				oBusyDialog.close();
			});		
		} else {
			//	search field is empty
			sap.m.MessageBox.show("Please enter a shipment number", sap.m.MessageBox.Icon.WARNING);
		}
	}
});

// 	create a page
//	add oSearchField to sub header
//	add oList to content
//	add oButton to footer
var homepage = new sap.m.Page("homepage", {
	title: "Shipping Manager",
    showNavButton: false,
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
        contentRight: [oButton]
    })           
  });

// 	add homepage to the App
app.addPage(homepage); 

// 	place the App into the HTML document
app.placeAt("content"); 

//	helper function
// 	update the status of a shipment
function updateStatus() {
	//	show busy indicator and disable the UI
	oBusyDialog2.open();
	
	// 	read update result
	oModel2.read(oPath, null, null, true, function(oData){
		//	if success, Status returned should be "6" 
		if(JSON.stringify(oData.Status) == '"6"') {
			// 	refresh OData model 
			//	in case that service has been modified (someone has updated the status)
			oModel.refresh();
			
			//	reload shipment detail
			oModel.read(oPath, null, null, true, function(oData){
				//	clear old list, rebind data, add new list
				homepage.removeContent(oList);
				oList.bindElement(oPath);
				homepage.addContent(oList);
				
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
				return;
			});
		} else {
			if(JSON.stringify(oData.Message) != '""') {
				sap.m.MessageBox.show(JSON.stringify(oData.Message), sap.m.MessageBox.Icon.ERROR);
			} else {
				sap.m.MessageBox.show("Uncaught error, please try it later", sap.m.MessageBox.Icon.ERROR);
			}
		}
		
		oBusyDialog2.close();
	},function(){
		sap.m.MessageBox.show("Couldn't find the service, please verify your network connection", sap.m.MessageBox.Icon.ERROR);
		oBusyDialog2.close();
	});
}