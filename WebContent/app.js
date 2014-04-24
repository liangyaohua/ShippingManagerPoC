// 	create a mobile App
// 	it initializes the HTML page for mobile use and provides animated page handling
var app = new sap.m.App("ShippingManager", {initialPage:"homepage"});

//	shipment number and the path to the shipment detail
var aShipment = "";
var oPath = "";

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
	placeholder: "shippment number",
	width: "100%",
	search: function(oEvent){
		//	get the shipment number
		aShipment = oEvent.getParameter("query");
		
		//	make sure that user has entered a shipment number
		if(aShipment != "") {
			//	set path to this shipment
			oPath = "/SHIPMENT('"+ aShipment +"')";
	 					
			// 	refresh OData model before reading it 
			//	in case that service has been modified
			oModel.refresh();
			
			//	read shipment detail
			oModel.read(oPath, null, null, true, function(oData){
				//	if success and shipment exist, Tknum returned (shipment number) should not be empty
				if(JSON.stringify(oData.Tknum) != '""' && oData.Tknum != undefined) {
					// clear old list, rebind data, add new list
					/* not efficient, could be reviewed later */
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
					sap.m.MessageToast.show(aShipment + " doesn't exist");
				}
			},function(){
				//	read failed
				sap.m.MessageToast.show("Couldn't find the service, please verify your network connection");
			});
		} else {
			//	search field is empty
			sap.m.MessageToast.show("Please enter a shipment number");
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
	//	disable the button after it has been clicked already
	oButton.setEnabled(false);

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
					oButton.setEnabled();
				} else if(JSON.stringify(oData.Sttrg) == '"6"') {
					//	status is updated to 6
					sap.m.MessageToast.show("Update successful!");
				} else {
					//	someone has modified the status
					return;
				}
			},function(){
				return;
			});
		} else {
			sap.m.MessageToast.show("Update failed, please refresh the shipment detail and try it again");
		}
	},function(){
		sap.m.MessageToast.show("Couldn't find the service, please verify your network connection");
	});
}