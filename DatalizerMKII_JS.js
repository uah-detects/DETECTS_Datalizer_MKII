const userList = document.querySelectorAll(".name-list li");

var headerDataArray = [];
var bodyDataArray = [];

console.log(userList);

function dropHandler(ev) {
    console.log('File(s) dropped');
  
    // Prevent default behavior (Prevent file from being opened)
    ev.preventDefault();
  
    if (ev.dataTransfer.items) {
      // Use DataTransferItemList interface to access the file(s)
      for (var i = 0; i < ev.dataTransfer.items.length; i++) {
        // If dropped items aren't files, reject them
        if (ev.dataTransfer.items[i].kind === 'file') {
          var file = ev.dataTransfer.items[i].getAsFile();
          console.log('... file[' + i + '].name = ' + file.name);
        }
      }
    } else {
      // Use DataTransfer interface to access the file(s)
      for (var i = 0; i < ev.dataTransfer.files.length; i++) {
        console.log('... file[' + i + '].name = ' + ev.dataTransfer.files[i].name);
      }
    }
  }

  function dragOverHandler(ev) {
    console.log('File(s) in drop zone');
  
    // Prevent default behavior (Prevent file from being opened)
    ev.preventDefault();
  }

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

  function displayContentsOfFile(fileContentArray)
  {
    for(var line = 0; line < fileContentArray.length-1; line++){
      console.log(line + " --> "+ fileContentArray[line]);
    }
  }

  
  function displayContents(contents) {
    var element = document.getElementById('file-content');
    element.textContent = contents;
  }

  function returnXlist(){
    var myArray = [1,2,3,4,5];
    return myArray;
  }
  function returnYlist(){
    var myArray2 = [6,7,8,9,100];
    return myArray2;
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

    var x_array = returnXlist();

    var y_array = returnYlist();
    
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

      Plotly.newPlot("plotGraph", data);
    }



  }

  document.getElementById('file-input').addEventListener('change', readSingleFile, false);