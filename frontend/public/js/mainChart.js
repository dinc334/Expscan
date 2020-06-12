"use strict";
$(document).ready(function(){
	function drawChart(block,url){ 
		$.ajax({
			url: url,
			type: 'GET',
			success: function (response) {
				console.log(response)
				if(response.success == true) {
					var chart = Highcharts.chart(block, {
					chart: {
						type: 'line',
						spacingBottom: 0,
						spacingTop:0,
						spacingLeft:0,
						spacingRight:0,
						backgroundColor: null
					},
		    	tooltip: {
		    		textAlign: 'center',
				    formatter: function() {
	              return '<span style="font-size:11px">' + formatTime(this.point.x) + '</span><br><table><tr><td style="padding:0">' +
	                  '<span style="color:' + this.series.color + '">Transactions: </a></span><b>' + this.point.y + '</b><br>'
	              '</td></tr></table>';
				    }
					},
		    	navigator: {enabled: false},
		    	legend: {enabled: false},
		    	credits: {enabled: false},
		    	title: {
		        	text: "7 days Expanse Transaction History",
		        	style: {
		        		fontSize: '13px'
		        	}
			    },
	        xAxis: {
	        	type: 'datetime',
	        	dateTimeLabelFormats: {
	            day: '%e/%m'
	        	},
	          title: {text: " "}
	         },
	        yAxis: {
	        	labels: {enabled: true},
	        	title: {text:null}
	        },

	        plotOptions: {
			 	// здесь нужно указать период по времени с какого по какое
				 		series: {
				 			animation: {
				 				duration: 0
				 			}
				 		},
				 		column: {
				 			pointPadding: 0.1,
				 			borderWidth: 0
				 		}
			    },
			    series: [{
			    	data: response.data,
			        name: 'Transactions',
			        type: 'line',
			      	color: '#DC5100',
			      	allowPointSelect: true,
			    	}]
					});
			} else {
				if(response.reason) {
					console.log(response.reason)
				}
			}
			}
		})
	} 
	drawChart('highchart','/admin/api/chart/txs7');

	function formatTime(time) {
		let date = new Date();
		date.setTime(time);
		return (date.getFullYear()+"-"+(date.getMonth()+1)+"-"+date.getDate());
	}
});