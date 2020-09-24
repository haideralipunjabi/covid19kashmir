const fetch = require("node-fetch");

const Utils = require("./utils")
const Stats = require("./stats")
const { URL_BULLETIN, URL_PATIENTS,URL_DISTRICTS } = process.env;
let URL_BEDS = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSg-doiJ59mWF5UiJP-tCB6XCqahr9YaXe6eHiyWFyjylHtGRuy5yZrw1ZNWq3etbbyU8Gqz0i5gANp/pub?gid=1077410698&single=true&output=csv"
exports.handler = async (event, context) => {
  let fields = event.queryStringParameters.fields;
  let patientData, districtData, bulletinData,bedsRawData;
  if(!fields){
    return {
      statusCode: 200,
      body:JSON.stringify({})
    }
  }
  fields = fields.split(",")
  console.log(fields)
  let promises = [];
  if(fields.includes("variance") || fields.includes("samples") || fields.includes("dailyMap") || fields.includes("total")){
    promises.push(fetch(URL_BULLETIN).then(response=>response.text()).then(data=>{bulletinData=Utils.ArraysToDict(Utils.CSVToArray(data))}))
  }
  if(fields.includes("districtMap") || fields.includes("districtVariance")){
    promises.push(fetch(URL_DISTRICTS).then(response=>response.text()).then(data=>{districtData=Utils.ArraysToDict(Utils.CSVToArray(data))}))
  }
  if(fields.includes("beds")){
    promises.push(fetch(URL_BEDS).then(response=>response.text()).then(data=>{bedsRawData=data}))
  }
  return Promise.all(promises).then(async ()=>{
    
    data = {}
    // if(fields.includes("patientData")){
    //   data["patientData"] = patientData
    // }
    if(fields.includes("districtMap")){
      data["districtMap"] = Stats.DistrictMap(districtData)
    }
    if(fields.includes("districtVariance")){
      data["districtVariance"] = Stats.DistrictVariance(districtData);
    }
    if(fields.includes("dailyMap")){
      data["dailyMap"] = Stats.DailyMap(bulletinData)
    }
    if(fields.includes("total")){
      data["total"] = Stats.totalMap(bulletinData)
    }
    if(fields.includes("variance")){
      data["variance"] = Stats.VarianceMap(bulletinData)
    }
    if(fields.includes("samples")){
      data["samples"] = Stats.Samples(bulletinData)
    }
    if(fields.includes("IndiaData")){
      data["india"] =  await Stats.IndiaData()
    }
    if(fields.includes("WorldData")){
      data["world"] = await Stats.WorldData()
    }
    if(fields.includes("ageMap")){
      data["ageMap"] = Stats.ageMap()
    }
    if(fields.includes("genderMap")){
      data["genderMap"] = Stats.genderMap()
    }
    if(fields.includes("beds")){
      data["beds"] = Stats.beds(bedsRawData);
    }
    return {
      statusCode: 200,
      body:JSON.stringify(data)
    }
  }).catch(error => ({
      statusCode: 422,
      body: String(error)
    }));



};