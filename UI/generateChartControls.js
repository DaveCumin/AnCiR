// create the dropdown lists for selected data and columns
function generateActiDataUI(controlsDiv, headingText, chartid, dataI) {
  dataDiv = document.createElement("div"); // for all the data bits
  dataDiv.setAttribute("id", "data_" + chartid + "_" + dataI);

  const dataHeading = document.createElement("div");
  const dataHeadingText = document.createElement("strong");
  if (dataI > 0) {
    dataHeadingText.innerHTML = `<a>${headingText}</a> <a href="javascript:charts[charts.findIndex(c => c.chartID === ${chartid})].chart.removeDataSource(${dataI})"><div class="menu-icon"><span class="w2ui-icon w2ui-icon-cross deleteDataCross"></span></div></a></strong>`;
  } else {
    dataHeadingText.innerHTML = `<a>${headingText}</a>`;
  }
  dataHeading.style.marginTop = "15px";
  dataHeading.appendChild(dataHeadingText);
  dataDiv.appendChild(dataHeading);

  const tableSelect = document.createElement("select");
  tableSelect.id = "table-dropdown" + dataI;

  for (let i = 0; i < dataList.length; i++) {
    const option = document.createElement("option");
    option.value = dataList[i].name;
    option.text = dataList[i].name;

    if (
      charts.find((c) => c.chartID === chartid).chart.dataSources()[dataI]
        .table === dataList[i].name
    ) {
      option.selected = true;
    }

    tableSelect.appendChild(option);
  }

  const dateColumn = document.createElement("select");
  dateColumn.id = "dates-dropdown" + dataI;
  const valueColumn = document.createElement("select");
  valueColumn.id = "values-dropdown" + dataI;

  //set the values if there are any
  if (charts.length > 0) {
    const currentSources = charts
      .find((c) => c.chartID === chartid)
      .chart.dataSources()[dataI];
    tableSelect.value = currentSources.table;
  }
  //EVENTS ON CHANGE
  tableSelect.addEventListener("change", () => {
    const sampleName = tableSelect.value;

    //clear the dateColumn
    dateColumn.innerHTML = "";
    valueColumn.innerHTML = "";

    //update the dates and values if there is a table selected
    if (sampleName != "") {
      const keys = Object.keys(
        dataList.find((datas) => datas.name === sampleName).data[0]
      );
      keys.forEach((key) => {
        const keyOption = document.createElement("option");
        keyOption.value = key;
        keyOption.text = key;
        dateColumn.appendChild(keyOption);

        const valueOption = document.createElement("option");
        valueOption.value = key;
        valueOption.text = key;
        valueColumn.appendChild(valueOption);
      });

      if (charts.length > 0) {
        const currentSources = charts
          .find((c) => c.chartID === chartid)
          .chart.dataSources()[dataI];
        dateColumn.value = currentSources.dates;
        valueColumn.value = currentSources.values;
      }

      //update the selected value if it exists
      if (charts.length > 0) {
        charts
          .find((c) => c.chartID === chartid)
          .chart.setDataSources(dataI, "table", sampleName);
        charts
          .find((c) => c.chartID === chartid)
          .chart.setDataSources(dataI, "dates", dateColumn.value);
        charts
          .find((c) => c.chartID === chartid)
          .chart.setDataSources(dataI, "values", valueColumn.value);
      }
    }
  });
  dateColumn.addEventListener("change", () => {
    if (charts.length > 0) {
      charts
        .find((c) => c.chartID === chartid)
        .chart.setDataSources(dataI, "dates", dateColumn.value);
    }
  });
  valueColumn.addEventListener("change", () => {
    if (charts.length > 0) {
      charts
        .find((c) => c.chartID === chartid)
        .chart.setDataSources(dataI, "values", valueColumn.value);
    }
  });

  tableSelect.dispatchEvent(new Event("change")); // set the dates and values from the start

  const tableLabel = document.createElement("label");
  tableLabel.innerText = "Table: ";
  tableLabel.setAttribute("for", "table-dropdown");

  const dateLabel = document.createElement("label");
  dateLabel.innerText = "Dates: ";
  dateLabel.setAttribute("for", "dates-dropdown");

  const valueLabel = document.createElement("label");
  valueLabel.innerText = "Values: ";
  valueLabel.setAttribute("for", "values-dropdown");

  const sampleDiv = document.createElement("div");
  sampleDiv.appendChild(tableLabel);
  sampleDiv.appendChild(tableSelect);

  const dataKeysDiv = document.createElement("div");
  dataKeysDiv.appendChild(dateLabel);
  dataKeysDiv.appendChild(dateColumn);

  const dataValuesDiv = document.createElement("div");
  dataValuesDiv.appendChild(valueLabel);
  dataValuesDiv.appendChild(valueColumn);

  dataDiv.appendChild(sampleDiv);
  dataDiv.appendChild(dataKeysDiv);
  dataDiv.appendChild(dataValuesDiv);

  //make a colour selector
  const colourSelector = document.createElement("input");
  colourSelector.value = charts
    .find((c) => c.chartID === chartid)
    .chart.dataSources()[dataI].colour;
  colourSelector.setAttribute("id", "colour-select" + dataI);
  colourSelector.addEventListener("change", () => {
    if (charts.length > 0) {
      charts
        .find((c) => c.chartID === chartid)
        .chart.setDataSources(dataI, "colour", colourSelector.value);
    }
  });

  const colourLabel = document.createElement("label");
  colourLabel.innerText = "Colour: ";
  colourLabel.setAttribute("for", "colours-select");

  const colourDiv = document.createElement("div");
  colourDiv.appendChild(colourLabel);
  colourDiv.appendChild(colourSelector);
  dataDiv.appendChild(colourDiv);

  controlsDiv.appendChild(dataDiv);

  const processData = document.createElement("div");
  processData.innerHTML = `<div class="menu-icon process" id="process_${chartid}_${dataI}"> <a href="javascript:charts[charts.findIndex(c => c.chartID === ${chartid})].chart.addProcessData(${dataI})"><span class="w2ui-icon w2ui-icon-drop processDataIcon"></span></a></div>`;
  dataDiv.appendChild(processData);

  //ADD IN EXISITNG PROCESSES
  const processes = charts[chartid].chart.dataSources()[dataI].process;
  if (processes.length > 0) {
    processes.forEach((p, i) => {
      parameters = Object.values(p).filter((key) => key !== p.name);
      parameters.unshift(i);
      window[p.name + "_controls"](
        `process_${chartid}_${dataI}`,
        ...parameters
      );
    });
  }

  controlsDiv.appendChild(dataDiv);
}
