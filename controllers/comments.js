var express = require('express');
var router = express.Router();//创建模块化安装路径的处理程序。
var crypto = require('crypto');//加载生成MD5值依赖模块
var User = require('../models/user.js');//加载用户保存和获取模块
var Post = require('../models/post.js');//加载用户保存和获取模块
var Comment = require('../models/comment.js');//加载评论保存和获取模块
var multiparty = require('multiparty');

router.post =  function (req, res) {
    var date = new Date(),
        time =date.getTime().toString(),
        commentTime = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + 
            date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes());
    var md5 = crypto.createHash('md5'),
        comment_MD5 = md5.update(time.toLowerCase()).digest('hex');
    var comment = {
        name: req.body.name,
        head: comment_MD5,
        email: req.body.email,
        website: req.body.website,
        time: commentTime,
        content: req.body.content,
        commetLogo:req.body.commetLogo
    };
    var newComment = new Comment(req.params.name,req.params.postHead_MD5, req.params.day ,req.params.title, comment);
    newComment.save(function (err) {
      if (err) {
        req.flash('error', err); 
        return res.redirect('back');
      }
      req.flash('success', '留言成功!');
      res.redirect('back');
    });
  },
router.removeTest = function(req,res){

    Comment.remove(req.params.name, req.params.postHead_MD5,req.params.title,req.params.head,function(err){
      if (err) {
        req.flash('error', err); 
        return res.redirect('back');
      }
      req.flash('success', '删除成功!');
        return res.redirect('back');

    })
}

module.exports = router;