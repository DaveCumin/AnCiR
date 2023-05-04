function generateData(  Ndays   = 7, //number of days to produce
                        fs_min  = 5,  //sampling rate in minutes
                        start   = "10/01/2023 10:35", //start date/time
                        period  = [25, 22.5], //period of the circadian rhythm
                        maxheight = [200, 100] // the maximum height of the data
                       ){

    const sampleN = 24 * (60/fs_min) * Ndays; //N days of data with 288 points on each day
    let startDate = new Date(start);
    let endDate = new Date(startDate.getTime() + Ndays * 24 * 60 * 60 * 1000); // N days later
    let sampletimes = [];

    sampletimes.push(startDate.toLocaleString("en-US")); // add current time to string
    while (startDate < endDate) {
      sampletimes.push(
        new Date(
          startDate.setTime(startDate.getTime() + fs_min * 60 * 1000)
        ).toLocaleString("en-US")
      ); // add 15 minutes to current time
    }
    const sampledata = [];
    for (let i = 0; i < sampleN; i++) {
        sampledata.push({date: sampletimes[i]}) 
    }
    period.forEach( (p,pindex) => {
        for (let i = 0; i < sampleN; i++) {
          var mult = maxheight[pindex];
          if (i % ((60 / fs_min) * p) < 144) {
            mult = maxheight[pindex]*0.05;
          }
          const valueKey = `value_${pindex}`;
          sampledata[i][valueKey] = Math.random() * mult
        }
      });

    dataList.push({ name: "Sample"+dataList.length, data: sampledata });

    //refresh the view
    updateSidebarData()
}


