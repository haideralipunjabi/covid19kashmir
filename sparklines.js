const API_URL2 = "https://covidkashmir.org/api/patients";
$.ajax({

    type: 'GET',

    url: API_URL2,

    dataType: 'text',

    error: function (e) {
        //alert('An error occurred while processing API calls');
        console.log("API call Failed: ", e);
    },

    success: function (data) {

        const dataArray = $.csv.toObjects(data);
        const groupedByDate = groupBy(dataArray, 'Date Announced');
        let days = splitData(getDailyData(dataArray),0);
        let totalCases = splitData(getDailyData(dataArray),1);
        const dailyActive = days.map((each) => {
            return groupBy(groupedByDate[each],'Status')['Hospitalized'] ? groupBy(groupedByDate[each],'Status')['Hospitalized'].length : 0;
        });
        const dailyRecovered = days.map((each) => {
            return groupBy(groupedByDate[each],'Status')['Recovered'] ? groupBy(groupedByDate[each],'Status')['Recovered'].length : 0;
        });
        const dailyDead = days.map((each) => {
            return groupBy(groupedByDate[each],'Status')['Deceased'] ? groupBy(groupedByDate[each],'Status')['Deceased'].length : 0;
        });
        console.log(dailyRecovered,dailyDead)
        var options1 = {
                series: [{
                data: dailyActive
                }],
                chart: {
                type: 'line',
                width: 100,
                height: 35,
                sparkline: {
                    enabled: true
                }
                },
                colors: ['#007bff'],
                tooltip: {
                fixed: {
                    enabled: false
                },
                x: {
                    show: false
                },
                y: {
                    title: {
                    formatter: function (seriesName) {
                        return ''
                    }
                    }
                },
                marker: {
                    show: false
                }
                }
                };

                var chart1 = new ApexCharts(document.querySelector("#dailyActive"), options1);
                chart1.render();
                var options4 = {
                    series: [{
                    data: totalCases
                    }],
                    chart: {
                    type: 'line',
                    width: 100,
                    height: 35,
                    sparkline: {
                        enabled: true
                    }
                    },
                    colors: ['#FF073A'],
                    tooltip: {
                    fixed: {
                        enabled: false
                    },
                    x: {
                        show: false
                    },
                    y: {
                        title: {
                        formatter: function (seriesName) {
                            return ''
                        }
                        }
                    },
                    marker: {
                        show: false
                    }
                    }
                    };
    
                    var chart4 = new ApexCharts(document.querySelector("#totalCases"), options4);
                    chart4.render();
        var options2 = {
            series: [{
            data: dailyRecovered
        }],
            chart: {
            type: 'line',
            width: 100,
            height: 35,
            sparkline: {
            enabled: true
            }
        },
        colors: ['#28a745'],
        tooltip: {
            fixed: {
            enabled: false
            },
            x: {
            show: false
            },
            y: {
            title: {
                formatter: function (seriesName) {
                return ''
                }
            }
            },
            marker: {
            show: false
            }
        }
        };

        var chart2 = new ApexCharts(document.querySelector("#dailyRecovered"), options2);
        chart2.render();
        var options3 = {
            series: [{
            data: dailyDead
        }],
            chart: {
            type: 'line',
            width: 100,
            height: 35,
            sparkline: {
            enabled: true
            }
        },
            colors: ['#6c757d'],
        tooltip: {
            fixed: {
            enabled: false
            },
            x: {
            show: false
            },
            y: {
            title: {
                formatter: function (seriesName) {
                return ''
                }
            }
            },
            marker: {
            show: false
            }
        }
        };

        var chart3 = new ApexCharts(document.querySelector("#dailyDead"), options3);
        chart3.render();

    } // end: Ajax success API call
    
}); // end: of Ajax call
function groupBy(objectArray, property) {
    return objectArray.reduce(function (acc, obj) {
      let key = obj[property]
      if (!acc[key]) {
        acc[key] = []
      }
      acc[key].push(obj)
      return acc
    }, {})
  }
  
const getDailyData = (data) => {
    const arr = data.map((each) => {
        return each['Date Announced'];
    });
    const map = arr.reduce((acc, e) => acc.set(e, (acc.get(e) || 0) + 1), new Map());
    const days = Array.from(map.entries());
    return days;
}
const splitData = (arr,index) => {
    const data = arr.map((each)=>{
        return each[index];
});
  return data;
};
      