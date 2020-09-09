//Define Map Object
const myMap = L.map("map", {
    center: [40.09, -105.71],
    zoom: 3,
  });

//Define Tile Layer

const darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  tileSize: 512,
  maxZoom: 18,
  zoomOffset: -1,
  id: "dark-v10",
  accessToken: API_KEY
}).addTo(myMap);

// Function to define circles size
function markerSize(mag) {
  return 10**mag/3;
}

// Function to define the circle's color based on the significance
function getColor(significance){
  
  if (significance > 1000){
    return "#842727"
  }

  if (significance > 750) {
    return "#a85d57";
  }
  else if (significance > 500) {
    return "#c8918b";
  }
  else if (significance > 250) {
    return "#e5c7c4";
  }
  else {
    return "#ffffff";
  }
};

// Import and visualize data
//API URL
const url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/1.0_month.geojson";

// d3 method to call the API and create a promise
d3.json(url).then(earthquakeData => {
  console.log(earthquakeData);

  const earthquakeFeature = earthquakeData.features;
  console.log(earthquakeFeature);

  earthquakeFeature.forEach(earthquake => {

    //set time to date format

    const time = new Date(earthquake.properties.time)
    const date = new Date(time); 
    const dateStr = date.toString(); 
      
    // circles creation, based on earthquake coordinates
    L.circle([earthquake.geometry.coordinates[1],earthquake.geometry.coordinates[0]], {
      fillOpacity: 0.75,
      color: getColor(earthquake.properties.sig),
      stroke: false,
      // call get color function, which defines circle color
      fillColor: getColor(earthquake.properties.sig),
      // Adjust radius
      radius: markerSize(earthquake.properties.mag)
    }).bindPopup("<h4>" + "Earthquake: " + earthquake.properties.place + "</h4><hr>"+"<h4>" + 
    "Time: " + dateStr + "</h4><hr>"+"<h4>" + "Magnitude: " + earthquake.properties.mag + "</h4><hr>"
    + "<h4>" + "Significance: " + earthquake.properties.sig + "</h4>").addTo(myMap);


  })

  // Set up the legend
  var legend = L.control({position: 'bottomright'});

  legend.onAdd = function (map) {
  
    var div = L.DomUtil.create('div', 'info legend'),
      sigGrades = [0, 250, 500, 750, 1000],
      labels = [];
      div.innerHTML += "<h4>EQ Significance</h4>"
      // loop through our density intervals and generate a label with a colored square for each interval
      for (var i = 0; i < sigGrades.length; i++) {
        div.innerHTML +=
            '<i style="background:'+ getColor(sigGrades[i] + 1) + '"></i> ' +
            sigGrades[i] + (sigGrades[i + 1] ? '&ndash;' + sigGrades[i + 1] + '<br><br>' : '+');
      }
  
      return div;
  };
  
  legend.addTo(myMap);
});