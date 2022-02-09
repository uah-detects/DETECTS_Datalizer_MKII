/*------Science Question Graph Variables------------------------------------------------- */

// This verification Header Insures that the data from the CSV file matches the values that have been preselected
// to be graphed fo each science question. It is VITAL that the list of items in the verification header matches
// the items listed in the scienceQuestionFileBody. If they do not match the program will not function properly.
// Only change what is betweeen the "" and make sure the verification header has the respective starting % and closing %.
var scienceQuestionVerificationHeader = "%time,lasttime,lat,lng,speed,course,altitude,Temperature (Celsius),Pressure (Pa),Ascent Rate (m/s),Distance Traveled (m),Absolute Course Difference (degrees)%";

var prettyHeader= ["Time (24-hr UTC)","Last Time (24-hr UTC)","Lat","Lng","Speed (km/hr)","Course (degrees)","Altitude (m)","Temperature (Celsius)","Pressure (Pa)","Ascent Rate (m/s)","Distance Traveled (m)","Absolute Course Difference (degrees)"];
// The scienceQuestionFileBody is the main point where the graph selections for each science objective is stored.
// The science question is delimeted by a starting < and a closing > with the name of the science question in between.
// Each group of graphs is seperated with a starting { and a closing } in between those curly brackets each xy graph
// is delimited by a starting [ and a closing ] in between those square braces is the x data point, a comma, and the y data point.
// it is very important to follow this form to make sure that the file is parsed correctly. You may notice that after som lines there is a \
// this is to escape the newline character. This \ is important for the multiline string format only. It has no impact on the data within
// the string itself. When editing the file make sure to follow the proper format and keep the closing ".
var scienceQuestionFileBody = "<Temperature Change>{[altitude,Temperature (Celsius)][Temperature (Celsius),speed][Temperature (Celsius),time]} \
<Pressure Change>{[altitude,Pressure (Pa)][Pressure (Pa),time][Pressure (Pa),Temperature (Celsius)]} \
<Time of Day>{[altitude,Temperature (Celsius)][altitude,Pressure (Pa)][altitude,time][Temperature (Celsius),time][Pressure (Pa),time][speed,time]} \
<Distance Traveled>{[altitude,time][altitude,speed][lat,time][lng,time][lat,lng]}\
<Jet Stream>{[altitude,speed]}\
<Clouds>{[altitude,time][Pressure (Pa),time]}\
<Tropopause>{[altitude,Temperature (Celsius)]}\
<Pollutants>{[altitude,speed]}\
<Ascent Rate>{[Ascent Rate (m/s),time][altitude,Ascent Rate (m/s)][Ascent Rate (m/s),Temperature (Celsius)][Ascent Rate (m/s),Pressure (Pa)]}\
<Wind Shear>{[altitude,speed][course,time][altitude,course]}";

/*------Global Values------------------------------------------------- */
var verificationHeaderArray = [];
var scienceQuestionArray = [];
var headerDataArray = [];
var bodyDataArray = [];
var calculationSwitchState = true;
var colorDifSwitchState = true;

/*------Call On Page Load------------------------------------------------- */
window.onload = function ()
{
  readConfFile();
};

/*------ Parse Config File------------------------------------------------- */
function readConfFile()
{
    var fileContentArray = scienceQuestionFileBody.split();
    console.log(fileContentArray);

    var headerLine = grabVerHeader(scienceQuestionVerificationHeader);

    console.log(headerLine);
    if (headerLine == null)         //Testing to see if a verification header was returned by grabVerHeader
    {
      return { 
        error: true,
        message: 'No valid verification header'
      }
    }

    verificationHeaderArray = headerLine;     // setting the global version of the headerLine

    console.log("Before");
    var body = getConfBody(fileContentArray);
    if(body == null)
    {
      window.alert("Error: Config Syntax Error");
      return;
    }
    scienceQuestionArray = body;           //setting the global science Question Array
    populateScienceQuestionDropdown();
    disableInterface();
}

//This function populates the Science question dropdown from the global science question array
function populateScienceQuestionDropdown()
{
  var selectScienceQuestion = document.getElementById("selectScienceQuestion");

  //looping through the global science question array setting each position 0 of the 2d array to populate the dropdown
  for(var i = 0; i < scienceQuestionArray.length; i++) {
    var opt = scienceQuestionArray[i][0];
    var el = document.createElement("option");
    el.textContent = opt;
    el.value = opt;
    selectScienceQuestion.appendChild(el);
  }

}

