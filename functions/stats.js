const Utils = require("./utils")

const DISTRICTS = ["Baramulla", "Ganderbal", "Bandipora", "Srinagar", "Anantnag", "Budgam", "Doda", "Jammu", "Kathua", "Kishtwar", "Kulgam", "Kupwara", "Pulwama", "Poonch", "Rajouri", "Ramban", "Riasi", "Samba", "Shopian", "Udhampur", "Mirpur", "Muzaffarabad", "Unknown"]

exports.DistrictMap = function (data) {
  data = Utils.createUnknownDistrict(data);
  let districtMap = {}
  for (let district of DISTRICTS) {
    let districtData = Utils.filterDataByDistrict(data, district)
    if (districtData.length === 0) continue;
    districtMap[district] = {
      "Total": districtData.length,
      "Active": Utils.filterDataByStatus(districtData, "Hospitalized").length,
      "Recovered": Utils.filterDataByStatus(districtData, "Recovered").length,
      "Deceased": Utils.filterDataByStatus(districtData, "Deceased").length
    }
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

exports.totalMap = function(data){
  return {
    "Total": data.length,
    "Active": data.filter(item=>{return (item["Status"]==="Hospitalized")}).length,
    "Recovered": data.filter(item=>{return (item["Status"]==="Recovered")}).length,
    "Deceased": data.filter(item=>{return (item["Status"]==="Deceased")}).length,
  }
}