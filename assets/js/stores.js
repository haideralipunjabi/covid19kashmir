const API_URL = "https://covidkashmir.org/api/stores/"
let myMap, storesData;

let sheetPromise = fetch(API_URL).then((response) => {
    return response.text()
})
$(document).ready(()=>{
    sheetPromise.then(response=>{
        storesData = ArraysToDict(CSVToArray(response))
        makeMap();
        createTable();
    })
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
    
    for(let store of storesData){
        if(store["Coords"]!==""){
            let marker = L.marker(store["Coords"].split(",")).addTo(myMap);
            marker.bindPopup(getHTML(store))
        }
    }
}

function getHTML(store){
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

function createTable(){
    for(let store of storesData){
        $("#data-table tbody").append(
            `
                <tr>
                    <td>${storesData.indexOf(store)+1}</td>
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
}