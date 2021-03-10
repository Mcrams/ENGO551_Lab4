//Create Leaflet Map centered on Calgary
const map = L.map('leafletMap').setView([51.0447, -114.0719], 10.5);

//Add OSM Basemap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 18,
    tileSize: 512,
    zoomOffset: -1,
}).addTo(map);

//Add layer for markers and MarkerCluster
let markers = L.markerClusterGroup();

//Add spiderifier
let oms = new OverlappingMarkerSpiderfier(map);

let popup = new L.Popup();

oms.addListener('click', function(marker) {
  popup.setContent(marker.desc);
  popup.setLatLng(marker.getLatLng());
  map.openPopup(popup);
});

//Get current date for data validation
const d = new Date();

//Initialize date picker widgets
const dateRange = new Litepicker({
    element: document.getElementById('startDate'),
    maxDate: d,
    singleMode: false,
  });

//Save Variables from form
document.querySelector('form').addEventListener('submit', (e) => {
  const formData = new FormData(e.target);

  //Grab the variables from the form as a string with both dates
  const dates = formData.get('startDate');

  //Grab the individual start and end dates from the larger string
  let fromDate = dates.substr(0,10);
  let endDate = dates.substr(13);

  let requestURL = "https://data.calgary.ca/resource/c2es-76ed.geojson?" + "$where=issueddate > " + "\'" + fromDate + "\'" + " and issueddate < " + "\'" + endDate + "\'";

  //Run the GET request on the API
  var data = new HttpClient();
  data.get(requestURL, function(response) {
    createMarkers(response);
  });

  //Make the alert box visible to show alerts
  document.getElementById('test').style.visibility = "visible";

  //Stop the form from submitting to avoid refreshing the page
  e.preventDefault();

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
function createMarkers(json) {
  const data = JSON.parse(json);

  console.log(data);

  //Clear any existing marker data
  markers.clearLayers();
  oms.clearMarkers();

  if (data.features.length == 0) {
    document.getElementById('test').innerHTML = "Sorry, there is no data available for these dates.";
  } else {

    for (i in data.features) {

      //If the feature has no geometry, skip it
      if (data.features[i].geometry != null) {
        let coords = data.features[i].geometry.coordinates;

        let date = data.features[i].properties.issueddate || "N/A";
        let wcGroup = data.features[i].properties.workclassgroup || "N/A";
        let contractor = data.features[i].properties.contractorname || "N/A";
        let community = data.features[i].properties.communityname || "N/A";
        let address = data.features[i].properties.originaladdress || "N/A";

        let description = "<table class='table'><tr><th>Issued Date: </th><td>" + date + "</td> </tr> <tr> <th>Community Name: </th>" + "<td>" + community + "</td></tr><tr><th>Work Class Group: </th>" + "<td>" + wcGroup + "</td></tr><tr><th>Contractor: </th> <td>" + contractor + "</td> </tr><tr><th>Original Address: </th>" + "<td>" + address + "</td></tr></table>";

        //Add marker to the spiderifier layer
        let marker = new L.marker([coords[1], coords[0]]);
        marker.desc = description;
        oms.addMarker(marker);

        //Add marker to the cluster layer
        markers.addLayer(marker);


      }
    }

    //Add cluster marker layer to the map
    map.addLayer(markers);
    
    document.getElementById('test').innerHTML = "Successfully loaded " + data.features.length + " features.";
  }
}
