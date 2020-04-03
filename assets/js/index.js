const API_URL = "https://covidkashmir.org/api/patients/"
const LIVE_API_URL = "https://covidkashmir.org/api/live"
let patientData, districtsMap, activeDistrictsMap, districtInformation,snap, countback;
const DISTRICTS = ["Baramulla", "Ganderbal", "Bandipora", "Srinagar", "Anantnag", "Budgam", "Doda", "Jammu", "Kathua", "Kishtwar", "Kulgam", "Kupwara", "Pulwama", "Poonch", "Rajouri", "Ramban", "Riasi", "Samba", "Shopian", "Udhampur", "Mirpur", "Muzaffarabad"]
const COLORS = {
    "PRIMARY": {"TOTAL": "#f14668","ACTIVE":"#3298dc", "RECOVERED":"#48c774", "DECEASED":"#4a4a4a"},
}
const FILTERS = {
    "Date Announced": "",
    "District": "",
    "Status": ""
}
function loadData(first) {
    
    if(first) progressBarVisible(true)
    if(!first){
        $("#cases_total").html("");
    $("#cases_active").html("")
    $("#cases_deaths").html("")
    $("#cases_recovered").html("")
    }
    loadStats();
    fetch(API_URL).then((response) => {
        return response.text()
    }).then((text) => {
        patientData = ArraysToDict(CSVToArray(text));
        if(first)loadTable();
        if(first)loadFilters();
        
        if(first)loadMap();
        if(first)loadChart();
    });
}