//function gets the verification header
function grabVerHeader(fileContentArray)
{
  var headerLine = fileContentArray;
  console.log(headerLine);
  if(headerLine.startsWith("%") && headerLine.endsWith("%")){
    console.log(headerLine);
    var validHLine = headerLine.substring(
      headerLine.indexOf("%") + 1, 
      headerLine.lastIndexOf("%")
    );
    console.log(validHLine);
    var newHeaderArray = validHLine.split(',');
    return newHeaderArray;
  }
  else{
    console.log("Error: No valid verification header");
    window.alert("Error: No valid verification header");
    return null;
  }

}

function getConfBody(fileContentArray)
{
  var data2DArray = [];                    //holds the main 2d Array
  console.log(fileContentArray.length - 1);
  var fileBodyString = fileContentArray[0];

  for(let i = 1; i <= fileContentArray.length - 1; i++)      //Looping through the file and putting everything into one singular string
  {
    fileBodyString = fileBodyString + fileContentArray[i];
  }
  console.log(fileBodyString);

  var startPercentPos = 0;
  var closePercentPos = 0;
  var close = false;

  var stopLoop = true;
  var lastPosition = 0;

  console.log(fileBodyString.length - 1);
  //loop searches for the < at the start of a science question. Then makes calls to functions to populate the science question array.
  while(stopLoop)
  {
      switch(close) {
        case false:
          var percentPosition = fileBodyString.indexOf("<",lastPosition);
          console.log(percentPosition);
          if(percentPosition == -1)  //"<" not found
          {
            stopLoop = false;
          }
          else{

            if(percentPosition + 1 < fileBodyString.length -1) // testing if the percent position overruns the length of the string
            {
              lastPosition = percentPosition + 1;
            }
            else{
              stopLoop = false;
            }
            startPercentPos = percentPosition;
            console.log("Start: "+ startPercentPos);
            close = true; //"< found"
          }
          break;
        case true:
          var percentPosition = fileBodyString.indexOf(">",lastPosition);
          console.log(percentPosition);
          if(percentPosition == -1)  //">" not found
          {
            stopLoop = false;
          }
          else{

            if(percentPosition + 1 < fileBodyString.length -1) // testing if the percent position overruns the length of the string
            {
              lastPosition = percentPosition + 1;
            }
            else{
              stopLoop = false;
            }
            closePercentPos = percentPosition;
            console.log("Stop: "+ closePercentPos);
            var scienceQuestion = fileBodyString.substring(startPercentPos+1,closePercentPos); // holds the actual science question
            console.log(scienceQuestion);
            var graphArray = getGraphs(closePercentPos,fileBodyString); // holds the array of graphs
            if(graphArray == null) //returns null if an error was found
            {
              return null;
            }
            console.log(graphArray);
            var arrayLineItem = [];
            arrayLineItem.push(scienceQuestion);
            for(let i = 0; i < graphArray.length; i++) // loop pushes each header into the Science question array
            {
              arrayLineItem.push(graphArray[i]);
            }
            console.log(arrayLineItem);
            data2DArray.push(arrayLineItem);
            close = false;
          }
          break;
        default:
          return null;
      }
  }

  return data2DArray;
}

// this function is intended to specifically isolate "{}" in the file
function getGraphs(closeAngleBracketPos,fileBodyString)
{
  var graphString;
  var startPercentPos = 0;
  var closePercentPos = 0;
  var close = false;


  var stopLoop = true;
  var lastPosition = closeAngleBracketPos;

  console.log(fileBodyString.length - 1);

  //loop searches for the { at the start of a graph list. then searches for the }. If found it passes the substring to getGraphArray
  while(stopLoop)
  {
    switch(close) {

      case false:
        var percentPosition = fileBodyString.indexOf("{",lastPosition);
        console.log(percentPosition);
        if(percentPosition == -1)
        {
          stopLoop = false;
        }
        else{

          if(percentPosition + 1 < fileBodyString.length -1)
          {
            lastPosition = percentPosition + 1;
          }
          else{
            stopLoop = false;
          }
          startPercentPos = percentPosition;
          console.log("Start I: "+ startPercentPos);
          close = true; //"{" found
        }
        break;

      case true:
        var percentPosition = fileBodyString.indexOf("}",lastPosition);
        console.log(percentPosition);
        if(percentPosition == -1)
        {
          stopLoop = false;
        }
        else{

          if(percentPosition + 1 < fileBodyString.length -1)
          {
            lastPosition = percentPosition + 1;
          }
          else{
            stopLoop = false;
          }
          closePercentPos = percentPosition;
          console.log("Stop I: "+ closePercentPos);
          if(startPercentPos+1 < closePercentPos){
          graphString = fileBodyString.substring(startPercentPos+1,closePercentPos); //getting the substring of the two {}
          console.log(graphString);
          } 
          else{
            graphString = null;
          }
          close = false;
          stopLoop = false;
        }
        break;

      default:
        return null;
    }
  }

  if(graphString != null)
  {
    var graphArray = getGraphArray(graphString);

    if(graphArray == null || graphArray === undefined || graphArray.length == 0)
    {
      return null;
    }

    return graphArray;
  }
  else{
    return null;
  }

}

