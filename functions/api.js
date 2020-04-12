const fetch = require("node-fetch");

const Utils = require("./utils")
const Stats = require("./stats")
const { URL_BULLETIN, URL_PATIENTS, URL_DISTRICTS } = process.env;

exports.handler = async (event, context) => {
  let fields = event.queryStringParameters.fields;
  if(!fields){
    return {
      statusCode: 200,
      body:JSON.stringify({})
    }
  }
  fields = fields.split(",")
  console.log(fields)
  let promises = [
    fetch(URL_PATIENTS).then(response=>response.text())
  ]
  if(fields.includes("variance") || fields.includes("samples")){
    promises.push(fetch(URL_BULLETIN).then(response=>response.text()))
  }
  if(fields.includes("districtMap")){
    promises.push(fetch(URL_DISTRICTS).then(response=>response.text()))
  }
  return Promise.all(promises).then(async (values)=>{
    patientData = Utils.ArraysToDict(Utils.CSVToArray(values[0]))
    data = {}
    if(fields.includes("patientData")){
      data["patientData"] = Utils.ArraysToDict(Utils.CSVToArray(values[0]))
    }
    if(fields.includes("districtMap")){
      let index = (fields.includes("variance")) ? 1 : 0 
      districtData = Utils.ArraysToDict(Utils.CSVToArray(values[1+index]))
      data["districtMap"] = Stats.DistrictMap(districtData)
    }
    if(fields.includes("dailyMap")){
      data["dailyMap"] = Stats.DailyMap(patientData)
    }
    if(fields.includes("total")){
      data["total"] = Stats.totalMap(patientData)
    }
    
    if(fields.includes("variance")){
      bulletinData = Utils.ArraysToDict(Utils.CSVToArray(values[1]))
      data["variance"] = Stats.VarianceMap(bulletinData)
    }
    if(fields.includes("samples")){
      bulletinData = Utils.ArraysToDict(Utils.CSVToArray(values[1]))
      data["samples"] = Stats.Samples(bulletinData)
    }
    if(fields.includes("IndiaData")){
      data["india"] =  await Stats.IndiaData()
    }
    if(fields.includes("WorldData")){
      data["world"] = await Stats.WorldData()
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