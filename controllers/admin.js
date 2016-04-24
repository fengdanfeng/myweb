var express = require('express');
var router = express.Router();//创建模块化安装路径的处理程序。\
var Admin = require('../models/admin.js');//加载用户保存和获取模块
var Post = require('../models/post.js');//加载用户保存和获取模块
var User = require('../models/user.js');//加载用户保存和获取模块
var multiparty = require('multiparty');


router.adminLogin = function (req, res) {
    //判断用户名和密码是否存在和正确
    Admin.get(req.body.admin, function (err, admin) {
        if (!admin) {
            req.flash('error', '用户名不存在');
            return res.redirect('/admin');
        }
        if (admin.password !== req.body.adminpwd) {
            req.flash('error', '用户密码不存在');
            return res.redirect('/admin');
        }
        req.flash('success', '登陆成功！');
        res.render('admin/adminIndex',{title:"管理员首页",admin:admin})
    });
};

router.getAllUsers = function(req,res){
    Admin.getAllUsers(null,function(err,allUsers){
        if (err) {
            req.flash('err','当前系统没有用户');
            return res.redirect('back');
        }
        console.log(allUsers);
        req.flash('success', '获取所有用户');
        res.render('admin/allUsers',{title:"所有用户",allUsers:allUsers})
    })
};
router.adminRemoveUser = function(req,res){
    Admin.removeUser(req.params.userName,function(err){
         if(err){
            req.flash('err',"无法获取所有游记");
            return res.redirect('back');
        }
        req.flash('success', '删除成功');
         return res.redirect('back');
    })
}
router.getAllPosts = function(req,res){
    Admin.getAllPosts(null,function(err,posts){
        if(err){
            req.flash('err',"无法获取所有游记");
            return res.redirect('back');
        }
        req.flash('success', '登陆成功！');
        res.render('admin/allPosts',{title:"所有游记",posts:posts})
    })
}
module.exports = router;