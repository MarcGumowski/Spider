/////////////////////////////////////////////////////////
/////////////// The Radar Chart Function ////////////////
/////////////// Written by Nadieh Bremer ////////////////
////////////////// VisualCinnamon.com ///////////////////
/////////// Inspired by the code of alangrafu ///////////
/////////////////////////////////////////////////////////
//
// Small modifications by Marc Gumowski
//
////////////////////////////////////////////////////////


function RadarChart(id, data, options) {
  
	var cfg = {
	 w: 800,				//Width of the circle
	 h: 800,				//Height of the circle
	 margin: {top: 20, right: 20, bottom: 20, left: 20}, //The margins around the circle
	 levels: 4,				//How many levels or inner circles should there be drawn
	 maxValue: 0, 				//What is the value that the biggest circle will represent
	 labelFactor: 1.25, 			//How much farther than the radius of the outer circle should the labels be placed
	 wrapWidth: 60, 			//The number of pixels after which a label needs to be given a new line
	 opacityArea: 0.35, 			//The opacity of the area of the blob
	 opacityStroke: 1,     	//The opacity of the stroke of the blob
	 opacityPoint: 1,       	//The opacity of the points of the blob
	 dotRadius: 4, 				//The size of the colored circles of each blob
	 opacityCircles: 0.05, 			//The opacity of the circles of each blob
	 strokeWidth: 2, 			//The width of the stroke around each blob
	 roundStrokes: false,			//If true the area and stroke will follow a round path (cardinal-closed)
	 color: d3.scaleOrdinal(d3.schemeCategory10),		//Color function
	 axisName: "axis",
	 value: "value",
	 sortAreas: true,
	};
	
	//Put all of the options into a variable called cfg
	if('undefined' !== typeof options){
	  for(var i in options){
		if('undefined' !== typeof options[i]){ cfg[i] = options[i]; }
	  }//for i
	}//if
	
	//Map the fields specified in the configuration 
	// to the axis and value variables
	var axisName = cfg.axisName,
			areaName = cfg.areaName,
			value = cfg.value;

	//Calculate the average value for each area
	data.forEach(function(d){
		d[value + "Average"] = d3.mean(d.values, function(e){ return e[value] }); 
	});

	//Sort the data for the areas from largest to smallest
	//by average value as an approximation of actual blob area
	//so that that the smallest area is drawn last
	//and therefore appears on top
	data = data.sort(function(a, b){
		var a = a[value + "Average"],
				b = b[value + "Average"];
		return b - a;
	});
	
	//Convert the nested data passed in
	// into an array of values arrays
	data = data.map(function(d) { return d.values });

	//If the supplied maxValue is smaller than the actual one, replace by the max in the data
	var maxValue = Math.max(cfg.maxValue, d3.max(data, function(i){
		return d3.max(i.map(
			function(o){ return o[value]; }
		));
	}));
		
	var allAxis = (data[0].map(function(d, i){ return d[axisName]; })),	//Names of each axis
		total = allAxis.length,					//The number of different axes
		radius = Math.min(cfg.w/2, cfg.h/2), 			//Radius of the outermost circle
		format = d3.format('.0%'),			 	//Percentage formatting
		angleSlice = Math.PI * 2 / total;			//The width in radians of each "slice"

	//Scale for the radius
	var rScale = d3.scaleLinear()
		.range([0, radius])
		.domain([0, maxValue]);
		
		
	/////////////////////////////////////////////////////////
	//////////// Create the container SVG and g /////////////
	/////////////////////////////////////////////////////////

	//Remove whatever chart with the same id/class was present before
	d3.select(id).select("svgSpider").remove();
	
	//Iniate div
	var divSpider = d3.select('#spiderChartInteractive').append('div')
    .attr('class', 'tooltip')
    .style('opacity', 0);
    
	//Initiate the radar chart SVG
	var svgSpider = d3.select(id).append("svg")
	    .attr('id', 'spiderChartInteractiveSvg')
			.attr("width",  cfg.w + cfg.margin.left + cfg.margin.right)
			.attr("height", cfg.h + cfg.margin.top + cfg.margin.bottom);
	
  //Append a g element		
	var gSpider = svgSpider.append("g")
			.attr("transform", "translate(" + (cfg.w/2 + cfg.margin.left) + "," + (cfg.h/2 + cfg.margin.top) + ")");
	
	/////////////////////////////////////////////////////////
	////////// Glow filter for some extra pizzazz ///////////
	/////////////////////////////////////////////////////////
	
	//Filter for the outside glow
	var filter = gSpider.append('defs').append('filter').attr('id','glow'),
		feGaussianBlur = filter.append('feGaussianBlur').attr('stdDeviation','0').attr('result','coloredBlur'),
		feMerge = filter.append('feMerge'),
		feMergeNode_1 = feMerge.append('feMergeNode').attr('in','coloredBlur'),
		feMergeNode_2 = feMerge.append('feMergeNode').attr('in','SourceGraphic'); 

	/////////////////////////////////////////////////////////
	/////////////// Draw the Circular grid //////////////////
	/////////////////////////////////////////////////////////
	
	//Wrapper for the grid & axes
	var axisGrid = gSpider.append("g").attr("class", "axisWrapper");
	
	//Draw the background circles
	axisGrid.selectAll(".levels")
	   .data(d3.range(1,(cfg.levels+1)).reverse())
	   .enter()
		.append("circle")
		.attr("class", "gridCircle")
		.attr("r", function(d, i){return radius/cfg.levels*d;})
		.style("fill", "#CDCDCD")
		.style("stroke", "#CDCDCD")
		.style("fill-opacity", cfg.opacityCircles)
		.style("filter" , "url(#glow)");

  
  /////////////////////////////////////////////////////////
  //////////////////// Draw the axes //////////////////////
  /////////////////////////////////////////////////////////
	
	//Create the straight lines radiating outward from the center
	var axis = axisGrid.selectAll(".axis")
		.data(allAxis)
		.enter()
		.append("g")
		.attr("class", "axis");
		
	//Append the lines
	axis.append("line")
		.attr("x1", 0)
		.attr("y1", 0)
		.attr("x2", function(d, i){ return rScale(maxValue*1.1) * Math.cos(angleSlice*i - Math.PI/2); })
		.attr("y2", function(d, i){ return rScale(maxValue*1.1) * Math.sin(angleSlice*i - Math.PI/2); })
		.attr("class", "line")
		.style("stroke", "white")
		.style("stroke-width", "2px");

	//Append the labels at each axis
	axis.append("text")
		.attr("class", "legend")
		.style("font-size", "10px")
		.style("font", "calibri")
		.style("fill", "#666666")
		.attr("text-anchor", "middle")
		.attr("dy", "0.35em")
		.attr("x", function(d, i){ return rScale(maxValue * cfg.labelFactor) * Math.cos(angleSlice*i - Math.PI/2); })
		.attr("y", function(d, i){ return rScale(maxValue * cfg.labelFactor) * Math.sin(angleSlice*i - Math.PI/2); })
		.text(function(d){ return d; })
		.call(wrap, cfg.wrapWidth);
		
	//Text indicating at what % each level is
	axisGrid.selectAll(".axisLabel")
	   .data(d3.range(1,(cfg.levels+1)).reverse())
	   .enter().append("text")
	   .attr("class", "axisLabel")
	   .attr("x", 4)
	   .attr("y", function(d){return -d*radius/cfg.levels;})
	   .attr("dy", "0.4em")
	   .style("font-size", "10px")
	   .style("font","calibri")
	   .style("fill", "#666666")
	   .text(function(d,i) { 
    //console.log('d: '+ d + ' levels : ' + cfg.levels);
    return format(maxValue * d/cfg.levels); 
  });

	/////////////////////////////////////////////////////////
	///////////// Draw the radar chart blobs ////////////////
	/////////////////////////////////////////////////////////
	
	//The radial line function
	var radarLine = d3.radialLine()
	  .curve(d3.curveLinearClosed)
		.radius(function(d) { return rScale(d.value); })
		.angle(function(d,i) {	return i*angleSlice; });
		
	if(cfg.roundStrokes) {
		radarLine.curve(d3.curveCardinalClosed);
	}
				
	//Create a wrapper for the blobs	
	var blobWrapper = gSpider.selectAll(".radarWrapper")
		.data(data)
		.enter().append("g")
		.attr("class", "radarWrapper");
			
	//Append the backgrounds	
	blobWrapper
		.append("path")
		.attr("class", function(d) {
		  return "radarArea spiderArea" + d[0].id; })
		.attr("d", function(d,i) { return radarLine(d); })
		.style("fill", function(d,i) { return cfg.color(dbplotSpider[i].values[0].id); })
		.style("fill-opacity", cfg.opacityArea)
		.on('mouseover', mouseoverSpiderBlob)
		.on('mousemove', mousemoveSpiderBlob)
		.on('mouseout', function(){
			//Bring back all blobs
			d3.selectAll(".radarArea")
				.transition().duration(200)
				.style("fill-opacity", cfg.opacityArea);
				
			//Bring back all blobs
			d3.selectAll(".radarCircle")
				.transition().duration(200)
				.style("fill-opacity", cfg.opacityPoint); 
				
			divSpider.transition()        
        .duration(500)
        .style('opacity', 0);
		})
		.on("click", function(d) { console.log(d[0].id) });
		
	//Create the outlines	
	blobWrapper.append("path")
		.attr("class", function(d) { return "radarStroke spiderStroke" + d[0].id; })
		.attr("d", function(d,i) { return radarLine(d); })
		.style("stroke-width", cfg.strokeWidth + "px")
		.style("stroke", function(d,i) { return cfg.color(dbplotSpider[i].values[0].id); })
		.style("stroke-opacity", cfg.opacityStroke)
		.style("fill", "none")
		.style("filter" , "url(#glow)")
		.on('mouseover', mouseoverSpiderStroke)
		.on('mousemove', mousemoveSpiderStroke)
		.on('mouseout', function(){
			//Bring back all blobs
			d3.selectAll(".radarArea")
				.transition().duration(200)
				.style("fill-opacity", cfg.opacityArea);
				
			//Bring back all circles
			d3.selectAll(".radarCircle")
				.transition().duration(200)
				.style("fill-opacity", cfg.opacityPoint); 
				
			divSpider.transition()        
        .duration(500)
        .style('opacity', 0);
		})
		.on("click", function(d) { console.log(d[0].id) });		
	
	//Append the circles
	blobWrapper
	  .selectAll(".radarCircle")
		.data(function(d,i,j) { return d; })
		.enter()
		.append("circle")
		.attr("class", function(d) { return "radarCircle spiderCircle" + d.id; })
		.attr("r", cfg.dotRadius)
		.attr("cx", function(d,i){ return rScale(d.value) * Math.cos(angleSlice*i - Math.PI/2); })
		.attr("cy", function(d,i){ return rScale(d.value) * Math.sin(angleSlice*i - Math.PI/2); })
	  .style("fill", function(d,i) { return cfg.color(d.id); })
		.style("fill-opacity", cfg.opacityPoint);

	/////////////////////////////////////////////////////////
	//////// Append invisible circles for tooltip ///////////
	/////////////////////////////////////////////////////////
	
	//Wrapper for the invisible circles on top
	var blobCircleWrapper = gSpider.selectAll(".radarCircleWrapper")
		.data(data)
		.enter().append("g")
		.attr("class", "radarCircleWrapper");
		
	//Append a set of invisible circles on top for the mouseover pop-up
	blobCircleWrapper.selectAll(".radarInvisibleCircle")
		.data(function(d,i) { return d; })
		.enter().append("circle")
		.attr("class", function(d) { return "radarInvisibleCircle spiderInvisible" + d.id; })
		.attr("r", cfg.dotRadius*1.5)
		.attr("cx", function(d,i){ return rScale(d.value) * Math.cos(angleSlice*i - Math.PI/2); })
		.attr("cy", function(d,i){ return rScale(d.value) * Math.sin(angleSlice*i - Math.PI/2); })
		.style("fill", "none")
		.style("pointer-events", "all")
		.on("click", function(d,i,j) {console.log(d);})
		.on("mouseover", function(d,i) {
      divSpider.transition()        
        .duration(0)      
        .style('opacity', 1);
        divSpider.html('<b><font size = "3">' + d.name + '</font></br>' +
        d.description + ': ' + format(d.value))
          .style('left', (d3.event.pageX + 20) + 'px')      
          .style('top', (d3.event.pageY - 20) + 'px');
    		})
		.on("mouseout", function(){
      divSpider.transition()        
        .duration(500)
        .style('opacity', 0);
		});
		
		
	/////////////////////////////////////////////////////////
	/////////////////// Checkboxes //////////////////////////
	/////////////////////////////////////////////////////////
 
  d3.select(".checkboxes").selectAll("label")
    .data(data)
    .style("color", function(d,i) {
      return cfg.color(d[i].id);
    });
  
  d3.selectAll(".myCheckbox")
    .data(data)
    .on("change", checkboxSpider);
    
  // Select / Deselect All  
  d3.selectAll('.checkboxAll')
    .on('change', function() {
      if(d3.select(this).property("checked")) {
        
        for (var i = 0; i < dbplotSpider.length; i++) {
            if (document.getElementById("checkbox" + dbplotSpider[i].key.id).checked === false) {
              document.getElementById("checkbox" + dbplotSpider[i].key.id).click();
            }
          }
          
        } else {
          
        for (var j = 0; j < dbplotSpider.length; j++) {
            if (document.getElementById("checkbox" + dbplotSpider[j].key.id).checked) {
              document.getElementById("checkbox" + dbplotSpider[j].key.id).click();
            } 
          }          
        }
    });
    
	/////////////////////////////////////////////////////////
	/////////////////// Helper Function /////////////////////
	/////////////////////////////////////////////////////////

	//Taken from http://bl.ocks.org/mbostock/7555321
	//Wraps SVG text	
	function wrap(text, width) {
	  text.each(function() {
		var text = d3.select(this),
			words = text.text().split(/\s+/).reverse(),
			word,
			line = [],
			lineNumber = 0,
			lineHeight = 1.4, // ems
			y = text.attr("y"),
			x = text.attr("x"),
			dy = parseFloat(text.attr("dy")),
			tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");
			
		while (word = words.pop()) {
		  line.push(word);
		  tspan.text(line.join(" "));
		  if (tspan.node().getComputedTextLength() > width) {
			line.pop();
			tspan.text(line.join(" "));
			line = [word];
			tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
		  }
		}
	  });
	}//wrap	
	
	// Mouseover blob tooltip
	function mouseoverSpiderBlob(d, i) {
      divSpider.transition()        
        .duration(0)      
        .style('opacity', 1);
        divSpider.html('<b><font size = "3">' + dbplotSpider[i].key.name + '</font></br>' + 
        "Average tariff: " + format(dbplotSpider[i].key.average))
        .style('left', (d3.event.pageX + 20) + 'px')      
        .style('top', (d3.event.pageY - 40) + 'px');

	  	//Dim all blobs
			d3.selectAll(".radarArea")
				.transition().duration(50)
				.style("fill-opacity", 0.1);
			//Dim all circles
			d3.selectAll(".radarCircle")
				.transition().duration(50)
				.style("fill-opacity", 0.1);
				
			//Bring back the hovered over blob
			d3.select(this)
				.transition().duration(50)
				.style("fill-opacity", 0.8);	
			//Bring back the circles of the hovered blob
     d3.selectAll(".spiderCircle"+d[0].id)
				.transition().duration(50)
				.style("fill-opacity", cfg.opacityPoint);
  }
  
  	// Mousemove blob tooltip
	function mousemoveSpiderBlob(d, i) {
      divSpider.transition()        
        .duration(0)      
        .style('opacity', 1);
        divSpider.html('<b><font size = "3">' + dbplotSpider[i].key.name + '</font></br>' + 
        "Average tariff: " + format(dbplotSpider[i].key.average))
        .style('left', (d3.event.pageX + 20) + 'px')      
        .style('top', (d3.event.pageY - 40) + 'px');
  }

	// Mouseover stroke tooltip
	function mouseoverSpiderStroke(d, i) {
      divSpider.transition()        
        .duration(0)      
        .style('opacity', 1);
        divSpider.html('<b><font size = "3">' + dbplotSpider[i].key.name + '</font></br>' + 
        "Average tariff: " + format(dbplotSpider[i].key.average))
        .style('left', (d3.event.pageX + 20) + 'px')      
        .style('top', (d3.event.pageY - 40) + 'px');

	  	//Dim all blobs
			d3.selectAll(".radarArea")
				.transition().duration(50)
				.style("fill-opacity", 0.1);
			//Dim all circles
			d3.selectAll(".radarCircle")
				.transition().duration(50)
				.style("fill-opacity", 0.1);
				
			//Bring back the hovered over blob
			d3.select(".spiderArea"+d[0].id)
				.transition().duration(50)
				.style("fill-opacity", 0.8);
		 //Bring back the circles of the hovered blob
     d3.selectAll(".spiderCircle"+d[0].id)
				.transition().duration(50)
				.style("fill-opacity", cfg.opacityPoint);
  }
  
  	// Mousemove stroke tooltip
	function mousemoveSpiderStroke(d, i) {
      divSpider.transition()        
        .duration(0)      
        .style('opacity', 1);
        divSpider.html('<b><font size = "3">' + dbplotSpider[i].key.name + '</font></br>' + 
        "Average tariff: " + format(dbplotSpider[i].key.average))
        .style('left', (d3.event.pageX + 20) + 'px')      
        .style('top', (d3.event.pageY - 40) + 'px');
  }

  // Checkbox 
  function checkboxSpider(d, i) {
        
        if(d3.select(this).property("checked")){
          
          d3.select(".spiderArea"+d[0].id)
          .transition().duration(50)
          .style("display", "inline")
          .attr("hidden", null);  
  				
  				d3.select(".spiderStroke"+d[0].id)
          .transition().duration(50)
          .style("display", "inline")
          .attr("hidden", null); 
          
          d3.selectAll(".spiderCircle"+d[0].id)
          .transition().duration(50)
          .style("display", "inline")
          .attr("hidden", null); 
  				
          d3.selectAll(".spiderInvisible"+d[0].id)
          .transition().duration(50)
          .style("display", "inline")
          .attr("hidden", null); 
  			  
        } else {
          
          d3.select(".spiderArea"+d[0].id)
          .transition().duration(50)
          .style("display", "none")
          .attr("hidden", true);
  				
  				d3.select(".spiderStroke"+d[0].id)
          .transition().duration(50)
          .style("display", "none")
          .attr("hidden", true);
  	
          d3.selectAll(".spiderCircle"+d[0].id)
  				.transition().duration(50)
  				.style("display", "none")
  				.attr("hidden", true);
  			  
          d3.selectAll(".spiderInvisible"+d[0].id)
          .transition().duration(50)
          .style("display", "none")
          .attr("hidden", true);          
          }
        }
	
}//RadarChart