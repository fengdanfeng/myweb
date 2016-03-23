var express = require('express');
var router = express.Router();//创建模块化安装路径的处理程序。
var crypto = require('crypto');//加载生成MD5值依赖模块
var User = require('../models/user.js');//加载用户保存和获取模块
var Post = require('../models/post.js');//加载用户保存和获取模块

router.post = function (req, res) {
    var currentUser = req.session.user,
        tags = [req.body.tag1, req.body.tag2, req.body.tag3];
        console.log(currentUser);
    var   post = new Post(currentUser.name, currentUser.head, req.body.title, tags, req.body.post);
    post.save(function (err) {
      if (err) {
        req.flash('error', err); 
        return res.redirect('/');
      }
      req.flash('success', '发布成功!');
      res.redirect('/',{posts:post});//发表成功跳转到主页
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
    //读取所有的用户游记，传递把posts游记数据集传给首页
    Post.getTen(null,page, function (err, posts,total) {
        if (err) {
            posts = [];
            res.json({code:1,page:page,post:posts});
        }
        //调用模板引擎，并传递参数给模板引擎
        res.json({code:0,page:page,total:total,post:posts});
    });
},
router.getOneArticle = function (req, res) {
    Post.getOne(req.params.name, req.params.day, req.params.title, function (err, post) {
      if (err) {
        req.flash('error', err); 
        return res.redirect('/');
      }
      res.render('article', {
        title: req.params.title,
        post: post,
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
      });
    });
  },
router.edit= function (req, res) {
    var currentUser = req.session.user;
    Post.edit(currentUser.name, req.params.day, req.params.title, function (err, post) {
      if (err) {
        req.flash('error', err); 
        return res.redirect('/');
      }
      res.render('edit', {
        title: '编辑',
        post: post,
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
      });
    });
  },
// 删除游记
router.deleteOnePost=function (req, res) {
    var currentUser = req.session.user;
    Post.remove(currentUser.name, req.params.day, req.params.title, function (err) {
      if (err) {
        req.flash('error', err); 
        return res.redirect('/');
      }
      req.flash('success', '删除成功!');
      res.redirect('/');
    });
  },
// 更新游记
router.editUpdate =  function (req, res) {
    var currentUser = req.session.user;
    Post.update(currentUser.name, req.params.day, req.params.title, req.body.post, function (err) {
      var url = encodeURI('/u/' + req.params.name + '/' + req.params.day + '/' + req.params.title);
      if (err) {
        req.flash('error', err); 
        return res.redirect(url);//出错！返回文章页
      }
      req.flash('success', '修改成功!');
      res.redirect(url);//成功！返回文章页
    });
  }
module.exports = router