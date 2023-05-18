
 // -- update the display of dataList
function updateSidebarData(){
    let listItems = "";
    for (let i = 0; i < dataList.length; i++) {
        listItems +=
        `<li><a href='javascript:adddataTab("dataList",${i},0,0)'>` +
        dataList[i].name +
        "</a></li>";
    }
    document.getElementById("sideBarDataList").innerHTML =
        `<div><h4>Data to use:</h4></div>
            <ul>${listItems}</ul>`;
    
}