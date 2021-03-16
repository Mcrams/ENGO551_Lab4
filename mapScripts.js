//Create Leaflet Map centered on Calgary
const map = L.map('leafletMap', {
  center: [51.0447, -114.0719],
  zoom:10.5
});


//Add OSM Basemap
L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: '© <a href="https://apps.mapbox.com/feedback/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 18,
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'pk.eyJ1IjoibWlra29yYW1vcyIsImEiOiJja2o4MTJicmcwNGF5MzBwN3c2eGpiajJhIn0.6u3ND0vC40NLgZfQJOvO2A'
}).addTo(map);

//Run stuff when the page loads
function collectData() {

    const requestURL = "https://data.calgary.ca/resource/fd9t-tdn2.geojson";
    const requestURLClinics = "https://data.calgary.ca/resource/x34e-bcjz.geojson?$where=type == 'PHS Clinic' or type == 'Hospital'";

    //Run the GET request on schools and hospitals
    const schoolData = new HttpClient();
    schoolData.get(requestURL, function(response) {
      createMarkers(response, "schools");
    });

    const clinicData = new HttpClient();
    clinicData.get(requestURLClinics, function(response) {
      createMarkers(response, "hospitals");
    });

}

//Define hospital and school icons in CSS
const hospitalIcon = L.divIcon({className: 'hospitalIcon'});
const hospitalIconClicked = L.divIcon({className: 'hospitalIconClicked'});
const schoolIcon = L.divIcon({className: 'schoolIcon'});

let schools = L.featureGroup();
let hospitals = L.featureGroup();
let nearestHospitalPoint = L.featureGroup();

//Add layer controls
L.control.layers(null,
  {
    "Schools": schools,
    "Hospitals": hospitals
  }, {
  collapsed: false
}).addTo(map);

map.addLayer(schools);
map.addLayer(hospitals);

map.addLayer(nearestHospitalPoint);



//Set onclick function to activate turf
schools.on("click", function (e) {
  //Clear the highlighted nearest hospital if any
  nearestHospitalPoint.clearLayers();

  //Find the clicked marker and convert to GeoJSON for Turf
  const clickedMarker = e.layer.toGeoJSON();

  //Run Turf nearest() calculation with GeoJSON objects
  const nearestHospital = turf.nearest(clickedMarker, hospitals.toGeoJSON());

  //Extract lat and long from turf function
  const nhLng = nearestHospital.geometry.coordinates[0];
  const nhLat = nearestHospital.geometry.coordinates[1];

  //Create a new marker on top of the found hospital marker and set z-index for visibility
  L.marker([nhLat, nhLng], {icon: hospitalIconClicked, zIndexOffset: 1000}).addTo(nearestHospitalPoint);

  //Output results to sidebar
  document.getElementById('announcer').style.display = "block";
  document.getElementById('schoolName').innerHTML = e.layer.options.title;
  document.getElementById('kmDistance').innerHTML = nearestHospital.properties.distanceToPoint.toFixed(3);

  //Find hospital in feature group from turf function via lat/long, and output hospital name
  hospitals.eachLayer(function (e) {
    const hLat = e._latlng.lat.toFixed(6);
    const hLng = e._latlng.lng.toFixed(6);

    if (hLat == nhLat && hLng == nhLng) {
      document.getElementById('hospName').innerHTML = e.options.title;
    }
  });
});

//XML HTTP Object for GET requests
let HttpClient = function() {
    this.get = function(aUrl, aCallback) {
        let anHttpRequest = new XMLHttpRequest();

        anHttpRequest.onreadystatechange = function() {
            if (anHttpRequest.readyState == 4 && anHttpRequest.status == 200)
                aCallback(anHttpRequest.responseText);
        }
        anHttpRequest.open( "GET", aUrl, true );
        //Set parameter headers
        anHttpRequest.setRequestHeader("X-App-Token", "0Yy2rHqfsSy863vVSti73hwb7");
        anHttpRequest.send();
    }
}

//Parse JSON from response and convert them into Leaflet Markers
function createMarkers(json, type) {
  const data = JSON.parse(json);

  if (data.features.length == 0) {
    alert("Sorry, there is no data available.");
  } else {
    for (i in data.features) {
      //If the feature has no geometry, skip it
      if (data.features[i].geometry != null) {
        //Set feature geometry
        let coords = data.features[i].geometry.coordinates;

        //Get name from GeoJSON
        const name = data.features[i].properties.name || "N/A";

        //Add marker to the schools layer
        let marker = new L.marker([coords[1], coords[0]], {title: name}).bindPopup(name);

        //Allocate the correct icon style and feature class depending on data type
        if (type == "hospitals") {
          marker.setIcon(hospitalIcon).addTo(hospitals);
        } else if (type == "schools") {
          marker.setIcon(schoolIcon).addTo(schools);
        }

      }
    }
  }
}
