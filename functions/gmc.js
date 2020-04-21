const fetch = require("node-fetch");

const Utils = require("./utils")
const { URL_GMC } = process.env;
exports.handler = async (event, context) => {
  return fetch(URL_GMC).then(response=>response.text()).then(values=>{
    let today = event.queryStringParameters.today;
    let todayFlag = false;
    if(!today && today === 1){
        todayFlag = true;
    }
    
    data = Utils.ArraysToDict(Utils.CSVToArray(values))
    date = new Date;
    dateToday = `${date.getDate()}/${(date.getMonth()+1).toString().padStart(2,"0")}/${date.getFullYear()}`
    data = data.filter(item=>item["Date"]===dateToday)
    return {
      statusCode: 200,
      body:JSON.stringify({
          "specialities": data.map(item=>item["Speciality"]),
          "data": data
      })
    }
  }).catch(error => ({
      statusCode: 422,
      body: String(error)
    }));



};