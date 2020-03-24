
function loadStats(){
    // $.getJSON("/data/stats.json").then(data=>{
    //     stats = data[0];
    //     for(let key of Object.keys(stats)){
    //         $("#"+key).html(stats[key])
    //     }
    //     let d =new Date(parseInt(stats.latest_run)*1000)
    //     $("#latest_utc").html(`${d.toLocaleString()}`)
    //     $("#storydata_perc").html(Math.round(stats['storydata_count']*100/stats['total_unique_stories']*100)/100+"%")
    // });
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
$(document).ready(function(){
    loadStats();
})