// 配置请求后续地址
const address = {
    // 第一周
    login: '/tacit/user/login',//登录请求session_key
    getUserInfo:'/tacit/user/getUser',//获取用户信息
    sendQuestionsBank:'/tacit/set/sendQuestionsBank',//获取题库
    setQuestions:'/tacit/set/setQuestions',//完成出题
    getQrCode:'/tacit/set/getQrCode',//获取小程序码
    getQuestions:'/tacit/answer/getQuestions',//获取题目
    finishAnswer:'/tacit/answer/finishAnswer',//完成答题
    // 第二周
    listRecord: '/tacit/set/listRecord', //查看出题记录-查看出题记录
    checkOneFriend: '/tacit/set/checkOneFriend',//查看出题记录-查看某好友
    checkAllFriend: '/tacit/set/checkFriends',//查看出题记录-查看所有好友
    getResults: '/tacit/answer/getResults',//查看答题记录-完成答题获取结果
    answerListRecord: '/tacit/answer/listRecord',//查看答题记录-查看答题记录
    checkIfAnswered: '/tacit/answer/checkIfAnswered',//查看答题记录-能否再答一次
    peekAnswer: '/tacit/answer/peekAnswer',//查看答题记录-偷看答案
    share2Group: '/tacit/answer/share2Group',//查看答题记录-分享到群
    anotherChance: '/tacit/answer/anotherChance',//查看答题记录-获得再答一次的计划（支付成功后回调）
    makeAnswerViewable: '/tacit/answer/makeAnswerViewable',//查看答题记录-获得偷看答案的资格（支付成功后回调）
    weixinPay: '/tacit/pay/weixinPay',//支付接口
    ifShowQrCode:'/tacit/set/ifShowQrCode',//控制接口
};

module.exports = address;