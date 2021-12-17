const userList = document.querySelectorAll(".name-list li");

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
      var bodyArray = splitBody(headerSize, fileContentArray);
      console.log(bodyArray);
      //displayContentsOfFile(fileContentArray);
      //for(var line = 0; line < fileContentArray.length-1; line++){
      //  console.log(line + " --> "+ fileContentArray[line]);
      //}
     // var contents = e.target.result;
      //displayContents(contents);
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

    var x_array = returnXlist();

    var y_array = returnYlist();

    var trace1 =
    {
        x: x_array,
        y: y_array,
        type: 'scatter'

    };
    console.log('Called');
    var data = [trace1];

    Plotly.newPlot("plotGraph", data);

  }

  document.getElementById('file-input').addEventListener('change', readSingleFile, false);