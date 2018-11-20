var express = require('express');
var app = express();
var fs = require("fs");
var bp = require('body-parser');
var url=require('url');
var mysql = require('mysql');


var conf=fs.readFileSync("conf.json");
var confj=JSON.parse(conf);



var connection = mysql.createConnection({
  host: confj.mysql,
  user: confj.user,
  password: confj.pwd,
  database: confj.db
});

app.use(bp.json());

connection.connect();

// connection.query("SELECT * FROM `user`", function (error, results, fields) {
//   if (error) throw error;
//   console.log(results);
// });


app.get('/', function (req, res) {

  fs.readFile(__dirname + "/" + "index.html", 'utf8', function (err, data) {
    res.status(200).send(data);
  });
});
app.get('/data', function (req, res) {

  fs.readFile(__dirname + "/" + "data.html", 'utf8', function (err, data) {
    res.status(200).send(data);
  });
});


app.get('/api/daily',function(req,res){


var searchSQL="SELECT `Data`.`NAME`,COUNT(*) AS COUNT FROM `Data` WHERE TO_DAYS(`Data`.DATE)=TO_DAYS(DATE_SUB(NOW(),INTERVAL 6 HOUR)) GROUP BY `Data`.`NAME`";

connection.query(searchSQL, function (error, results, fields) {
      if (error) throw error;

    res.status(200).json(results);
      console.log(results);
    });

});

app.get('/api/personal',function(req,res){
var params = url.parse(req.url, true).query;
console.log(params);

var searchSQL="SELECT * FROM `Data` WHERE TO_DAYS(`Data`.DATE)=TO_DAYS(DATE_SUB(NOW(),INTERVAL 6 HOUR)) AND `Data`.`NAME`=?";
var data=[params.name];
connection.query(searchSQL, data,function (error, results, fields) {
      if (error) throw error;

    res.status(200).json(results);
    //   console.log(results);
    });

});

app.get('/api/defective',function(req,res){


var searchSQL="SELECT `Data`.`DEFECTIVE`, Count(*) AS COUNT FROM `Data` WHERE TO_DAYS(`Data`.DATE) = TO_DAYS(DATE_SUB(NOW(),INTERVAL 6 HOUR)) GROUP BY  `Data`.`DEFECTIVE`";

connection.query(searchSQL, function (error, results, fields) {
      if (error) throw error;

    res.status(200).json(results);
      console.log(results);
    });

});





app.post('/add', function (req, res) {
  var data = req.body;
  console.log(data);
  res.status(200).send("{}");
  for (var p in data) {
    var querySQL="SELECT * FROM `Data` WHERE `Data`.ID='"+data[p].devid+"'";
    var addSQL = "INSERT INTO `qc`.`Data`(`NAME`, `SKU`, `HDD`,`UP`, `ID`, `DEFECTIVE`, `Point of Failure`, `NOTE1`, `NOTE2`, `DATE`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    var updateSQL="UPDATE `qc`.`Data` SET `NAME` =?, `SKU` =?, `HDD` =?, `UP` =?, `ID` =?, `DEFECTIVE` =?, `Point of Failure` =?, `NOTE1` =?, `NOTE2` =?, `DATE` =? WHERE `ID` =?";
    var additem=[data[p].name,data[p].sku,data[p].hdd,data[p].up,data[p].devid,data[p].defective,data[p].pof,data[p].note1,data[p].note2,data[p].time];
    var updateitem=[data[p].name,data[p].sku,data[p].hdd,data[p].up,data[p].devid,data[p].defective,data[p].pof,data[p].note1,data[p].note2,data[p].time,data[p].devid];


     insertData(additem);
    // connection.query(querySQL, function (error, results, fields) {
    //   if (error) throw error;
    //   if(results.length==0){
         
    //   }else{
    //       updateData(updateitem)
    //   }
    // });

    function insertData(data){
        connection.query(addSQL,data, function (error, results, fields) {
      if (error) throw error;
      console.log("item added");
    });
    }
    function updateData(data){
        connection.query(updateSQL,data, function (error, results, fields) {
      if (error) throw error;
      console.log("item updated");
    });
    }


  }


});



var server = app.listen(confj.port, function () {

  var host = server.address().address
  var port = server.address().port

  console.log("应用实例，访问地址为 http://%s:%s", host, port)

})