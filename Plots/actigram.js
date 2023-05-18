function actigram(chartID) {
  if (!arguments.length) chartID = -1;
  var margin = { top: 5, right: 30, bottom: 50, left: 60, between: 5 },
    width = 400,
    height = 10,
    periodHrs = 24,
    startTime = new Date(),
    putcontrols = "",
    normalise = false,
    allDataSources = [
      {
        name: "main data",
        table: "",
        dates: "",
        values: "",
        colour: "",
        process: [],
      },
    ],
    plottingData = []; //the data used in the plot

  function chart(selection) {
    selection.each(function (data) {
      plottingData = [];
      allDataSources.forEach((s, i) => {
        tempData = getDataFromSource(s); //get the data
        //if it's the first one, then set the start time to the first data, 0hrs
        if (i === 0) {
          startTime = new Date(Date.parse(tempData[0].date));
          startTime = new Date(startTime);
          startTime.setHours(0, 0, 0);
        }

        tempData = makeActiData(tempData, periodHrs); //convert the data for use in actiplot
        plottingData.push(tempData); //add the data to plotting so it doesn't need to be remade
      });

      //clear for redraw
      d3.select(this).selectAll("svg").remove();

      //create svg
      var svg = d3
        .select(this)
        .selectAll("svg")
        .data([data]) //only make 1
        .attr("id", "svg");

      //Create the skeletal chart.
      var svgEnter = svg.enter().append("svg");
      var gEnter = svgEnter.append("g");

      // Update the outer dimensions.
      svg
        .merge(svgEnter)
        .attr(
          "width",
          2 * (width + margin.left + margin.right * plottingData.length)
        )
        .attr(
          "height",
          plottingData[0].nPlots * (height + margin.between) +
            2 * (margin.top + margin.bottom)
        );

      // Update the inner dimensions.
      var g = svg
        .merge(svgEnter)
        .select("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      // Create scales for the x and y axes
      const xScale = d3.scaleLinear().domain([0, periodHrs]).range([0, width]);

      // Create a group for each plot and position them
      var plots = g
        .selectAll(".acti")
        .data(Array.from(Array(plottingData[0].nPlots).keys())) // create the n plots (one for each periodHrs*2, as per the makeActiData)
        .enter()
        .append("g")
        .attr("class", "acti")
        .attr(
          "transform",
          (d, i) =>
            `translate(${margin.left}, ${
              i * height + (i + 1) * margin.between
            })`
        );

      // set up the number of ticks for each Y axis
      var nYTicks = Math.round(height / 20);
      if (nYTicks < 2) {
        nYTicks = 2;
      }

      // Create y scale for the current plot based on its maximum value, or a function for the normalised version
      const maxVals = plottingData.map((pd, i) =>
        d3.max(
          pd.filter((datum) => datum.plot === i || datum.plot === i + 1),
          (datum) => datum.value
        )
      );
      const maxVal = d3.max(maxVals);

      const line = d3
        .line()
        .x((datum) => xScale(datum.newhour))
        .y((datum) => yScale(datum.value))
        .curve(d3.curveStepAfter);

      for (let pd = 0; pd < plottingData.length; pd++) {
        //get the data to plot
        const plotsData = plottingData[pd];

        // for each plot
        for (let pl = 0; pl < plotsData.nPlots; pl++) {
          //get the data for the plot
          var plotData = plotsData.filter(
            (d) => d.plot === pl || d.plot === pl + 1
          );
          plotData = plotData.map((d) => ({
            ...d,
            newhour: d.hour + (d.plot - pl) * periodHrs,
          }));

          var yScale;
          if (normalise) {
            const plotMax = d3.max(plotData, (d) => d.value);

            yScale = d3.scaleLinear().domain([0, plotMax]).range([height, 0]);
          } else {
            yScale = d3
              .scaleLinear()
              .domain([0, maxVals[pd]])
              .range([height, 0]);
          }

          //work the magic
          g.selectAll(".acti" + pd + pl)
            .data([plotData]) //do once
            .enter()
            .append("g")
            .attr("class", "acti" + pd + pl)
            .attr(
              "transform",
              (d, i) =>
                `translate(${margin.left}, ${
                  pl * height + (pl + 1) * margin.between
                })`
            )
            .append("path")
            //.datum(d => d[1])
            .attr(
              "d",
              (d) => `${line(d)} 
                                            L${xScale(
                                              d.reduce((max, obj) => {
                                                return obj.newhour > max
                                                  ? obj.newhour
                                                  : max;
                                              }, 0)
                                            )},
                                            ${height} 
                                            L${xScale(
                                              d.reduce((min, obj) => {
                                                return obj.newhour < min
                                                  ? obj.newhour
                                                  : min;
                                              }, width)
                                            )},
                                            ${height} Z`
            ) // add line to end point and close path
            .attr("stroke", "none")
            .attr("fill", allDataSources[pd].colour);

          //add the y-axis
          if (pd === 0) {
            const yAxis = d3.axisLeft(yScale).ticks(nYTicks);
            g.selectAll(".acti" + pd + pl)
              .append("g")
              .call(yAxis)
              .attr("class", "disable-select");
          } else {
            const yAxis = d3.axisRight(yScale).ticks(nYTicks);
            g.selectAll(".acti" + pd + pl)
              .append("g")
              .call(yAxis)
              .attr("transform", `translate(${width * 2 + (pd - 1) * 40},0)`)
              .selectAll("text")
              .style("fill", allDataSources[pd].colour)
              .attr("class", "disable-select");
          }
        }
      }

      // Add the x axis to the bottom plot
      const xaxisScale = d3
        .scaleLinear()
        .domain([0, periodHrs * 2])
        .range([0, width * 2]);
      const xAxis = d3.axisBottom(xaxisScale).ticks(24);
      g.selectAll(".acti")
        .filter((d, i) => i === plottingData[0].nPlots - 1)
        .append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(xAxis)
        .attr("class", "xaxis1st disable-select");

      /// Add in the start time to the left of each plot
      g.selectAll(".acti")
        .append("text")
        .attr("y", (d, i) => height / 2 + margin.between)
        .attr("x", 0 - margin.left * 2)
        .text((d, i) => {
          const ylab = new Date();
          ylab.setTime(startTime.getTime() + i * periodHrs * 3600000);
          if (periodHrs >= 24) {
            return ylab.toLocaleString("en-US", {
              year: "numeric",
              month: "short",
              day: "2-digit",
            });
          } else {
            return ylab.toLocaleString("en-US", {
              year: "numeric",
              month: "short",
              day: "2-digit",
              hour12: true,
              hour: "numeric",
              minute: "numeric",
              second: "numeric",
            });
          }
        })
        .attr("font-size", "12px")
        .attr("class", "disable-select");

      //interactivity
      const tooltip = d3
        .select(this)
        .append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("opacity", 0);

      // Define the initial coordinates for the selection
      let startX = margin.left * 2; // default position at start of graph
      let endX = margin.left * 2;
      let plotHihglight = 1;
      let mousedown = false;

      // Create a rectangle for the selection
      const selectionRect = svg
        .merge(svgEnter)
        .append("rect")
        .attr("class", "selection-rect")
        .attr("x", 0)
        .attr("y", margin.top + margin.between)
        .attr("width", 0)
        .attr("height", height)
        .style("fill", "yellow")
        .style("opacity", 0.3)
        .style("pointer-events", "none");

      svg
        .merge(svgEnter)
        .on("mousedown", function (event) {
          mousedown = true;

          if (inPlotMargins(event)) {
            var leftOff = event.offsetX > width + 2 * margin.left ? -170 : 10;
            tooltip
              .style("opacity", 1)
              .style("position", "absolute")
              .style("left", event.offsetX + leftOff + "px")
              .style("top", event.offsetY + 10 + "px")
              .style("background", "rgba(255,255,255,0.8)")
              .style("width", "max-content")
              .html(
                getTimeFromMouseEvent(event.offsetX, event.offsetY) +
                  getValuesFromMouseEvent(event.offsetX, event.offsetY)
              )
              .style("visibility", "visible");

            startX = event.offsetX;
            endX = event.offsetX;
            plotHihglight = Math.floor(
              (event.offsetY - margin.top) / (height + margin.between)
            );
            updateSelectionRect(startX, endX, plotHihglight, selectionRect);
          }
        })

        .on("mousemove", function (event) {
          if (mousedown && inPlotMargins(event)) {
            endX = event.offsetX;
            updateSelectionRect(startX, endX, plotHihglight, selectionRect);
          }

          tooltip.style("visibility", "hidden");
        })

        .on("mouseup", function (event) {
          mousedown = false;

          if (endX != startX) {
            sendMessage(
              "Time range selected: " +
                getTimeFromMouseEvent(
                  startX,
                  plotHihglight * (height + margin.between) +
                    margin.top +
                    margin.between
                ) +
                " - " +
                getTimeFromMouseEvent(
                  endX,
                  plotHihglight * (height + margin.between) +
                    margin.top +
                    margin.between
                )
            );
          }

          tooltip.style("visibility", "hidden");
        });

      svg.merge(svgEnter).on("dblclick", function (event) {
        if (inPlotMargins(event)) {
          var values = getValuesFromMouseEvent(event.offsetX, event.offsetY)
            .replace(/<br>/g, "; ")
            .replace(/<[^>]+>/g, "");
          sendMessage(
            "Clicked at " +
              getTimeFromMouseEvent(event.offsetX, event.offsetY) +
              values
          );
        }
      });

      //put the controls where they need to go, if there is somewhere to put them
      if (putcontrols != "") chart.controls();
    });

    function updateSelectionRect(startX, endX, plotHihglight, selectionRect) {
      const x = Math.min(startX, endX);
      const width = Math.abs(endX - startX);
      selectionRect
        .attr("x", x)
        .attr("width", width)
        .attr(
          "y",
          margin.top +
            margin.between +
            plotHihglight * (height + margin.between)
        );
    }
    function inPlotMargins(event) {
      return (
        event.offsetX > margin.left * 2 &&
        event.offsetX < 2 * (width + margin.left) &&
        event.offsetY > margin.top &&
        event.offsetY <
          margin.top + plottingData[0].nPlots * (height + margin.between)
      );
    }

    chart.update = function (newData) {
      if (!arguments.length) {
        selection.call(chart);
      } else {
        //new
        plottingData = [];
        allDataSources.forEach((s) => {
          tempData = getDataFromSource(s); //get the data
          //TODO do the process functions - should be of the form [{function: XXX, parameter1:YYYY, parameter2:ZZZ ...}, {function: XYZ, ...}, ...]
          tempData = makeActiData(tempData, periodHrs); //convert the data for use in actiplot
          plottingData.push(tempData); //add the data to plotting so it doesn't need to be remade
        });
        selection.call(chart);
      }
    };

    function getTimeFromMouseEvent(X, Y) {
      const clickedPlot = Math.floor(
        (Y - margin.top) / (height + margin.between)
      );
      const clickedTime = (X - margin.left * 2) / width;
      var end = new Date();
      end.setTime(
        startTime.getTime() + (clickedPlot + clickedTime) * periodHrs * 3600000
      ); //3600000 is the number of ms in 1 hour
      return end.toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour12: true,
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
      });
    }

    function getValuesFromMouseEvent(X, Y) {
      var clickedPlot = Math.floor(
        (Y - margin.top) / (height + margin.between)
      );
      var clickedHrs = ((X - margin.left * 2) / width) * periodHrs;

      if (clickedHrs > periodHrs) {
        clickedHrs = clickedHrs - periodHrs;
        clickedPlot = clickedPlot + 1;
      }

      outValues = "";
      for (let i = 0; i < plottingData.length; i++) {
        outValues += "<br>";
        outValues += "<a style='color: " + allDataSources[i].colour + ";'>";
        outValues += allDataSources[i].name + ": ";
        outValues +=
          findClosestValue(plottingData[i], clickedPlot, clickedHrs) + "</a>";
      }

      return outValues;
    }

    const findClosestValue = (data, targetPlot, targetHour) => {
      let closestValue = null;
      let closestDistance = Infinity;

      for (const entry of data) {
        const { plot, hour, value } = entry;
        if (plot === targetPlot) {
          const distance = Math.abs(hour - targetHour);
          if (distance < closestDistance) {
            closestDistance = distance;
            closestValue = value;
          }
        }
      }

      //console.log(closestDistance)
      if (closestDistance > 0.05) {
        //arbitrary value so values aren't presented where there are none
        return "No value here";
      }
      return closestValue.toFixed(2);
    };
  }

  //for initial setting source (and further changes)
  chart.dataSources = function (index, source) {
    if (!arguments.length) return allDataSources;
    allDataSources[index] = source;
    return chart;
  };
  chart.setDataSources = function (index, keyname, val) {
    allDataSources[index][keyname] = val;
    return chart;
  };
  chart.addDataSource = function (_) {
    allDataSources.push(_);
    return chart;
  };
  chart.removeDataSource = function (index) {
    allDataSources.splice(index, 1);
    charts[charts.findIndex((c) => c.chartID == chartID)].chart.putcontrols(
      putcontrols
    );
    return chart;
  };

  chart.addProcessData = function (index) {
    procesContextMenu(`process_${chartID}_${index}`);
  };

  getDataFromSource = function (source) {
    var table = dataList.find((item) => item.name === source.table).data;
    const forPlot = [];
    for (const dataPoint of table) {
      forPlot.push({
        date: dataPoint[source.dates],
        value: dataPoint[source.values],
      });
    }
    return forPlot;
  };
  chart.plottingData = function () {
    return plottingData;
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
    if (periodHrs < 24) {
      margin.left = 100;
    } else {
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
  makeActiData = function (rawData, periodHrs) {
    //TODO - date formatting, and make this starttime

    //Get the hours from the start and the time for the actigram
    rawData.forEach((obj) => {
      //const tempDate = new Date(obj['date']);
      const tempDate = new Date(Date.parse(obj["date"]));
      const timeDiffInMs = Math.abs(tempDate.getTime() - startTime.getTime());
      const timeDiffInHours = timeDiffInMs / (1000 * 60 * 60);
      obj.HrsFromStart = timeDiffInHours;
      obj.DayAct = Math.floor(obj.HrsFromStart / periodHrs);
      obj.HrsFromStartAct = obj.HrsFromStart % periodHrs;
    });

    // Set up the dimensions and margins for the plots

    const rawDataPlot = rawData.map((obj) => obj["DayAct"]);
    const rawDataHrsAct = rawData.map((obj) => obj["HrsFromStartAct"]);
    const rawDatadata = rawData.map((obj) => obj["value"]);

    const actiData = [];
    for (let i = 0; i < rawDatadata.length; i++) {
      actiData.push({
        plot: rawDataPlot[i],
        hour: rawDataHrsAct[i],
        value: rawDatadata[i],
      });
    }

    //Summary data for plotting
    actiData.nPlots = d3.max(rawDataPlot) + 1;
    actiData.max = actiData.reduce((max, obj) => {
      return obj.value > max ? obj.value : max;
    }, 0);

    return actiData;
  };

  // Check if two objects have the same values
  areObjectsEqual = function (obj1, obj2) {
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    if (keys1.length !== keys2.length) {
      return false;
    }
    for (let key of keys1) {
      if (obj1[key] !== obj2[key]) {
        return false;
      }
    }
    return true;
  };

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
    if (this.chartID() < 0) {
      return "Not in charting";
    }
    if (this.putcontrols() === "") {
      return "Nowhere to put controls";
    }
    if (dataList.length < 1) {
      return "No data";
    }

    const controlsDiv = document.getElementById(
      this.putcontrols().replace("#", "")
    );

    const dataheading = document.createElement("div");
    const dataheadingtext = document.createElement("h4");
    dataheadingtext.style.marginBottom = "5px";
    dataheadingtext.innerHTML = "Data for this plot";
    dataheading.appendChild(dataheadingtext);
    controlsDiv.appendChild(dataheading);

    controlsDiv.appendChild(
      Object.assign(document.createElement("div"), { id: "dataSources" })
    );
    //Set up the data sources that exist
    allDataSources.forEach((s, i) =>
      generateActiDataUI(
        document.getElementById("dataSources"),
        s.name,
        this.chartID(),
        i
      )
    );

    //Create more data sources
    const addDataButton = document.createElement("button");
    addDataButton.textContent = "Add Data";
    addDataButton.setAttribute("style", "margin: 10px 0 10px 0;");
    controlsDiv.appendChild(addDataButton);
    addDataButton.addEventListener("click", () => {
      tempName = "Dataset " + this.dataSources().length;
      this.addDataSource({
        name: tempName,
        table: "",
        dates: "",
        values: "",
        colour: "rgba(1,1,1,0.6)",
      });
      generateActiDataUI(
        document.getElementById("dataSources"),
        tempName,
        this.chartID(),
        allDataSources.length - 1
      );
    });

    controlsDiv.appendChild(Object.assign(document.createElement("div")));
    const GenerateButton = document.createElement("button");
    GenerateButton.textContent = "Plot the data";
    GenerateButton.setAttribute("style", "margin: 0 0 10px 0;");
    controlsDiv.appendChild(GenerateButton);
    GenerateButton.addEventListener("click", () => {
      const tablesSelected = document.querySelectorAll(
        '[id^="table-dropdown"]'
      );
      const datesSelected = document.querySelectorAll('[id^="dates-dropdown"]');
      const valuesSelected = document.querySelectorAll(
        '[id^="values-dropdown"]'
      );
      const colourSelected = document.querySelectorAll('[id^="colour-select"]');
      tablesSelected.forEach((t, i) => {
        const tempSource = {
          name: this.dataSources()[i].name,
          table: tablesSelected[i].value,
          dates: datesSelected[i].value,
          values: valuesSelected[i].value,
          colour: colourSelected[i].value,
        };
        this.dataSources(i, tempSource);
      });
      this.update(this.dataSources());
    });

    //Add in the data to be able to view it in the viewer
    const chartDataDiv = document.createElement("div");
    chartDataDiv.id = "chartData";
    const datalistdataheading = document.createElement("div");
    const datalistdataheadingtext = document.createElement("h5");
    datalistdataheadingtext.innerHTML = "The data used for the plot:";
    datalistdataheading.appendChild(datalistdataheadingtext);
    controlsDiv.appendChild(datalistdataheading);
    controlsDiv.appendChild(chartDataDiv);

    document.getElementById("chartData").innerHTML = "<ul>";
    allDataSources.forEach((ds, i) => {
      document.getElementById(
        "chartData"
      ).innerHTML += `<li><a href='javascript:adddataTab("chartList",${this.chartID()}, ${i} ,"${
        ds.name
      }");'>
                                                                        ${
                                                                          ds.name
                                                                        }</a></li>`;
    });
    document.getElementById("chartData").innerHTML += "</ul>";
    //line separating the data from the controls
    controlsDiv.appendChild(document.createElement("hr"));

    //-------------------------------------
    //-------------------------------------
    //-------------------------------------

    const editplotheading = document.createElement("div");
    const editplotheadingtext = document.createElement("h4");
    editplotheadingtext.innerHTML = "Edit the plot:";
    editplotheading.appendChild(editplotheadingtext);
    controlsDiv.appendChild(editplotheading);

    //PERIOD_HRS
    const PeriodHrsslider = document.createElement("input");
    PeriodHrsslider.type = "number";
    PeriodHrsslider.min = 0;
    PeriodHrsslider.style.width = "54px";
    PeriodHrsslider.value = this.periodHrs();
    // add an event listener to the slider control to update the PeriodHrs of the element
    PeriodHrsslider.addEventListener("change", () => {
      elementPeriodHrs = parseFloat(PeriodHrsslider.value);
      this.periodHrs(elementPeriodHrs);
      //UPDATE THE DATA AND REDRAW HERE
      this.update(this.dataSources());
    });
    // create a label for the input control
    const PeriodHrslabel = document.createElement("label");
    PeriodHrslabel.innerText = "Period (hrs):";
    PeriodHrslabel.setAttribute("for", "PeriodHrs-input");
    // wrap the label and input controls in a div
    const PeriodHrsDiv = document.createElement("div");
    PeriodHrsDiv.appendChild(PeriodHrslabel);
    PeriodHrsDiv.appendChild(PeriodHrsslider);
    // add the slider control to the DOM
    controlsDiv.appendChild(PeriodHrsDiv);

    // NORMALISE
    const normaliseInput = document.createElement("input");
    normaliseInput.type = "checkbox";
    normaliseInput.checked = normalise;
    normaliseInput.id = "normalise-input";

    // add an event listener to the checkbox to update the normalise flag of the element
    normaliseInput.addEventListener("change", () => {
      this.normalise(normaliseInput.checked);
      //UPDATE THE DATA AND REDRAW HERE
      this.update(this.dataSources());
    });

    // create a label for the checkbox control
    const normaliseLabel = document.createElement("label");
    normaliseLabel.innerText = "Normalise:";
    normaliseLabel.setAttribute("for", "normalise-input");

    // wrap the label and checkbox controls in a div
    const normaliseDiv = document.createElement("div");
    normaliseDiv.appendChild(normaliseLabel);
    normaliseDiv.appendChild(normaliseInput);

    // add the checkbox control to the DOM
    controlsDiv.appendChild(normaliseDiv);

    //-------------------------------------
    //------------------------------------- Somewhat generic code for plot sizing
    //-------------------------------------

    //WIDTH
    const widthslider = document.createElement("input");
    widthslider.type = "number";
    widthslider.min = 0;
    widthslider.style.width = "54px";
    widthslider.value = width;
    // add an event listener to the slider control to update the width of the element
    widthslider.addEventListener("change", () => {
      elementwidth = parseInt(widthslider.value);
      this.width(elementwidth);
      this.update();
    });
    // create a label for the input control
    const widthlabel = document.createElement("label");
    widthlabel.innerText = "Width:";
    widthlabel.setAttribute("for", "width-input");
    // wrap the label and input controls in a div
    const widthDiv = document.createElement("div");
    widthDiv.appendChild(widthlabel);
    widthDiv.appendChild(widthslider);
    // add the slider control to the DOM
    controlsDiv.appendChild(widthDiv);

    //HEIGHT
    const heightslider = document.createElement("input");
    heightslider.type = "number";
    heightslider.min = 0;
    heightslider.style.width = "54px";
    heightslider.value = height;
    // add an event listener to the slider control to update the height of the element
    heightslider.addEventListener("change", () => {
      elementgeight = parseInt(heightslider.value);
      this.height(elementgeight);
      this.update();
    });
    // create a label for the input control
    const heightlabel = document.createElement("label");
    heightlabel.innerText = "Height:";
    heightlabel.setAttribute("for", "height-input");
    // wrap the label and input controls in a div
    const heightDiv = document.createElement("div");
    heightDiv.appendChild(heightlabel);
    heightDiv.appendChild(heightslider);
    // add the slider control to the DOM
    controlsDiv.appendChild(heightDiv);

    //-------------------------------------
    //------------------------------------- More bespoke to actigrams
    //-------------------------------------

    //BETWEEN
    const betweenslider = document.createElement("input");
    betweenslider.type = "number";
    betweenslider.min = 0;
    betweenslider.style.width = "54px";
    betweenslider.value = this.between();
    // add an event listener to the slider control to update the between of the element
    betweenslider.addEventListener("change", () => {
      elementbetween = parseInt(betweenslider.value);
      this.between(elementbetween);
      this.update();
    });
    // create a label for the input control
    const betweenlabel = document.createElement("label");
    betweenlabel.innerText = "Between:";
    betweenlabel.setAttribute("for", "between-input");
    // wrap the label and input controls in a div
    const betweenDiv = document.createElement("div");
    betweenDiv.appendChild(betweenlabel);
    betweenDiv.appendChild(betweenslider);
    // add the slider control to the DOM
    controlsDiv.appendChild(betweenDiv);
  };

  return chart;
}
