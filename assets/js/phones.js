const API_URL = "/api/phones/"
function loadData(){
    progressBarVisible(true)

    fetch(API_URL).then((response)=>{
        return response.text()
    }).then((text)=>{
        let data = ArraysToDict(CSVToArray(text));
        loadTable(data)
        loadStats(data);
    });
}

function loadTable(data){
    progressBarVisible(false);

    for(let contact of data){
        $("#data-table tbody").append(`
        <tr>
        <td>${contact["Name"]}</td>
                      <td>${contact["Phone No"].split(",").map((phone)=>{
                        return `<span class="icon"><i class="fas fa-phone-alt"></i></span><a href="tel:${phone}">${phone}</a>`
                    })}</td>
        </tr>
    `)
    }
}
function formatSources(patient){
    let links = patient["Sources"].split(",")
    let sources = []
    for(link of links){
         sources.push(`<a href="${link}">${links.indexOf(link)+1}</a>`)
    } 
    return sources.join(" ")
}
function loadStats(data){
    console.log(data)
    $("#cases_total").html(data.length);
    $("#cases_active").html(data.filter((item)=>{return item["Status"]==="Hospitalized"}).length)
    $("#cases_deaths").html(data.filter((item)=>{return item["Status"]==="Deceased"}).length)
    $("#cases_recovered").html(data.filter((item)=>{return item["Status"]==="Recovered"}).length)

}

$(document).ready(function(){
    loadData();
})

