const express = require('express');
const app = express();
const sha = require('sha256');

let session = require('express-session'); // 사용자 로그인 정보나 임시 데이터 서버에 저장
app.use(session({
    secret: 'secretkey1234123421asdfasdf', // 세션 암호화 키
    resave: false, // 세션이 변경되지 않아도 다시 저장할지 여부
    saveUninitialized: true // 세션 사용 전까지는 세션 식별자 발급 받지 않도록 설정
}));

//body-parser 라이브러리 추가
const bodyParser = require('body-parser');
const db = require('node-mysql/lib/db');
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');

//정적 파일 라이브러리 추가
app.use(express.static('public'));
//몽고DB 라이브러리 추가
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

//'signup'요청에 대한 처리 루틴
app.get('/signup',function(req, res){
    res.render('signup.ejs');
});

app.post('/signup', function(req, res) {
    console.log(req.body.userid);
    console.log(sha(req.body.userpw));
    console.log(req.body.usergroup);
    console.log(req.body.useremail);

    mydb
        .collection("account")
        .insertOne({
            userid: req.body.userid,
            userpw : sha(req.body.userpw),
            usergroup : req.body.usergroup,
            useremail : req.body.useremail
        })
        .then(result => {
            console.log('회원가입 성공');
            res.redirect('/');
        })
        
})

//'/login'요청에 대한 처리 루틴
app.get('/login', function(req, res) {
    console.log(req.session);
    if(req.session.user){
        console.log('세션 유지');
        res.render('index.ejs',{user : req.session.user});//정보 같이 전달, 메인페이지로 이동
    }else{
        res.render("login.ejs");
    }
});

app.post('/login', function(req, res) {
    console.log("아이디 : " + req.body.userid);
    console.log("비밀번호 : " +req.body.userpw);

mydb
    .collection("account")
    .findOne({userid: req.body.userid})
    .then(result => {
        if (!result) {
                res.send('존재하지 않는 아이디입니다.');
                res.render('login.ejs'); // 아이디가 존재하지 않을 때 로그인 페이지로 이동
            } else if (result.userpw == sha(req.body.userpw)) {
                req.session.user = req.body;
                console.log('새로운 로그인');
                res.render('index.ejs', {user: req.session.user}); // 로그인 성공 후 메인 페이지로 이동
            } else {
                res.send('비밀번호가 틀렸습니다.');
                res.render('login.ejs'); // 비밀번호가 틀렸을 때 로그인 페이지로 이동
            }
    });
});

//'logout' 요청에 대한 처리 루틴
app.get('/logout', function(req, res) {
    console.log('로그아웃');
    req.session.destroy();
    res.render('index.ejs', {user: null}); // 로그아웃 후 메인 페이지로 이동
});


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


//'list'요청에 대한 처리 루틴
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



//'/content'요청에 대한 처리 루틴
app.get('/content/:id', function(req, res){
    console.log(req.params.id);
    req.params.id = new ObjId(req.params.id);
    mydb
        .collection('post')
        .findOne({_id: req.params.id})
        .then(result => {
            console.log(result);
            res.render('content.ejs', {data: result});
        });
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

    res.redirect('/list');
});

//'edit'요청에 대한 처리 루틴(get방식)
app.get('/edit/:id', function(req, res){
    req.params.id = new ObjId(req.params.id);
    mydb
        .collection('post')
        .findOne({_id: req.params.id})
        .then(result => {
            console.log(result);
            res.render('edit.ejs', {data: result});
        });
});

//'edit'요청에 대한 처리 루틴(post방식)
app.post("/edit", function(req, res){
    console.log(req.body);
    req.body.id = new ObjId(req.body.id);
    mydb
        .collection('post')
        .updateOne({_id: req.body.id},
            {$set : {title:req.body.title, content:req.body.content, date:req.body.someDate}})
        .then(result => {
            console.log("수정 완료");
            res.redirect('/list');
        })
        .catch(err => {
            console.log(err);
        });
});

app.post('/delete', function(req,res){
    console.log(req.body.id);
    req.body.id=new ObjId(req.body.id);
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

//cookie-parser 라우터 생성
let cookieParser = require('cookie-parser');
app.use(cookieParser('mysecretkey'));//쿠키 암호화 키 설정
app.get('/cookie',function(req, res){
    let milk = parseInt(req.signedCookies.milk) + 1000;
    if(isNaN(milk))
    {
        milk=0;
    }
    res.cookie("milk",milk, {signed : true}); //1초
    res.send("product :"+milk +"원")
    });


app.get('/session', function(req, res){
    if(isNaN(req.session.milk)){
        req.session.milk = 0;
    }
    req.session.milk += 1000; //세션에 저장된 milk 값에 1000원 추가
    res.send("session :" + req.session.milk + "원");
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