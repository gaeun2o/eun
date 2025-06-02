var router = require('express').Router();
const sha = require('sha256');
let session = require('express-session'); // 사용자 로그인 정보나 임시 데이터 서버에 저장
router.use(session({
    secret: 'secretkey1234123421asdfasdf', // 세션 암호화 키
    resave: false, // 세션이 변경되지 않아도 다시 저장할지 여부
    saveUninitialized: true // 세션 사용 전까지는 세션 식별자 발급 받지 않도록 설정
}));

//몽고DB 라이브러리 추가
const ObjId = require('mongodb').ObjectId;

//'signup'요청에 대한 처리 루틴
router.get('/signup',function(req, res){
    res.render('signup.ejs');
});

router.post('/signup', function(req, res) {
    console.log(req.body.userid);
    console.log(sha(req.body.userpw));
    console.log(req.body.usergroup);
    console.log(req.body.useremail);
    const mydb = req.app.locals.mydb;
    
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
router.get('/login', function(req, res) {
    console.log(req.session);
    if(req.session.user){
        console.log('세션 유지');
        res.render('index.ejs',{user : req.session.user});//정보 같이 전달, 메인페이지로 이동
    }else{
        res.render("login.ejs");
    }
});

router.post('/login', function(req, res) {
    console.log("아이디 : " + req.body.userid);
    console.log("비밀번호 : " +req.body.userpw);
    const mydb = req.app.locals.mydb;


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
router.get('/logout', function(req, res) {
    console.log('로그아웃');
    req.session.destroy();
    res.render('index.ejs', {user: null}); // 로그아웃 후 메인 페이지로 이동
});

//cookie-parser 라우터 생성
let cookieParser = require('cookie-parser');
router.use(cookieParser('mysecretkey'));//쿠키 암호화 키 설정
router.get('/cookie',function(req, res){
    let milk = parseInt(req.signedCookies.milk) + 1000;
    if(isNaN(milk))
    {
        milk=0;
    }
    res.cookie("milk",milk, {signed : true}); //1초
    res.send("product :"+milk +"원")
    });

//세션 라우터 생성
router.get('/session', function(req, res){
    if(isNaN(req.session.milk)){
        req.session.milk = 0;
    }
    req.session.milk += 1000; //세션에 저장된 milk 값에 1000원 추가
    res.send("session :" + req.session.milk + "원");
});

module.exports = router;