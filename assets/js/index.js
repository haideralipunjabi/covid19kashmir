const API_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSg-doiJ59mWF5UiJP-tCB6XCqahr9YaXe6eHiyWFyjylHtGRuy5yZrw1ZNWq3etbbyU8Gqz0i5gANp/pub?gid=0&single=true&output=csv&prevent-cache=" + (Math.floor(Math.random()*10**8)).toString()
let patientData, districtsMap, activeDistrictsMap, districtInformation,snap, countback;
const DISTRICTS = ["Baramulla", "Ganderbal", "Bandipora", "Srinagar", "Anantnag", "Budgam", "Doda", "Jammu", "Kathua", "Kishtwar", "Kulgam", "Kupwara", "Pulwama", "Poonch", "Rajouri", "Ramban", "Riasi", "Samba", "Shopian", "Udhampur", "Mirpur", "Muzaffarabad"]
const COLORS = {
    "PRIMARY": {"TOTAL": "#f14668","ACTIVE":"#3298dc", "RECOVERED":"#48c774", "DECEASED":"#4a4a4a"},
}
function loadData(first) {
    if(first) progressBarVisible(true)
    if(!first){
        $("#cases_total").html("");
    $("#cases_active").html("")
    $("#cases_deaths").html("")
    $("#cases_recovered").html("")
    }
    fetch(API_URL).then((response) => {
        return response.text()
    }).then((text) => {
        patientData = ArraysToDict(CSVToArray(text));
        if(first)loadTable()
        loadStats();
        if(first)loadMap();
    });
}

function loadTable() {
    progressBarVisible(false);
    $("#data-table tbody").html("")
    for (let patient of patientData) {
        $("#data-table tbody").append(`
        <tr ${(patient["Status"]=="Recovered") ? `style="background-color: #ebfffc"`:""} 
        ${(patient["Status"]=="Deceased") ? `style="background-color: #feecf0"`:""}
        onclick=javascript:patientModal(${patientData.indexOf(patient)})
        >
        <td>${patientData.indexOf(patient)+1}</td>
                      <td>${patient["Date Announced"]}</td>
                      <td class="is-hidden-mobile is-hidden-tablet-only">${patient["City"]}</td>
                      <td>${patient["District"]}</td>
                      <td class="is-hidden-mobile is-hidden-tablet-only">${patient["Age"]}</td>
                      <td class="is-hidden-mobile is-hidden-tablet-only">${patient["Gender"]}</td>
                      <td class="is-hidden-mobile is-hidden-tablet-only">${patient["Notes"]}</td>
                      <td class="is-hidden-mobile is-hidden-tablet-only">${formatSources(patient)}</td>
                      <td class="is-hidden-mobile is-hidden-tablet-only">${patient["Status"]}</td>
                      <td><a class="button is-small - is-rounded is-info" onclick="javascript:patientModal(${patientData.indexOf(patient)}>${patient["Status"]}">View Details</a></td>
                      
        </tr>
    `)
    }
    $("#data-table th")[1].click()
    $("#data-table th")[1].click()
}

function formatSources(patient) {
    let links = patient["Sources"].split(",")
    let sources = []
    for (link of links) {
        sources.push(`<a href="${link}">${links.indexOf(link)+1}</a>`)
    }
    return sources.join(" ")
}

function loadStats() {
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

}

