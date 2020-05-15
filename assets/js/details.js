let patientData;
let tableLimit =50, tablePage =1;
const API_URL = "/.netlify/functions/api"

const API_PROMISE = fetch(API_URL+"?fields=patientData").then((response) => {
    return response.json()
})
const FILTERS = {
    "Date Announced": "",
    "District": "",
    "Status": ""
}
function getUniqueData(key) {
    return patientData.map((item) => {
        return item[key]
    }).filter((value, index, self) => {
        return self.indexOf(value) === index
    });
}
$(document).ready(() => {
    API_PROMISE.then((data) => {
        $("progress").addClass("is-hidden")
        patientData = data["patientData"];
        loadFilters();
        loadTable()
    })
})

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
function matchesFilters(patient) {
    for (let key of Object.keys(FILTERS)) {
        if (FILTERS[key] === "") continue;
        if (patient[key] !== FILTERS[key]) return false;
    }
    return true;
}
function loadFilters() {
    let districts = getUniqueData("District")
    let dates = getUniqueData("Date Announced")
    let statuses = getUniqueData("Status")
    for (let district of districts) $("#filter-district").append(`<option>${district}</option>`)
    for (let date of dates) $("#filter-date-announced").append(`<option>${date}</option>`)
    for (let status of statuses) $("#filter-status").append(`<option>${status}</option>`)
    $("#data-filters .select").removeClass("is-loading")
    $("#filter-district").change(() => {
        if ($("#filter-district")[0].selectedIndex !== 0) FILTERS["District"] = $("#filter-district").val()
        else FILTERS["District"] = ""
        loadTable()
    })
    $("#filter-date-announced").change(() => {
        if ($("#filter-date-announced")[0].selectedIndex !== 0) FILTERS["Date Announced"] = $("#filter-date-announced").val()
        else FILTERS["Date Announced"] = ""
        loadTable()
    })
    $("#filter-status").change(() => {
        if ($("#filter-status")[0].selectedIndex !== 0) FILTERS["Status"] = $("#filter-status").val()
        else FILTERS["Status"] = ""
        loadTable()
    })
}
function loadTable() {
    progressBarVisible(false);
    $("#data-table tbody").html("")
    let filteredData = patientData.filter(item=>matchesFilters(item))
    if(filteredData.length > tableLimit){
        $(".pagination-next").removeClass("is-invisible")
    }
    else {
        $(".pagination-next").addClass("is-invisible")

    }
    for (let i =(filteredData.length - 1) - tableLimit*(tablePage-1); i > (filteredData.length - 1) - (tableLimit*tablePage); i--) {
        if(i<0) break;
        patient = filteredData[i]
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
}

function changePage(c){
    
    $(".pagination-previous").removeClass("is-invisible")
    $(".pagination-next").removeClass("is-invisible")

    tablePage += c;
    if(tablePage === 1){
        $(".pagination-previous").addClass("is-invisible")
    }
    if(tablePage*tableLimit>patientData.length){
        $(".pagination-next").addClass("is-invisible")

    }
    loadTable();
    $("#data-table")[0].scrollIntoView()
}
function formatSources(patient) {
    let links = patient["Sources"].split(",")
    let sources = []
    for (link of links) {
        if(!link.trim().startsWith("http")){
            sources.push(`<a href="https://${link.trim()}">${links.indexOf(link)+1}</a>`)
            continue;
        }
        sources.push(`<a href="${link.trim()}">${links.indexOf(link)+1}</a>`)
    }
    return sources.join(" ")
}