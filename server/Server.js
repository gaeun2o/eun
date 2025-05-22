const express = require('express');
const app = express();

//body-parser 라이브러리 추가
const bodyParser = require('body-parser');
const db = require('node-mysql/lib/db');
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');

const mongoclient = require('mongodb').MongoClient;
const ObjId = require('mongodb').ObjectId;
const url = 'mongodb+srv://gaeunpop:1111@cluster0.uqxyg33.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

var mysql = require('mysql');
var conn = mysql.createConnection({
    host : 'localhost',
    user : 'root',
    password : '0000',
    database : 'myboard',
});
conn.connect();

let mydb;


app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});


app.get('/list', async function(req, res){
    try {
        const result = await mydb.collection('post').find().toArray();
        console.log('조회된 데이터:', result);
        res.render('list', { data: result });
    } catch (err) {
        console.error('MongoDB 조회 오류:', err);
        res.status(500).send('DB 조회 중 오류 발생');
    }
});

//'enter'요청에 대한 처리 루틴 
app.get('/enter', function(req, res){
    res.render('enter.ejs');
});
//'save'요청에 대한 post 방식의 처리 루틴
app.post('/save', function(req, res){
    console.log(req.body.title);
    console.log(req.body.content);
    console.log(req.body.someDate);
    //몽고DB에 데이터 저장하기
    mydb.collection('post').insertOne(
        {title: req.body.title, content: req.body.content, date: req.body.someDate}
    ).then(result=>{
        console.log(result);
        console.log('데이터 추가 성공');
    });

    res.send('데이터 추가 성공');
});

app.post('/delete', function(req,res){
    console.log(req.body._id);
    req.body._id=new ObjId(req.body._id);
    mydb.collection('post').deleteOne(req.body)
    .then(result=>{
        console.log('삭제완료');
        res.status(200).send();
    })
    .catch(err=>{
        console.log(err);
        res.status(500).send();
    });
});


mongoclient.connect(url)
    .then(client=>{
        console.log('몽고DB 접속 성공');
        mydb = client.db('myboard');

            app.listen(8080, function(){
                console.log("포트 8080으로 서버 대기중 ...");  
            });
})
        .catch(err=>{
            console.log('MongoDB 연결 실패:', err);
        });