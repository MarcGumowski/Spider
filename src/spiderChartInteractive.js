///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// Spider Chart
//
// Marc Gumowski
//
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// The data are loaded in the main .Rmd file under the var name dbplotSpider.
// This script has to be loaded in the main file.
//
// The Radar Chart Function is written by Nadieh Bremer from VisualCinnamon.com,
// inspired by the code of alangrafu 
//
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var margin = {top: 75, right: 125, bottom: 75, left: 125},
	width = Math.min(700, window.innerWidth - 10) - margin.left - margin.right,
	height = Math.min(width, window.innerHeight - margin.top - margin.bottom - 20);
		
var radarChartOptions = {
  w: width,
  h: height,
  margin: margin,
  maxValue: 0.55,
  levels: 11,
  roundStrokes: true,
  labelFactor: 1.25,
  wrapWidth: 100,
  axisName: "description",
  value: "value",
  opacityStroke: 0,
  dotRadius:0,
  opacityArea: 0.6,
  //color: color
};

//Call function to draw the Radar chart
RadarChart("#spiderChartInteractive", dbplotSpider, radarChartOptions);