function getGraphArray(graphString)
{
  var graphsArray = [];
  var startPercentPos = 0;
  var closePercentPos = 0;
  var close = false;
  var error = false;

  var stopLoop = true;
  var lastPosition = 0;

  //loop searches for the [ at the start of a graph key. then searches for the ]. If found it splits the substring and verifies that each item is a valid member of the verification header
  while(stopLoop)
  {
      switch(close) {
        case false:
          var percentPosition = graphString.indexOf("[",lastPosition);
          console.log(percentPosition);
          if(percentPosition == -1)
          {
            stopLoop = false;
          }
          else{

            if(percentPosition + 1 < graphString.length -1)
            {
              lastPosition = percentPosition + 1;
            }
            else{
              stopLoop = false;
            }
            startPercentPos = percentPosition;
            console.log("Start: "+ startPercentPos);
            close = true;
          }
          break;
        case true:
          var percentPosition = graphString.indexOf("]",lastPosition);

          console.log(percentPosition);
          if(percentPosition == -1)
          {
            stopLoop = false;
          }
          else{

            if(percentPosition + 1 < graphString.length -1)
            {
              lastPosition = percentPosition + 1;
            }
            else{
              stopLoop = false;
            }
            closePercentPos = percentPosition;
            console.log("Stop: "+ closePercentPos);

            if(startPercentPos + 1 < closePercentPos){

              var graphs = graphString.substring(startPercentPos+1,closePercentPos);

              console.log(graphs);

              var graphSub = graphs.split(',');

              if(verifyHeaderItem(graphSub[0]))   //verifying that the item is valid
              { 
                graphsArray.push(graphSub[0]);
              }
              else{
                stopLoop = true;
                error = true;
              }

              if(verifyHeaderItem(graphSub[1]))   //verifying that the item is valid
              { 
                graphsArray.push(graphSub[1]);
              }
              else{
                stopLoop = true;
                error = true;
              }
            } 
            else{
              stopLoop = true;
              error = true;
            }
            close = false;
          }
          break;
        default:
          return null;
      }
    
    
  }
  console.log("Array: " + graphsArray);

  if(error)
  {
    console.log("Entered");
    return null;

  }
  return graphsArray;

}

//this function verifies that the item is in the verification header
function verifyHeaderItem(item)
{
  for(let i = 0; i < verificationHeaderArray.length; i++){
    if(item.toLowerCase() == verificationHeaderArray[i].toLowerCase())
    {
      return true;
    }
  }
  console.log("ERROR: Selected Item not in verification Header.");
  return false;
}

/*------ Plot Graph-------------------------------------------------------- */

