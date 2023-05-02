function actigram(chartID) {

    if (!arguments.length) chartID = -1;
    var margin = { top: 2, right: 10, bottom: 50, left: 60, between: 5 },
        width = 400,
        height = 10,
        periodHrs = 24,
        startTime = new Date(),
        putcontrols = "",
        normalise = false,
        dataTabCols, //Reference the 'raw data'; an object with {table: tabname , dates: colname, values: colname}
        chartData; //This is the 'internal' data that is plotted


    function chart(selection) {
        
        
        selection.each(function (data) {
            if (typeof data !== 'undefined'){
                chartData = makeActiData(data, periodHrs);
                startTime = new Date(Date.parse(data[0].date));
                startTime = new Date(startTime);
                startTime.setHours(0,0,0);         
            }
            
            //clear for redraw
            d3.select(this).selectAll("svg").remove();

            //create svg
            var svg = d3.select(this)
                .selectAll("svg")
                    .data([data])
                    .attr("id", "svg");
            
            //Create the skeletal chart.
            var svgEnter = svg.enter().append("svg");
            var gEnter = svgEnter.append("g");

            // Update the outer dimensions.
            svg.merge(svgEnter)
                .attr("width", 2* (width+margin.left+margin.right) )
                .attr("height", chartData.nPlots*(height+margin.between) + margin.top + margin.bottom);
            
            // Update the inner dimensions.
            var g = svg.merge(svgEnter).select("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            // Create scales for the x and y axes
            const xScale = d3.scaleLinear()
                .domain([0, periodHrs])
                .range([0, width]);


            // Create a group for each plot and position them
            var plots = g.selectAll(".acti")
                .data(Array.from(Array(chartData.nPlots).keys()))
                .enter()
                .append("g")
                .attr("class", "acti")
                .attr("transform", (d, i) => `translate(${margin.left}, ${i * height + (i + 1) * margin.between})`);

            var nYTicks = Math.round(height / 20)
            if(nYTicks < 2){nYTicks = 2}

            plots.each(function(d, i) {
                // Filter data for current plot
                const plotData = chartData.filter(datum => datum.plot === i || datum.plot === (i+1));

                // Get max values for the current plot
                const maxVal = d3.max(plotData, datum => datum.value);
                

                // Create y scale for the current plot based on its maximum value
                var yScale;
                if(normalise){
                    yScale = d3.scaleLinear()
                        .domain([0, maxVal])
                        .range([height, 0]);
                }else{
                    yScale = d3.scaleLinear()
                        .domain([0, d3.max(chartData, datum => datum.value)])
                        .range([height, 0]);
                }
                // Append y axis to the current plot
                d3.select(this).append("g")
                 .call(d3.axisLeft(yScale).ticks(nYTicks));

                // Create line generator for the current plot
                const line = d3.line()
                    .x(datum => xScale(datum.newhour))
                    .y(datum => yScale(datum.value))
                    .curve(d3.curveStepBefore);

                // Append path to the current plot
                var maxHr;
                d3.select(this).append("path")
                    .datum(plotData.map(datum => {
                        datum.newhour = datum.hour + (periodHrs * (datum.plot - i));
                        maxHr = d3.max(plotData, d => d.newhour);
                        return datum;
                    }))
                    .attr("d", d => `${line(d, i)} 
                                            L${xScale(maxHr)},${height} 
                                            L${xScale(0)},${height} Z`
                        )
                    .attr("stroke", "none")
                    .attr("fill", "rgba(1,1,1,0.6)"); //make slightly transparrent so we can see if they overlap
            });


            // Add the x axis to the bottom plot
            const xaxisScale = d3.scaleLinear()
                .domain([0, periodHrs*2])
                .range([0, width*2]);
            const xAxis = d3.axisBottom(xaxisScale).ticks(24);
            g.selectAll(".acti")
                .filter((d, i) => i === chartData.nPlots - 1)
                .append("g")
                .attr("transform", `translate(0, ${height})`)
                .call(xAxis)
                .attr("class", "xaxis1st");

            

            /// Add in the start time to the left of each plot
            var start = new Date(startTime);
            g.selectAll(".acti")
                .append("text")
                .attr("y", (d,i) => (height/2) + margin.between )
                .attr("x", 0-(margin.left*2))
                .text((d,i) => {    const ylab = new Date;
                                    ylab.setTime(start.getTime() + i*periodHrs*3600000);
                                    if(periodHrs >=24){
                                        return ylab.toLocaleString('en-US',{year: 'numeric', month: 'short', day: '2-digit'})
                                    }else{
                                        return ylab.toLocaleString('en-US',{year: 'numeric', month: 'short', day: '2-digit', hour12: true, hour: 'numeric', minute: 'numeric', second: 'numeric'})
                                    }
                                })    
                .attr("font-size", "12px")

            //interactivity
            svg.merge(svgEnter).on("click", function(){
                var mouse = d3.pointer(event);
                
                /*
                svg.merge(svgEnter).append("circle")
                    .attr("cx", mouse[0])
                    .attr("cy", mouse[1])
                    .attr("r", 2)
                    .attr("fill", "#039BE5")
                */
                const clickedPlot = Math.floor( (mouse[1]-margin.top) / (height+margin.between));
                const clickedTime = ((mouse[0]-margin.left*2) / (width));              
                const clickedOut = new Date(startTime + (clickedPlot * periodHrs) + clickedTime)
                
                var end = new Date();
                end.setTime(start.getTime() + (clickedPlot + clickedTime)*periodHrs*3600000);

                sendMessage("Clicked at " + end.toLocaleString('en-US', {year: 'numeric', month: 'short', day: '2-digit', hour12: true, hour: 'numeric', minute: 'numeric', second: 'numeric'}))
            });
            
            //put the controls where they need to go, if there is somewhere to put them
            if(putcontrols != "") chart.controls();
        });
        
        chart.update = function(newData) {
            if (!arguments.length){
                selection.call(chart);
            }else{           
                chartData = makeActiData(newData, periodHrs);
                selection.call(chart);
            }
        }
    }

    chart.getRawData = function(){
        var table = dataList.find(item => item.name === this.dataTabCols().table).data;
        const forPlot = [];
          for (const dataPoint of table) {
            forPlot.push({
              date: dataPoint[this.dataTabCols().dates],
              value: dataPoint[this.dataTabCols().values],
            });
          }
        return forPlot;
    }

    
    chart.dataTabCols = function (_) {
        if (!arguments.length) return dataTabCols;
        dataTabCols = _;
        return chart;
    };

    chart.chartData = function (_) {
        if (!arguments.length) return chartData;
        chartData = +_;
        return chart;
    };

    chart.chartID = function (_) {
        if (!arguments.length) return chartID;
        chartID = +_;
        return chart;
    };

    chart.startTime = function (_) {
        if (!arguments.length) return startTime;
        startTime = _;
        return chart;
    };

    chart.width = function (_) {
        if (!arguments.length) return width;
        width = +_;
        innerWidth = width - margin.left - margin.right; //update the inner width also
        return chart;
    };

    chart.height = function (_) {
        if (!arguments.length) return height;
        height = +_;
        return chart;
    };

    chart.between = function (_) {
        if (!arguments.length) return margin.between;
        margin.between = +_;
        return chart;
    };

    chart.periodHrs = function (_) {
        if (!arguments.length) return periodHrs;
        periodHrs = +_;
        if(periodHrs < 24){
            margin.left = 100;
        }else{
            margin.left = 60;
        }
        return chart;
    };

    chart.normalise = function (_) {
        if (!arguments.length) return normalise;
        normalise = +_;
        return chart;
    };







 // internal code for reformatting data of the form {date: ..., value: ...} for plotting
    makeActiData = function(rawData, periodHrs){
//TODO - date formatting
        //make start time at the start of the day
        var minDateTime = d3.min(rawData, d => new Date(Date.parse(d['date'])));
        minDateTime = new Date(minDateTime);
        minDateTime.setHours(0,0,0);

        //Get the hours from the start and the time for the actigram
        rawData.forEach((obj) => {
        //const tempDate = new Date(obj['date']);
            const tempDate = new Date(obj['date']);
            const timeDiffInMs = Math.abs(
                tempDate.getTime() - minDateTime.getTime()
            );
            const timeDiffInHours = timeDiffInMs / (1000 * 60 * 60);
            obj.HrsFromStart = timeDiffInHours;
            obj.DayAct = Math.floor(obj.HrsFromStart / periodHrs);
            obj.HrsFromStartAct = obj.HrsFromStart % periodHrs;
        });

        // Set up the dimensions and margins for the plots

        const rawDataPlot = rawData.map((obj) => obj["DayAct"]);
        const rawDataHrsAct = rawData.map((obj) => obj["HrsFromStartAct"]);
        const rawDatadata = rawData.map((obj) => obj['value']);

        const actiData = []
        for(let i=0; i<rawDatadata.length; i++){
            actiData.push({plot: rawDataPlot[i],
                    hour: rawDataHrsAct[i],
                    value: rawDatadata[i]
                    })
        }

        //Summary data for plotting
        actiData.nPlots = d3.max(rawDataPlot)+1;        
        actiData.max= actiData.reduce((max, obj) => {
            return obj.value > max ? obj.value : max;
            }, 0);


        return actiData;    
    }









    chart.putcontrols = function (selectedControls) {
        if (!arguments.length) return putcontrols;
        putcontrols = selectedControls;
        this.controls(chartID);
        return chart;
    };
    chart.controls = function () {
        //clear the controls
        document.getElementById(this.putcontrols().replace("#", "")).innerHTML = "";
        
        // do the checks
        if(this.chartID() <0){return "Not in charting";}
        if(this.putcontrols() === ""){return "Nowhere to put controls";}
        if(dataList.length < 1){return "No data";}

        const controlsDiv = document.getElementById(this.putcontrols().replace("#", ""));
 

    //DATA
    const dataheading = document.createElement("div")
    const dataheadingtext = document.createElement("h4")
    dataheadingtext.innerHTML = "Data for this plot"
    dataheading.appendChild(dataheadingtext)
    controlsDiv.appendChild(dataheading);

    //make the data input - table, dates, values (conditional dropdowns)
    // create dropdown list for sample selection
    const tableSelect = document.createElement('select');
    tableSelect.id = 'sample-dropdown';

    // add the table names
    for (let i = 0; i < dataList.length; i++) {
        const option = document.createElement('option');
        option.value = dataList[i].name;
        option.text = dataList[i].name;
        tableSelect.appendChild(option);
    }
    tableSelect.value = this.dataTabCols().table;

    // create dropdown list for data keys
    const dateColumn = document.createElement('select');
    dateColumn.id = 'data-keys-dropdown';

    // create dropdown list for data keys within a sample
    const valueColumn = document.createElement('select');
    valueColumn.id = 'data-values-dropdown';

    // add event listener to sample dropdown to update data key dropdowns
    tableSelect.addEventListener('change', () => {
        const sampleName = tableSelect.value;
        const sampleData = dataList.find(sample => sample.name === sampleName).data;
        
        // clear previous options
        dateColumn.innerHTML = '';
        valueColumn.innerHTML = '';

        // get keys from first item in sample data array
        const keys = Object.keys(sampleData[0]);
        keys.forEach(key => {
            // add key to data key dropdowns
            const keyOption = document.createElement('option');
            keyOption.value = key;
            keyOption.text = key;
            dateColumn.appendChild(keyOption);

            const valueOption = document.createElement('option');
            valueOption.value = key;
            valueOption.text = key;
            valueColumn.appendChild(valueOption);
        });
        dateColumn.value = this.dataTabCols().dates;
        valueColumn.value = this.dataTabCols().values;    
    });
    
    tableSelect.dispatchEvent(new Event('change'));


    // create labels for dropdown lists
    const tablelabel = document.createElement('label');
    tablelabel.innerText = 'Table: ';
    tablelabel.setAttribute('for', 'sample-dropdown');

    const datelabel = document.createElement('label');
    datelabel.innerText = 'Dates: ';
    datelabel.setAttribute('for', 'data-keys-dropdown');

    const valuelabel = document.createElement('label');
    valuelabel.innerText = 'Values: ';
    valuelabel.setAttribute('for', 'data-values-dropdown');

    // wrap dropdown lists and labels in divs
    const sampleDiv = document.createElement('div');
    sampleDiv.appendChild(tablelabel);
    sampleDiv.appendChild(tableSelect);

    const dataKeysDiv = document.createElement('div');
    dataKeysDiv.appendChild(datelabel);
    dataKeysDiv.appendChild(dateColumn);

    const dataValuesDiv = document.createElement('div');
    dataValuesDiv.appendChild(valuelabel);
    dataValuesDiv.appendChild(valueColumn);

    // add dropdown lists to controlsDiv
    controlsDiv.appendChild(sampleDiv);
    controlsDiv.appendChild(dataKeysDiv);
    controlsDiv.appendChild(dataValuesDiv);
    
    
    // create a button element
    const changedata = document.createElement('button');
    changedata.textContent = 'Update';
    controlsDiv.appendChild(changedata);

    // add an event listener to the button
    changedata.addEventListener('click', () => {
        // get the selected values from the dropdowns
        const selectedTable = tableSelect.value;
        const selectedDateCol= dateColumn.value;
        const selectedValCol = valueColumn.value;

        //then update with that gotten data
        this.dataTabCols({table: selectedTable , dates: selectedDateCol, values: selectedValCol})
        this.update(this.getRawData())
    });

    
    //Add in the data to be able to view it in the viewer
    const chartDataDiv = document.createElement('div');
        chartDataDiv.id = 'chartData';
    controlsDiv.appendChild(chartDataDiv)
    document.getElementById('chartData').innerHTML = `<ul><li><a href='javascript:adddataTab("chartList",${this.chartID()});'>${tabs.tabs[this.chartID()].text}</a></li></ul>`

    //line separating the data from the controls
    controlsDiv.appendChild(document.createElement('hr'));


//-------------------------------------
//-------------------------------------
//-------------------------------------



    const editplotheading = document.createElement("div")
    const editplotheadingtext = document.createElement("h4")
    editplotheadingtext.innerHTML = "Edit the plot:"
    editplotheading.appendChild(editplotheadingtext)
    controlsDiv.appendChild(editplotheading);

    //PERIOD_HRS
        const PeriodHrsslider = document.createElement('input');
            PeriodHrsslider.type = 'number';
            PeriodHrsslider.min = 0;
            PeriodHrsslider.style.width = '54px';
            PeriodHrsslider.value = this.periodHrs();
        // add an event listener to the slider control to update the PeriodHrs of the element
        PeriodHrsslider.addEventListener('change', () => {
            elementPeriodHrs = parseFloat(PeriodHrsslider.value);
            this.periodHrs(elementPeriodHrs);
            //UPDATE THE DATA AND REDRAW HERE
            this.update(this.getRawData())

        });
        // create a label for the input control
        const PeriodHrslabel = document.createElement('label');
            PeriodHrslabel.innerText = 'Period (hrs):';
            PeriodHrslabel.setAttribute('for', 'PeriodHrs-input');
        // wrap the label and input controls in a div
        const PeriodHrsDiv = document.createElement('div');
            PeriodHrsDiv.appendChild(PeriodHrslabel);
            PeriodHrsDiv.appendChild(PeriodHrsslider);
        // add the slider control to the DOM
        controlsDiv.appendChild(PeriodHrsDiv);



        // NORMALISE
        const normaliseInput = document.createElement('input');
        normaliseInput.type = 'checkbox';
        normaliseInput.checked = normalise;
        normaliseInput.id = 'normalise-input';

        // add an event listener to the checkbox to update the normalise flag of the element
        normaliseInput.addEventListener('change', () => {
            this.normalise(normaliseInput.checked);
            //UPDATE THE DATA AND REDRAW HERE
            this.update(this.getRawData())
        });

        // create a label for the checkbox control
        const normaliseLabel = document.createElement('label');
        normaliseLabel.innerText = 'Normalise:';
        normaliseLabel.setAttribute('for', 'normalise-input');

        // wrap the label and checkbox controls in a div
        const normaliseDiv = document.createElement('div');
        normaliseDiv.appendChild(normaliseLabel);
        normaliseDiv.appendChild(normaliseInput);
        

        // add the checkbox control to the DOM
        controlsDiv.appendChild(normaliseDiv);


//-------------------------------------
//------------------------------------- Somewhat generic code for plot sizing
//-------------------------------------


    //WIDTH
        const widthslider = document.createElement('input');
            widthslider.type = 'number';
            widthslider.min = 0;
            widthslider.style.width = '54px';
            widthslider.value = width;
        // add an event listener to the slider control to update the width of the element
        widthslider.addEventListener('change', () => {
            elementwidth = parseInt(widthslider.value);
            this.width(elementwidth);
            this.update();
        });
        // create a label for the input control
        const widthlabel = document.createElement('label');
            widthlabel.innerText = 'Width:';
            widthlabel.setAttribute('for', 'width-input');
        // wrap the label and input controls in a div
        const widthDiv = document.createElement('div');
            widthDiv.appendChild(widthlabel);
            widthDiv.appendChild(widthslider);
        // add the slider control to the DOM
        controlsDiv.appendChild(widthDiv);
        

    //HEIGHT
        const heightslider = document.createElement('input');
            heightslider.type = 'number';
            heightslider.min = 0;
            heightslider.style.width = '54px';
            heightslider.value = height;
        // add an event listener to the slider control to update the height of the element
        heightslider.addEventListener('change', () => {
            elementgeight = parseInt(heightslider.value);
            this.height(elementgeight);
            this.update();
        });
        // create a label for the input control
        const heightlabel = document.createElement('label');
            heightlabel.innerText = 'Height:';
            heightlabel.setAttribute('for', 'height-input');
        // wrap the label and input controls in a div
        const heightDiv = document.createElement('div');
            heightDiv.appendChild(heightlabel);
            heightDiv.appendChild(heightslider);
        // add the slider control to the DOM
        controlsDiv.appendChild(heightDiv);


//-------------------------------------
//------------------------------------- More bespoke to actigrams
//-------------------------------------


    //BETWEEN
        const betweenslider = document.createElement('input');
        betweenslider.type = 'number';
        betweenslider.min = 0;
        betweenslider.style.width = '54px';
        betweenslider.value = this.between();
        // add an event listener to the slider control to update the between of the element
        betweenslider.addEventListener('change', () => {
            elementbetween = parseInt(betweenslider.value);
            this.between(elementbetween);
            this.update();
        });
        // create a label for the input control
        const betweenlabel = document.createElement('label');
            betweenlabel.innerText = 'Between:';
            betweenlabel.setAttribute('for', 'between-input');
        // wrap the label and input controls in a div
        const betweenDiv = document.createElement('div');
            betweenDiv.appendChild(betweenlabel);
            betweenDiv.appendChild(betweenslider);
        // add the slider control to the DOM
        controlsDiv.appendChild(betweenDiv);

    };
  

    return chart;
}
