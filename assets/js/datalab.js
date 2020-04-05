const API_URL = "https://covidkashmir.org/api/patients/"
const LIVE_API = "https://covidkashmir.org/api/live/"
const STATS_API = "https://covidkashmir.org/api/bulletin"
const DISTRICTS = ["Baramulla", "Ganderbal", "Bandipora", "Srinagar", "Anantnag", "Budgam", "Doda", "Jammu", "Kathua", "Kishtwar", "Kulgam", "Kupwara", "Pulwama", "Poonch", "Rajouri", "Ramban", "Riasi", "Samba", "Shopian", "Udhampur", "Mirpur", "Muzaffarabad", "Unknown"]
const CHARTS = {
  "chartOne": "Chart1",
  "chartTwo": "Chart2",
  "chartThree": "Chart3",
  "chartFour": "Chart4",
  "chartFive": "Chart5"
}
let patientData, districtMap, dateMap, activeDistricts, liveData, statsData,dailyData;


$(document).ready(() => {
  let sheetPromise = fetch(API_URL).then((response) => {
    return response.text()
  })
  let statsPromise = fetch(STATS_API).then((response) => {
    return response.text()
  })
  let livePromise = fetch(LIVE_API, {
    'mode': 'cors',
    headers : { 
      'Content-Type': 'application/json',
      'Accept': 'application/json'
     }
  }).then((response) => {
    return response.json()
  })
  Promise.all([sheetPromise, livePromise,statsPromise]).then((values) => {
    patientData = ArraysToDict(CSVToArray(values[0]));
    liveData = values[1];
    statsData = ArraysToDict(CSVToArray(values[2])).reverse();
    createHolders();
    createUnknowns();
    createData();
    createCharts()
  });
})

function createHolders() {
  for (let key of Object.keys(CHARTS)) {
    $("#charts-container").append(
      `
      <div class="column is-half">
        <div class="card">
          <div class="card-content">
            <div id="${key}">
            </div>
          </div> 
        </div>
        
    </div>
      `
    )
  }
}

function createUnknowns() {
  patitentData = patientData.map(item => {
    if (item["District"] === "") item["District"] = "Unknown"
    return item;
  })
}

function filterDataByDistrict(data, district) {
  return data.filter(item => {
    return item["District"] === district
  })
}

function filterDataByStatus(data, status) {
  return data.filter(item => {
    return item["Status"] === status
  })
}

function filterDataByDate(data, date) {
  return data.filter(item => {
    return item["Date Announced"] === date
  })
}

function getUnique(data, key) {
  return data.map((item) => {
    return item[key]
  }).filter((value, index, self) => {
    return self.indexOf(value) === index
  });
}

function createData() {
  districtMap = {}
  for (let district of DISTRICTS) {
    let districtData = filterDataByDistrict(patientData, district);
    districtMap[district] = {
      "Total": districtData.length,
      "Active": filterDataByStatus(districtData, "Hospitalized").length,
      "Recovered": filterDataByStatus(districtData, "Recovered").length,
      "Deceased": filterDataByStatus(districtData, "Deceased").length
    }
  }
  dateMap = {}
  for (let date of getUnique(patientData, "Date Announced")) {
    dateMap[date] = filterDataByDate(patientData, date).length
  }
  activeDistricts = Object.keys(districtMap).filter(key => (districtMap[key]["Total"] > 0))
  dailyData = {
    "Dates": statsData.map(item => parseIntOpt(item["Date"])),
    "Total": statsData.map(item => parseIntOpt(item["Samples Positive"])),
    "Active": statsData.map(item=>{
      return parseIntOpt(item["Samples Positive"]) - (parseIntOpt(item["Cases Recovered"])+parseIntOpt(item["No. of Deaths"]))
    }),
    "Recovered": statsData.map(item => parseIntOpt(item["Cases Recovered"])),
    "Deceased":statsData.map(item => parseIntOpt(item["No. of Deaths"]))
  }

}

function filteredData(kind, key) {
  data = {}
  if (kind = "status") {
    for (let district of DISTRICTS) {
      data[district] = districtMap[district][key]
    }
  }
  return data
}

