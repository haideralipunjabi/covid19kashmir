const API_URL = "https://covidkashmir.org/api/patients/"
const DISTRICTS = ["Baramulla", "Ganderbal", "Bandipora", "Srinagar", "Anantnag", "Budgam", "Doda", "Jammu", "Kathua", "Kishtwar", "Kulgam", "Kupwara", "Pulwama", "Poonch", "Rajouri", "Ramban", "Riasi", "Samba", "Shopian", "Udhampur", "Mirpur", "Muzaffarabad", "Unknown"]
const CHARTS = {
  "chartOne": "Chart1",
  "chartTwo": "Chart2",
  "chartThree": "Chart3",
  "chartFour": "Chart4",
  "chartFive":"Chart5"
}
let patientData, districtMap, dateMap, activeDistricts;


$(document).ready(() => {
  fetch(API_URL).then((response) => {
    return response.text()
  }).then((text) => {
    patientData = ArraysToDict(CSVToArray(text));
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
      (100 * filterDataByStatus(patientData, "Hospitalized").length / patientData.length).toPrecision(4),
      (100 * filterDataByStatus(patientData, "Recovered").length / patientData.length).toPrecision(4),
      (100 * filterDataByStatus(patientData, "Deceased").length / patientData.length).toPrecision(4)
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
    plotOptions: {
      radialBar: {
        dataLabels: {
          name: {
            fontSize: '22px',
          },
          value: {
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
        data: getUnique(patientData,"Date Announced").map(date=>filterDataByStatus(filterDataByDate(patientData,date),"Hospitalized").length)
      }, {
        name: 'Recovered',
        data: getUnique(patientData,"Date Announced").map(date=>filterDataByStatus(filterDataByDate(patientData,date),"Recovered").length)
      },
      {
        name: 'Deaths',
        data: getUnique(patientData,"Date Announced").map(date=>filterDataByStatus(filterDataByDate(patientData,date),"Deceased").length)
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
      categories: getUnique(patientData,"Date Announced")
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
  // var chart = new ApexCharts(document.querySelector("#chart"), options);
  // chart.render();
}

function popup(el){
  $("#popup .modal-content").html($("#"+el).parent().parent().parent().html())
  $("#popup").addClass("is-active")

}

function closePopup(){
  $("#popup").removeClass("is-active")
  $("#popup .modal-content").html("")
}