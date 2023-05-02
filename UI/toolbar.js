import { w2toolbar } from '../dependencies/w2ui-2.0.es6.min.js'

let pstyle = 'background: #eeeeee; padding: 5px;'

// THE TOOLBAR
let toolbar = new w2toolbar({
    box: '#toolbar',
    name: 'toolbar',
    style: pstyle,
    items: [
        { type: 'menu', id: 'data', style: pstyle, text: 'Data', items: [
            { text: 'Import', onClick: importFunc},
            { text: 'Create', onClick: generateData}
        ]},
        { type: 'menu', id: 'plot', style: pstyle, text: 'Plot', items: [
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
    const ID = tabs.tabs.length;
    addTab()
    var d = dataList[0].data;
    const newData1 = [];
    for (const dataPoint of d) {
    newData1.push({
        date: dataPoint.date,
        value: dataPoint.value_0,
    });
    }

    var testActigram = actigram(ID)
            .width(200+Math.round(Math.random()*200))
            .height(15+Math.round(Math.random()*15))
            .dataTabCols({table: 'Sample0', dates: 'date', values: 'value_0'})
            .putcontrols("#controls");

    charts.push({
        id: "testActigram",
        selection: "#thePlot"+ID,
        chart: testActigram,
    });

    d3.select(charts[ID].selection)
    .datum(newData1)
    .call(charts[ID].chart);

    setTimeout(function() {
        tabs.click("tab"+(ID+1))
    }, 310);
}

window.toolbar = toolbar;