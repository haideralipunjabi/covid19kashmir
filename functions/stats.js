const Utils = require("./utils");
const Population = require("./population");
const fetch = require("node-fetch");

exports.DistrictMap = function (d) {
  let data = JSON.parse(JSON.stringify(d));
  let districtMap = {};
  let lastDay = data[data.length - 1];
  let secondLastDay = data[data.length - 2];
  districtMap["date"] = lastDay["Date"]
  delete lastDay["Date"];
  delete secondLastDay["Date"];
  for (let district of Object.keys(lastDay)) {
    const [x1, x2, x3, x4] = lastDay[district].split(",");
    let entry = {
      Total: Utils.parseIntOpt(x1),
      Active: Utils.parseIntOpt(x2),
      Recovered: Utils.parseIntOpt(x3),
      Deceased: Utils.parseIntOpt(x4),
      Population: Population.POPULATION[district],
    };
    if (Object.keys(secondLastDay).includes(district)) {
      const [y1, y2, y3, y4] = secondLastDay[district].split(",");
      entry["newTotal"] = x1 - y1;
      entry["newActive"] = x2 - y2 + (x3 - y3) + (x4 - y4);
      entry["newRecovered"] = x3 - y3;
      entry["newDeceased"] = x4 - y4;
    }
    districtMap[district] = entry;
  }
  return districtMap;
};

exports.DistrictVariance = function (d) {
  let data = JSON.parse(JSON.stringify(d));
  let variance = {};
  for (let day of data) {
    let date = day["Date"];
    delete day["Date"];
    for (let district of Object.keys(day)) {
      if (!Object.keys(variance).includes(district)) {
        variance[district] = {};
      }
      let [x1, x2, x3, x4] = day[district].split(",");
      variance[district][date] = {
        Total: Utils.parseIntOpt(x1),
        Active: Utils.parseIntOpt(x2),
        Recovered: Utils.parseIntOpt(x3),
        Deceased: Utils.parseIntOpt(x4),
      };
    }
  }
  return variance;
};

exports.DailyMap = function (d) {
  let dateMap = {};
  let data = JSON.parse(JSON.stringify(d));
  data.reverse();
  dateMap[data[0]["Date"]] = Utils.parseIntOpt(data[0]["Samples Positive"]);
  for (let i = 1; i < data.length; i++) {
    dateMap[data[i]["Date"]] =
      Utils.parseIntOpt(data[i]["Samples Positive"]) -
      Utils.parseIntOpt(data[i - 1]["Samples Positive"]);
  }
  return dateMap;
};

exports.VarianceMap = function (d) {
  let data = JSON.parse(JSON.stringify(d));
  data.reverse();
  spData = {
    total: [0],
    active: [0],
    recovered: [0],
    deceased: [0],
  };
  for (let day of data) {
    let tTotal = Utils.parseIntOpt(day["Samples Positive"]);
    let tRecovered = Utils.parseIntOpt(day["Cases Recovered"].split("(")[0]);
    let tDeceased = Utils.parseIntOpt(day["No. of Deaths"].split("(")[0]);
    let tActive = tTotal - (tRecovered + tDeceased);
    let pTotal = spData["total"].reduce((x, y) => {
      return x + y;
    });
    let pRecovered = spData["recovered"].reduce((x, y) => {
      return x + y;
    });
    let pDeceased = spData["deceased"].reduce((x, y) => {
      return x + y;
    });
    let pActive = spData["active"].reduce((x, y) => {
      return x + y;
    });
    spData["total"].push(tTotal - pTotal);
    spData["recovered"].push(tRecovered - pRecovered);
    spData["deceased"].push(tDeceased - pDeceased);
    spData["active"].push(tActive - pActive);
  }
  spData["total"].splice(0, 1);
  spData["recovered"].splice(0, 1);
  spData["deceased"].splice(0, 1);
  spData["active"].splice(0, 1);
  return spData;
};

