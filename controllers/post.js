var express = require('express');
var router = express.Router();//创建模块化安装路径的处理程序。
var crypto = require('crypto');//加载生成MD5值依赖模块
var User = require('../models/user.js');//加载用户保存和获取模块
var Post = require('../models/post.js');//加载用户保存和获取模块

router.post =  function (req, res) {//路由规则/post
    var currentUser = req.session.user;//获取当前用户信息
        if(req.body.post == ""){//发布信息不能为空
        req.flash('error', '内容不能为空！');
        return res.redirect('/u/' + currentUser.name);
    }
    //实例化Post对象
   var post = new Post(currentUser.name, req.body.post);//req.body.post获取用户发表的内容
    //调用实例方法，发表游记并把信息保存到MongoDB数据库
    post.save(function (err) {
        if (err) {
            req.flash('error', err);
            return res.redirect('/');
        }
        req.flash('sucess', '发表成功');
        var uname = currentUser.name.toString();
        res.redirect('/u/' + currentUser.name);
    });
}
router.getAll = function (req, res,next) {
    var page = req.query.p ? paseInt(req.query.p):1;
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
                isFirstPage: (page - 1) == 0,
                isLastPage: ((page - 1) * 3 + posts.length) == total,
                user: req.session.user,
                success: req.flash('success').toString(),
                error: req.flash('error').toString()
            });
    });
},
router.getTen = function (req, res) {
      var page = req.body.page;
    console.log(page);
    //读取所有的用户游记，传递把posts游记数据集传给首页
    Post.getTen(null,page, function (err, posts,total) {
        if (err) {
            posts = [];
            res.json({code:1,page:page,post:posts});
         
        }
        //调用模板引擎，并传递参数给模板引擎
        res.json({code:0,page:page,total:total,post:posts});
    });
};
module.exports = router;