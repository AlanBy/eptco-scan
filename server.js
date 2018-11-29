var express = require('express');
var app = express();
var fs = require("fs");
var bp = require('body-parser');
var url=require('url');
var mysql = require('mysql');


var conf=fs.readFileSync("conf.json");
var confj=JSON.parse(conf);



var dbconfig ={
  host: confj.mysql,
  user: confj.user,
  password: confj.pwd,
  database: confj.db
};

var connection;

app.use(bp.json());
app.use(express.static('public'));


function handleError (err) {
  if (err) {
    // 如果是连接断开，自动重新连接
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      connect();
    } else {
      console.error(err.stack || err);
    }
  }
}

// 连接数据库
function connect () {
  connection = mysql.createConnection(dbconfig);
  connection.connect(handleError);
  connection.on('error', handleError);
}

connect();


// connection.query("SELECT * FROM `user`", function (error, results, fields) {
//   if (error) throw error;
//   console.log(results);
// });


process.on('uncaughtException', function (err) {
  //打印出错误
  console.log(err);
  //打印出错误的调用栈方便调试
  console.log(err.stack);
});

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

app.get('/api/addone',function(req,res){
var params = url.parse(req.url, true).query;
console.log(params);
var addSQL = "INSERT INTO `qc`.`Realtime`(`devid`, `name`, `sku`,`time`) VALUES (?, ?, ?, ?)";
var data=[params.devid,params.name,params.sku,params.time];

connection.query(addSQL, data,function (error, results, fields) {
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
      console.log(results);
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