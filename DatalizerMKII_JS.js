
var headerDataArray = [];
var bodyDataArray = [];

function readSingleFile(e) {
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

  for(let i = 0; i < headerSize; i++)                         //Createing each array column of the multidimensional Array
  {
      dataArray.push([]);
  }
  console.log(dataArray);
  
  for(let j = 1; j < fileContentArray.length - 1; j++)            //First loop is looping through the file line by line
  {
    var parseLine = fileContentArray[j].split(',');

    for(let k = 0; k < headerSize; k++)                       //Looping through each line item by item
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
  console.log("Y = " +ySelection)
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
    var trace1 =
    {
        x: bodyDataArray[xIndex],
        y: bodyDataArray[yIndex],
        type: 'scatter'

    };
    console.log('Called');
    var data = [trace1];
   // Plotly.newPlot("txt_1", data);

  // Finding total number of elements added
  var total_element = $(".element").length;
 
  // last <div> with element class id
  var lastid = $(".element:last").attr("id");
  var split_id = lastid.split("_");
  var nextindex = Number(split_id[1]) + 1;

  var max = 5;
  // Check total number elements
  if(total_element < max ){
   // Adding new div container after last occurance of element class
   $(".element:last").after("<div class='element' id='div_"+ nextindex +"'></div>");
 
   // Adding element to <div>
   $("#div_" + nextindex).append("<div id='txt_"+ nextindex +"' style='width:1200px;height:500px;'></div>");
 
  }
  Plotly.newPlot("txt_"+ nextindex +"", data);

    
  }

}

document.getElementById('file-input').addEventListener('change', readSingleFile, false);