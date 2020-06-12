"use strict";
$(document).ready(function(){
	function drawChart(block,url){ 
		$.ajax({
			url: url,
			type: 'GET',
			success: function (response) {
				if(response.success == true) {
					var chart = Highcharts.chart(block, {
					chart: {
						zoomType: 'x',
						resetZoomButton: {
							position: {
								align: 'right',
								verticalAlign: 'top',
								x: -55,
								y: 10
							},
							relativeTo: 'chart'
						}
					},
		    	tooltip: {
		    		textAlign: 'center',
				    formatter: function() {
				    	const html = '<table>'+
				    	'<tr><td>'+(new Date(this.point.x).toUTCString()).split('00')[0]+'</td></tr><br>'+
				    	'<tr><td><span style="color:'+this.series.color+'">[ '+response.type+":</span> "+new Intl.NumberFormat('us-US').format(parseInt(this.point.y))+' ]</td></tr>'+
				    	'</table>'
				      return html;
				    }
					},
		    	navigator: { enabled: false },
		    	legend: { enabled: false },
		    	credits: { enabled: false },
		    	title: {text: response.title },
	        xAxis: {
	        	type: 'datetime',
	          minRange: 14*24*3600000

	         },
	        yAxis: {
	        	min: 0,
	        	title: {text: response.yAxis}
	        },

	        plotOptions: {
				 		area: {
              fillColor: {
                  linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                  stops: [
                      [0, Highcharts.getOptions().colors[0]],
                      [1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
                  ]
              },
              marker: {
                  radius: 2
              },
              lineWidth: 1,
              states: {
                  hover: {
                      lineWidth: 1
                  }
              },
              threshold: null
          	}
			    },
			    series: [{
				    	type: 'area',
				    	turboThreshold: 7000,
			    		data: response.data,
			        name: response.type+'Chart',
			    	}]
					});
			} 
			}
		})
	} 
	drawChart('difficulty','/admin/api/chart/difficulty');
	drawChart('txs','/admin/api/chart/txsall');
	drawChart('fees','/admin/api/chart/fees');
	// drawChart('miners','/admin/api/chart/miners');
});