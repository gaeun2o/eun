let user = {
    id : "gaeun",
    pw : "1234",
    name : "가은",
    mobile : "010-1234-5678",
    country : "대한민국"
}

for (let info in user) { //key in object
    console.log(`${info} : ${user[info]}`);
}