function loadMap() {
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
    for (let district of DISTRICTS) {
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
    snap = Snap("#map")
    Snap.load("assets/media/jk_districts_1.svg", (data) => {
        snap.append(data)
        let districtShapes = snap.selectAll("path")
        districtShapes.forEach((districtShape) => {
            districtShape.attr("fill", getFillColor(districtShape.node.id.toTitleCase()))
            districtShape.click((event) => {
               selectMapDistrict(districtShape)
            })
        })
        makeLegend()
        selectMapDistrict(snap.select("#srinagar"))
    })
}

function selectMapDistrict(dShape){
    snap.selectAll("path").forEach((item)=>{
        item.attr("stroke","#000000");
        item.attr("strokeWidth","1px");
    })
    dShape.paper.node.removeChild(dShape.node)
    dShape.paper.node.insertBefore(dShape.node, dShape.paper.node.firstChild)
    dShape.attr("stroke", COLORS.PRIMARY.RECOVERED)
    dShape.attr("strokeWidth","5px")
    activateDistrict(dShape.node.id.toTitleCase())
}
function patientModal(id) {
    let patient = patientData[id];
    $("#modal-details-id").html(id + 1);
    $("#modal-details-age").html(patient["Age"])
    $("#modal-details-gender").html(patient["Gender"])
    $("#modal-details-city").html(patient["City"])
    $("#modal-details-district").html(patient["District"])
    $("#modal-details-date-announced").html(patient["Date Announced"])

    $("#modal-details-date-change").html(patient["Date Status Change"])
    $("#modal-details-notes").html(patient["Notes"])
    $("#modal-details-sources").html(patient["Sources"].split(",").map((link) => {
        return `<p class="subtitle"><a href="${link}" target="_blank">${link}</a></p>`
    }))

    $("#modal-details-current-status").html(`<span class="tag 
        ${(patient["Status"]==="Recovered") ? `is-primary`:""}
        ${(patient["Status"]==="Deceased")?`is-danger`:""}
        ${(patient["Status"]==="Hospitalized")?`is-info`:""}">
    ${patient["Status"]}</span>`)
    toggleModal("modal-patient")
}



function shareStatsImage() {
    $(".dropdown").toggleClass("is-active");
    $(".dropdown").toggle()
    html2canvas(document.querySelector("#stats")).then((canvas) => {
        $(".dropdown").toggle()
        $("#modal-stats-image .modal-card-body").html(canvas);
        let imData = canvas.toDataURL("image/png").replace(
            /^data:image\/png/, "data:application/octet-stream")
        $("#modal-stats-image footer a.is-success").attr("href", imData);
        toggleModal("modal-stats-image")
    })
}

function shareStatsText() {
    $(".dropdown").toggleClass("is-active");
    toggleModal("modal-stats-text")

    let stats = getStatsText(patientData)
    let districts = patientData.map((item) => {
        return item["District"]
    }).filter((value, index, self) => {
        return self.indexOf(value) === index
    });
    for (let district of districts) {
        districtData = patientData.filter((item) => {
            return item["District"] === district
        });
        stats += `\n\n${district}: \n${getStatsText(districtData)}`
    }
    stats += "\nSource: covidkashmir.org"
    $("#stats-textarea").text(stats)
}

function getStatsText(data) {
    let total = data.length;
    let active = data.filter((item) => {
        return item["Status"] === "Hospitalized"
    }).length;
    let deaths = data.filter((item) => {
        return item["Status"] === "Deceased"
    }).length;
    let recovered = data.filter((item) => {
        return item["Status"] === "Recovered"
    }).length
    return `Total: ${total}${(active)?`\nActive:${active}`:""}${(deaths)?`\nDeaths:${deaths}`:""}${(recovered)?`\nRecovered:${recovered}`:""}`
}

function copyStatsText() {
    $("#stats-textarea").select();
    document.execCommand('copy')
    $("#modal-stats-text footer a.is-success").html("Copied");

}

function activateDistrict(district) {
    $("#map-district_name").html(district);
    for (let c of Object.keys(districtsMap[district])) {
        $("#map-cases_" + c.toLowerCase()).html(districtsMap[district][c])
    }
}

function makeLegend() {
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
    if(!Object.keys(activeDistrictsMap).includes(district)) return "#ffffff"
    let min = Math.min(...Object.values(activeDistrictsMap))
    let max = Math.max(...Object.values(activeDistrictsMap))
    let range = (max - min) / 3
    let number = activeDistrictsMap[district];
    if (number < min + range) return "#fee8c8"
    else if (number < min + (range * 2)) return "#fdbb84"
    else if (number <= max) return "#e34a33"
}


$(document).ready(function () {
    loadData(true);
    
    $(".dropdown-trigger").click(function () {
        $(".dropdown").toggleClass("is-active");
    })
})