const fetch = require("node-fetch");

const Utils = require("./utils")
const Stats = require("./stats")
const { URL_BULLETIN, URL_PATIENTS } = process.env;
let URL_DISTRICTS = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSg-doiJ59mWF5UiJP-tCB6XCqahr9YaXe6eHiyWFyjylHtGRuy5yZrw1ZNWq3etbbyU8Gqz0i5gANp/pub?gid=1857127229&single=true&output=csv"
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
  if(fields.includes("variance")){
    promises.push(fetch(URL_BULLETIN).then(response=>response.text()))
  }
  if(fields.includes("districtMap")){
    promises.push(fetch(URL_DISTRICTS).then(response=>response.text()))
  }
  return Promise.all(promises).then(values=>{
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
    
    return {
      statusCode: 200,
      body:JSON.stringify(data)
    }
  }).catch(error => ({
      statusCode: 422,
      body: String(error)
    }));



};