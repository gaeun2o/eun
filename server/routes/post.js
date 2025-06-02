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



//'list'요청에 대한 처리 루틴
router.get('/list', async function(req, res){
    const mydb = req.app.locals.mydb;
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
router.post('/delete', function(req,res){
    console.log(req.body._id);
    req.body._id=new ObjId(req.body._id);
    const mydb = req.app.locals.mydb;

    mydb.collection('post').deleteOne({_id: req.body._id})
    .then(result=>{
        console.log('삭제완료');
        res.status(200).send();
    })
    .catch(err=>{
        console.log(err);
        res.status(500).send();
    });
});

//'/content'요청에 대한 처리 루틴
router.get('/content/:id', function(req, res){
    console.log(req.params.id);
    req.params.id = new ObjId(req.params.id);
    const mydb = req.app.locals.mydb;

    mydb
        .collection('post')
        .findOne({_id: req.params.id})
        .then(result => {
            console.log(result);
            // let imagePath = result.path.replace(/\\public\\image\\/, "/image/");
            res.render('content.ejs', {data: result});
        });
});


//'edit'요청에 대한 처리 루틴(get방식)
router.get('/edit/:id', function(req, res){
    req.params.id = new ObjId(req.params.id);
    const mydb = req.app.locals.mydb;

    mydb
        .collection('post')
        .findOne({_id: req.params.id})
        .then(result => {
            console.log(result);
            res.render('edit.ejs', {data: result});
        });
});

//'edit'요청에 대한 처리 루틴(post방식)
router.post("/edit", upload.single('picture'), function(req, res){
    console.log(req.body);
    let updateData = {
        title: req.body.title,
        content: req.body.content,
        date: req.body.someDate
    };

    // 파일이 새로 업로드된 경우 path도 수정
    if (req.file) {
        updateData.path = '/image/' + req.file.filename;
    }

    req.body.id = new ObjId(req.body.id);
    const mydb = req.app.locals.mydb;

    mydb
        .collection('post')
        .updateOne(
            { _id: req.body.id },
            { $set: updateData }
        )
        .then(result => {
            console.log("수정 완료");
            res.redirect('/list');
        })
        .catch(err => {
            console.log(err);
        });
});



module.exports = router;