function readDataFile(e) {
  disableInterface();
  var file = e.target.files[0];
  if (!file) {
    return;
  }
  var reader = new FileReader();
  reader.onload = function(e) {
    var fileContentArray = this.result.split(/\r\n|\n/);


  if (calculationSwitchState == true)
  {
    if( false == verifyCSVHeader(fileContentArray[0]))
    {
      console.log("Error: CSV Header Not Valid");
      window.alert("Error: CSV Header Not Valid");
      return;
    }
    var headerLine = splitHeader(fileContentArray);
    console.log("in read --> " + headerLine);
    var headerSize = headerLine.length;
    console.log(headerSize);

    //parsing the body of the data
    var bodyArray = splitBody(headerSize, fileContentArray);
    console.log(bodyArray);


    headerLine.push("Ascent Rate (m/s)");
    headerLine.push("Distance Traveled (m)");
    headerLine.push("Absolute Course Difference (degrees)");

   for(let j = 0; j < bodyArray[0].length; j++)            //First loop is looping through the file line by line
   {
     if(j == 0)
     {
       //inserting 3 arrays to hold all calculated data
       for(let i = 0; i<= 2; i++)
       {
         bodyArray.push([]);
       }

       bodyArray[9][0] = 0; //adding the zero to the ascent rate column
       bodyArray[10][0] = 0; //adding the zero to the Distance Travelled column
       bodyArray[11][0] = 0; //adding the zero to the Absolute Value Course
     }
     if(j >= 1)
     {
       /*time,lasttime,lat,lng,speed,course,altitude,Temperature (C),Pressure (Pa),Ascent Rate (M/Sec),Distance Traveled (M),Absolute Value Course*/
       /* 0       1     2   3     4     5       6         7              8                 9                  10                        11*/
       
      //Calculate Ascent Rate
      var altitudeOne = bodyArray[6][j-1];
      var altitudeTwo = bodyArray[6][j];
      var dateOne = bodyArray[0][j-1];
      var dateTwo = bodyArray[0][j];
      var ascentRate = calcAscentRate(altitudeOne,altitudeTwo,dateOne,dateTwo);
      bodyArray[9][j] = ascentRate;        //Adding the ascentRate to the bodyArray

      //Calculate Distance Travelled
      var prevLat = bodyArray[2][j-1];
      var currentLat = bodyArray[2][j];
      var prevLon = bodyArray[3][j-1];
      var currentLon = bodyArray[3][j];
      bodyArray[10][j] = calcDistanceTraveled(currentLat,prevLat,currentLon,prevLon);

      // COURSE
      var prevCourse = bodyArray[5][j-1];
      var currentCourse = bodyArray[5][j];
      bodyArray[11][j] = calcAbsoluteValueCourse(prevCourse,currentCourse);
     }
   }
console.log(bodyArray);
   

  }
  else
  {
    var headerLine = splitHeader(fileContentArray);
    console.log("in read --> " + headerLine);
    var headerSize = headerLine.length;
    console.log(headerSize);

    //parsing the body of the data
    var bodyArray = splitBody(headerSize, fileContentArray);
    console.log(bodyArray);

    
    //console.log(headerLine);
  }

    console.log(bodyArray);
    //Setting global arrays
    headerDataArray = headerLine;
    bodyDataArray = bodyArray;

    populateDropdowns(headerLine);
    enableInterface();
    if (verificationHeaderCheck(headerLine) == false)
    {
      document.getElementById("selectScienceQuestion").disabled = true;
      document.getElementById("plotScienceQuestion").disabled = true;
      document.getElementById("selectScienceQuestion").hidden = true;
      document.getElementById("plotScienceQuestion").hidden = true;

      //throwing sudo error
      document.getElementById("headerErrorNotice").disabled=false;
      document.getElementById("headerErrorNotice").hidden = false;
    }
  };
  reader.readAsText(file);
}

function verificationHeaderCheck(headerLine)
{
  var headerLineArray = [];
  headerLineArray = headerLine;
  console.log( headerLineArray);
  console.log(verificationHeaderArray);
  if(headerLine.length == verificationHeaderArray.length)
  {
    for(let i = 0; i <verificationHeaderArray.length; i++)
    {
      if(verificationHeaderArray[i] != headerLine[i])
      {
        return false;
      }
    }
    return true;
  }
  return false;

}

function splitHeader(fileContentArray)
{
  var headerLine = fileContentArray[0].split(',');
  console.log(headerLine);
  return headerLine;
}

function splitBody(headerSize,fileContentArray)
{
  var dataArray = [];
  var headerLine = fileContentArray[0].split(',');

  for(let i = 0; i < headerSize; i++)                         //Creating each array column of the multidimensional Array
  {
      dataArray.push([]);
  }
  console.log(dataArray);
  
  for(let j = 1; j < fileContentArray.length - 1; j++)            //First loop is looping through the file line by line Note: loop starts at one to leave off the header title that is stored in position 0 of the subarray
  {
    var parseLine = fileContentArray[j].split(',');

    for(let k = 0; k < headerSize; k++)                       //Looping through each line item, item by item
    {
      dataArray[k].push(parseLine[k]);
    }

  }

  return dataArray;
}

function removeOptions(selectElement) {
  var i, L = selectElement.options.length - 1;
  for(i = L; i >= 0; i--) {
     selectElement.remove(i);
  }
}

function populateDropdowns(headerArray)
{
  var selectX = document.getElementById("selectX");
  var selectY = document.getElementById("selectY");

  removeOptions(document.getElementById('selectX'));
  removeOptions(document.getElementById('selectY'));

  var elX = document.createElement("option");
  elX.textContent = "Choose an X";
  selectX.appendChild(elX);

  var elY = document.createElement("option");
  elY.textContent = "Choose a Y";
  selectY.appendChild(elY);

  for(var i = 0; i < headerArray.length; i++) {
    var opt = headerArray[i];
    var el = document.createElement("option");
    el.textContent = opt;
    el.value = opt;
    selectX.appendChild(el);
  }
  for(var i = 0; i < headerArray.length; i++) {
    var opt = headerArray[i];
    var el = document.createElement("option");
    el.textContent = opt;
    el.value = opt;
    selectY.appendChild(el);
  }

}

function verifyCSVHeader(stringToVer)
{
  //This is the string that is a the top of the RAW CSV file
  var verificationString = "time,lasttime,lat,lng,speed,course,altitude,Temperature (Celsius),Pressure (Pa)";

  if (verificationString == stringToVer)
  {
    return true;
  }
  else
  {
    return false;
  }
}

