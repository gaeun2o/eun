var userName = '이가은';
var userPW = '1111';

function account(userId, userPW) 
{
    console.log(userId);
    console.log(userPW);
    var savedName = '이가은';
    var savedPW = '1111';

    userPW = userPW || '1111';

    if(userId == savedName)
    {
        if(userPW == savedPW)
        {
            console.log('반갑습니다.'+ userId + '님');
        }
    }
}
account(userName);