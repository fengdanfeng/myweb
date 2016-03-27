var express = require('express');
var router = express.Router();//创建模块化安装路径的处理程序。
var crypto = require('crypto');//加载生成MD5值依赖模块
var User = require('../controllers/users.js');//加载用户保存和获取模块
var Post = require("../controllers/post.js");//加载用户发游记模块
var Comment = require("../controllers/comments.js");//加载用户发游记模块

/* GET home page. */
//匹配路由:通过router.get()或router.post()创建路由规则

//首页:显示所有的游记，并按照时间先后顺序排列
router.get('/', User.getIndex);
//用户首页
router.get('/u/:user', checkLogin);//页面权限控制
router.get('/u/:user',User.getuser);
router.get('/u/:name/:day/:title',Post.getOneArticle)
//获取更多
router.post('/getMore',Post.getTen);
// 加关注
router.get('/friends',User.makeFriends);

//发表信息
router.get('/post', checkLogin);
router.post('/post', checkLogin);//页面权限控制
router.post('/post', Post.post);
// 游记详情页
router.get('/edit/:name/:day/:title', checkLogin);
router.get('/edit/:name/:day/:title', Post.edit);
// 删除游记
router.get('/remove/:name/:day/:title', checkLogin);
router.get('/remove/:name/:day/:title', Post.deleteOnePost);
// 更新游记
router.post('/edit/:name/:day/:title', checkLogin);
router.post('/edit/:name/:day/:title',Post.editUpdate);
// 通过一个标签获取游记列表
router.get('/tags/:tag', Post.getTag);
// 转载游记
router.get('/reprint/:name/:day/:title', checkLogin);
router.get('/reprint/:name/:day/:title', Post.reprint);
// 获取发布评论
router.post('/u/:name/:day/:title',Comment.post);

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
    res.render('login', {title: '用户登录'});
});
router.post('/login', checkNotLogin);
router.post('/login',User.userlogin);
//粉丝页
router.get('/fans', function (req, res) {
    res.render('fans', {title: '用户粉丝'});
});
//关注页
router.get('/attention', function (req, res) {
    res.render('attention', {title: '用户关注页'});
});
//游记
router.get('/postlist', function (req, res) {
        res.render('postlist',{title:'发布游记'});
    });

//设置
router.get('/set', function (req, res) {
    res.render('set', {title: '用户设置个人信息'});
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
// 上传图片
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

//移动端
router.get('/m', function (req, res) {
   res.render('m/index', {title: '移动端首页'});
});

module.exports = router;
