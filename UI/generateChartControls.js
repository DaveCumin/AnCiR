

// create the dropdown lists for selected data and columns
  function generateActiDataUI(controlsDiv, headingText, chartid, dataI) {
    const dataHeading = document.createElement("div");
    const dataHeadingText = document.createElement("h5");
    if(dataI > 0){
        dataHeadingText.innerHTML = `${headingText} (<a href="javascript:charts[charts.findIndex(c => c.chartID === ${chartid})].chart.removeDataSource(${dataI})">X</a>)`;
    }else{
        dataHeadingText.innerHTML = `${headingText}`;
    }
    dataHeading.appendChild(dataHeadingText);
    controlsDiv.appendChild(dataHeading);
  
    const tableSelect = document.createElement('select');
    tableSelect.id = 'table-dropdown'+dataI;
  
    for (let i = 0; i < dataList.length; i++) {
        const option = document.createElement('option');
        option.value = dataList[i].name;
        option.text = dataList[i].name;
      
        if (charts.find(c => c.chartID === chartid).chart.dataSources()[dataI].table === dataList[i].name) {
          option.selected = true;
        }
      
        tableSelect.appendChild(option);
      }
      
    
  
    const dateColumn = document.createElement('select');
    dateColumn.id = 'dates-dropdown'+dataI;
    const valueColumn = document.createElement('select');
    valueColumn.id = 'values-dropdown'+dataI;
  


    //EVENTS ON CHANGE
    tableSelect.addEventListener('change', () => {
      const sampleName = tableSelect.value;
      

      //clear the dateColumn
      dateColumn.innerHTML = '';
      valueColumn.innerHTML = '';

      //update the dates and values if there is a table selected
      if(sampleName != ''){
        const keys = Object.keys(dataList.find(datas => datas.name === sampleName).data[0]);
        keys.forEach(key => {
            const keyOption = document.createElement('option');
            keyOption.value = key;
            keyOption.text = key;
            dateColumn.appendChild(keyOption);
    
            const valueOption = document.createElement('option');
            valueOption.value = key;
            valueOption.text = key;
            valueColumn.appendChild(valueOption);
        });

          //set the values if there are any
          if(charts.length > 0){    
            const currentSources = charts.find(c => c.chartID === chartid).chart.dataSources()[dataI]
            tableSelect.value =  currentSources.table;
            dateColumn.value = currentSources.dates;
            valueColumn.value = currentSources.values;
        }

        //update the selected value if it exists
        if(charts.length > 0 ){
            charts.find(c => c.chartID === chartid).chart.setDataSources(dataI, 'table', sampleName)
            charts.find(c => c.chartID === chartid).chart.setDataSources(dataI, 'dates', dateColumn.value)
            charts.find(c => c.chartID === chartid).chart.setDataSources(dataI, 'values', valueColumn.value)
        }
        
      }
    });
    dateColumn.addEventListener('change', () => {
        if(charts.length > 0 ){
            charts.find(c => c.chartID === chartid).chart.setDataSources(dataI, 'dates', dateColumn.value)
          }
    })
    valueColumn.addEventListener('change', () => {
        if(charts.length > 0 ){
            charts.find(c => c.chartID === chartid).chart.setDataSources(dataI, 'values', valueColumn.value)
          }
    })
  

    tableSelect.dispatchEvent(new Event('change')); // set the dates and values from the start
  
    const tableLabel = document.createElement('label');
    tableLabel.innerText = 'Table: ';
    tableLabel.setAttribute('for', 'table-dropdown');
  
    const dateLabel = document.createElement('label');
    dateLabel.innerText = 'Dates: ';
    dateLabel.setAttribute('for', 'dates-dropdown');
  
    const valueLabel = document.createElement('label');
    valueLabel.innerText = 'Values: ';
    valueLabel.setAttribute('for', 'values-dropdown');
  
    const sampleDiv = document.createElement('div');
    sampleDiv.appendChild(tableLabel);
    sampleDiv.appendChild(tableSelect);
  
    const dataKeysDiv = document.createElement('div');
    dataKeysDiv.appendChild(dateLabel);
    dataKeysDiv.appendChild(dateColumn);
  
    const dataValuesDiv = document.createElement('div');
    dataValuesDiv.appendChild(valueLabel);
    dataValuesDiv.appendChild(valueColumn);
  
    controlsDiv.appendChild(sampleDiv);
    controlsDiv.appendChild(dataKeysDiv);
    controlsDiv.appendChild(dataValuesDiv);

    //make a colour selector
    const colourSelector = document.createElement('input')
    colourSelector.value = charts.find(c => c.chartID === chartid).chart.dataSources()[dataI].colour;
    colourSelector.setAttribute('id', 'colour-select'+dataI);
    colourSelector.addEventListener('change', () => {
        if(charts.length > 0 ){
            charts.find(c => c.chartID === chartid).chart.setDataSources(dataI, 'colour', colourSelector.value)
          }
    })

    const colourLabel = document.createElement('label');
    colourLabel.innerText = 'Colour: ';
    colourLabel.setAttribute('for', 'colours-select');
    
    controlsDiv.appendChild(colourLabel);
    controlsDiv.appendChild(colourSelector);
    
    

  }
