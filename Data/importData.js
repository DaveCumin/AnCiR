import { w2popup, w2field, query } from "/dependencies/w2ui.min.js";




function importpopup() {
    w2popup.open({
        title: 'Import data',
        text: ` <div class="w2ui-field">
                    <label>Attach Files:</label>
                    <div> <input id="file"> </div>
                </div>`,
        actions: ['Ok', 'Cancel'],
        width: 600,
        height: 400,
        modal: true,
        showClose: true,
    })
    .ok((evt) => {
        //process the data
        fileImport.selected.forEach(selectedFile => {
            Papa.parse(selectedFile.file, {
                header: true,
                dynamicTyping: true,
                error: function (err, file, inputElem, reason) {
                  console.log("Error: " + err);
                },
                complete: function (results) {
                  dataList.push({ name: selectedFile.name, data: results.data });
                  updateSidebarData()
                },
              });     
        });
        
        w2popup.close()
    })
    .cancel((evt) => {
        console.log('cancel', evt)
        w2popup.close()
    })

      window.fileImport = new w2field('file', { el: query('#file')[0] })

  };


window.importFunc = function(){
    importpopup();
}


window.exportData = function(){
  const activeTab = datatabs.active;
  const fromindex = activeTab.split("_");

  var data  = []
  if(fromindex[1] === "dataList"){
    data = dataList[fromindex[2]].data;
  }
  if(fromindex[1] === "chartList"){
    data = charts[fromindex[2]].chart.chartData()
  }

  const csvRows = [];
  const headers = Object.keys(data[0]).filter(header => header !== 'recid');
  csvRows.push(headers.map(header => `"${header}"`).join(','));

  for (const row of data) {
    const values = headers.map(header => `"${row[header]}"`);
    csvRows.push(values.join(','));
  }

  const csvString = csvRows.join('\n');

  const downloadLink = document.createElement('a');
  downloadLink.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvString));
  const tabName = datatabs.tabs[datatabs.tabs.findIndex(t => t.id == datatabs.active)].text;
  downloadLink.setAttribute('download', tabName+'.csv');
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
}