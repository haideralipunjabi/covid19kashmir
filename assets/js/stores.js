const API_URL = "https://covidkashmir.org/api/stores/"
let myMap, storesData;
let sheetPromise = fetch(API_URL).then((response) => {
    return response.text()
})

let typeDefined = getUrlParameter("type")
if(typeDefined!==undefined || typeDefined !==""){
    if(typeDefined.toLowerCase()==="medical"){
        switchType(1)
    }
    else if(typeDefined.toLowerCase()==="grocery"){
        switchType(0)
    }
}

$(document).ready(()=>{
    sheetPromise.then(response=>{
        storesData = ArraysToDict(CSVToArray(response))
        makeMap();
        createTable();
    })
})

let medicalIcon = L.AwesomeMarkers.icon({
    icon: "clinic-medical",
    markerColor: 'red',
    extraClasses: 'fas',
    prefix: 'fa',
})
let storeIcon = L.AwesomeMarkers.icon({
    icon: "store",
    markerColor: 'blue',
    extraClasses: 'fas',
    prefix: 'fa',
})
function makeMap(){
    myMap = L.map('mapid').setView([34.0837, 74.7973], 11);

    L.tileLayer('https://api.maptiler.com/maps/basic/{z}/{x}/{y}.png?key=pveDabKqKvojR5EZXAR7', {
        attribution: '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>',
        maxZoom: 20,
        minZoom: 11,
        id: 'mapbox/streets-v11',
        tileSize: 512,
        zoomOffset: -1,
        accessToken: 'pk.eyJ1IjoiaGFpZGVyYWxpcHVuamFiaSIsImEiOiJjazhrNDR0YzEwZ3h5M2dwOTNsaXh4eHZtIn0.pPotYvke-qLKD6RJtQtghA'
    }).addTo(myMap);
    myMap.setMaxBounds(myMap.getBounds());
    myMap.setZoom(12)
    console.log(storesData)
    for(let store of storesData){
        let markerIcon;
        markerIcon = (store["Type"]==="Grocery") ? storeIcon:medicalIcon
        
        if(store["Coords"]!==""){
            let marker = L.marker(store["Coords"].split(","), {icon:markerIcon}).addTo(myMap);
            marker.bindPopup(getHTML(store))
        }
    }
}

function getHTML(store){
    if(store["Type"==="Grocery"]){
        return `
        <h1 class="title is-6">${store["Name"]}</h1>
        <h2 class="subtitle is-6">${store["Area"]}</h2>
        ${
            store["Contact No."].split(",").map(item=>`<a style="margin-left: 5px; margin-bottom:5px;" class="button is-success" href="tel:+91${item}"><span style="margin-right: 5px"><i class="icon fas fa-phone-volume"></i></span><span>${item}</span></a>`)
        }
        <hr>
        <h2 class="subtitle is-6"><b>Designated Official: </b>${store["Designated Official"]}</h2>
        ${
            store["DO - Contact No"].split(",").map(item=>`<a style="margin-left: 5px; margin-bottom:5px;" class="button is-info" href="tel:+91${item}"><span style="margin-right: 5px"><i class="icon fas fa-phone-volume"></i></span><span>${item}</span></a>`)
        }
        <hr>
        ${ (store["Google Maps Link"]!=="")?(`<a class="button is-info" href="${store["Google Maps Link"]}"><span style="margin-right: 15px"><i class="icon fas fa-map"></i></span><span>Google Maps</span></a>`):""}
    `
    }
    else{
        return `
        <h1 class="title is-6">${store["Name"]}</h1>
        <h2 class="subtitle is-6">${store["Area"]}</h2>
        ${
            store["Contact No."].split(",").map(item=>`<a style="margin-left: 5px; margin-bottom:5px;" class="button is-success" href="tel:+91${item}"><span style="margin-right: 5px"><i class="icon fas fa-phone-volume"></i></span><span>${item}</span></a>`)
        }
        <hr>
        ${ (store["Google Maps Link"]!=="")?(`<a class="button is-info" href="${store["Google Maps Link"]}"><span style="margin-right: 15px"><i class="icon fas fa-map"></i></span><span>Google Maps</span></a>`):""}
    `
    }
    
}

function createTable(){
    let groceryStores = storesData.filter(item=>(item["Type"]==="Grocery"));
    let medicalStores = storesData.filter(item=>(item["Type"]==="Medical"));
    for(let store of groceryStores){
            $("#table-grocery tbody").append(
                `
                <tr>
                    <td>${groceryStores.indexOf(store)+1}</td>
                    <td>${store["Name"]}</td>
                    <td>${store["Area"]}</td>
                    <td style="vertical-align: middle" class="has-text-centered">${
                        store["Contact No."].split(",").map(item=>`<a class="button is-success" style="margin-left: 5px; margin-bottom:5px;" href="tel:+91${item}"><span style="margin-right: 5px"><i class="icon fas fa-phone-volume"></i></span><span>${item}</span></a>`)
                    }</td>
                    <td>${store["Designated Official"]}</td>
                    
                    <td class="has-text-centered" style="vertical-align: middle">${
                        store["DO - Contact No"].split(",").map(item=>`<a class="button is-info" style="margin-left: 5px; margin-bottom:5px;" href="tel:+91${item}"><span style="margin-right: 5px"><i class="icon fas fa-phone-volume"></i></span><span>${item}</span></a>`)
                    }</td>
                    <td class="has-text-centered" style="vertical-align: middle">${ (store["Google Maps Link"]!=="")?(`<a class="button is-info" href="${store["Google Maps Link"]}"><span style="margin-right: 5px"><i class="icon fas fa-map"></i></span></a>`):""}</td>
                </tr>
                    
                `
    
            )     
    }
    for(let store of medicalStores){
        $("#table-medical tbody").append(
            `
            <tr>
            <td>${medicalStores.indexOf(store)+1}</td>
            <td>${store["Name"]}</td>
            <td>${store["Area"]}</td>
            <td style="vertical-align: middle" class="has-text-centered">${
                store["Contact No."].split(",").map(item=>`<a class="button is-success" style="margin-left: 5px; margin-bottom:5px;" href="tel:+91${item}"><span style="margin-right: 5px"><i class="icon fas fa-phone-volume"></i></span><span>${item}</span></a>`)
            }</td>
            <td class="has-text-centered" style="vertical-align: middle">${ (store["Google Maps Link"]!=="")?(`<a class="button is-info" href="${store["Google Maps Link"]}"><span style="margin-right: 5px"><i class="icon fas fa-map"></i></span></a>`):""}</td>
                </tr>
            `

        )     
}
}

function switchType(type){
    let tabs = $("#store-tabs li")
    switch (type) {
        case 0:
            $(tabs[0]).addClass("is-active")
            $(tabs[1]).removeClass("is-active")
            $("#table-grocery").removeClass("is-hidden")
            $("#table-medical").addClass("is-hidden")
            break;
        case 1:
                $(tabs[1]).addClass("is-active")
                $(tabs[0]).removeClass("is-active")
                $("#table-grocery").addClass("is-hidden")
                $("#table-medical").removeClass("is-hidden")
                break
        default:
            break;
    }
}