function createCharts() {
  let chartOptions = []
  chartOptions[0] = {
    series: [{
      name: 'Active',
      data: Object.values(districtMap).filter(item => item["Total"] > 0).map(item => item["Active"])
    }, {
      name: 'Recovered',
      data: Object.values(districtMap).filter(item => item["Total"] > 0).map(item => item["Recovered"])
    }, {
      name: 'Deaths',
      data: Object.values(districtMap).filter(item => item["Total"] > 0).map(item => item["Deceased"])
    }],
    chart: {
      type: 'bar',
      height: 350
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '55%',
        endingShape: 'rounded'
      },
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent']
    },
    xaxis: {
      categories: activeDistricts,
    },
    yaxis: {
      title: {
        text: 'No of cases'
      }
    },
    title: {
      text: "No. of Different Types of Cases / District"
    },
    subtitle: {
      text: "Source: covidkashmir.org"
    },
    fill: {
      opacity: 1
    },
    tooltip: {
      y: {
        formatter: function (val) {
          return val + " cases"
        }
      }
    }
  };
  chartOptions[1] = {
    series: [{
      name: 'Case',
      data: Object.values(dateMap)
    }],
    chart: {
      height: 350,
      type: 'line',
    },
    stroke: {
      width: 7,
      curve: 'smooth'
    },
    xaxis: {
      categories: Object.keys(dateMap)
    },
    title: {
      text: "Cases Announced Daily"
    },
    subtitle: {
      text: "Source: covidkashmir.org"
    },
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'dark',
        gradientToColors: ['#FDD835'],
        shadeIntensity: 1,
        type: 'horizontal',
        opacityFrom: 1,
        opacityTo: 1,
        stops: [0, 100, 100, 100]
      },
    },
    markers: {
      size: 4,
      colors: ["#FFA41B"],
      strokeColors: "#fff",
      strokeWidth: 2,
      hover: {
        size: 7,
      }
    },
    yaxis: {
      min: -10,
      max: 40,
      title: {
        text: 'No. of cases',
      },
    }
  };
  chartOptions[2] = {
    series: [{
      name: 'Cases',
      data: Object.values(filteredData("status", "Total")).filter(count => (count > 0))
    }],
    chart: {
      height: 350,
      type: 'radar',
    },
    dataLabels: {
      enabled: true
    },
    plotOptions: {
      radar: {
        size: 140,
        polygons: {
          strokeColor: '#e9e9e9',
          fill: {
            colors: ['#f8f8f8', '#fff']
          }
        }
      }
    },
    title: {
      text: "No. of Total Types of Cases / District"
    },
    subtitle: {
      text: "Source: covidkashmir.org"
    },
    colors: ['#FF4560'],
    markers: {
      size: 4,
      colors: ['#fff'],
      strokeColor: '#FF4560',
      strokeWidth: 2,
    },
    tooltip: {
      y: {
        formatter: function (val) {
          return val
        }
      }
    },
    xaxis: {
      categories: activeDistricts
    },
    yaxis: {
      tickAmount: 7,
      labels: {
        formatter: function (val, i) {
          if (i % 2 === 0) {
            return val
          } else {
            return ''
          }
        }
      }
    }
  };
  chartOptions[3] = {
    series: [
      (100 * liveData["Active"] / liveData["Total"]).toPrecision(4),
      (100 * liveData["Recovered"] / liveData["Total"]).toPrecision(4),
      (100 * liveData["Deceased"] / liveData["Total"]).toPrecision(4)
    ],
    chart: {
      height: 350,
      type: 'radialBar',
      toolbar: {
        show: true,
        offsetX: 0,
        offsetY: 0,
        tools: {
          download: true,
          selection: false,
          zoom: false,
          zoomin: false,
          zoomout: false,
          pan: false,
          reset: false
        }
      },
    },
    title: {
      text: "Overall Percentage of Cases"
    },
    subtitle: {
      text: "Source: covidkashmir.org"
    },
    legend:{
      show:true,
    },
    plotOptions: {
      radialBar: {
        dataLabels: {
          name: {
            show:true,
            fontSize: '22px',
          },
          value: {
            show:true,
            fontSize: '16px',
          },
          total: {
            show: true,
            label: 'Total',
            formatter: function (w) {
              return patientData.length
            }
          }
        }
      }
    },
    labels: ["Active", "Recovered", "Deceased"],
  };
  chartOptions[4] = {
    series: [{
        name: 'Active',
        data: dailyData["Active"]
      }, {
        name: 'Recovered',
        data: dailyData["Recovered"]
      },
      {
        name: 'Deceased',
        data: dailyData["Deceased"]
      }
    ],
    chart: {
      height: 350,
      type: 'area'
    },
    dataLabels: {
      enabled: false
    },
    title: {
      text: "Daily Plot of Cases"
    },
    subtitle: {
      text: "Source: covidkashmir.org"
    },
    stroke: {
      curve: 'smooth'
    },
    xaxis: {
      categories: dailyData["Dates"]
    },
    tooltip: {
      x: {
        format: 'dd/MM/yy'
      },
    },
  };

  let keys = Object.keys(CHARTS);
  for (let key of keys) {
    new ApexCharts(document.querySelector("#" + key), chartOptions[keys.indexOf(key)]).render()
  }
}

function popup(el) {
  $("#popup .modal-content").html($("#" + el).parent().parent().parent().html())
  $("#popup").addClass("is-active")

}

function closePopup() {
  $("#popup").removeClass("is-active")
  $("#popup .modal-content").html("")
}