exports.Samples = function (d) {
  let data = JSON.parse(JSON.stringify(d));
  let samData = {};
  samData["date"] = data[0]["Date"];
  samData["stats"] = {
    total: data[0]["Samples Collected"],
    average: data[0]["Samples Collected"] / data.length,
    new: data[0]["Samples Collected"] - data[1]["Samples Collected"],
    posper: (data[0]["Samples Positive"] * 100) / data[0]["Samples Collected"],
    posper_today:
      ((data[0]["Samples Positive"] - data[1]["Samples Positive"]) * 100) /
      (data[0]["Samples Collected"] - data[1]["Samples Collected"]),
    negper: (data[0]["Samples Negative"] * 100) / data[0]["Samples Collected"],
    // "negper_today": (data[0]["Samples Negative"]-data[1]["Samples Negative"]) *100 / (data[0]["Samples Collected"]-data[1]["Samples Collected"]),
    recper:
      (parseInt(data[0]["Cases Recovered"].split(" ")[0]) * 100) /
      data[0]["Samples Positive"],
    // "recper_today": (parseInt(data[0]["Cases Recovered"].split(" ")[0]) - parseInt(data[1]["Cases Recovered"].split(" ")[0])) * 100 / (data[0]["Samples Positive"]-data[1]["Samples Positive"]),
    decper:
      (parseInt(data[0]["No. of Deaths"].split(" ")[0]) * 100) /
      data[0]["Samples Positive"],
    // "decper_today": (parseInt(data[0]["No. of Deaths"].split(" ")[0]) -parseInt(data[1]["No. of Deaths"].split(" ")[0])) * 100 / (data[0]["Samples Positive"]-data[1]["Samples Positive"])
  };

  // samData["variance"] = {
  //   "total": [0],
  //   "posper": [0],
  //   "negper": [0],
  //   "recper": [0],
  //   "decper": [0],
  // }
  // data.reverse()
  // for(let day of data){
  //   let tTotal = Utils.parseIntOpt(day["Samples Collected"])
  //   let tPosper = Utils.parseIntOpt(day["Samples Positive"])*100 / Utils.parseIntOpt(day["Samples Collected"])
  //   let tNegper = Utils.parseIntOpt(day["Samples Negative"])*100 / Utils.parseIntOpt(day["Samples Collected"])
  //   let tRecper = Utils.parseIntOpt(day["Cases Recovered"].split(" ")[0])*100 / Utils.parseIntOpt(day["Samples Positive"])
  //   let tDecper = Utils.parseIntOpt(day["No. of Deaths"].split(" ")[0])*100 / Utils.parseIntOpt(day["Samples Positive"])
  //   let pTotal = samData["variance"]["total"].reduce((x,y)=>(x+y))
  //   let pPosper = samData["variance"]["posper"].reduce((x,y)=>(x+y))
  //   let pNegper = samData["variance"]["negper"].reduce((x,y)=>(x+y))
  //   let pRecper = samData["variance"]["recper"].reduce((x,y)=>(x+y))
  //   let pDecper = samData["variance"]["recper"].reduce((x,y)=>(x+y))
  //   samData["variance"]["total"].push(tTotal - pTotal)
  //   samData["variance"]["posper"].push(tPosper - pPosper)
  //   samData["variance"]["negper"].push(tNegper - pNegper)
  //   samData["variance"]["recper"].push(tRecper - pRecper)
  // }
  // samData["variance"]["total"].splice(0,1)
  // samData["variance"]["posper"].splice(0,1)
  // samData["variance"]["negper"].splice(0,1)
  // samData["variance"]["recper"].splice(0,1)
  return samData;
};

exports.IndiaData = async function () {
  return fetch("https://api.covid19india.org/data.json")
    .then((r) => r.json())
    .then((data) => {
      return {
        active: data.statewise[0].active,
        recovered: data.statewise[0].recovered,
        deaths: data.statewise[0].deaths,
        total: data.statewise[0].confirmed,
      };
    });
};
exports.WorldData = async function () {
  return fetch("https://coronavirus-19-api.herokuapp.com/all")
    .then((r) => r.json())
    .then((data) => {
      return {
        total: data["cases"],
        deaths: data["deaths"],
        recovered: data["recovered"],
      };
    });
};

exports.totalMap = function (data) {
  d = data[0];
  console.log(d);
  return {
    Total: d["Samples Positive"],
    Active: d["Active Postive"].split(" ")[0],
    Recovered: d["Cases Recovered"].split(" ")[0],
    Deceased: d["No. of Deaths"].split(" ")[0],
  };
};

exports.ageMap = function () {
  // let maleages = data.filter(item=>item["Gender"]==="M").map(item=>{
  //   let matched  = item["Age"].match(/[0-9]+/gm)
  //   if(matched){
  //     return parseInt(matched[0])
  //   }
  // }).filter(item=>(item))
  // let femaleages = data.filter(item=>item["Gender"]==="F").map(item=>{
  //   let matched  = item["Age"].match(/[0-9]+/gm)
  //   if(matched){
  //     return parseInt(matched[0])
  //   }
  // }).filter(item=>(item))
  // let unknownages = data.filter(item=>item["Gender"]==="").map(item=>{
  //   let matched  = item["Age"].match(/[0-9]+/gm)
  //   if(matched){
  //     return parseInt(matched[0])
  //   }
  // }).filter(item=>(item))
  // let ages = [...maleages,...femaleages,...unknownages]
  // let maxAge = Math.max(...ages)
  // let maxRange = Math.ceil((maxAge+1)/10)*10
  // let map = {
  //   "male":{},"female":{},"unknown":{}
  // }
  // for(let i =0; i < maxRange/10; i++){
  //   map["male"][`${i*10}-${(i*10)+9}`] = maleages.filter(item=> (item>=i*10 && item < ((i+1)*10))).length
  //   map["female"][`${i*10}-${(i*10)+9}`] = femaleages.filter(item=> (item>=i*10 && item < ((i+1)*10))).length
  //   map["unknown"][`${i*10}-${(i*10)+9}`] = unknownages.filter(item=> (item>=i*10 && item < ((i+1)*10))).length

  // }
  // console.log(map)
  return {
    male: {
      "0-9": 17,
      "10-19": 43,
      "20-29": 106,
      "30-39": 70,
      "40-49": 58,
      "50-59": 48,
      "60-69": 53,
      "70-79": 23,
      "80-89": 8,
      "90-99": 1,
    },
    female: {
      "0-9": 21,
      "10-19": 45,
      "20-29": 72,
      "30-39": 59,
      "40-49": 45,
      "50-59": 32,
      "60-69": 29,
      "70-79": 16,
      "80-89": 1,
      "90-99": 0,
    },
    unknown: {
      "0-9": 23,
      "10-19": 12,
      "20-29": 20,
      "30-39": 21,
      "40-49": 14,
      "50-59": 4,
      "60-69": 3,
      "70-79": 4,
      "80-89": 0,
      "90-99": 0,
    },
  };
};

