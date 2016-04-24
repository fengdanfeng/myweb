var express = require('express');
var router = {};//创建模块化安装路径的处理程序。
var crypto = require('crypto');//加载生成MD5值依赖模块
var User = require('../models/user.js');//加载用户保存和获取模块
var Post = require('../models/post.js');//加载用户保存和获取模块
var multiparty = require('multiparty');

router.getIndex = function (req, res) {
    var page = req.query.p ? paseInt(req.query.p):1;
         var currentUser = req.session.user;
    console.log(12345)
    // console.log(currentUser)
    //读取所有的用户游记，传递把posts游记数据集传给首页
    Post.getTen(null,page, function (err, posts,total) {
        if (err) {
            posts = [];
        }
   
        //调用模板引擎，并传递参数给模板引擎
        res.render('index', {
                title: '首页', 
                posts: posts, 
                page: page,
                user: req.session.user,
                // isFirstPage: (page - 1) == 0,
                // isLastPage: ((page - 1) * 3 + posts.length) == total,
                currentUser: req.session.user,
                success: req.flash('success').toString(),
                error: req.flash('error').toString()
            });
    });
};
router.getU= function (req, res) {
    var page = req.query.p ? paseInt(req.query.p):1;
         var currentUser = req.session.user;
    // console.log(currentUser.friends);
    // console.log(currentUser)
    //读取所有的用户游记，传递把posts游记数据集传给首页
    Post.getTen(null,page, function (err, posts,total) {
        if (err) {
            posts = [];
        }
        if(currentUser.friends){
            currentUserFriends = currentUser.friends;
        }else{
            currentUserFriends =[];
        }
// 获取当前用户的所有游记信息
     Post.get(currentUser.name,  function (err,total, currentUserPost) {
        // 获取当前用户所有好友游记
        Post.getFriendsPost( currentUserFriends,1,  function (err,total1, friendsPosts) {
            // console.log(friendsPosts);
        //调用模板引擎，并传递参数给模板引擎
        res.render('u', {
                title: '登录后首页', 
                posts: posts, 
                page: page,
                user: req.session.user,
                currentUserPost:currentUserPost,
                friendsPosts:friendsPosts,
                total:total,
                // isFirstPage: (page - 1) == 0,
                // isLastPage: ((page - 1) * 3 + posts.length) == total,
                currentUser: req.session.user,
                success: req.flash('success').toString(),
                error: req.flash('error').toString()
            });
          });
    })
    });
};
router.getuser=  function (req, res) {//路由规则
     var page = req.query.p ? parseInt(req.query.p) : 1;
    User.get(req.params.user, function (err, user) {
        //判断用户是否存在
        if (!user) {
            req.flash('error', '用户不存在');
            return res.redirect('back');
      }

        //调用对象的方法用户存在，从数据库获取该用户的游记信息
         Post.getTen(user.name,page, function (err, posts,total) {
                if (err) {
                    posts = [];
                }
                //调用模板引擎，并传递参数给模板引擎
                res.render('user', {
                        title: '用户详情页', 
                        user:user,
                        posts: posts, 
                        page: page,
                        isFirstPage: (page - 1) == 0,
                        isLastPage: ((page - 1) * 3 + posts.length) == total,
                        currentUser: req.session.user,
                        success: req.flash('success').toString(),
                        error: req.flash('error').toString()
                    });
            });

   });
};

