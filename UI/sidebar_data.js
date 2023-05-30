// -- update the display of dataList
//TODO: make the below prettier (along with much of the rest of the UI I've coded, rather than used W2UI)
function updateSidebarData() {
  let listItems = "";
  for (let i = 0; i < dataList.length; i++) {
    listItems +=
      `<li><a href='javascript:adddataTab("dataList",${i},0,0)'>` +
      dataList[i].name +
      "</a></li>";
  }
  document.getElementById(
    "sideBarDataList"
  ).innerHTML = `<div><h4>Data to use:</h4></div>
            <ul>${listItems}</ul>`;
}
