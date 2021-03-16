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

    nearestHospitalPoint.clearLayers();
    const clickedMarker = e.layer.toGeoJSON();


    const nearestHospital = turf.nearest(clickedMarker, hospitals.toGeoJSON());

    const nhLng = nearestHospital.geometry.coordinates[0];
    const nhLat = nearestHospital.geometry.coordinates[1];

    L.marker([nhLat, nhLng], {icon: hospitalIconClicked}).addTo(nearestHospitalPoint);

    document.getElementById('announcer').style.display = "block";
    document.getElementById('schoolName').innerHTML = e.layer.options.title;
    document.getElementById('kmDistance').innerHTML = nearestHospital.properties.distanceToPoint.toFixed(3);

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
    document.getElementById('test').innerHTML = "Sorry, there is no data available for these dates.";
  } else {
    for (i in data.features) {
      //If the feature has no geometry, skip it
      if (data.features[i].geometry != null) {
        //Set feature geometry
        let coords = data.features[i].geometry.coordinates;

          //Cluster school data, but not hospital data
          if (type == "schools") {

          const name = data.features[i].properties.name || "N/A";
          // let type = data.features[i].properties.TYPE || "N/A";
          // let code = data.features[i].properties.COMM_CODE || "N/A";
          // let address = data.features[i].properties.ADDRESS || "N/A";

          const description = "<h5>" + name + "</h5>";

          //Add marker to the spiderifier layer
          let marker = new L.marker([coords[1], coords[0]], {icon: schoolIcon, title: name}).bindPopup(name).addTo(schools);

        } else if (type == "hospitals") {
          const name = data.features[i].properties.name || "N/A";
          let marker = new L.marker([coords[1], coords[0]], {icon: hospitalIcon, title: name}).addTo(hospitals);
        }


      }
    }


    //document.getElementById('test').innerHTML = "Successfully loaded " + data.features.length + " features.";
  }
}