//This function is called by the Plot button and is designed to allow the user to manually input a comparison to graph
function plotGraph()
{
  console.log(bodyDataArray);

  var xSelection = document.getElementById("selectX");
  var ySelection = document.getElementById("selectY");
  console.log("X = " +xSelection);
  console.log("Y = " +ySelection);
  var xPosition = xSelection.value;
  var yPosition = ySelection.value;
  console.log("X = " + xPosition);
  console.log("Y = " + yPosition);
  
  var xIndex = -1;
  var yIndex = -1;
  
  var count = 0;

  do //this loop finds the position of the label in the header array
  {
    if(xPosition == headerDataArray[count])
    {
      xIndex = count;
    }
    if(yPosition == headerDataArray[count])
    {
      yIndex = count;
    }
    count++;
  }while(count < headerDataArray.length)

  console.log("X = " + xIndex);
  console.log("Y = " + yIndex);

  if (xIndex == -1 || yIndex == -1)
  {
    console.log("Error: No data selected");
    window.alert("Error: No data selected");
  }
  else
  {
    plot(xIndex,yIndex);
  }

}


//This function is called by the Plot Science Question button and is designed to plot the science question
function plotScienceQuestion()
{
  console.log("SQ" + bodyDataArray);

  var sQSelection = document.getElementById("selectScienceQuestion");
  console.log("SQ = " +sQSelection);
  var sQPosition = sQSelection.value;
  console.log("SQ = " + sQPosition);

  
  var sQIndex = -1;
  
  var count = 0;


  do //this loop finds the array that holds the selected science question
  {
    if(sQPosition == scienceQuestionArray[count][0])   //Since the Science question is always held in position zero of the array Itterate through till the Question is found
    {
      sQIndex = count;
    }
    count++;
  }while(count < scienceQuestionArray.length)

  console.log("X = " + sQIndex);

  if (sQIndex == -1)
  {
    console.log("Error: No data selected");
    window.alert("Error: No data selected");
  }
  else
  {

    for(let i = 1; i <scienceQuestionArray[sQIndex].length; i = i+2)     //itterate through the array starting at position 1 skipping every even position as that is the y position of the pair
    {

      var xIndex = -1;
      var yIndex = -1;
      
      var count = 0;
    
      do   // find the header item in the header array
      {
        console.log(scienceQuestionArray[sQIndex][i]);
        console.log(scienceQuestionArray[sQIndex][i+1]);
        console.log(headerDataArray[count]);
        if(scienceQuestionArray[sQIndex][i] == headerDataArray[count])
        {
          xIndex = count;
        }
        if(scienceQuestionArray[sQIndex][i+1] == headerDataArray[count])
        {
          yIndex = count;
        }
        count++;
      }while(count < headerDataArray.length)

      if (xIndex == -1 || yIndex == -1)   //Header not found in the data set
      {
        console.log("Error: No Header found in the data set");
        window.alert("Error: No Header found in the data set");
      }
      else
      {
        if(colorDifSwitchState == true){
          var max = findMaxAlt();
          //sqPlot(xIndex,yIndex);
          sqAsDecPlot(xIndex,yIndex,max);
        }
        else{
          sqPlot(xIndex,yIndex);
        }
      }

    }
  }

}

function findMaxAlt()
{
  var maxAlt = 0;
  var Index = 0;
  console.log(bodyDataArray[6].length);
  console.log(bodyDataArray[6]);
  for(let i = 0; i < bodyDataArray[6].length; i++) {
    console.log("New Value:--" + bodyDataArray[6][i] + "-- old value: " + maxAlt + " test: " + (bodyDataArray[6][i] >= maxAlt) + " isNaN: " + isNaN(bodyDataArray[6][i]));
    if((bodyDataArray[6][i] - maxAlt) > 0.0)
    {
      console.log("New Max:" + bodyDataArray[6][i] + " old max: " + maxAlt);
      maxAlt = bodyDataArray[6][i];
      Index = i;
      console.log(maxAlt);
    }
    console.log(i);
  }
  console.log(maxAlt);
  console.log(Index);
  val1 = 9984.33;
  val2 = 12341.12;
  console.log("TESTER: " +(val1 < val2) );
  return Index;
}