router.userlogin =   function (req, res) {
//密码用md5值表示
    var md5 = crypto.createHash('md5');
    var password = md5.update(req.body.userpwd).digest('base64');
    //判断用户名和密码是否存在和正确
    User.get(req.body.username, function (err, user) {
        if (!user) {
            req.flash('error', '用户名不存在');
            return res.redirect('/login');
        }
        if (user.password !== password) {
            req.flash('error', '用户密码不存在');
            return res.redirect('/login');
        }
        req.session.user = user;//保存用户信息
        req.flash('success', '登陆成功！');
        res.redirect('/u');
    });
};
router.logout=function (req, res) {
    req.session.user = null;//清空session
    req.flash('sucess', '退出成功！');
    res.redirect('/');
}
router.reg =  function (req, res) {
    //console.log(req.body['pwdrepeat'] + ";" + req.body['userpwd']);
    //用户名密码不能为空
    if (req.body.username == "" || req.body.userpwd == "" || req.body.pwdrepeat == "") {
        //使用req.body.username获取提交请求的用户名，username为input的name
        req.flash('error', "输入框不能为空！");//保存信息到error中，然后通过视图交互传递提示信息，调用alert.ejs模块进行显示
        return res.redirect('/reg');//返回reg页面
    }
    //两次输入密码如果不一致，提示信息
    if (req.body['pwdrepeat'] !== req.body['userpwd']) {
        req.flash("error", '两次输入密码不一致！');//保存信息到error中，用于界面显示提示信息
        return res.redirect('/reg');
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
            return res.redirect('/reg');
        }

        newUser.save(function (err) {//用户名不存在时，保存记录到数据库
            if (err) {
                req.flash('error', err);
                return res.redirect('/reg');
            }
            req.session.user = newUser;//保存用户信息，用于判断用户是否已登录
            req.flash('success', req.session.user.name + '注册成功');
            res.redirect('/u');
        });
    });
}
// 用户个人设置
router.setUserInfo = function(req,res){
    var username = req.body.username;
    var sex = req.body.sex;
    var userInfo = req.body.userInfo;
    var ulog = req.body.ulog;
    req.session.user['ulog'] = ulog;
    User.change( username,sex,userInfo,ulog, function (err) {
         console.log(err);
        if (err) {
                req.flash('error', err);
                res.json({code:1});
            }
          res.json({code:0});
     })
}
// 修改密码
router.changePwd = function(req,res){
    var currentUser = req.session.user;
    var newpwd = req.body.newpwd,
        newpwdag = req.body.newpwdag,
        oldpwd = req.body.oldpwd;
    if(newpwdag != newpwd){
         res.json({code:1});
    }else{
        // User.changePwd(currentUser.name,newpwd,oldpwd,function(err){
        //     if (err) {
        //         res.json({code:1});
        //     }
        // res.json({code:0});
        // })
    }

}
router.uploadUserLogo = function(req, res, next) {
  //生成multiparty对象，并配置上传目标路径
  var form = new multiparty.Form({uploadDir: './public/images/upload'});
  form.parse(req, function(err, fields, files) {
    var filesTmp = JSON.stringify(files);
 
    if(err){
      console.log('parse error: ' + err);
    } else {
      testJson = eval("(" + filesTmp+ ")");
      res.json({imgSrc:testJson.ulog[0].path})
      console.log('rename ok');
    }
  });
},

router.uploadUserImgPre = function(req, res, next) {
  //生成multiparty对象，并配置上传目标路径
  var form = new multiparty.Form({uploadDir: './public/images/upload'});
  form.parse(req, function(err, fields, files) {
    var filesTmp = JSON.stringify(files);
 
    if(err){
      console.log('parse error: ' + err);
    } else {
      testJson = eval("(" + filesTmp+ ")");
      res.json({imgSrc:testJson})
      console.log('rename ok');
    }
  });
},


// 加关注
router.makeFriends =  function (req, res) {
    var currentUser = req.session.user;
    console.log(req.query.name);
    User.makeFriends(currentUser.name, req.query.name, function (err) {
      if (err) {
        req.flash('error', err); 
        return res.redirect('/');//出错！返回文章页
      }
      req.flash('success', '修改成功!');
      res.json({code:0});
    });
  },

// 取消关注
router.withoutFriend =function(req,res){
    var currentUserName = req.params.currentUser,
        friendsName = req.params.friendName;
    User.withoutFriends(currentUserName,friendsName,function (err) {
          if (err) {
            req.flash('error', err); 
            return res.redirect('back');//出错！返回文章页
          }
          req.flash('success', '修改成功!');
           return res.redirect('back');
    });
}
// 收藏游记
router.collections = function(req,res){
    var postHead = req.body.data;
    var currentUser = req.session.user;
    console.log(currentUser);
    User.collections(currentUser.name,postHead,function(err){
        if (err) {
            req.flash('err',err);
            return res.redirect('/u');
        }
    // 重新获取用户，更换session中的用户
    User.get(currentUser.name, function (err, user) {
        req.session.user = user;
        console.log(user);
           User.get(currentUser.name, function (err, user) {  
                req.flash('success','收藏成功');
                res.json({
                    code:0
                })
            })
         })
    })
}
// 取消收藏
router.withOutCollections = function(req,res){
    var postHead = req.body.data;
    var currentUser = req.session.user;
    console.log(currentUser);
    User.withOutCollections(currentUser.name,postHead,function(err){
        if (err) {
            req.flash('err',err);
            return res.redirect('/u');
        }
    // 重新获取用户，更换session中的用户
    User.get(currentUser.name, function (err, user) {
        req.session.user = user;
        console.log(user);
           User.get(currentUser.name, function (err, user) {  
                req.flash('success','取消收藏成功');
                res.json({
                    code:0
                })
            })
         })
    })
}
router.getFans = function(req,res){
    var page = req.query.p ? paseInt(req.query.p):1;
    var currentUser = req.session.user;
    User.getFans(currentUser.name,page,function(err,fans){
        if (err) {
            fans=[];
            return res.redirect('/fans');
        }
        res.render('fans', {
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
            return res.redirect('/fans');
        }
        res.render('attention', {
            title:"粉丝",
            mfans:fans,
            currentUser: req.session.user
        });

    })
}
module.exports = router;