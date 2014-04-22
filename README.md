ShippingManagerPoC
==================

A SAPUI5 application that consumes SAP NetWeaver Gateway OData Service

Step 1: Make a SAPUI5 web app
- Create an empty SAPUI5 project in Eclipse
- Replace the WebContent of your project by the WebContent here
- Run your application in Eclipse, it should be working on your web browsers

Step 2: Transform your web app to PhoneGap hybrid app
- Create a phonegap project on your computer
- Replace the content of www folder by the files you find in PhoneGap/www
- Unzip PhoneGap/resources.zip (sapui5 core lib) to www folder
- Copy all the files in WebContent to www folder
- Modify some parts of index.html (follow the comments) depending on which platforms you want to build
- Build and run your phonegap project, it should be working on your mobile phone

See Tutorial/ for more informations on how to setup the development environment and build the SAPUI5 application.
