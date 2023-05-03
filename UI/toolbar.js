import { w2toolbar } from '../dependencies/w2ui-2.0.es6.min.js'

// THE TOOLBAR
let toolbar = new w2toolbar({
    box: '#toolbar',
    name: 'toolbar',
    style: pstyle+"border:none;",
    items: [
        { type: 'menu', id: 'data', style: pstyle+"border:none;", text: 'Data', items: [
            { text: 'Import', onClick: importFunc},
            { text: 'Create', onClick: generateData}
        ]},
        { type: 'menu', id: 'plot', style: pstyle+"border:none;", text: 'Plot', items: [
            { text: 'Actigram', onClick: makeNewActigram}
        ]},
    ],
    onClick(event) {
        doToolbarItemClick(event.target);
    }
})
// function to map the onClick parts of the toolbar to their functions
function doToolbarItemClick(input){
    const parts = input.split(':');
    let currentItem = null;
    let currentItems = toolbar.items;

    for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        currentItem = currentItems.find(item => item.id === part);
        if (!currentItem) {
        break;
        }
        if (currentItem.items) {
        currentItems = currentItem.items;
        }
    }

    if (currentItem && currentItem.onClick) {
        currentItem.onClick();
    }
    
}

function makeNewActigram(){

    const ID = addTab()

    var d = dataList[0].data;
    const newData3 = [];
          for (const dataPoint of d) {
            newData3.push({
              date: dataPoint.date,
              value: dataPoint.value_0,
            });
          }

    var testActigram2 = actigram(ID-1)
                        .width(400)
                        .height(15)
                        .dataTabCols({table: 'Sample1', dates: 'date', values: 'value_0'})
                        .lightTabCols({table: 'Sample1', dates: 'date', values: 'value_1'})
                        .putcontrols("#controls");

    charts.push({
        chartID: (ID-1),
        selection: "#thePlot"+(ID-1),
        chart: testActigram2,
    });

    const gotolast = charts.length -1
    d3.select(charts[gotolast].selection)
        .datum(newData3)
        .call(charts[gotolast].chart);

    setTimeout(function() {
        tabs.click("tab"+(ID))
    }, 310);
}

window.toolbar = toolbar;