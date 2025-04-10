const unit ={
    attack:function(weapon){
            return  `${weapon} 으로 공격한다.`; // 템플릿 리터럴 사용
    }
}

console.log(unit.attack("주먹"));
console.log(unit.attack("총"));