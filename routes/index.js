var express = require('express');
var router = express.Router();//创建模块化安装路径的处理程序。
var crypto = require('crypto');//加载生成MD5值依赖模块
var User = require('../controllers/users.js');//加载用户保存和获取模块
var Post = require("../controllers/post.js");//加载用户发游记模块
var Comment = require("../controllers/comments.js");//加载用户发游记模块
var Admin = require("../controllers/admin.js");
var Mobile = require("../controllers/m.js");

/* GET home page. */
//匹配路由:通过router.get()或router.post()创建路由规则

//首页:显示所有的游记，并按照时间先后顺序排列
router.get('/', User.getIndex);
router.get('/u', checkLogin);
router.get('/u', User.getU);
//用户首页
router.get('/u/:user', checkLogin);//页面权限控制
router.get('/u/:user',User.getuser);
// 获取一篇游记详情
router.get('/u/:name/:postHead_MD5/:day/:title',Post.getOneArticle);
//获取更多
router.post('/getMore',Post.getTen);
// 加关注
router.get('/friends',User.makeFriends);
// 取消关注
router.get('/friends/:currentUser/:friendName',User.withoutFriend);
// 收藏
router.post('/collections',User.collections);
// 取消收藏
router.post('/withOutCollections',User.withOutCollections);

//发表信息
router.get('/post', checkLogin);
router.post('/post', checkLogin);//页面权限控制
router.post('/post', Post.post);
//获取编辑页
router.get('/edit/:name/:day/:title', checkLogin);
router.get('/edit/:name/:day/:title', Post.edit);
// 更新游记
router.post('/edit/:name/:day/:title', checkLogin);
router.post('/edit/:name/:day/:title',Post.editUpdate);
// 删除游记
router.get('/remove/:name/:day/:title', checkLogin);
router.get('/remove/:name/:postHead_MD5/:day/:title', Post.deleteOnePost);

// 通过一个标签获取游记列表
router.get('/tags/:tag', Post.getTag);
// 转载游记
router.get('/reprint/:name/:day/:postHead_MD5/:title', checkLogin);
router.get('/reprint/:name/:day/:postHead_MD5/:title', Post.reprint);
// 获取发布评论
router.post('/u/:name/:day/:postHead_MD5/:title',Comment.post);
//删除评论
router.get('/:name/:postHead_MD5/:title/:head',Comment.removeTest);

