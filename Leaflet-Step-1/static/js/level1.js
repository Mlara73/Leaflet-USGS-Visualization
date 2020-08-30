//Define Map Object
const myMap = L.map("map", {
    center: [40.09, -105.71],
    zoom: 3.2,
  });

//Define Tile Layer

const darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  tileSize: 512,
  maxZoom: 13,
  zoomOffset: -1,
  id: "dark-v10",
  accessToken: API_KEY
}).addTo(myMap);

// Import and visualize data

const url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/1.0_month.geojson";

d3.json(url).then(earthquakeData => {
  console.log(earthquakeData);

  const earthquakeFeature = earthquakeData.features;
  console.log(earthquakeFeature);

  earthquakeFeature.forEach(earthquake => {

    let color;
  
    if (earthquake.properties.sig > 1000){
      color = "#842727"
    }

    if (earthquake.properties.sig > 750) {
      color = "#a85d57";
    }
    else if (earthquake.properties.sig > 500) {
      color = "#c8918b";
    }
    else if (earthquake.properties.sig > 250) {
      color = "#e5c7c4";
    }
    else {
      color = "#ffffff";
    }

    //set time to date

    const time = new Date(earthquake.properties.time)
    const date = new Date(time); 
    const dateStr = date.toString(); 
      

    L.circle([earthquake.geometry.coordinates[1],earthquake.geometry.coordinates[0]], {
      fillOpacity: 0.75,
      color: null,
      stroke: false,
      fillColor: color,
      // Adjust radius
      radius: earthquake.properties.mag * 3000
    }).bindPopup("<h4>" + "Earthquake: " + earthquake.properties.place + "</h4><hr>"+"<h4>" + 
    "Time: " + dateStr + "</h4><hr>"+"<h4>" + "Magnitude: " + earthquake.properties.mag + "</h4><hr>"
    + "<h4>" + "Significance: " + earthquake.properties.sig + "</h4>").addTo(myMap);
  })
});