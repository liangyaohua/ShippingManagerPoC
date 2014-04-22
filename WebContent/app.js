// here's the content of the app
// create a mobile App
// it initializes the HTML page for mobile use and provides animated page handling
var app = new sap.m.App("ShippingManager", {initialPage:"homepage"});

// create a list for displaying shipment details
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

// Button - Shipment start
var oButton = new sap.m.Button({
	text: "Shipment start",
	icon: "sap-icon://shipping-status",
	enabled: false
});

// create a Search Field
var oSearchField = new sap.m.SearchField({
	placeholder: "shippment number",
	width: "100%",
	search: function(oEvent){
		var aShipment = oEvent.getParameter("query");
		if(aShipment != "") {
			
			var oPath = "/SHIPMENT('"+ aShipment +"')";
	 		
			oModel.read(oPath, null, null, true, function(oData){
				if(JSON.stringify(oData.Tknum) != '""' && oData.Tknum != undefined){
					// Clear old list, rebind data, add new list
					homepage.removeContent(oList);
					oList.bindElement(oPath);
    				homepage.addContent(oList);
    				
    				if(JSON.stringify(oData.Sttrg) == '"7"')
    					oButton.setEnabled();
				} else {
					alert(aShipment + " doesn't exist");
				}
			},function(){
				alert("Couldn't connect to the server");
			});
		} else {
			alert("Please enter a shipment number");
		}
	}
});

// create the first page of your application
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

//add homepage to the App
app.addPage(homepage); 

//place the App into the HTML document
app.placeAt("content"); 