//this function is used to plot the x, y data it accepts as parameters. It is built with the ability to plot more than one singular graph
function plot(xIndex,yIndex)
{
  var titleTEXT = headerDataArray[xIndex]+" vs "+ headerDataArray[yIndex];
    var trace1 =
    {
        x: bodyDataArray[xIndex],
        y: bodyDataArray[yIndex],
        type: 'scatter'

    };

    var layout = {
      title: {
        text: titleTEXT,
        font: {
          family: 'Courier New, monospace',
          size: 24
        },
        xref: 'paper',
        x: 0.05,
      },
      xaxis: {
        title: {
          text: headerDataArray[xIndex],
          font: {
            family: 'Courier New, monospace',
            size: 18,
            color: '#7f7f7f'
          }
        },
      },
      yaxis: {
        title: {
          text: headerDataArray[yIndex],
          font: {
            family: 'Courier New, monospace',
            size: 18,
            color: '#7f7f7f'
          }
        }
      }
    };

    console.log('Called');
    var data = [trace1];

///////////////////////////////////////////////////////////////////////////////////////////// Multi Functionality Start ///////////////////////////////////////////////
  // Finding total number of elements added
  var total_element = $(".element").length;
 
  // last <div> with element class id
  var lastid = $(".element:last").attr("id");
  var split_id = lastid.split("_");
  var nextindex = Number(split_id[1]) + 1;

  var max = 8; // Setting the maximum number of the graphs that the program will allow

  // Check total number elements
  if(total_element < max ){
   // Adding new div container after last occurance of element class
   $(".element:last").after("<div class='element' id='div_"+ nextindex +"'></div>");
 
   // Adding element to <div>
   $("#div_" + nextindex).append("<div class='pt-4'><button id='remove_" + nextindex + "' class='remove'>X</button>"+"<div class=' pt-1 w-75 'id='txt_"+ nextindex +"' style='height:500px;'></div> </div>");
 
  }

   // Remove element
 $('.container').on('click','.remove',function(){
 
  var id = this.id;
  var split_id = id.split("_");
  var deleteindex = split_id[1];

  // Remove <div> with id
  $("#div_" + deleteindex).remove();

 }); 


  Plotly.newPlot("txt_"+ nextindex +"", data,layout);
///////////////////////////////////////////////////////////////////////////////////////////// Multi Functionality End //////////////////////////////////////////////////
    
}

//this function is used to plot the x, y Science Question data it accepts as parameters. It is built with the ability to plot more than one singular graph
function sqPlot(xIndex,yIndex)
{
  var titleTEXT = prettyHeader[xIndex]+" vs "+ prettyHeader[yIndex];
    var trace1 =
    {
        x: bodyDataArray[xIndex],
        y: bodyDataArray[yIndex],
        type: 'scatter'

    };

    var layout = {
      title: {
        text: titleTEXT,
        font: {
          family: 'Courier New, monospace',
          size: 24
        },
        xref: 'paper',
        x: 0.05,
      },
      xaxis: {
        title: {
          text: prettyHeader[xIndex],
          font: {
            family: 'Courier New, monospace',
            size: 18,
            color: '#7f7f7f'
          }
        },
      },
      yaxis: {
        title: {
          text: prettyHeader[yIndex],
          font: {
            family: 'Courier New, monospace',
            size: 18,
            color: '#7f7f7f'
          }
        }
      }
    };

    console.log('Called');
    var data = [trace1];

///////////////////////////////////////////////////////////////////////////////////////////// Multi Functionality Start ///////////////////////////////////////////////
  // Finding total number of elements added
  var total_element = $(".element").length;
 
  // last <div> with element class id
  var lastid = $(".element:last").attr("id");
  var split_id = lastid.split("_");
  var nextindex = Number(split_id[1]) + 1;

  var max = 8; // Setting the maximum number of the graphs that the program will allow

  // Check total number elements
  if(total_element < max ){
   // Adding new div container after last occurance of element class
   $(".element:last").after("<div class='element' id='div_"+ nextindex +"'></div>");
 
   // Adding element to <div>
   $("#div_" + nextindex).append("<div class='pt-4'><button id='remove_" + nextindex + "' class='remove'>X</button>"+"<div class=' pt-1 w-75 'id='txt_"+ nextindex +"' style='height:500px;'></div> </div>");
 
  }

   // Remove element
 $('.container').on('click','.remove',function(){
 
  var id = this.id;
  var split_id = id.split("_");
  var deleteindex = split_id[1];

  // Remove <div> with id
  $("#div_" + deleteindex).remove();

 }); 


  Plotly.newPlot("txt_"+ nextindex +"", data,layout);
///////////////////////////////////////////////////////////////////////////////////////////// Multi Functionality End //////////////////////////////////////////////////
    
}

