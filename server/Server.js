const express = require('express');
const app = express();



const mongoclient = require('mongodb').MongoClient;
const url = 'mongodb+srv://gaeunpop:1111@cluster0.uqxyg33.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
// mongoclient.connect(url)
//     .then(client=>{
//         console.log('몽고DB 접속 성공');
//     })

let mydb;
mongoclient.connect(url)
    .then(client=>{
        console.log('몽고DB 접속 성공');
        mydb = client.db('myboard');
        // mydb.collection('post').find().toArray()
        //     .then(result=>{
        //         console.log(result);
        //     })

            app.listen(8080, function(){
                console.log("포트 8080으로 서버 대기중 ...");  
            });
        })
        .catch(err=>{
            console.log('MongoDB 연결 실패:', err);
        });


// var mysql = require('mysql');
// var conn = mysql.createConnection({
//     host : 'localhost',
//     user : 'root',
//     password : '0000',
//     database : 'myboard',
// });

// conn.connect();
app.get('/list', function(req, res){
    // conn.query('select * from post_bk', function(err, rows, fields){
    //     if (err) throw err;
    //     console.log(rows);
    //     res.send(rows);
    // });
    mydb.collection('post').find().toArray()
        .then(result=>{
            console.log(result);
            res.send(result);
        })
});

