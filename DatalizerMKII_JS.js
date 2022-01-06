/*------ Parse Config File------------------------------------------------- */

var verificationHeaderArray = [];
var scienceQuestionArray = [];

function readConfFile(e) {
  var file = e.target.files[0];
  if (!file) {
    return;
  }
  var reader = new FileReader();
  reader.onload = function(e) {
    var fileContentArray = this.result.split(/\r\n|\n/);
    console.log(fileContentArray);

    var headerLine = grabVerHeader(fileContentArray);

    console.log(headerLine);
    if (headerLine == null)         //Testing to see if a verification header was returneed by grabVerHeader
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
    scienceQuestionArray = body;
    console.log(body);
    console.log(scienceQuestionArray);
    console.log("After");
    populateScienceQuestionDropdown();
  };
  reader.readAsText(file);
}

function populateScienceQuestionDropdown()
{
  var selectScienceQuestion = document.getElementById("selectScienceQuestion");

  for(var i = 0; i < scienceQuestionArray.length; i++) {
    var opt = scienceQuestionArray[i][0];
    var el = document.createElement("option");
    el.textContent = opt;
    el.value = opt;
    selectScienceQuestion.appendChild(el);
  }

}

function grabVerHeader(fileContentArray)
{
  var headerLine = fileContentArray[0];
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

  for(let i = 1; i <= fileContentArray.length - 1; i++)
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
  while(stopLoop)
  {
      switch(close) {
        case false:
          var percentPosition = fileBodyString.indexOf("<",lastPosition);
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
            console.log("Start: "+ startPercentPos);
            close = true;
          }
          break;
        case true:
          var percentPosition = fileBodyString.indexOf(">",lastPosition);
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
            console.log("Stop: "+ closePercentPos);
            var scienceQuestion = fileBodyString.substring(startPercentPos+1,closePercentPos);
            console.log(scienceQuestion);
            var graphArray = getGraphs(closePercentPos,fileBodyString);
            if(graphArray == null)
            {
              return null;
            }
            console.log(graphArray);
            var arrayLineItem = [];
            arrayLineItem.push(scienceQuestion);
            for(let i = 0; i < graphArray.length; i++)
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

function getGraphs(closeAngleBracketPos,fileBodyString)
{
  var graphString;
  var startPercentPos = 0;
  var closePercentPos = 0;
  var close = false;


  var stopLoop = true;
  var lastPosition = closeAngleBracketPos;

  console.log(fileBodyString.length - 1);
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
          close = true;
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
          graphString = fileBodyString.substring(startPercentPos+1,closePercentPos);
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
              if(verifyHeaderItem(graphSub[0]))
              { 
                graphsArray.push(graphSub[0]);
              }
              else{
                stopLoop = true;
                error = true;
              }
              if(verifyHeaderItem(graphSub[1]))
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

function verifyHeaderItem(item)
{
  for(let i = 0; i < verificationHeaderArray.length; i++){
    if(item.toLowerCase() == verificationHeaderArray[i].toLowerCase())
    {
      return true;
    }
  }
  console.log("ERROR");
  return false;
}

/*------ Plot Graph-------------------------------------------------------- */
var headerDataArray = [];
var bodyDataArray = [];

function readDataFile(e) {
  var file = e.target.files[0];
  if (!file) {
    return;
  }
  var reader = new FileReader();
  reader.onload = function(e) {
    var fileContentArray = this.result.split(/\r\n|\n/);
    var headerLine = splitHeader(fileContentArray);
    console.log("in read --> " + headerLine);
    var headerSize = headerLine.length;
    console.log(headerSize);

    //parsing the body of the data
    var bodyArray = splitBody(headerSize, fileContentArray);
    console.log(bodyArray);

    //Setting global arrays
    headerDataArray = headerLine;
    bodyDataArray = bodyArray;

    populateDropdowns(headerLine);
  };
  reader.readAsText(file);
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
  
  for(let j = 1; j < fileContentArray.length - 1; j++)            //First loop is looping through the file line by line
  {
    var parseLine = fileContentArray[j].split(',');

    for(let k = 0; k < headerSize; k++)                       //Looping through each line item, item by item
    {
      dataArray[k].push(parseLine[k]);
    }

  }

  return dataArray;
}

function populateDropdowns(headerArray)
{
  var selectX = document.getElementById("selectX");
  var selectY = document.getElementById("selectY");

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

  do
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

function plotScienceQuestion()
{
  console.log("SQ" + bodyDataArray);

  var sQSelection = document.getElementById("selectScienceQuestion");
  console.log("SQ = " +sQSelection);
  var sQPosition = sQSelection.value;
  console.log("SQ = " + sQPosition);

  
  var sQIndex = -1;
  
  var count = 0;

  do
  {
    console.log("Entered");
    if(sQPosition == scienceQuestionArray[count][0])
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
    console.log(scienceQuestionArray[sQIndex].length);

    for(let i = 1; i <scienceQuestionArray[sQIndex].length; i = i+2)
    {
      console.log(scienceQuestionArray[sQIndex][i]+scienceQuestionArray[sQIndex][i + 1]);

      var xIndex = -1;
      var yIndex = -1;
      
      var count = 0;
    
      do
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

    //plot(xIndex,yIndex);
  }

}

function plot(xIndex,yIndex)
{
    var trace1 =
    {
        x: bodyDataArray[xIndex],
        y: bodyDataArray[yIndex],
        type: 'scatter'

    };
    console.log('Called');
    var data = [trace1];

   // Plotly.newPlot("txt_1", data);

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
   $("#div_" + nextindex).append("<div id='txt_"+ nextindex +"' style='width:1200px;height:500px;'></div>");
 
  }
  Plotly.newPlot("txt_"+ nextindex +"", data);
///////////////////////////////////////////////////////////////////////////////////////////// Multi Functionality End //////////////////////////////////////////////////
    
}

/////////// Event Listeners ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

document.getElementById('file-input').addEventListener('change', readDataFile, false);  // Listener for the Data File input

document.getElementById('CONFIG_FILE').addEventListener('change', readConfFile, false);  // Listener for the Data File input