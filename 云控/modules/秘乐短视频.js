
// 保持脚本运行
var ID = setInterval(() => { }, 1000)
// 监听主脚本消息
events.on("prepare", function (i, mainEngine) {

    try{
        var taskData = getTask();
        log(taskData.task.data);

        if (main()) {
            readInfo()
        }

        callback_task(taskData.task.id,"done");
        launch('com.wenfree.cn');
    }
    catch(err){
        log(err)
    }

    mainEngine.emit("control", i);  //向主脚本发送一个事件，该事件可以在它的events模块监听到并在脚本主线程执行事件处理。
    clearInterval(ID);   //取消一个由 setInterval() 创建的循环定时任务。
});


function jspost(url,data){
    var res = http.post(url, data);
    var data = res.body.string();
    if(data){
        return data;
    }
}

// 获取接口数据
function getTask() {
    var url = 'http://api.wenfree.cn/public/';
    let res = http.post(url, {
        "s": "NewsImei.Imei",
        "imei": device.getIMEI()
    });
    let json = {};
    try {
        let html = res.body.string();
        // log(html)
        json = JSON.parse(html);
        log(json)
        return json.data;
    } catch (err) {
        //在此处理错误
    }
};

function callback_task(id,state){
    var url = "http://api.wenfree.cn/public/";
    var arr = {};
    arr["id"] = id;
    arr["state"] = state;
    var postdata = {};
    postdata["s"]="NewsRecordBack.Back"
    postdata["arr"] = JSON.stringify(arr)
    log(arr,postdata)
    log(jspost(url,postdata));
}

//读取本地数据
function getStorageData(name, key) {
    const storage = storages.create(name);  //创建storage对象
    if (storage.contains(key)) {
        return storage.get(key);
    };
    //默认返回undefined
}

function app_info(name,data){
    var url = "http://api.wenfree.cn/public/";
    var postdata = {};
    postdata["s"]="App.NewsAppInfo.App_info";
    postdata["imei"]= device.getIMEI();
    postdata["imei_tag"]= getStorageData(device.getIMEI(), "tag");;
    postdata["app_name"]= name;
    postdata["whos"]= "ouwen000";
    postdata["app_info"]= JSON.stringify(data);
    log(jspost(url,postdata));
}

/*
    清除app数据，无需root权限
    备注:仅适用小米手机
    @author：飞云
    @packageName：包名
    返回值：Boolean，是否执行成功
*/

function clearApp(packageName) {
    // var appName = "星巴克"
    // var packageName = "com.starbucks.cn"
    let i = 0
    while (i < 10) {
        let activity = currentActivity()
        switch (activity) {
            case "com.miui.appmanager.ApplicationsDetailsActivity":
                if (click("清除数据")) {
                } else if (click("清除全部数据")) {
                } else if (click("确定")) {
                    desc("返回").click();
                    sleep(2000);
                    back();
                    sleep(2000);
                    return true
                }
                break;
            default:
                log("页面:other")
                back()  //返回
                sleep(1000);
                if (!openAppSetting(packageName)) {
                    log("找不到应用，请检查packageName");
                    return false;
                }
                sleep(3000);
                break;
        };
        i++;
        sleep(1000)
    }
    back();
}


//基础函数
function active(pkg,n){
    if(!n){n=5}
    if(  currentPackage() == pkg ){
       log("应用在前端");
       return true;
    }else{
        app.launch(pkg);
        sleep(1000*n);
    }
}
//准备点击
function click_(x,y){
    if(x>0 && x < 720 && y > 0 && y < 1440){
        click(x,y);
        return true
    }else{
        log('坐标错误');
        return false
    }
}
//点击obj
function click__(obj){
    click_(obj.bounds().centerX(),obj.bounds().centerY())
}
//普通封装
function jsclick(way,txt,clickKey,n){
    if(!n){n=1};//当n没有传值时,设置n=1
    var res = false;
    if(!clickKey){clickKey=false}; //如果没有设置点击项,设置为false
    if (way == "text"){
        res = text(txt).findOne(200);
    }else if(way == "id"){
        res = id(txt).findOne(200);
    }else if(way == "desc"){
        res = desc(txt).findOne(200);
    }
    if(res){
        if ( clickKey ){
            if ( res.bounds().centerX() < 0 || res.bounds().centerX()> width || res.bounds().centerY() < 0 || res.bounds().centerY() > height ){
                return false
            }
            log('准备点击->',txt,"x:",res.bounds().centerX(),"y:",res.bounds().centerY());
            click__(res);
        }else{
            log("找到->",txt);
        }
        sleep(1000*n);
        return true;
    }else{
        // log("没有找到->",txt)
    }
}
//随机数
function rd(min,max){
    if (min<=max){
        return random(min,max)
    }else{
        return random(max,min)
    }
}
//输入密码
function input_pay_password(password){
    var key_xy = {}
    key_xy[1]=[width*0.3,height*7/10]
    key_xy[2]=[width*0.5,height*7/10]
    key_xy[3]=[width*0.8,height*7/10]
    key_xy[4]=[width*0.3,height*7.5/10]
    key_xy[5]=[width*0.5,height*7.5/10]
    key_xy[6]=[width*0.8,height*7.5/10]
    key_xy[7]=[width*0.3,height*8/10]
    key_xy[8]=[width*0.5,height*8/10]
    key_xy[9]=[width*0.8,height*8/10]
    key_xy[0]=[width*0.5,height*9/10]
    // 清除其它字符
    password = password.replace(/\D/g,"")
    for(var i=0;i<password.length;i++){
        var numbers = password.substring(i,i+1);
        click_(key_xy[numbers][0],key_xy[numbers][1])
        sleep(300)
    }
}

