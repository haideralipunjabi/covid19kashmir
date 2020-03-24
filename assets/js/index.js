const API_URL = "https://api.covid19india.org/raw_data.json"
function loadData(){
    progressBarVisible(true)
    fetch(API_URL).then((response)=>{
        return response.json()
    }).then((data)=>{
        let filteredData = data["raw_data"].filter((item)=>{
            return item["detectedstate"]==="Jammu and Kashmir"
        })
        loadTable(filteredData)
        loadStats(filteredData);
    });
}

function loadTable(data){
    progressBarVisible(false);

    for(let patient of data){
        $("#data-table tbody").append(`
        <tr>
        <td>${patient.patientnumber}</td>
                      <td>${patient.dateannounced}</td>
                      <td>${patient.detectedcity}</td>
                      <td>${patient.detecteddistrict}</td>
                      <td>${patient.agebracket}</td>
                      <td>${patient.gender}</td>
                      <td>${patient.notes}</td>
                      <td>${formatSources(patient)}</td>
        </tr>
    `)
    }
}
function formatSources(patient){
    return (`
        ${patient.source1 ? `<a href="${patient.source1}">1</a>`:""} 
        ${patient.source2 ? `<a href="${patient.source2}">2</a>`:""} 
        ${patient.source3 ? `<a href="${patient.source3}">3</a>`:""}
    `)
}
function loadStats(data){
    console.log(data)
    $("#cases_total").html(data.length);
    $("#cases_active").html(data.filter((item)=>{return item["currentstatus"]==="Hospitalized"}).length)
    $("#cases_deaths").html(data.filter((item)=>{return item["currentstatus"]==="Deceased"}).length)
    $("#cases_recovered").html(data.filter((item)=>{return item["currentstatus"]==="Recovered"}).length)

}


function getFullDate(date){
    return new Date(parseInt(date)*1000).toLocaleDateString();
}
function abbr(number, decPlaces) {
    // Source: https://stackoverflow.com/a/2686098/4698800
    // 2 decimal places => 100, 3 => 1000, etc
    decPlaces = Math.pow(10,decPlaces);

    // Enumerate number abbreviations
    var abbrev = [ "k", "m", "b", "t" ];

    // Go through the array backwards, so we do the largest first
    for (var i=abbrev.length-1; i>=0; i--) {

        // Convert array index to "1000", "1000000", etc
        var size = Math.pow(10,(i+1)*3);

        // If the number is bigger or equal do the abbreviation
        if(size <= number) {
             // Here, we multiply by decPlaces, round, and then divide by decPlaces.
             // This gives us nice rounding to a particular decimal place.
             number = Math.round(number*decPlaces/size)/decPlaces;

             // Handle special case where we round up to the next abbreviation
             if((number == 1000) && (i < abbrev.length - 1)) {
                 number = 1;
                 i++;
             }

             // Add the letter for the abbreviation
             number += abbrev[i];

             // We are done... stop
             break;
        }
    }

    return number;
}
function progressBarVisible(visible){
    progress = $("#data-table progress")
    if(visible){
        progress.removeClass("is-hidden")
    }
    else{
        progress.addClass("is-hidden")
    }
}

function messageVisible(elem){
    message = $(elem).closest("article").children(".message-body")
    if(message.hasClass("is-hidden")){
        message.removeClass("is-hidden")
    }
    else {
        message.addClass("is-hidden")
    }
}
// function turnPage(i){
//     page += i
//     loadTable()
// }

// function changeLimit(limit){
//     pagination = limit;
//     loadTable();
// }
$(document).ready(function(){
    loadData();
})