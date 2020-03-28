const API_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSg-doiJ59mWF5UiJP-tCB6XCqahr9YaXe6eHiyWFyjylHtGRuy5yZrw1ZNWq3etbbyU8Gqz0i5gANp/pub?gid=0&single=true&output=csv";
let patientData, districtsMap, activeDistrictsMap, districtInformation;
let districts =["Baramulla", "Ganderbal", "Bandipora", "Srinagar", "Anantnag", "Budgam", "Doda", "Jammu", "Kathua", "Kishtwar", "Kulgam", "Kupwara", "Pulwama", "Poonch", "Rajouri", "Ramban", "Riasi", "Samba", "Shopian", "Udhampur", "Mirpur", "Muzaffarabad"]
function loadData() {
    fetch(API_URL).then((response) => {
        return response.text()
    }).then((text) => {
        patientData = ArraysToDict(CSVToArray(text));
        $("#cases_total").html(patientData.length);
        $("#cases_active").html(patientData.filter((item) => {
            return item["Status"] === "Hospitalized"
        }).length)
        $("#cases_deaths").html(patientData.filter((item) => {
            return item["Status"] === "Deceased"
        }).length)
        $("#cases_recovered").html(patientData.filter((item) => {
            return item["Status"] === "Recovered"
        }).length)
        // districts = patientData.map((item) => {
        //     return item["District"]
        // }).filter((value, index, self) => {
        //     return self.indexOf(value) === index
        // });
        let activeDistricts = patientData.map((item) => {
            return (item["Status"] === "Hospitalized") ? item["District"] : ""
        })
        activeDistrictsMap = {}
        districtsMap = {}
        for (let district of activeDistricts) {
            if (district === "") continue
            activeDistrictsMap[district] = activeDistricts.filter((item) => {
                return item === district
            }).length
        }
        for (let district of districts) {
            let districtData = patientData.filter((item) => {
                return item["District"] === district
            });
            districtsMap[district] = {}
            districtsMap[district]["Total"] = districtData.length;
            districtsMap[district]["Active"] = districtData.filter((item) => {
                return item["Status"] === "Hospitalized"
            }).length;
            districtsMap[district]["Deceased"] = districtData.filter((item) => {
                return item["Status"] === "Deceased"
            }).length;
            districtsMap[district]["Recovered"] = districtData.filter((item) => {
                return item["Status"] === "Recovered"
            }).length

        }
        let s = Snap("#map")
        Snap.load("assets/media/jk_districts.svg", (data) => {
            s.append(data)
            let districtShapes = s.selectAll("polygon")
            districtShapes.forEach((districtShape) => {
                districtShape.hover((event) => {
                    if (districts.includes(districtShape.node.id.toTitleCase())) {
                        districtShape.attr("stroke", "#ff0000")
                        activateDistrict(districtShape.node.id.toTitleCase())
                    }


                }, (event) => {
                    districtShape.attr("stroke", "#000000")
                })
            })
            for (let district of Object.keys(activeDistrictsMap)) {
                s.select("#" + district.toLowerCase()).attr("fill", getFillColor(district))
            }
            makeLegend()

        })
    });


}
$(document).ready(() => {
    loadData();
})

function activateDistrict(district) {
    $("#district_name").html(district);
    for (let c of Object.keys(districtsMap[district])) {
        $("#cases_" + c.toLowerCase()).html(districtsMap[district][c])
    }
}

function makeLegend(){
    let min = Math.min(...Object.values(activeDistrictsMap))
    let max = Math.max(...Object.values(activeDistrictsMap))
    let range = (max - min) / 3
    let tags = $(".legend .tag")
    $(tags[0]).html(`Active Cases < ${Math.floor(min + range)}`)
    $(tags[0]).css("background-color", "#fee8c8")
    $(tags[1]).html(`Active Cases < ${Math.floor(min + (range * 2))}`)
    $(tags[1]).css("background-color", "#fdbb84")
    $(tags[2]).html(`Active Cases <= ${max}`)
    $(tags[2]).css("background-color", "#e34a33")
}
function getFillColor(district) {
    let min = Math.min(...Object.values(activeDistrictsMap))
    let max = Math.max(...Object.values(activeDistrictsMap))
    let range = (max - min) / 3
    let number = activeDistrictsMap[district];
    if (number < min + range) return "#fee8c8"
    else if (number < min + (range * 2)) return "#fdbb84"
    else if (number <= max) return "#e34a33"
}