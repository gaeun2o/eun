var router = require('express').Router();


//몽고DB 라이브러리 추가
const ObjId = require('mongodb').ObjectId;


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



//'enter'요청에 대한 처리 루틴 
router.get('/enter', function(req, res){
    res.render('enter.ejs');
});


//'save'요청에 대한 post 방식의 처리 루틴
router.post('/save', function(req, res){
    console.log(req.body.title);
    console.log(req.body.content);
    console.log(req.body.someDate);
    const mydb = req.app.locals.mydb;

    //몽고DB에 데이터 저장하기
    mydb
    .collection('post')
    .insertOne(
        {title: req.body.title, 
            content: req.body.content,
            date: req.body.someDate,
            path : imagepath
            }
    ).then(result=>{
        console.log(result);
        console.log('데이터 추가 성공');
    });

    res.redirect('/list');
});

//'photo' 요청에 대한 처리 루틴
router.post('/photo', upload.single('picture'), function(req, res){
    console.log(req.file.path);
    imagepath = '/image/' + req.file.filename; // 업로드된 파일의 경로를 변수에 따로 저장
});

module.exports = router;