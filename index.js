import Datamap from 'datamaps'
import CSV from 'csv-string'
import polylabel from 'polylabel'

window.Datamap = Datamap

//$(document.body).append("<h1>Hello World again v2!</h1>");

//var map = new Datamap({element: document.getElementById('container')});
/*
var country_list = Datamap.prototype.worldTopo.objects.world.geometries.map((x) => [x.id, x.properties.name])
var country_id_list = country_list.map(x => x[0])
var country_name_to_id = {}
for (let [country_id,country_name] of country_list) {
  country_name_to_id[country_name] = country_id
}
*/
/*
var country_aliases = {
  // supported country names are at http://datamaps.github.io/scripts/0.4.4/datamaps.world.js
  "UAE": "United Arab Emirates",
  "Singapore": "Malaysia",
  "Hong Kong": "China",
  "USA": "United States of America",
  "Serbia": "Republic of Serbia",
  "UK": "United Kingdom",
  "Palestine": "Israel"
}
*/

var country_aliases = {
  // https://raw.githubusercontent.com/lukes/ISO-3166-Countries-with-Regional-Codes/master/all/all.json
  "Vietnam": "Viet Nam",
  "Palestine": "Israel",
  "Iran": "Iran (Islamic Republic of)",
  "Russia": "Russian Federation",
  "South Korea": "Korea (Republic of)",
  "Taiwan": "Taiwan, Province of China",
  "UAE": "United Arab Emirates",
  "UK": "United Kingdom of Great Britain and Northern Ireland",
  "USA": "United States of America",
  "Venezuela": "Venezuela (Bolivarian Republic of)",
  "Hong Kong": "China",
}

/*
let arc_id_to_arc_array = Datamap.prototype.worldTopo.arcs
let country_id_to_polygon = {}
for (let country_info of Datamap.prototype.worldTopo.objects.world.geometries) {
  let polygon = {}
  polygon.coordinates = country_info.arcs.map(coordinate_id_array => coordinate_id_array.map(arc_id => arc_id_to_arc_array[arc_id]))
  country_id_to_polygon[country_info.id] = polygon
}
let country_id_to_center = {}
if (localStorage.country_id_to_center) {
  country_id_to_center = JSON.parse(localStorage.country_id_to_center)
} else {
  for (let country_id of country_id_list) {
    var polygon = country_id_to_polygon[country_id]
    country_id_to_center[country_id] = polylabel(polygon.coordinates, 1.0)
  }
  localStorage.country_id_to_center = JSON.stringify(country_id_to_center)
}
//console.log(country_id_to_polygon)
*/

async function main() {
  let data_request = await fetch('CRP_Participants - Countries Final.csv')
  let data_text = await data_request.text()
  let country_codes_map_request = await fetch('country_codes.json')
  let country_codes_map = await country_codes_map_request.json()
  let country_name_to_id = {}
  for (let country_info of country_codes_map) {
    country_name_to_id[country_info.name] = country_info['alpha-2']
  }
  /*
  let country_label_points_request = await fetch('ne_10m_admin_0_label_points-country.json')
  let country_label_points_text = await country_label_points_request.text()
  let country_id_to_center = {}
  for (let country_info of JSON.parse(country_label_points_text).features) {
    country_id_to_center[country_info.properties.sr_brk_a3] = country_info.geometry.coordinates
  }
  */
  let country_id_to_num_participants = {}
  for (let [country, count] of CSV.parse(data_text)) {
    count = parseInt(count)
    if (country_aliases[country]) {
      country = country_aliases[country]
    }
    let country_id = country_name_to_id[country]
    if (!country_id) {
      console.log(country)
    }
    if (!country_id_to_num_participants[country_id]) {
      country_id_to_num_participants[country_id] = 0
    }
    country_id_to_num_participants[country_id] += count
  }
  let data = []
  for (let country_id of Object.keys(country_id_to_num_participants)) {
    let count = country_id_to_num_participants[country_id]
    data.push({code: country_id, z: count})
  }
  console.log(data)

Highcharts.theme = {
   colors: ['#cf542b', '#8085e9', '#8d4654', '#7798BF', '#aaeeee', '#ff0066', '#eeaaee',
      '#55BF3B', '#DF5353', '#7798BF', '#aaeeee'],
   chart: {
      backgroundColor: null,
      style: {
         fontFamily: 'Signika, serif'
      }
   },
   title: {
      style: {
         color: 'black',
         fontSize: '16px',
         fontWeight: 'bold'
      }
   },
   subtitle: {
      style: {
         color: 'black'
      }
   },
   tooltip: {
      borderWidth: 0
   },
   legend: {
      itemStyle: {
         fontWeight: 'bold',
         fontSize: '13px'
      }
   },
   xAxis: {
      labels: {
         style: {
            color: '#6e6e70'
         }
      }
   },
   yAxis: {
      labels: {
         style: {
            color: '#6e6e70'
         }
      }
   },
   plotOptions: {
      series: {
         shadow: true
      },
      candlestick: {
         lineColor: '#404048'
      },
      map: {
         shadow: false
      }
   },

   // Highstock specific
   navigator: {
      xAxis: {
         gridLineColor: '#D0D0D8'
      }
   },
   rangeSelector: {
      buttonTheme: {
         fill: 'white',
         stroke: '#C0C0C8',
         'stroke-width': 1,
         states: {
            select: {
               fill: '#D0D0D8'
            }
         }
      }
   },
   scrollbar: {
      trackBorderColor: '#C0C0C8'
   },

   // General
   background2: '#F5F5F5'

};

// Apply the theme
Highcharts.setOptions(Highcharts.theme);

  Highcharts.mapChart('container', {
        chart: {
            borderWidth: 0,
            map: 'custom/world',
            backgroundColor: 'white'
        },
        title: {
          text: ''
        },
        //title: {
        //    text: 'Participation by Country'
        //},

        //subtitle: {
        //    text: 'Demo of Highcharts map with bubbles'
        //},

        legend: {
            enabled: false
        },

        mapNavigation: {
            enabled: true,
            buttonOptions: {
                verticalAlign: 'bottom'
            }
        },

        series: [{
            name: 'Countries',
            color: '#F5F5F5',
            //nullColor: '#FFFFFF',
            enableMouseTracking: false
        }, {
            type: 'mapbubble',
            name: 'Population 2013',
            joinBy: ['iso-a2', 'code'],
            data: data,
            minSize: 8,
            maxSize: '13%',
            tooltip: {
                pointFormat: '{point.code}: {point.z}'
            }
        }]
    });
}

main()

setTimeout(() => {
  for (var x of $('path.highcharts-point')) {
    if ($(x).hasClass('highcharts-color-0')) { // point
      $(x).attr('fill', '#A23325')
    } else { // country
      $(x).attr('fill', '#EFEFF0')
    }
  }
}, 3000)

