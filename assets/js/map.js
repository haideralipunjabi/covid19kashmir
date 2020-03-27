let mapData, mapOutlineData;
const API_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSg-doiJ59mWF5UiJP-tCB6XCqahr9YaXe6eHiyWFyjylHtGRuy5yZrw1ZNWq3etbbyU8Gqz0i5gANp/pub?gid=0&single=true&output=csv";
let patientData, districts, activeDistrictsMap;

let dataPromise = fetch(API_URL).then((response) => {
    return response.text()
}).then((text) => {
    patientData = ArraysToDict(CSVToArray(text));

});

let mapOutlinePromise = $.getJSON("/assets/data/JK_outline.json", (json) => {
    mapOutlineData = json;
});
let mapPromise = $.getJSON("/assets/data/JK_Dist.json", (json) => {
    mapData = json;
});

Promise.all([mapPromise, dataPromise, mapOutlinePromise]).then(() => {
    districts = patientData.map((item) => {
        return item["District"]
    }).filter((value, index, self) => {
        return self.indexOf(value) === index
    });
    let activeDistricts = patientData.map((item) => {
        return (item["Status"] === "Hospitalized") ? item["District"] : ""
    })
    activeDistrictsMap = {}
    for (let district of activeDistricts) {
        if (district === "") continue
        activeDistrictsMap[district] = activeDistricts.filter((item) => {
            return item === district
        }).length
    }
    let mapLayer = L.geoJSON(mapData, {
        style: function (feature) {
            console.log(districts)
            return {
                fillColor:  getFillColor(feature.properties.DISTRICT),
                color: (districts.includes(feature.properties.DISTRICT)) ? "white" : "none",
                fillOpacity:1,
            }
        }
    }).bindPopup(function (layer) {

        console.log(layer.feature.properties.DISTRICT)
        return "";
    });
    let outlineLayer = L.geoJSON(mapOutlineData,{
        style: function(feature){
            return {
                color: "white"
            }
        }
    } )
    let mymap = L.map('mapid', {
        center: [33.72, 76.1],
        zoom: 7.4,
        layers: [mapLayer, outlineLayer]
    });

    

})

function getFillColor(district) {
    let min = Math.min(...Object.values(activeDistrictsMap))
    let max = Math.max(...Object.values(activeDistrictsMap))
    let range = (max - min) / 3
    let number = activeDistrictsMap[district];
    if (number < min + range) return "#fee8c8"
    else if (number < min + (range * 2)) return "#fdbb84"
    else if (number <= max) return "#e34a33"

}