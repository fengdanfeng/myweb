 var express = require('express');
var router = express.Router();//创建模块化安装路径的处理程序。
var crypto = require('crypto');//加载生成MD5值依赖模块
var User = require('../models/user.js');//加载用户保存和获取模块
var Post = require('../models/post.js');//加载用户保存和获取模块

router.post = function (req, res) {
    var currentUser = req.session.user,
        tags = [req.body.tag1, req.body.tag2, req.body.tag3],
        Img=req.body.postImg,
        userLogo = req.body.userLogo;
    var date = new Date(),
        time = date.getTime().toString();
    var md5 = crypto.createHash('md5'),
        postHead_MD5 = md5.update(time.toLowerCase()).digest('hex');
        console.log(postHead_MD5);
        if(!Array.isArray(Img)){
          var postImg = [];
            postImg.push(Img);
        }else{
          var postImg = Img;
        } 
    var   post = new Post(currentUser.name, currentUser.head, req.body.title, tags, req.body.post,postImg,userLogo,postHead_MD5);
   console.log(post);
    post.save(function (err) {
      if (err) {
        req.flash('error', err); 
        return res.redirect('/u');
      }
      req.flash('success', '发布成功!');
      res.redirect('/u');//发表成功跳转到主页
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
// 获取十篇游记
router.getTen = function (req, res) {
      var page = req.body.page;
    //读取所有的用户游记，传递把posts游记数据集传给首页
    Post.getTen(null,page, function (err, posts,total) {
        if (err) {
            posts = [];
            res.json({code:1,page:page,post:posts});
        }
        //调用模板引擎，并传递参数给模板引擎
         console.log(posts);
        res.json({code:0,page:page,total:total,post:posts});
    });
},
// 获取一篇游记及其详情
router.getOneArticle = function (req, res) {
    Post.getOne(req.params.name, req.params.day,req.params.postHead_MD5, req.params.title, function (err, post) {
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

// 编辑游记
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
    // var currentUser = req.session.user;
    Post.remove(req.params.name, req.params.day,req.params.postHead_MD5, req.params.title, function (err) {
      if (err) {
        req.flash('error', err); 
        return res.redirect('/u');
      }
      req.flash('success', '删除成功!');
      res.redirect('/u');
    });
  },
// 更新游记
router.editUpdate =  function (req, res) {
    var currentUser = req.session.user;
    Post.update(currentUser.name, req.params.day, req.params.title, req.body.post, function (err) {
      // var url = encodeURI('/u/' + req.params.name + '/' + req.params.day + '/' + req.params.title);
      if (err) {
        req.flash('error', err); 
        return res.redirect('/');//出错！返回文章页
      }
      req.flash('success', '修改成功!');
      res.redirect("/u");//成功！返回文章页
    });
  },

// 通过一个标签获取游记列表
router.getTag =function (req, res) {
    Post.getTag(req.params.tag, function (err, posts) {
      if (err) {
        req.flash('error',err); 
        return res.redirect('/u');
      }
      res.render('tag', {
        title: 'TAG:' + req.params.tag,
        posts: posts,
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
      });
    });
  }

// 转载游记
router.reprint = function (req, res) {
    Post.edit(req.params.name, req.params.day,req.params.title, function (err, post) {
      if (err) {
        req.flash('error', err); 
        return res.redirect('back');
      }
      var currentUser = req.session.user,
          reprint_from = {name: post.name, day: post.time.day, title: post.title},
          reprint_to = {name: currentUser.name};
      Post.reprint(reprint_from, reprint_to,req.params.postHead_MD5, function (err, doc) {
        if (err) {
          req.flash('error', err); 
          return res.redirect('back');
        }
        req.flash('success', '转载成功!');
        // var url = encodeURI('/u/' + doc.name + '/' + doc.time.day + '/' + doc.title);
        res.redirect('/u');
      });
    });
  }
module.exports = router