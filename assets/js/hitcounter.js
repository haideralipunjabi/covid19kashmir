const API_URL_ANALYTICS = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQDDYzV5ur3z4rzAkcFH9BMqM60wwniEIblLyk_ZY3R3Ye1HkLUbDIs803C-jhfXbqAwJW7f1P7Oq79/pub?gid=292216360&single=true&output=csv"
let rawAnalyticsData
function loadAnalyticsData() {

    fetch(API_URL_ANALYTICS).then((response) => {
        return response.text()
    }).then((text) => {
        rawAnalyticsData = ArraysToDict(CSVToArray(text));
        loadCounter()
    });
}

function loadCounter(){
    let totalSiteViews = Object.values(rawAnalyticsData[10])[1]
    let urlPageViewsMap = {}
    for(let i =14; i < rawAnalyticsData.length;i++){
        let key = Object.values(rawAnalyticsData[i])[0]
        let value = parseInt(Object.values(rawAnalyticsData[i])[1])
        if(key.includes("?")){
            key = key.substring(0,key.indexOf("?"))
        }
        key = key.replace(".html","")
        if(Object.keys(urlPageViewsMap).includes(key)){
            urlPageViewsMap[key] += value
        }
        else{
            urlPageViewsMap[key] = value
        }
    }
    let thisPageViews = urlPageViewsMap[window.location.pathname.replace(".html","")].toString()
    $("#hitcounter-1").html("")
    for(let c of thisPageViews){
        $("#hitcounter-1").append(`<span>${c}</span> `)
    }
    $("#hitcounter-2").html("")
    for(let c of totalSiteViews){
        $("#hitcounter-2").append(`<span>${c}</span> `)
    }
}
$(document).ready(function() {
    loadAnalyticsData();
})