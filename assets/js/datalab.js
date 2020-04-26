const API_URL = "/.netlify/functions/api"
const LIVE_API = "https://covidkashmir.org/api/live/"
const DISTRICTS = ["Baramulla", "Ganderbal", "Bandipora", "Srinagar", "Anantnag", "Budgam", "Doda", "Jammu", "Kathua", "Kishtwar", "Kulgam", "Kupwara", "Pulwama", "Poonch", "Rajouri", "Ramban", "Riasi", "Samba", "Shopian", "Udhampur", "Mirpur", "Muzaffarabad", "Unknown"]
const CHARTS = {
  "chartOne": "Chart1",
  "chartTwo": "Chart2",
  "chartThree": "Chart3",
  "chartFour": "Chart4",
  // "chartFive": "Chart5",
  "chartSix": "Chart6",
  "chartSeven": "Chart7"
}
let districtMap, dateMap, activeDistricts, liveData, dailyData, ageMap, genderMap;


$(document).ready(() => {
  let sheetPromise = fetch(API_URL + "?fields=districtMap,dailyMap,genderMap,ageMap").then((response) => {
    return response.json()
  })
  let livePromise = fetch(LIVE_API, {
    'mode': 'cors',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  }).then((response) => {
    return response.json()
  })
  Promise.all([sheetPromise, livePromise]).then((values) => {
    data = values[0]
    districtMap = data["districtMap"]
    dateMap = data["dailyMap"]
    ageMap = data["ageMap"],
      genderMap = data["genderMap"]
    liveData = values[1];
    createHolders();
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

function createCharts() {
  let chartOptions = []
  chartOptions[0] = {
    series: [{
      name: 'Active',
      data: Object.values(districtMap).map(item => item["Active"])
    }, {
      name: 'Recovered',
      data: Object.values(districtMap).map(item => item["Recovered"])
    }, {
      name: 'Deaths',
      data: Object.values(districtMap).map(item => item["Deceased"])
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
      categories: Object.keys(districtMap),
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
      min: 0,
      max: 40,
      title: {
        text: 'No. of cases',
      },
    }
  };
  chartOptions[2] = {
    series: [{
      name: 'Cases',
      data: Object.values(districtMap).map(item => item["Total"])
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
      categories: Object.keys(districtMap)
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
    legend: {
      show: true,
    },
    plotOptions: {
      radialBar: {
        dataLabels: {
          name: {
            show: true,
            fontSize: '22px',
          },
          value: {
            show: true,
            fontSize: '16px',
          },
          total: {
            show: true,
            label: 'Total',
            formatter: function (w) {
              return liveData["Total"]
            }
          }
        }
      }
    },
    labels: ["Active", "Recovered", "Deceased"],
    responsive: [{
      breakpoint: 500,
      options: {
        legend: {
          position: "bottom"
        }
      }
    }]
  };
  // chartOptions[4] = {
  //   series: [{
  //       name: 'Active',
  //       data: dailyData["active"]
  //     }, {
  //       name: 'Recovered',
  //       data: dailyData["recovered"]
  //     },
  //     {
  //       name: 'Deceased',
  //       data: dailyData["deceased"]
  //     }
  //   ],
  //   chart: {
  //     height: 350,
  //     type: 'area'
  //   },
  //   dataLabels: {
  //     enabled: false
  //   },
  //   title: {
  //     text: "Daily Plot of Cases"
  //   },
  //   subtitle: {
  //     text: "Source: covidkashmir.org"
  //   },
  //   stroke: {
  //     curve: 'smooth'
  //   },
  //   xaxis: {
  //     categories: dailyData["Dates"]
  //   },
  //   tooltip: {
  //     x: {
  //       format: 'dd/MM/yy'
  //     },
  //   },
  // };
  // chartOptions[4]={}
  chartOptions[4] = {
    series: [{
      name: 'Male',
      data: Object.values(ageMap["male"])
    },{
      name: 'Female',
      data: Object.values(ageMap["female"])
    },{
      name: 'Unknown',
      data: Object.values(ageMap["unknown"])
    }],
    chart: {
      type: 'bar',
      height: 350,
      stacked: true,
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '55%',
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
      categories: Object.keys(ageMap["male"]),
    },
    yaxis: {
      title: {
        text: 'No of patients'
      }
    },
    title: {
      text: "No. of Patients in various age groups"
    },
    subtitle: {
      text: `Note: ${liveData["Total"] - (Object.values(ageMap["male"]).reduce((x,y)=>x+y)+Object.values(ageMap["female"]).reduce((x,y)=>x+y)+Object.values(ageMap["unknown"]).reduce((x,y)=>x+y))} have unknown age | Source: covidkashmir.org`
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
  console.log(genderMap)
  chartOptions[5] = {
    series: [...Object.values(genderMap), liveData["Total"]-Object.values(genderMap).reduce((x,y)=>x+y)],
    labels: ["Male", "Female","Unknown"],
    responsive: [{
      breakpoint: 500,
      options: {
        legend: {
          position: "bottom"
        }
      }
    }],
    chart: {
      type: 'donut',
      height: 350,
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
    dataLabels: {
      enabled: false,
    },
    plotOptions: {
      pie: {
        donut: {
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: '22px',
            },
            value: {
              show: true,
              fontSize: '16px',
            },
            total: {
              show: true,
              label: 'Total',
              formatter: function (w) {
                return liveData["Total"]
              }
            }
          },
        }
      }
    },
    title: {
      text: "Gender of Patients"
    },
    subtitle: {
      text: `Source: covidkashmir.org`
    },
    fill: {
      opacity: 1
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