//注册
router.get('/reg', checkNotLogin);//页面权限控制，注册功能只对未登录用户可用
router.get('/reg', function (req, res) {
    res.render('reg', {title: '用户注册'});
});
router.post('/reg', checkNotLogin);
router.post('/reg', User.reg);
//登陆
router.get('/login', checkNotLogin);//登陆功能只对未登录用户可使用
router.get('/login', function (req, res) {
      res.render('login', {
      title: '登录',
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
});
router.post('/login', checkNotLogin);
router.post('/login',User.userlogin);
//粉丝页
router.get('/fans',User.getFans);
//关注页
router.get('/attention', User.getFriends);
//游记
router.get('/postlist', function (req, res) {
        res.render('postlist',{title:'发布游记', currentUser: req.session.user});
    });

//设置
router.get('/set', function (req, res) {
    res.render('set', {title: '用户设置个人信息', currentUser: req.session.user});
});

//退出
router.get('/logout', checkLogin);//退出功能只对已登陆的用户可用
router.get('/logout', function (req, res) {
    req.session.user = null;//清空session
    req.flash('sucess', '退出成功！');
    res.redirect('/');
});

//针对处理post请求，使用http invoker或ajax post向服务器端的地址（http://localhost:8001/users）提交post请求进行测试
// 用户修改个人信息
router.post('/setForm1', User.setUserInfo);
// 用户修改密码
router.post('/changePwd',User.changePwd)
// 上传头像图片
router.post('/uploadUserLogo',User.uploadUserLogo);

// 上传游记图片
router.post('/uploadUserImgPre',User.uploadUserImgPre);
function checkNotLogin(req, res, next) {
    if (req.session.user)//用户存在
    {
        req.flash('error', '已登录');
        return res.redirect('/');
    }
    next();//控制权转移：当不同路由规则向同一路径提交请求时，在通常情况下，请求总是被第一条路由规则捕获，
    // 后面的路由规则将会被忽略，为了可以访问同一路径的多个路由规则，使用next()实现控制权转移。
};
function checkLogin(req, res, next) {
    if (!req.session.user)//用户不存在
    {   //未登录跳转到登陆界面
        req.flash('error', '未登录');
        return res.redirect('/login');
    }
    //已登录转移到下一个同一路径请求的路由规则操作
    next();
};

//超级管理员
router.get('/adminIndex',function(req,res){
    res.render('/admin/adminIndex',{title:"管理员首页"})
})
router.get('/admin', checkNotLogin);//登陆功能只对未登录管理员可使用
router.get('/admin', function (req, res) {
   res.render('admin/adminLogin', {title: '管理员登录'});
});
router.post('/admin', checkNotLogin);
router.post('/admin',Admin.adminLogin);
router.get('/admin/allUsers',Admin.getAllUsers)
router.get('/admin/allPosts',Admin.getAllPosts)
router.get('/adminRemoveUser/:userName',Admin.adminRemoveUser)
//移动端
router.get('/m',Mobile.getIndex);
router.get('/m/muser', function (req, res) {
    res.render('m/muser', {title: '用户设置页'})
});
//移动端用户登陆
router.get('/m/login', mcheckNotLogin);//登陆功能只对未登录用户可使用
router.get('/m/login', function (req, res) {
    res.render('m/mlogin', {title: '用户登录'});
});
router.post('/m/login', mcheckNotLogin);
router.post('/m/login',Mobile.userlogin);
//移动端注册
router.get('/m/mregister', checkNotLogin);//页面权限控制，注册功能只对未登录用户可用
router.get('/m/mregister', function (req, res) {
    res.render('m/mregister', {title: '用户注册'});
});
router.post('/m/mregister', checkNotLogin);
router.post('/m/mregister', Mobile.reg);
// 移动端退出登录
router.get('/mlogout', checkLogin);//退出功能只对已登陆的用户可用
router.get('/mlogout', function (req, res) {
    req.session.user = null;//清空session
    req.flash('sucess', '退出成功！');
    res.redirect('m/muser');
})
//m粉丝页
router.get('/mfans', mcheckLogin);
router.get('/mfans',Mobile.getFans);
//m关注页
router.get('/mfriends', mcheckLogin);
router.get('/mfriends', Mobile.getFriends);
// m获取一篇游记及其详情
router.get('/m/:name/:postHead_MD5/:day/:title',Mobile.getOneArticle)

// 在好友首页关注好友
router.get('/m/makeFriends/:name',mcheckLogin);
router.get('/m/makeFriends/:name',Mobile.makeFriends);

// m获取某一用户所有游记
router.get('/m/userDetail/:name',Mobile.getuser);
// m获取发布游记页
router.get('/m/postPosts',Mobile.getPostPosts);
// 移动端创建游记
router.get('/m/createNote',Mobile.createNote);
// 移动端发布游记

// router.post('/mpost', mcheckLogin);//页面权限控制
router.post('/mpost', Mobile.mpost);
function mcheckNotLogin(req, res, next) {
    if (req.session.user)//用户存在
    {
        req.flash('error', '已登录');
        return res.redirect('back');
    }
    next();//控制权转移：当不同路由规则向同一路径提交请求时，在通常情况下，请求总是被第一条路由规则捕获，
    // 后面的路由规则将会被忽略，为了可以访问同一路径的多个路由规则，使用next()实现控制权转移。
};

function mcheckLogin(req, res, next) {
    if (!req.session.user)//用户不存在
    {   //未登录跳转到登陆界面
        req.flash('error', '未登录');
        return res.redirect('/m/login');
    }
    //已登录转移到下一个同一路径请求的路由规则操作
    next();
};
module.exports = router;
