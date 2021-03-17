# ENGO 551 - Lab 4

Geospatial analysis using Turf.js and Calgary Open data to find the nearest hospital/clinic to a school in Calgary

## Instructions
1. Open the index.html file, and you're done!

***

## Project Files
### index.html
Main landing page for the app. Contains a Leaflet map of the city of Calgary running on Mapbox, as well as the overlaid data for schools (blue dots) and hospitals/clinics (red dots). Clicking a school will highlight the nearest hospital with a yellow dot, as well as show the names of the selected school, nearest hospital and calculated straight-line distance in the sidebar.

### mapScripts.js
JS file that allows page to make HTTP GET requests to the City of Calgary Socrata Open Data API to school and hospital (derived from community services) databases. Also contains functionality for all Turf scripts to calculate nearest point, and leaflet DivIcon styles for all points to make the map easier to read visually.

### styles.css
CSS for site that controls the height of the Leaflet map (required) as well as containing the CSS styles for leaflet's DivIcons, changing the default marker pin into a simpler colored dot.
