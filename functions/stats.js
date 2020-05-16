const Utils = require("./utils")
const Population = require("./population")
const fetch = require("node-fetch");

exports.DistrictMap = function (d) {
  let data = JSON.parse(JSON.stringify(d))
  let districtMap = {}
  let lastDay = data[data.length-1]
  let secondLastDay = data[data.length-2]
  delete lastDay["Date"]
  delete secondLastDay["Date"]
  for(let district of Object.keys(lastDay)){
    const [x1,x2,x3,x4] = lastDay[district].split(",") 
    let entry = {
      "Total":Utils.parseIntOpt(x1),
      "Active":Utils.parseIntOpt(x2),
      "Recovered":Utils.parseIntOpt(x3),
      "Deceased":Utils.parseIntOpt(x4),
      "Population": Population.POPULATION[district]
    }
    if(Object.keys(secondLastDay).includes(district)){
      const [y1,y2,y3,y4] = secondLastDay[district].split(",")
      entry["newTotal"] = x1 - y1
      entry["newActive"] = (x2 - y2) + (x3 - y3) + (x4 - y4) 
      entry["newRecovered"] = x3 - y3
      entry["newDeceased"] = x4 - y4
    }
    districtMap[district] = entry;
  }
  return districtMap
}

exports.DistrictVariance = function(d){
  let data = JSON.parse(JSON.stringify(d))
  let variance = {}
  for(let day of data){
    let date = day["Date"]
    delete day["Date"]
    for(let district of Object.keys(day)) {
      if(!Object.keys(variance).includes(district)){
        variance[district]={}
      }
      let [x1,x2,x3,x4] = day[district].split(",")
      variance[district][date] = {
        "Total":Utils.parseIntOpt(x1),
        "Active":Utils.parseIntOpt(x2),
        "Recovered":Utils.parseIntOpt(x3),
        "Deceased":Utils.parseIntOpt(x4)
      }
    }
  }
  return variance;
}


exports.DailyMap = function (data) {
  let dateMap = {}
  for (let date of Utils.getUnique(data, "Date Announced")) {
    dateMap[date] = Utils.filterDataByDate(data, date).length
  }
  return dateMap;
}

exports.VarianceMap = function (d) {
  let data = JSON.parse(JSON.stringify(d))
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

exports.Samples = function(d){
  let data = JSON.parse(JSON.stringify(d))
  let samData = {}
  samData["date"] = data[0]["Date"]
  samData["stats"] ={
    "total": data[0]["Samples Collected"],
    "new": data[0]["Samples Collected"]-data[1]["Samples Collected"],
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

exports.ageMap = function(data){
  let maleages = data.filter(item=>item["Gender"]==="M").map(item=>{
    let matched  = item["Age"].match(/[0-9]+/gm)
    if(matched){
      return parseInt(matched[0])
    }
  }).filter(item=>(item))
  let femaleages = data.filter(item=>item["Gender"]==="F").map(item=>{
    let matched  = item["Age"].match(/[0-9]+/gm)
    if(matched){
      return parseInt(matched[0])
    }
  }).filter(item=>(item))
  let unknownages = data.filter(item=>item["Gender"]==="").map(item=>{
    let matched  = item["Age"].match(/[0-9]+/gm)
    if(matched){
      return parseInt(matched[0])
    }
  }).filter(item=>(item))
  let ages = [...maleages,...femaleages,...unknownages]
  let maxAge = Math.max(...ages)
  let maxRange = Math.ceil((maxAge+1)/10)*10
  let map = {
    "male":{},"female":{},"unknown":{}
  }
  for(let i =0; i < maxRange/10; i++){
    map["male"][`${i*10}-${(i*10)+9}`] = maleages.filter(item=> (item>=i*10 && item < ((i+1)*10))).length
    map["female"][`${i*10}-${(i*10)+9}`] = femaleages.filter(item=> (item>=i*10 && item < ((i+1)*10))).length
    map["unknown"][`${i*10}-${(i*10)+9}`] = unknownages.filter(item=> (item>=i*10 && item < ((i+1)*10))).length

  }
  return map;
}

exports.genderMap = function(data){
  let genders = data.map(item=>item["Gender"])
  return {
    "M": genders.filter(item=>(item==="M")).length,
    "F": genders.filter(item=>(item==="F")).length
  }
}