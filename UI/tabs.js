import { w2tabs, w2prompt, query, w2grid } from "../dependencies/w2ui-2.0.es6.min.js";

// TABS FOR PLOTS
let tabs = new w2tabs({
  box: "#tabs",
  name: "tabs",
  active: "tab1",
  
  tabs: [],
  onClick(event) {
    //get the index
    const index = this.tabs.findIndex((t) => t.id == event.target);

    //Double click
    if (Date.now() - dblctime < 300) {
      tabnamechangepopup(index);
      dblctime = Date.now();
    }

    //----------- CHANGE THE TAB -----------
    //single click = change the plot area and load the appropriate chart
    query("#plotContent").html(`<div id="${charts[index].selection.split("#")[1]}"></div>`);
    
    d3.select(charts[index].selection)
       .call(charts[index].chart);
     
     
    //update the time for double-click
    dblctime = Date.now();
  },
  onClose(event){
     if(tabs.tabs.length === 1){
         document.getElementById("plotContent").innerHTML = "Create a plot to show it here.";
         document.getElementById("controls").innerHTML = "";
         document.getElementById("exportplotbutton").innerHTML = "";
     }

//TODO: need to remove the chart and adjust accordingly
     charts.splice(this.tabs.findIndex((t) => t.id == event.target), 1)
 },
});

window.addTab = function () {
    //add the export button if first tab
    if(tabs.tabs.length === 0){
        document.getElementById("exportplotbutton").innerHTML = `   <button onclick="exportSVG()">EXPORT PLOT</button>
                                                                    <hr>`;
    }
    

    let ind = tabs.tabs.length+1; // get the next index for the new tab
    let newId = "tab" + ind; // generate a new id based on the index
    while (tabs.tabs.findIndex(tab => tab.id === newId) !== -1) {
        ind++; // increment the index
        newId = "tab" + ind; // generate a new id based on the updated index
    }
    tabs.add({ id: newId, text: "Plot " + ind, closable: true });

    query("#plotContent").html(`<div id="thePlot${ind-1}"></div>`);
    tabs.refresh();

    return ind;
};

function updateTabName (tabIndex, newname) {
  tabs.tabs[tabIndex].text = newname;
  tabs.refresh();
};

function tabnamechangepopup (tabIndex) {
  const currentname = tabs.tabs[tabIndex].text;
  w2prompt({
    title: "Update Tab name",
    label: "Change the tab name",
    value: currentname,
    btn_ok: {
      text: "Update",
    },
    btn_cancel: {
      text: "Cancel",
    },
  })
    .ok((event) => {
      console.log("tabchangepopup OK event: "+event);
      updateTabName(tabIndex, event.detail.value);
    })
    .cancel((event) => {
      console.log("tabchangepopup cancel clicked");
    });
};


window.tabs = tabs;



let grid = new w2grid({
    box: '#dataContent',
    name: 'dataTable',
    columns: [ ],
    records: []
})

// TABS FOR DATA
let datatabs = new w2tabs({
    box: "#datatabs",
    name: "datatabs",
    active: "tab1",
    tabs: [ ],
    onClick(event) {
        const fromindex = event.target.split("_")
        showDataInTab(fromindex[1], fromindex[2])
        grid.render("#dataContent");
    },
    onClose(event){
        if(datatabs.tabs.length === 1){
            document.getElementById("dataContent").innerHTML = "Click on a data link to show it here.";
            document.getElementById("exportdatabutton").innerHTML = "";
        }
    },
  });
  
  window.adddataTab = function (from, index) {
    //add the export button if first tab
    if(datatabs.tabs.length === 0){
        document.getElementById("exportdatabutton").innerHTML = `   <button onclick="exportDataCSV()">EXPORT as csv</button>
                                                                    <hr>`;
    }

    //now deal with the new tab
    if(typeof datatabs.click("datatab_" + from + "_" + index) !== 'undefined'){ //if it already exists in the tabs do noting
        const ind = datatabs.tabs.length + 1;
        if(from === 'dataList'){
            datatabs.add({ id: "datatab_" + from + "_" + index, text: dataList[index].name, closable: true });
        }
        if(from === 'chartList'){
            datatabs.add({ id: "datatab_" + from + "_" + index, text: "data1:"+tabs.tabs[index-1].text, closable: true });
        }
        if(from === 'chartListlight'){
          datatabs.add({ id: "datatab_" + from + "_" + index, text: "data2:"+tabs.tabs[index-1].text, closable: true });
        }
        showDataInTab(from, index);
        datatabs.refresh();
        datatabs.click("datatab_" + from + "_" + index);
        
    }
    
  };
  

  // create the table for the data and display it
  window.showDataInTab = function(from, index){
    var columnNames;

    if(from === 'dataList'){
        //get the keys for headers
        const keys = Object.keys(dataList[index].data[0]).filter(k => k!='recid');
        var maxsize = 100+"px"
            
        columnNames = keys.map(key => ({
            field: key,
            text: key,
            size: maxsize
        }));
        //add recid for the table w2grid
        var tableData = dataList[index].data
        for(let i=0; i<tableData.length; i++){
            tableData[i].recid = i+1;
        }
    }
    if(from === 'chartList'){
        //get the keys for headers
        const keys = Object.keys(charts[charts.findIndex(c => c.chartID === index)].chart.chartData()[0]).filter(k => k!='recid');
        var maxsize = 100+"px"
            
        columnNames = keys.map(key => ({
            field: key,
            text: key,
            size: maxsize
        }));
        //add recid for the table w2grid
        var tableData = charts[charts.findIndex(c => c.chartID === index)].chart.chartData()
        for(let i=0; i<tableData.length; i++){
            tableData[i].recid = i+1;
        }
    }
    if(from === 'chartListlight'){
      //get the keys for headers
      const keys = Object.keys(charts[charts.findIndex(c => c.chartID === index)].chart.lightData()[0]).filter(k => k!='recid');
      var maxsize = 100+"px"
          
      columnNames = keys.map(key => ({
          field: key,
          text: key,
          size: maxsize
      }));
      //add recid for the table w2grid
      var tableData = charts[charts.findIndex(c => c.chartID === index)].chart.lightData()
      for(let i=0; i<tableData.length; i++){
          tableData[i].recid = i+1;
      }
  }
    
    grid.columns = columnNames;
    grid.records = tableData;
    grid.render("#dataContent");
    
  }


  window.datatabs = datatabs;
  window.grid = grid;