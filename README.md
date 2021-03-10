# ENGO 551 - Lab 2

City of Calgary Interactive Building Permit Lookup using JavaScript and Leaflet.

## Instructions
1. Open the index.html file, and you're done!

***

## Project Files
### index.html
Main landing page for the app. Contains a Leaflet map of the city of Calgary running on OpenStreetMap, as well as a form to select a date range using the Litepicker JS date picker widget.

### mapScripts.js
JS file that allows page to make HTTP GET requests to the City of Calgary Socrata Open Data API to grab building permits, then displays them on the Leaflet map as clustered markers. Also contains spiderifier functionality for markers with overlapping locations. This file also initializes the Leaflet map and all of its associated extensions.

### styles.css
Extraneous CSS for site that controls the height of the Leaflet map (required) as well as element visibility.
