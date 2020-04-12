const Utils = require("./utils")
const Population = require("./population")
const fetch = require("node-fetch");

exports.DistrictMap = function (data) {
  console.log(data)
  let districtMap = {}
  for(let entry of data){
    let district = entry["District"];
    delete entry["District"]
    entry["Population"] = Population.POPULATION[district]
    districtMap[district] = entry;
  }
  return districtMap
}

exports.DailyMap = function (data) {
  let dateMap = {}
  for (let date of Utils.getUnique(data, "Date Announced")) {
    dateMap[date] = Utils.filterDataByDate(data, date).length
  }
  return dateMap;
}

exports.VarianceMap = function (data) {
  data.reverse()
  spData = {
    "total": [0],
    "active": [0],
    "recovered": [0],
    "deceased": [0]
  }
  for (let day of data) {
    let tTotal = Utils.parseIntOpt(day["Samples Positive"])
    let tRecovered = Utils.parseIntOpt(day["Cases Recovered"].split("(")[0])
    let tDeceased = Utils.parseIntOpt(day["No. of Deaths"].split("(")[0])
    let tActive = tTotal - (tRecovered + tDeceased)
    let pTotal = spData["total"].reduce((x, y) => {
      return (x + y)
    })
    let pRecovered = spData["recovered"].reduce((x, y) => {
      return (x + y)
    })
    let pDeceased = spData["deceased"].reduce((x, y) => {
      return (x + y)
    })
    let pActive = spData["active"].reduce((x, y) => {
      return (x + y)
    })
    spData["total"].push(tTotal - pTotal)
    spData["recovered"].push(tRecovered - pRecovered)
    spData["deceased"].push(tDeceased - pDeceased)
    spData["active"].push(tActive - pActive)
  }
  spData["total"].splice(0, 1)
  spData["recovered"].splice(0, 1)
  spData["deceased"].splice(0, 1)
  spData["active"].splice(0, 1)
  return spData
}

exports.Samples = function(data){
  let samData = {}
  samData["date"] = data[0]["Date"]
  samData["stats"] ={
    "total": data[0]["Samples Collected"],
    "posper": data[0]["Samples Positive"] *100 / data[0]["Samples Collected"],
    "negper": data[0]["Samples Negative"] *100 / data[0]["Samples Collected"]
  }

  samData["variance"] = {
    "total": [0],
    "posper": [0],
    "negper": [0]
  }
  data.reverse()
  for(let day of data){
    let tTotal = Utils.parseIntOpt(day["Samples Collected"])
    let tPosper = Utils.parseIntOpt(day["Samples Positive"])*100 / Utils.parseIntOpt(day["Samples Collected"])
    let tNegper = Utils.parseIntOpt(day["Samples Negative"])*100 / Utils.parseIntOpt(day["Samples Collected"])
    let pTotal = samData["variance"]["total"].reduce((x,y)=>(x+y))
    let pPosper = samData["variance"]["posper"].reduce((x,y)=>(x+y))
    let pNegper = samData["variance"]["negper"].reduce((x,y)=>(x+y))
    samData["variance"]["total"].push(tTotal - pTotal)
    samData["variance"]["posper"].push(tPosper - pPosper)
    samData["variance"]["negper"].push(tNegper - pNegper)
  }
  samData["variance"]["total"].splice(0,1)
  samData["variance"]["posper"].splice(0,1)
  samData["variance"]["negper"].splice(0,1)
  return samData;

}

exports.IndiaData = async function(){
  return fetch("https://api.covid19india.org/data.json").then(r=>r.json()).then(data=>{
    return {
      "active": data.statewise[0].active,
      "recovered":data.statewise[0].recovered,
      "deaths":data.statewise[0].deaths,
      "total":data.statewise[0].confirmed
  }
  })
}
exports.WorldData = async function(){
  return  fetch("https://coronavirus-19-api.herokuapp.com/all").then(r=>r.json()).then(data=>{
    return {
      "total": data['cases'],
      "deaths":data["deaths"],
      "recovered": data["recovered"]
    }
  })
}

exports.totalMap = function(data){
  return {
    "Total": data.length,
    "Active": data.filter(item=>{return (item["Status"]==="Hospitalized")}).length,
    "Recovered": data.filter(item=>{return (item["Status"]==="Recovered")}).length,
    "Deceased": data.filter(item=>{return (item["Status"]==="Deceased")}).length,
  }
}