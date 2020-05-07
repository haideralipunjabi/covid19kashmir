const fetch = require("node-fetch");

const Utils = require("./utils")
const Stats = require("./stats")
const { URL_BULLETIN, URL_PATIENTS,URL_DISTRICTS } = process.env;
exports.handler = async (event, context) => {
  let fields = event.queryStringParameters.fields;
  let patientData, districtData, bulletinData;
  if(!fields){
    return {
      statusCode: 200,
      body:JSON.stringify({})
    }
  }
  fields = fields.split(",")
  console.log(fields)
  let promises = [
    fetch(URL_PATIENTS).then(response=>response.text()).then(data=>{patientData = Utils.ArraysToDict(Utils.CSVToArray(data))})
  ]
  if(fields.includes("variance") || fields.includes("samples")){
    promises.push(fetch(URL_BULLETIN).then(response=>response.text()).then(data=>{bulletinData=Utils.ArraysToDict(Utils.CSVToArray(data))}))
  }
  if(fields.includes("districtMap") || fields.includes("districtVariance")){
    promises.push(fetch(URL_DISTRICTS).then(response=>response.text()).then(data=>{districtData=Utils.ArraysToDict(Utils.CSVToArray(data))}))
  }
  return Promise.all(promises).then(async ()=>{
    
    data = {}
    if(fields.includes("patientData")){
      data["patientData"] = patientData
    }
    if(fields.includes("districtMap")){
      data["districtMap"] = Stats.DistrictMap(districtData)
    }
    if(fields.includes("districtVariance")){
      data["districtVariance"] = Stats.DistrictVariance(districtData);
    }
    if(fields.includes("dailyMap")){
      data["dailyMap"] = Stats.DailyMap(patientData)
    }
    if(fields.includes("total")){
      data["total"] = Stats.totalMap(patientData)
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
      data["ageMap"] = Stats.ageMap(patientData)
    }
    if(fields.includes("genderMap")){
      data["genderMap"] = Stats.genderMap(patientData)
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