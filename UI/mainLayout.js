// THE MAIN LAYOUT
import { w2layout } from '../dependencies/w2ui-2.0.es6.min.js'


let layout = new w2layout({
    box: '#layout',
    name: 'layout',
    panels: [
        { type: 'top', size: 60, style: pstyle, resizable: false, 
            style: pstyle+'padding-left: 50px;', 
            html: `<div id="toolbar"></div>` },
        { type: 'left', size: 200, resizable: true, style: pstyle, 
            html: '<div id="sideBarDataList"></div>' },
        { type: 'main', style: pstyle, overflow: 'hidden'},
        { type: 'preview', style: pstyle, size: '20%', overflow:'hidden', resizable: true },
        { type: 'bottom', size: 60, resizable: true, style: pstyle, 
                    html: ` <div id="messages"></div>` }
    ]
})

let plotlayout = new w2layout({
    name: 'plotlayout',
    panels: [
        { type: 'main', style: pstyle+"height:100%;", html: `<div id="tabs" style="width: 100%; position: sticky;top: -6px;left:0px;"></div>
        <div id="plotContent">Create a plot to show it here.</div>`},
        { type: 'right', size: "20%", style: pstyle+"height:100%; width:100%;", resizable: true, html:` <div id="exportplotbutton"></div>
                                                                <div id="controls"></div>`}
    ]
})

let datalayout = new w2layout({
    name: 'datalayout',
    panels: [
        { type: 'main', style: pstyle + "height:100%;", html: `<div id="datatabs" style="width: 100%; position: sticky;top: -6px;left:0px;"></div>
        <div id="dataContent" style="width: 100%;height: calc(100% - 28px);">Click on a data link to show it here.</div>` },
        { type: 'right', size: "20%", style: pstyle+"height:100%; width:100%;", resizable: true, html: `<div id="exportdatabutton"></div>`}
    ]
})

layout.html('main', plotlayout)
layout.html('preview', datalayout)

//make global
window.layout = layout;