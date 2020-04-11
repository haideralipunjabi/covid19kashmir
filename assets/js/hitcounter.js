const API_URL_ANALYTICS = "/.netlify/functions/hits"
let rawAnalyticsData;
function loadAnalyticsData() {

    fetch(API_URL_ANALYTICS).then((response) => {
        return response.json()
    }).then((data) => {
        rawAnalyticsData = data;
        loadCounter()
    });
}

function loadCounter(){
    
    let thisPageViews = rawAnalyticsData["pageMap"][window.location.pathname.replace(".html","").replace("index","")].toString()
    $("#hitcounter-1").html("")
    for(let c of thisPageViews){
        $("#hitcounter-1").append(`<span>${c}</span> `)
    }
    $("#hitcounter-2").html("")
    for(let c of rawAnalyticsData["total"]){
        $("#hitcounter-2").append(`<span>${c}</span> `)
    }
}
$(document).ready(function() {
    loadAnalyticsData();
})