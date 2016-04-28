 var express = require('express');
var router = express.Router();//创建模块化安装路径的处理程序。
var crypto = require('crypto');//加载生成MD5值依赖模块
var User = require('../models/user.js');//加载用户保存和获取模块
var Post = require('../models/post.js');//加载用户保存和获取模块

router.getIndex=function getIndex(req,res){
 var page = req.query.p ? paseInt(req.query.p):1;
    //读取所有的用户游记，传递把posts游记数据集传给首页
    Post.getTen(null,page, function (err, posts,total) {
        if (err) {
            posts = [];
        }
        // var currentUser = req.session.user
        //调用模板引擎，并传递参数给模板引擎
        res.render('m/index', {
                title: '移动端首页', 
                // posts: posts, 
                // page: page
                // currentUser: req.session.user,
                // success: req.flash('success').toString(),
                // error: req.flash('error').toString()
            });
    });
}
router.userlogin =   function (req, res) {
//密码用md5值表示
    var md5 = crypto.createHash('md5');
    var password = md5.update(req.body.userpwd).digest('base64');
    //判断用户名和密码是否存在和正确
    User.get(req.body.username, function (err, user) {
        if (!user) {
            req.flash('error', '用户名不存在');
            return res.redirect('/m/login');
        }
        if (user.password !== password) {
            req.flash('error', '用户密码不存在');
            return res.redirect('/m/login');
        }
        console.log(user)
        req.session.user = user;//保存用户信息
        req.flash('success', '登陆成功！');
        res.render('m/muser',{
            title:"用户设置页",
            user:user
        });
    });
};

router.reg =  function (req, res) {
    //console.log(req.body['pwdrepeat'] + ";" + req.body['userpwd']);
    //用户名密码不能为空
    if (req.body.username == "" || req.body.userpwd == "" || req.body.pwdrepeat == "") {
        //使用req.body.username获取提交请求的用户名，username为input的name
        req.flash('error', "输入框不能为空！");//保存信息到error中，然后通过视图交互传递提示信息，调用alert.ejs模块进行显示
        return res.redirect('/m/mregister');//返回reg页面
    }
    //两次输入密码如果不一致，提示信息
    if (req.body['pwdrepeat'] !== req.body['userpwd']) {
        req.flash("error", '两次输入密码不一致！');//保存信息到error中，用于界面显示提示信息
        return res.redirect('/m/mregister');
    }
    //把密码转换为MD5值
    var md5 = crypto.createHash('md5');
    var password = md5.update(req.body.userpwd).digest('base64');

    //用新注册用户信息对象实例化User对象，用于存储新注册用户和判断注册用户是否存在
    var newUser = new User({
        name: req.body.username,
        password: password,
    });
    //检查用户名是否已经存在
    User.get(newUser.name, function (err, user) {
        if (user) {//用户名存在
            err = '用户名已存在.';
        }
        if (err) {
            req.flash('error', err);//保存错误信息，用于界面显示提示
            return res.redirect('/m/mregister');
        }

        newUser.save(function (err) {//用户名不存在时，保存记录到数据库
            if (err) {
                req.flash('error', err);
                return res.redirect('/m/mregister');
            }
            req.session.user = newUser;//保存用户信息，用于判断用户是否已登录
            req.flash('success', req.session.user.name + '注册成功');
            res.redirect('/m/muser');
        });
    });
}
// 加关注
router.makeFriends =  function (req, res) {
    var currentUser = req.session.user;
    console.log(req.params.name);
    User.makeFriends(currentUser.name, req.params.name, function (err) {
      if (err) {
        req.flash('error', err); 
        return res.redirect('back');//出错！返回文章页
      }
      console.log("aaasd");
      req.flash('success', '修改成功!');
       return res.redirect('/m/userDetail/'+req.params.name);
    });
  },



router.getFans = function(req,res){
    var page = req.query.p ? paseInt(req.query.p):1;
    var currentUser = req.session.user;
    User.getFans(currentUser.name,page,function(err,fans){
        if (err) {
            fans=[];
            return res.redirect('/m/mfans');
        }
        res.render('m/mfans', {
            title:"粉丝",
            mfans:fans, 
            currentUser: req.session.user
        });

    })
}
router.getFriends = function(req,res){
    var page = req.query.p ? paseInt(req.query.p):1;
    var currentUser = req.session.user;
    User.getFans(currentUser.name,page,function(err,fans){
        if (err) {
            fans=[];
            return res.redirect('/m/mfans');
        }
        res.render('m/mfriends', {
            title:"关注列表",
            mfans:fans,
            currentUser: req.session.user
        });

    })
}

// 获取游记详情
// 获取一篇游记及其详情
router.getOneArticle = function (req, res) {
    Post.getOne(req.params.name, req.params.day,req.params.postHead_MD5, req.params.title, function (err, post) {
      if (err) {
        req.flash('error', err); 
        return res.redirect('/m');
      }
      console.log(post);
      res.render('m/postDetail', {
        title: req.params.title,
        post: post,
        // user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
      });
    });
  },
// 获取某一用户以及其所有游记
router.getuser =function(req,res){
      Post.get(req.params.name,  function (err,total, post) {
          if (err) {
            req.flash('error', err); 
            return res.redirect('back');
          }
        if(req.session.user){
           var currentUser = req.session.user;
        }else{
            var currentUser = null;
        }
          User.get(req.params.name, function (err, user) {
              res.render('m/userDetail', {
                title: req.params.title,
                posts: post,
                total:total,
                postUser:user,
                currentUser:currentUser,
                success: req.flash('success').toString(),
                error: req.flash('error').toString()
              });
          })
    })
}

// 获取移动端发布游记页
router.getPostPosts =function(req,res){
    var page = req.query.p ? paseInt(req.query.p):1;
    var currentUser = req.session.user;
        res.render('m/postPosts', {
            title:"发布游记页",
            currentUser: req.session.user
        });
}

// 移动端创建游记页
router.createNote = function(req,res){
    res.render('m/createNote',{
        title:"创建游记内容页"
    })
}

var multiparty = require('multiparty');
// 移动端发布游记
router.mpost = function (req, res) {
    console.log(req.session.user);
    if(!req.session.user){
      return res.json({code:1});
    }
    var currentUser = req.session.user,
        tags = [req.body.tag1, req.body.tag2, req.body.tag3],
        Img=req.body['postImg[]'];
        if(currentUser.ulog){
          var  userLogo = currentUser.ulog;
        }else{
          var  userLogo = '/images/ulogo.png';
        }
    var date = new Date(),
        time = date.getTime().toString();
    var md5 = crypto.createHash('md5'),
        postHead_MD5 = md5.update(time.toLowerCase()).digest('hex');
        if(!Array.isArray(Img)){
          var postImg =[];
            postImg.push(Img);
        }else{
          var postImg = Img;
        } 
    var   post = new Post(currentUser.name, currentUser.head, req.body.title, tags, req.body.post,postImg,userLogo,postHead_MD5);
   console.log(post);
    post.save(function (err) {
      if (err) {
        req.flash('error', err); 
        return res.redirect('back');
      }
      req.flash('success', '发布成功!');
      console.log("asda");
      // res.redirect('back');//发表成功跳转到主页
      res.json({code:0});
  });
}

// 移动端搜索
router.msearch=function(req,res){
    var searchForm = req.body.searchValue;
    Post.search(searchForm,function(err,posts){
        if(err){
            res.json({code:1});
        }
        console.log(posts);
        res.json({
            code:0,
            post:posts
        })
    })
}
module.exports = router