//this function is used to plot the x, y Science Question data it accepts as parameters. It is built with the ability to plot more than one singular graph
function sqAsDecPlot(xIndex,yIndex,maxAltIndex)
{
  var ascentX = [];
  var ascentY = [];
  var descentX = [];
  var descentY = [];

  for(let i =0; i <= maxAltIndex; i++){
    ascentX.push(bodyDataArray[xIndex][i]);
    ascentY.push(bodyDataArray[yIndex][i]);
  }
  for(let i =maxAltIndex; i <bodyDataArray[xIndex].length; i++){
    descentX.push(bodyDataArray[xIndex][i]);
    descentY.push(bodyDataArray[yIndex][i]);
  }
  var titleTEXT = prettyHeader[xIndex]+" vs "+ prettyHeader[yIndex];
    var ascent =
    {
        x: ascentX,
        y: ascentY,
        type: 'scatter',
        name: 'Ascent'

    };
    var descent =
    {
        x: descentX,
        y: descentY,
        type: 'scatter',
        name: 'Descent'

    };

    var layout = {
      title: {
        text: titleTEXT,
        font: {
          family: 'Courier New, monospace',
          size: 24
        },
        xref: 'paper',
        x: 0.05,
      },
      xaxis: {
        title: {
          text: prettyHeader[xIndex],
          font: {
            family: 'Courier New, monospace',
            size: 18,
            color: '#7f7f7f'
          }
        },
      },
      yaxis: {
        title: {
          text: prettyHeader[yIndex],
          font: {
            family: 'Courier New, monospace',
            size: 18,
            color: '#7f7f7f'
          }
        }
      }
    };

    console.log('Called');
    var data = [ascent,descent];

///////////////////////////////////////////////////////////////////////////////////////////// Multi Functionality Start ///////////////////////////////////////////////
  // Finding total number of elements added
  var total_element = $(".element").length;
 
  // last <div> with element class id
  var lastid = $(".element:last").attr("id");
  var split_id = lastid.split("_");
  var nextindex = Number(split_id[1]) + 1;

  var max = 8; // Setting the maximum number of the graphs that the program will allow

  // Check total number elements
  if(total_element < max ){
   // Adding new div container after last occurance of element class
   $(".element:last").after("<div class='element' id='div_"+ nextindex +"'></div>");
 
   // Adding element to <div>
   $("#div_" + nextindex).append("<div class='pt-4'><button id='remove_" + nextindex + "' class='remove'>X</button>"+"<div class=' pt-1 w-75 'id='txt_"+ nextindex +"' style='height:500px;'></div> </div>");
 
  }

   // Remove element
 $('.container').on('click','.remove',function(){
 
  var id = this.id;
  var split_id = id.split("_");
  var deleteindex = split_id[1];

  // Remove <div> with id
  $("#div_" + deleteindex).remove();

 }); 


  Plotly.newPlot("txt_"+ nextindex +"", data,layout);
///////////////////////////////////////////////////////////////////////////////////////////// Multi Functionality End //////////////////////////////////////////////////
    
}

function clearGraphs()
{
  $('.container').html("<div class='element' id='div_1'></div><div id='txt_1' style='width:1200px;height:500px;'></div>");
}

function allScreenshot()
{
  var myPlot = document.getElementById('txt_2');
  myPlot.on('plotly_relayout', function(data){
    Plotly.toImage(data).then((dataURI) => {
      console.log(dataURI);
    });
  });
}

$('#btnExport').click(function(){
  //var title = $("<p>Image Here</p>");
  //$("#content").append(title);
    // Finding total number of elements added
    var total_element = $(".element").length;
 
    // last <div> with element class id
    var lastid = $(".element:last").attr("id");
    var split_id = lastid.split("_");
    var nextindex = Number(split_id[1]);
    console.log(nextindex);
    console.log(document.getElementById('imageFileType').value);
    if(nextindex < 2)
    {
      window.alert("Error: You have created no graphs.");
    }
    for(let i =2; i <= nextindex; i++)
    {
      var divGraph = $('#graph');
      Plotly.toImage('txt_'+ i, { format: document.getElementById('imageFileType').value, width: 1200, height: 500 }).then(function (dataURL) {
        console.log(dataURL);
        dataURLtoFile(dataURL, "File", i - 1);
      });
    }

});

$('#btnExportCSV').click(function(){

console.log("In Funcction CSV");
var exportedArray = exportArray();
console.log("New Array");
console.log(exportedArray);

let csvContent = "data:text/csv;charset=utf-8," 
    + exportedArray.map(e => e.join(",")).join("\n");

    var encodedUri = encodeURI(csvContent);
    var link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "balloonData.csv");
    document.body.appendChild(link); // Required for FF
    
    link.click(); 

});

function  dataURLtoFile(dataUrl, fileName, graphNumber){
    var arr = dataUrl.split(','), mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }
    var bb = new File([u8arr], fileName, {type:mime});
    var a = document.createElement('a');
    a.download = 'graph '+graphNumber+'.' + document.getElementById('imageFileType').value;
    a.href = window.URL.createObjectURL(bb);
    a.click();

    return;

}