function loadTable() {
    progressBarVisible(false);
    $("#data-table tbody").html("")
    for (let patient of patientData) {
        if(!matchesFilters(patient)) continue;
        $("#data-table tbody").append(`
        <tr ${(patient["Status"]=="Recovered") ? `style="background-color: #ebfffc"`:""} 
        ${(patient["Status"]=="Deceased") ? `style="background-color: #feecf0"`:""}
        onclick=javascript:patientModal(${patientData.indexOf(patient)})
        >
        <td>${patientData.indexOf(patient)+1}</td>
                      <td data-value=${patientData.indexOf(patient)+1}>${patient["Date Announced"]}</td>
                      <td>${patient["District"]}</td>
                      <td class="is-hidden-mobile is-hidden-tablet-only">${patient["Locality"]}</td>
                      <td class="is-hidden-mobile is-hidden-tablet-only">${patient["Age"]}</td>
                      <td class="is-hidden-mobile is-hidden-tablet-only">${patient["Gender"]}</td>
                      <td class="is-hidden-mobile is-hidden-tablet-only">${patient["History"]}</td>
                      <td class="is-hidden-mobile is-hidden-tablet-only">${patient["Notes"]}</td>
                      <td class="is-hidden-mobile is-hidden-tablet-only">${formatSources(patient)}</td>
                      <td class="is-hidden-mobile is-hidden-tablet-only">${patient["Status"]}</td>
                      <td><a class="button is-small - is-rounded is-info" onclick="javascript:patientModal(${patientData.indexOf(patient)}>${patient["Status"]}">View Details</a></td>
                      
        </tr>
    `)
    }
    $("#data-table th")[1].click()
    // $("#data-table th")[1].click()
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
    fetch(LIVE_API_URL).then((response) => {
        return response.json()
    }).then((data) => {
        $("#cases_total").html(data.Total);
        $("#cases_active").html(data.Active);
        $("#cases_deaths").html(data.Deceased);
        $("#cases_recovered").html(data.Recovered);
    });
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
    // legend.rect(0,0,500,500)
}
function loadChart(){
    dateMap = {}
    for (let date of getUniqueData("Date Announced")) {
        dateMap[date] =  patientData.filter(item => {
            return item["Date Announced"] === date
          }).length
    }
    chartOptions = {
        series: [{
          name: 'Case',
          data: Object.values(dateMap)
        }],
        chart: {
          height: 350,
          type: 'line',
        },
        stroke: {
          width: 7,
          curve: 'smooth'
        },
        xaxis: {
          categories: Object.keys(dateMap)
        },
        title: {
          text: "Cases Announced Daily"
        },
        subtitle: {
          text: "Source: covidkashmir.org"
        },
        fill: {
          type: 'gradient',
          gradient: {
            shade: 'dark',
            gradientToColors: ['#FDD835'],
            shadeIntensity: 1,
            type: 'horizontal',
            opacityFrom: 1,
            opacityTo: 1,
            stops: [0, 100, 100, 100]
          },
        },
        markers: {
          size: 4,
          colors: ["#FFA41B"],
          strokeColors: "#fff",
          strokeWidth: 2,
          hover: {
            size: 7,
          }
        },
        yaxis: {
          min: -10,
          max: 40,
          title: {
            text: 'No. of cases',
          },
        }
      };
      let chart = new ApexCharts(document.querySelector("#chart1"), chartOptions);
  chart.render();
}
function selectMapDistrict(dShape){
    snap.selectAll("path").forEach((item)=>{
        item.attr("stroke","#000000");
        item.attr("strokeWidth","1");
    })
    dShape.paper.node.removeChild(dShape.node)
    dShape.paper.node.insertBefore(dShape.node, dShape.paper.node.firstChild)
    dShape.attr("stroke", COLORS.PRIMARY.RECOVERED)
    dShape.attr("strokeWidth","3px")
    activateDistrict(dShape.node.id.toTitleCase())
}
function patientModal(id) {
    let patient = patientData[id];
    $("#modal-details-id").html(id + 1);
    $("#modal-details-age").html(patient["Age"])
    $("#modal-details-gender").html(patient["Gender"])
    $("#modal-details-history").html(patient["History"])

    $("#modal-details-city").html(patient["City"])
    $("#modal-details-district").html(patient["District"])
    $("#modal-details-locality").html(patient["Locality"])
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
$(window).resize(function(){
    if($("#legend").children().length){
        $("#legend").html("");
        makeLegend();
    }
})
function makeLegend() {
    legend = Snap("#legend")
    
    let svgWidth = snap.node.offsetWidth;
    let min = Math.min(...Object.values(activeDistrictsMap))
    let max = Math.max(...Object.values(activeDistrictsMap))
    let range = (max - min) / 3
    let stops = [svgWidth/3,4*svgWidth/9, 5*svgWidth/9, 2*svgWidth/3]
    // let stops = [0, svgWidth/3, 2*svgWidth/3, svgWidth]
    let barWidth = svgWidth/9;
    let barHeight = 10;
    legend.rect(stops[0],0,barWidth,barHeight).attr("fill","#fee8c8")
    legend.rect(stops[1],0,barWidth,barHeight).attr("fill","#fdbb84")
    legend.rect(stops[2],0,barWidth,barHeight).attr("fill","#e34a33")
    legend.text(stops[0]-5,2.5*barHeight,"1").attr("fill","#000")
    legend.text(stops[1]-5,2.5*barHeight,`${Math.floor(min + range)}`).attr("fill","#000")
    legend.text(stops[2]-5,2.5*barHeight,`${Math.floor(min + (range * 2))}`).attr("fill","#000")
    legend.text(stops[3]-5,2.5*barHeight,max).attr("fill","#000")

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

function loadFilters(){
    let districts = getUniqueData("District")
    let dates = getUniqueData("Date Announced")
    let statuses = getUniqueData("Status")
    for(let district of districts) $("#filter-district").append(`<option>${district}</option>`)
    for(let date of dates) $("#filter-date-announced").append(`<option>${date}</option>`)
    for(let status of statuses) $("#filter-status").append(`<option>${status}</option>`)
    $("#data-filters .select").removeClass("is-loading")
    $("#filter-district").change(()=>{
        if($("#filter-district")[0].selectedIndex!==0) FILTERS["District"]=$("#filter-district").val()
        else FILTERS["District"]=""
        loadTable()
    })
    $("#filter-date-announced").change(()=>{
        if($("#filter-date-announced")[0].selectedIndex!==0) FILTERS["Date Announced"]=$("#filter-date-announced").val()
        else FILTERS["Date Announced"]=""
        loadTable()
    })
    $("#filter-status").change(()=>{
        if($("#filter-status")[0].selectedIndex!==0) FILTERS["Status"]=$("#filter-status").val()
        else FILTERS["Status"]=""
        loadTable()
    })
}
function getUniqueData(key){
    return patientData.map((item) => {
        return item[key]
    }).filter((value, index, self) => {
        return self.indexOf(value) === index
    });
}
function matchesFilters(patient){
    for(let key of Object.keys(FILTERS)){
        if(FILTERS[key] === "") continue;
        if(patient[key] !== FILTERS[key]) return false;
    }
    return true;
}


$(document).ready(function () {
    loadData(true);
    
    $(".dropdown-trigger").click(function () {
        $(".dropdown").toggleClass("is-active");
    })
})