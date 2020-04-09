import fetch from "node-fetch";



exports.handler = async (event, context) => {
  const url = "https://covidkashmir.org/api/patients";
  const DISTRICTS = ["Baramulla", "Ganderbal", "Bandipora", "Srinagar", "Anantnag", "Budgam", "Doda", "Jammu", "Kathua", "Kishtwar", "Kulgam", "Kupwara", "Pulwama", "Poonch", "Rajouri", "Ramban", "Riasi", "Samba", "Shopian", "Udhampur", "Mirpur", "Muzaffarabad", "Unknown"]
  return fetch(url)
    .then(response => response.json())
    .then(data => {
      districtMap = {}
      for (let district of DISTRICTS) {
        let districtData = data.filter(item => {
          return item["District"] === district
        })
        districtMap[district] = {
          "Total": districtData.length,
          "Active": filterDataByStatus(districtData, "Hospitalized").length,
          "Recovered": filterDataByStatus(districtData, "Recovered").length,
          "Deceased": filterDataByStatus(districtData, "Deceased").length
        }
      }
      return {
        statusCode: 200,
        body:JSON.stringify(districtMap)
      }
    })
    .catch(error => ({
      statusCode: 422,
      body: String(error)
    }));



};