function moveTo(x,y,x1,y1,times){
    swipe(x,y,x1,y1,times);
    sleep(1000);
}

function Tips(){
   if( jsclick("text","允许",true,2) ){

   }else if( jsclick("text","好",true,2) ){

   }
}

// [500,1044,692,1238]

function main(){

    home();
    sleep(2000);
    click(device.width/4,device.height-20)
    sleep(2000);
    jsclick('id',"clearAnimView",true,2)
    sleep(2000);

    var fristbox = true
    var readtimes = 0
    var readtimes_end = random(10,15);
    var detail2 = 0;

    var i__ = 0;
    while (i__ < 50) {
        i__++;
        if ( active( appinfo.bid , 8)  ){

            var UI = currentActivity();
            log('UI',UI,i__)
            switch(UI){
                case 'com.bytedance.sdk.openadsdk.activity.TTDelegateActivity':
                    log('首页2');
                case 'com.milecn.modulemain.MainActivity':
                    if (fristbox){
                        if (jsclick('text','我的',true,2)){
                            if(jsclick('id','com.milecn.milevideo:id/me_Toolbar_iv_menu',true,2)){
                
                            }
                        }
                    }else
                    if ( jsclick("text","我的",false,1) && jsclick("text","首页",true,rd(3,8)) ){
        
                        moveTo(width/2,height*0.8,width/2,height*0.3,random(500,4000));
                        sleep(1000*rd(1,10))
                        readtimes++;
                        if (readtimes >  readtimes_end ){
                            return true
                        }
                        
                    }else{
                        back();
                    }
                    break;
                case "com.milecn.moduleme.PersonalCenterActivity":
                    log('个人中心');
                    if ( fristbox && jsclick('text','秘乐庄园',true,2)){
                    }else{
                        back()
                    }
                    break
                case "com.milecn.moduleme.ManorActivity":
                    log("秘乐庄园页面")
                    if (fristbox && jsclick('id',"com.milecn.milevideo:id/iv_task",true,2)){
                    }else{
                        back();
                    }
                    break;
                case 'com.milecn.moduletask.DegreeActivity':
                    log('任务中心');
                    var degree100 = id('tv_degree').findOne(1000);
                    if (fristbox && degree100.text() == '100%' ){
                        log('今日任务已经完成');
                        fristbox = false;
                        return true
                    }else
                    if(jsclick('text','今日进度',true,2)){
                        fristbox = false;
                        back();
                        sleep(1000);
                        back();
                        sleep(1000);
                        back();
                        sleep(1000);
                        jsclick("text","首页",true,rd(3,8))
                    }
                    break
                case 'com.milecn.milevideo.ui.SplashActivity':
                    log('正在启动')
                    break;
                default:
                    back();
            }
        }
        Tips();
        sleep(1000);
    }
}

function readInfo(){
    info = {};
    var i__ = 0;
    while (i__ < 30) {
        i__++;
        if ( active( appinfo.bid , 8)  ){

            var UI = currentActivity();
            log('UI',UI,i__)
            switch(UI){
                case 'com.bytedance.sdk.openadsdk.activity.TTDelegateActivity':
                    log('首页2');
                case 'com.milecn.modulemain.MainActivity':
                    log('首页');
                    if(jsclick('text','我的',true,2)){
                        jsclick('id','com.milecn.milevideo:id/me_Toolbar_iv_menu',true,2)
                    }

                    break;
                case 'com.milecn.moduleme.PersonalCenterActivity':
                    log('个人中心');
                    jsclick('text','活跃度+秘豆',true,2);
                    break;
                case 'com.milecn.moduleme.MeLevelActivity':
                    log('活跃度');
                    if (jsclick('text','我的秘豆',false,2)){
                        info['秘豆'] = id('com.milecn.milevideo:id/tv_sumSecretBean').findOne(1000).text();
                        info['今日秘豆'] = id('com.milecn.milevideo:id/tv_todayIncome').findOne(1000).text();
                        info['冻结'] = id('com.milecn.milevideo:id/tv_freeze').findOne(1000).text();
                        log(info);
                        app_info(appinfo.name,info);
                        return true
                    }
                    break;
                case 'com.android.systemui.recents.RecentsActivity':
                    home();
                    break;
                default:
                    back();
            }
        }
        Tips();
        sleep(500);
    }
}



// 正式开始编代码

log([currentPackage(),currentActivity(),device.width,device.height]);
var width = 720;
var height = 1440;
var appinfo = {}
appinfo.name = "秘乐短视频";
appinfo.bid = "com.milecn.milevideo";
var info ={}




// var all_Info = textMatches(/.*/).find();
// for (var i = 0;i<all_Info.length;i++){
//     var d = all_Info[i];
//     if ( d.bounds().centerY() < height/4 ){
//         log(i,d.id(),d.text(),d.selected(),d.depth(),d.bounds().centerX(),d.bounds().centerY());
//     }
// }


// main();
// readInfo()

