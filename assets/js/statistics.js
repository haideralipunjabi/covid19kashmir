const API_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSg-doiJ59mWF5UiJP-tCB6XCqahr9YaXe6eHiyWFyjylHtGRuy5yZrw1ZNWq3etbbyU8Gqz0i5gANp/pub?gid=1918769997&single=true&output=csv"
let data;
let dates;
let currentDateIndex;
function loadData(){
    progressBarVisible(true)

    fetch(API_URL).then((response)=>{
        return response.text()
    }).then((text)=>{
        data = ArraysToDict(CSVToArray(text));
        dates = data.map((item)=>{return item["Date"]}).filter((value,index,self)=>{return self.indexOf(value)===index});
        console.log(data)
        loadTable();
    });
}

function loadTable(){
    progressBarVisible(false);
    currentDateIndex = 0;
    $("#date-options").html(dates.map((date,index)=>{
        return `<a class="dropdown-item ${(index===currentDateIndex)?"is-active":""}" onclick="javascript:changeDate(this)">${date}</a>`
    }))
    $("#date-now").html(dates[currentDateIndex])
    loadByDate();
}

function loadByDate(){
    $("#data-table tbody").html("");
    let d = Object.entries(data[currentDateIndex]);
    $("#data-source").attr("href",d[d.length-1][1])
    for(let item of d.slice(1,d.length-1)){
        $("#data-table tbody").append(`
        <tr>
                    <td>${item[0]}</td>
                      <td>${item[1]}</td> 
        </tr>
    `)
    }
}

function changeDate(date){
    currentDateIndex = dates.indexOf(date.text)
    $("#date-now").html(date.text)
    $("#date-options .is-active").removeClass("is-active")
    $(date).addClass("is-active")
    $(".dropdown").toggleClass("is-active");
    loadByDate();
}


$(document).ready(function(){
    loadData();
    $(".navbar-burger").click(function() {

        // Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
        $(".navbar-burger").toggleClass("is-active");
        $(".navbar-menu").toggleClass("is-active");
  
    });
    $(".dropdown-trigger").click(function(){
        $(".dropdown").toggleClass("is-active");
    })
})

