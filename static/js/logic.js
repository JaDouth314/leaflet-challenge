

//Store GEOJson as a url
let queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

//Perform a GET request and obtain the data
d3.json(queryUrl).then(function (data) {
    console.log(data);
    createFeatures(data.features);
});

//Create a createFeatures function to create markers and label each location point
function createFeatures(earthQuakeData) {

    //Display info for each data point, including location, time, and magnitude
    function onEachFeature(feature, layer) {
        layer.bindPopup(`<h3>${feature.properties.place}</h3><hr><p>${new Date(feature.properties.time)}</p><p>Magnitude: ${feature.properties.mag}`);
    }

    //A circle marker is show to indicate the magnitude of the earthquake and displays a color relative to its intensity
    function createCircleMarker(feature, latlng){
        options = {
            radius: feature.properties.mag*5,
            fillColor: chooseColor(feature.properties.mag),
            color: "#000000",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.75,
        }
    //Call the function
    return L.circleMarker(latlng, options);
    }

    //Create the markers
    let earthquakes = L.geoJSON(earthQuakeData, {
        onEachFeature: onEachFeature,
        pointToLayer: createCircleMarker
    });

    //Create the map
    createMap(earthquakes);
}

//Create a function to determine the intensity of an earthquake and fill its circle marker with the corresponding color
function chooseColor(mag){
    switch(true){
        case (mag < 0.99):
            return "#008000";
        case (mag < 1.99):
            return "#7CFC00";
        case (mag < 2.99):
            return "#FFC000";
        case (mag < 3.99):
            return "#FFA500";
        case (mag < 4.99):
            return "#FF5F1F";
        case (mag < 5.99):
            return "#FF4433";
        case (mag < 6.99):
            return "#8B0000";
    }
}

//Create a function to populate and create the overal map
function createMap(earthquakes) {

    //Create base layers
    let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    })

    let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    });

    //Create a baseMaps object
    let baseMaps = {
        "Street Map": street,
        "Topographic Map": topo
    };

    //Create an overlay 
    let overlayMaps = {
        Earthquakes: earthquakes
    };

        //Create the map
    let myMap = L.map("map", {
        center: [40, -95],
        zoom: 5,
        layers: [street, earthquakes]
    });

    //Create legend
    let legend = L.control({
        position: "bottomright"
    });

    legend.onAdd = function (map) {
        let div = L.DomUtil.create('div', 'info legend'),
            grades = [0, 1, 2, 3, 4, 5, 6],
            labels = [];

        for (let i = 0; i < grades.length; i++){
            div.innerHTML +=
                "<i style='background: " + chooseColor(grades[i]) + "'></i> " +
                grades[i] + (grades[i + 1] ? "&ndash;" + grades[i + 1] + "<br>" : "+");
        }
        return div;
    };

    //Create the layer control
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);
    legend.addTo(myMap);
}