const express = require('express');
const app = express();
const sha = require('sha256');
const dotenv = require('dotenv').config();

let session = require('express-session'); // 사용자 로그인 정보나 임시 데이터 서버에 저장
app.use(session({
    secret: 'secretkey1234123421asdfasdf', // 세션 암호화 키
    resave: false, // 세션이 변경되지 않아도 다시 저장할지 여부
    saveUninitialized: true // 세션 사용 전까지는 세션 식별자 발급 받지 않도록 설정
}));

//multer 라이브러리로 이미지 경로 설정
let multer = require('multer');

let storage = multer.diskStorage({
    destination: function(req, file, done){
        done(null, './public/image')
    },
    filename: function(req, file, done){
        done(null, file.originalname);
    }
});

let upload = multer({storage: storage});
let imagepath ='';


//body-parser 라이브러리 추가
const bodyParser = require('body-parser');
const db = require('node-mysql/lib/db');
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');

//정적 파일 라이브러리 추가
app.use(express.static('public'));
app.use('/', require('./routes/post.js')); 
app.use('/', require('./routes/add.js')); 
app.use('/', require('./routes/auth.js')); 

//몽고DB 라이브러리 추가
const mongoclient = require('mongodb').MongoClient;
const ObjId = require('mongodb').ObjectId;
const url = process.env.DB_URL;
let mydb;
mongoclient.connect(url)
    .then(client=>{
        console.log('몽고DB 접속 성공');
        mydb = client.db('myboard');
        app.locals.mydb = mydb;

            app.listen(process.env.PORT, function(){
                console.log("포트 8080으로 서버 대기중 ...");  
            });
})
        .catch(err=>{
            console.log('MongoDB 연결 실패:', err);
        });

var mysql = require('mysql');
var conn = mysql.createConnection({
    host : 'localhost',
    user : 'root',
    password : '0000',
    database : 'myboard',
});
conn.connect();


//'홈' 요청에 대한 처리 루틴
app.get('/', function(req, res) {
    // res.render('index.ejs');
    if(req.session.user){
        console.log('세션 유지');
        res.render('index.ejs', {user: req.session.user}); // 로그인된 사용자 정보와 함께 메인 페이지로 이동
    } else {
        console.log("user: null");
        res.render('index.ejs', {user: null}); // 로그인되지 않은 경우
    }
});


//'search'요청에 대한 처리 루틴
app.get('/search', function(req, res){
    console.log(req.query.value);

    mydb
        .collection('post')
        .find({title:req.query.value}).toArray()
        .then(result => {
            console.log(result);
            result = result.map(post =>{
                post.path = post.path.replace(/\\public\\image\\/, "/image/");
                return post;
            });
            res.render("sresult.ejs",{data:result});
        })
});



