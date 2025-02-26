// CcreateMap function
function createMap(earthquakePoints,faultsPoints, legend){

    // Create the tile layers
    const light = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/streets-v11",
    accessToken: API_KEY
    });

    const darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "dark-v10",
    accessToken: API_KEY
    });
  
    // Create a baseMaps object to hold the lightmap and darkmap layers
    
    const baseMaps = {
      Light: light,
      Dark: darkmap
    };
  
    // Create an overlayMaps object to hold the earthquakes and faults layers
    
    const overlayMaps = {
      Earthquakes: earthquakePoints,
      Faults: faultsPoints
    };
  
    // Create the map object with options
    
    const map = L.map("map", {
      center:[40.09, -105.71],
      zoom: 3,
      layers: [darkmap, earthquakePoints,faultsPoints]
    });
  
    // Create a layer control, pass in the baseMaps and overlayMaps. Add the layer control to the map
    
    L.control.layers(baseMaps, overlayMaps).addTo(map);
    legend.addTo(map)
  }
  

// Function to define circles size
function markerSize(mag) {
    return 10**mag/3;
  }
// Function to define cirlces color based on significance
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


// createMarkers function
function createMarkers(earthquakeData, faultsInfo){
    const earthquakeFeature = earthquakeData.features;
    console.log(earthquakeFeature);
  
    // earthquakes Markers

    const earthquakeMarkers = [];
    earthquakeFeature.forEach(earthquake => {
  
        //set time to date
  
        const time = new Date(earthquake.properties.time)
        const date = new Date(time); 
        const dateStr = date.toString(); 
        
        // store circles data into earthquakesMarkers array
        earthquakeMarkers.push(L.circle([earthquake.geometry.coordinates[1],earthquake.geometry.coordinates[0]], {
            fillOpacity: 0.75,
            color: getColor(earthquake.properties.sig),
            stroke: false,
            fillColor: getColor(earthquake.properties.sig),
            // Adjust radius
            radius: markerSize(earthquake.properties.mag)
            })
            .bindPopup("<h4>" + "Earthquake: " + earthquake.properties.place + "</h4><hr>"+"<h4>" + 
            "Time: " + dateStr + "</h4><hr>"+"<h4>" + "Magnitude: " + earthquake.properties.mag + "</h4><hr>"
            + "<h4>" + "Significance: " + earthquake.properties.sig + "</h4>")
        );
  
    });

    
    // Create an overlayMaps object to hold the earthquakePoints 
    const earthquakePoints = L.layerGroup(earthquakeMarkers);

    ///fault Markers///

    const faultsFeature = faultsInfo.features;
    console.log(faultsFeature);
    const faultsArray = [];

    // store faults filtered data into earthquakesMarkers array
    faultsFeature.forEach(fault => {
        // look for only fault-lines which have the following slip_rate values,Greater than 5.0 mm/yr and Between 1.0 and 5.0 mm/yr
        if(fault.properties.slip_rate === "Greater than 5.0 mm/yr"| fault.properties.slip_rate === "Between 1.0 and 5.0 mm/yr" ){
            faultsArray.push(fault);
            
        }
    })

    console.log(faultsArray);
    
    // Define a new layer group for faults
    const faultsPoints = new L.LayerGroup();

    //Function to "L.geoJso" style property (fault-lines weight based on slip_rate, and color)
    function getStyle(weightVal){
      let weight;
  
      switch (weightVal){
          case 'Greater than 5.0 mm/yr':
            weight = "5";
            break;

          default:
            weight = "2";
      }
  
      return {
  
          "color": "green",
          "weight": weight,
      
      };
  }
  
    // use "L.geoJson" method to create fault-lines
    L.geoJson(faultsArray, 

      {
        color: "green",
        style: feature => getStyle(feature.properties.slip_rate),

        onEachFeature: function(feature, layer){
          layer.bindPopup("<h4>" + "Fault: " + feature.properties.fault_name + "</h4><hr>"+"<h4>" + 
          "Slip Rate: " + feature.properties.slip_rate + "</h4>")
        }
      }
    ).addTo(faultsPoints)
  
    
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
    
    // call createMap function
    createMap(earthquakePoints,faultsPoints, legend);
}

// pull the data from api and geojson file
const url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/1.0_month.geojson";
const geoData = "static/data/qfaults_latest_quaternary.geojson";
d3.json(url).then( earthquakeData => {
    console.log(earthquakeData);
    d3.json(geoData).then(faultsInfo =>
      {
        console.log(faultsInfo);
        createMarkers(earthquakeData, faultsInfo);
      }
    );
  });