exports.genderMap = function () {
  // let genders = data.map(item=>item["Gender"])
  // let map = {
  //   "M": genders.filter(item=>(item==="M")).length,
  //   "F": genders.filter(item=>(item==="F")).length
  // }
  // console.log(map)
  return { M: 495, F: 544 };
};

exports.varianceBeds = function(raw) {
  let arr = Utils.CSVToArray(raw);
  Utils.fillArray(arr[0]);
  Utils.fillArray(arr[1]);
  let totalData = [];
  for(let day = 3; day < arr.length; day++){
    let data = {};
    for (let i = 0; i < arr[0].length; i++) {
      if (!Object.keys(data).includes(arr[0][i])) {
        if (arr[1][i]) data[arr[0][i]] = {};
        else {
          data[arr[0][i]] = arr[day][i];
          continue;
        }
      }
      if (!Object.keys(data[arr[0][i]]).includes(arr[1][i])) {
        if (arr[2][i]) data[arr[0][i]][arr[1][i]] = {};
        else {
          data[arr[0][i]][arr[1][i]] = arr[day][i];
          continue;
        }
      }
      data[arr[0][i]][arr[1][i]][arr[2][i]] = arr[day][i];
    }
    totalData.push(data);
  }
  totalData.reverse();
  totalData = totalData.slice(8)
  return {
    "Dates": totalData.map(data=>data["Date"]),
    "Jammu": {
      "total_available":totalData.map(data=>data["Jammu"]["Covid"]["Available"]),
      "total_occupied":totalData.map(data=>data["Jammu"]["Covid"]["Occupied"]),
      "isolation_occupied": totalData.map(data=>
        parseInt(data["Jammu"]["Isolation"]["Without_O2"])+
        parseInt(data["Jammu"]["Isolation"]["With_O2"])
        ),
      "icu_occupied": totalData.map(data=>
        parseInt(data["Jammu"]["ICU"]["Occupied"])+
        parseInt(data["Jammu"]["ICU"]["Occupied_Ventilator_Non_Invasive"])+
        parseInt(data["Jammu"]["ICU"]["Occupied_Ventilator_Invasive"])
        ),
    },
    "Kashmir": {
      "total_available":totalData.map(data=>data["Kashmir"]["Covid"]["Available"]),
      "total_occupied":totalData.map(data=>data["Kashmir"]["Covid"]["Occupied"]),
      "isolation_occupied": totalData.map(data=>
        parseInt(data["Kashmir"]["Isolation"]["Without_O2"])+
        parseInt(data["Kashmir"]["Isolation"]["With_O2"])
        ),
      "icu_occupied": totalData.map(data=>
        parseInt(data["Kashmir"]["ICU"]["Occupied"])+
        parseInt(data["Kashmir"]["ICU"]["Occupied_Ventilator_Non_Invasive"])+
        parseInt(data["Kashmir"]["ICU"]["Occupied_Ventilator_Invasive"])
        ),
    }
  }
}
exports.beds = function (raw) {
  let arr = Utils.CSVToArray(raw);
  Utils.fillArray(arr[0]);
  Utils.fillArray(arr[1]);
  let data = {};
  for (let i = 0; i < arr[0].length; i++) {
    if (!Object.keys(data).includes(arr[0][i])) {
      if (arr[1][i]) data[arr[0][i]] = {};
      else {
        data[arr[0][i]] = arr[3][i];
        continue;
      }
    }
    if (!Object.keys(data[arr[0][i]]).includes(arr[1][i])) {
      if (arr[2][i]) data[arr[0][i]][arr[1][i]] = {};
      else {
        data[arr[0][i]][arr[1][i]] = arr[3][i];
        continue;
      }
    }
    data[arr[0][i]][arr[1][i]][arr[2][i]] = arr[3][i];
  }
  return data;
};
