const API_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSg-doiJ59mWF5UiJP-tCB6XCqahr9YaXe6eHiyWFyjylHtGRuy5yZrw1ZNWq3etbbyU8Gqz0i5gANp/pub?gid=941252155&single=true&output=csv"
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
                      <td>${contact["Speciality"]}</td>
                      <td>${contact["Phone No"]}</td>
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

// ref: http://stackoverflow.com/a/1293163/2343
    // This will parse a delimited string into an array of
    // arrays. The default delimiter is the comma, but this
    // can be overriden in the second argument.    

    function CSVToArray( strData, strDelimiter ){
        // Check to see if the delimiter is defined. If not,
        // then default to comma.
        strDelimiter = (strDelimiter || ",");
    
        // Create a regular expression to parse the CSV values.
        var objPattern = new RegExp(
            (
                // Delimiters.
                "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +
    
                // Quoted fields.
                "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +
    
                // Standard fields.
                "([^\"\\" + strDelimiter + "\\r\\n]*))"
            ),
            "gi"
            );
    
    
        // Create an array to hold our data. Give the array
        // a default empty first row.
        var arrData = [[]];
    
        // Create an array to hold our individual pattern
        // matching groups.
        var arrMatches = null;
    
    
        // Keep looping over the regular expression matches
        // until we can no longer find a match.
        while (arrMatches = objPattern.exec( strData )){
    
            // Get the delimiter that was found.
            var strMatchedDelimiter = arrMatches[ 1 ];
    
            // Check to see if the given delimiter has a length
            // (is not the start of string) and if it matches
            // field delimiter. If id does not, then we know
            // that this delimiter is a row delimiter.
            if (
                strMatchedDelimiter.length &&
                strMatchedDelimiter !== strDelimiter
                ){
    
                // Since we have reached a new row of data,
                // add an empty row to our data array.
                arrData.push( [] );
    
            }
    
            var strMatchedValue;
    
            // Now that we have our delimiter out of the way,
            // let's check to see which kind of value we
            // captured (quoted or unquoted).
            if (arrMatches[ 2 ]){
    
                // We found a quoted value. When we capture
                // this value, unescape any double quotes.
                strMatchedValue = arrMatches[ 2 ].replace(
                    new RegExp( "\"\"", "g" ),
                    "\""
                    );
    
            } else {
    
                // We found a non-quoted value.
                strMatchedValue = arrMatches[ 3 ];
    
            }
    
    
            // Now that we have our value string, let's add
            // it to the data array.
            arrData[ arrData.length - 1 ].push( strMatchedValue );
        }
    
        // Return the parsed data.
        return( arrData );
    }

function ArraysToDict(data){
    let return_data = [];
    for(let i =1; i<data.length;i++){
        let item = {};
        for(let col in data[i]){
            item[data[0][col]] = data[i][col]
        }
        return_data.push(item)
    }
    return return_data;
}
$(document).ready(function(){
    loadData();
    $(".navbar-burger").click(function() {

        // Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
        $(".navbar-burger").toggleClass("is-active");
        $(".navbar-menu").toggleClass("is-active");
  
    });
})

