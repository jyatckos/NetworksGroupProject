var fs = require('fs');
var express = require('express');
var formidable = require('formidable');
const path = require('path');
const fileUpload = require('express-fileupload');
var multer  = require('multer')
var upload = multer({ dest: 'uploads/' })

//code to create a new directory for a user
function createUserDirectory(userName){
  try{
    fs.mkdirSync(__dirname + '/' + userName );
    console.log('The directory ' + userName + ' has been created in: ' + __dirname);
  }catch(err){
    if(err== 'EEXIST'){
      console.log('The directory already exists');
    }else{
      console.log(err);
    }
  }
}

function filewalker(dir,done){
  let results = [];
  let folderItems = [];

  if(fs.existsSync(dir)){
    fs.readdir(dir, function(err,list){
      if(err) return done(err);

      var pending = list.length;
      if(!pending) return done(null, results);

      list.forEach(function(file){
        file = path.resolve(dir,file);

        fs.stat(file, function(err,stat){
          // If directory, execute a recursive call
          if(stat && stat.isDirectory()){
            // Add directory to array 
              results.push([  
                name = path.win32.basename(file),
                type = "folder",
                filePath = ( dir + "/" + path.win32.basename(file)),
                items = folderItems
              ]);

              filewalker( dir + "/" + path.win32.basename(file),function(err, res){
                folderItems = folderItems.push(res);
                if(!--pending) done(null,results);
              });
          } else{
            //is a file
            results.push([ 
              name = path.win32.basename(file),
              type = "file",
              filePath = (dir + "/" + path.win32.basename(file)),
              size = fs.statSync(file).size
            ]);
            
            if(!--pending) done(null,results);
          }
        });
      });
    });
  }else{
    return done(null,"File does not exist.");
  }
};

var app = express();
app.use(fileUpload());
app.use(express.static(__dirname));

app.post('/getfiles/:userName',function(req, res){
  var files = [];
  var user = req.params.userName;
  
  filewalker(user, function(err,data){
    if(err){
      throw err;
    }
    console.log(data);

    res.send(
        {
          "name": user,
          "type": "folder",
          "path": user,
          "items": data
        }
    );
  });
});

app.get('/', function (req, res){
    res.sendFile(__dirname + '/' + 'home.html');
});
var currentFilePath;

app.get('/sendfilepath/',function(req,res){
  // var test = decodeURIComponent(req.url);
  //console.log(test);
  currentFilePath = "";
  var arr = req.query.split;
  for(var a=0; a< arr.length; a++){
    console.log(arr[a]);
    currentFilePath = currentFilePath + arr[a] + "/";
  };
  console.log(currentFilePath);
})

//upload file
app.post('/upload/', upload.single('file'), function(req, res) {  

  console.log(currentFilePath);
  if (Object.keys(req.files).length == 0) {
    return res.status(400).send('No files were uploaded.');
  }

  // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
  let sampleFile = req.files.file;
  console.log(sampleFile);
  if(!fs.existsSync(__dirname + "/" + currentFilePath + "/" + sampleFile.name)){
  //Use the mv() method to place the file somewhere on your server
    sampleFile.mv(__dirname + '/' + currentFilePath + "/" + sampleFile.name, function(err) {
      if (err)
        return res.status(500).send(err);

      res.send('File uploaded!');
  
    });
  }else{
    res.send('This file already exists in this directory');
  }
});



app.listen(3000);