function exportArray()
{
var exporterArray = [];
exporterArray.push(headerDataArray);
// i delimits row, j delimits column
for(let i = 0; i < bodyDataArray[0].length; i++)
{
  var row = [];
  for(let j=0; j < bodyDataArray.length;j++)
  {
    row[j] = bodyDataArray[j][i];
  }
  exporterArray.push(row);
}
return exporterArray;
}

function disableInterface()
{
  document.getElementById("headerErrorNotice").disabled=true;
  document.getElementById("plotButton").disabled = true;
  document.getElementById("selectX").disabled = true;
  document.getElementById("selectY").disabled = true;
  document.getElementById("selectScienceQuestion").disabled = true;
  document.getElementById("colorChangeSwitch").disabled = true;
  document.getElementById("plotScienceQuestion").disabled = true;
  document.getElementById("clearButton").disabled = true;
  document.getElementById("imageFileType").disabled = true;
  document.getElementById("btnExport").disabled = true;
  document.getElementById("btnExportCSV").disabled = true;
  hiddenInterface();
}

function hiddenInterface()
{
  document.getElementById("headerErrorNotice").hidden=true;
  document.getElementById("plotButton").hidden=true;
  document.getElementById("selectX").hidden = true;
  document.getElementById("selectY").hidden = true;
  document.getElementById("selectScienceQuestion").hidden = true;
  document.getElementById("colorChangeSwitch").hidden = true;
  document.getElementById("plotScienceQuestion").hidden = true;
  document.getElementById("clearButton").hidden = true;
  document.getElementById("imageFileType").hidden = true;
  document.getElementById("btnExport").hidden = true;
  document.getElementById("btnExportCSV").hidden = true;
}

function enableInterface()
{
  document.getElementById("plotButton").disabled = false;
  document.getElementById("selectX").disabled = false;
  document.getElementById("selectY").disabled = false;
  document.getElementById("selectScienceQuestion").disabled = false;
  document.getElementById("colorChangeSwitch").disabled = false;
  document.getElementById("plotScienceQuestion").disabled = false;
  document.getElementById("clearButton").disabled = false;
  document.getElementById("imageFileType").disabled = false;
  document.getElementById("btnExport").disabled = false;
  document.getElementById("btnExportCSV").disabled = false;
  showInterface();
}

function showInterface()
{
  document.getElementById("plotButton").hidden = false;
  document.getElementById("selectX").hidden = false;
  document.getElementById("selectY").hidden = false;
  document.getElementById("selectScienceQuestion").hidden = false;
  document.getElementById("colorChangeSwitch").hidden = false;
  document.getElementById("plotScienceQuestion").hidden = false;
  document.getElementById("clearButton").hidden = false;
  document.getElementById("imageFileType").hidden = false;
  document.getElementById("btnExport").hidden = false;
  document.getElementById("btnExportCSV").hidden = false;
}

 /*------Formulas-------------------------------------------------------- */

function calcAscentRate(altitudeOne,altitudeTwo,dateOne,dateTwo)
{
  var timeDifference = calcTimeDif(dateOne,dateTwo);
  var altitudeDif = altitudeDifference(altitudeOne,altitudeTwo);
  return (altitudeDif / (timeDifference))*1000;
}

function calcTimeDif(dateOne,dateTwo)
{
  var dateOneConvert = new Date(dateOne);
  var dateTwoConvert = new Date(dateTwo);
  var Difference_In_Time = dateTwoConvert.getTime() - dateOneConvert.getTime();
  return Difference_In_Time;
}

function altitudeDifference(y1,y2)
{
  var total = y2 - y1;
  return total;
}

function calcDistanceTraveled(currentLat,prevLat,currentLon,prevLon)
{
  var p = currentLat - prevLat;
  var t = currentLon - prevLon;
  var pSQ = Math.pow(p,2);
  var tSQ = Math.pow(t,2);
  var d = Math.sqrt(pSQ+tSQ);
  dMeters = d * 111111;
  return dMeters
}

function calcAbsoluteValueCourse(prevCourse,currentCourse)
{
  var courseDif = currentCourse - prevCourse;
  courseDif = Math.abs(courseDif);
  if(courseDif > 180)
  {
    courseDif = 360 - courseDif;
  }

  return courseDif;
}

/////////// Event Listeners ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

document.getElementById('file-input').addEventListener('change', readDataFile, false);  // Listener for the Data File input

document.getElementById('mySwitch').addEventListener('change', function(){
if(calculationSwitchState == false)
{
  calculationSwitchState = true;
}
else{
  calculationSwitchState = false;
}
}, false);

document.getElementById('mySwitchColor').addEventListener('change', function(){
  if(calculationSwitchState == false)
  {
    colorDifSwitchState = true;
  }
  else{
    colorDifSwitchState = false;
  }
  }, false);