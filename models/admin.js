var mongodb = require('./db');//加载数据库模块

function Post(name,time,title, tags, post,postImg,userLogo,postHead_MD5,comments,reprint_info,pv) {
  this.name = name;
  this.time = time;
  this.title = title;
  this.tags = tags;
  this.post = post;
  this.comments = comments;
  this.reprint_info = reprint_info;
  this.pv = pv;
  this.postImg = postImg;
  this.userLogo = userLogo;
  this.postHead_MD5 = postHead_MD5;
}

//User构造函数，用于创建对象
function User(name,password,sex,ulog,friends,fans,useInfo) {
    this.name = name;
    this.password = password;
    this.sex = sex;
    this.ulog = ulog;
    this.friends =friends;
    this.fans = fans;
    this.useInfo=useInfo;

};

//User构造函数，用于创建对象
function AdminUser(admin) {
    this.name = admin.name;
    this.password = admin.password;
};
//输出User对象
module.exports = AdminUser;
//User对象方法：从数据库中查找指定用户的信息
AdminUser.get = function get(username, callback) {
    mongodb.open(function(err, db) {
        if (err) {
            return callback(err);
        }
        //读取users集合
        db.collection('admin', function(err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            //从users集合中查找name属性为username的记录
            collection.findOne({name: username}, function(err, doc) {
                mongodb.close();
                if (doc) {
                    //封装查询结果为User对象
                    var admin = new AdminUser(doc);
                    callback(err, admin);
                } else {
                    callback(err, null);
                }
            });
        });
    });
};
// 获取所有用户
AdminUser.getAllUsers = function getAllUsers(err,callback){
     mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        //读取posts集合
        db.collection('users', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
         var query = {};
            //查找符合条件的记录，并按时间顺序排列
            collection.find(query).sort({time: 1}).toArray(function (err, docs) {
                mongodb.close();
                if (err) {
                    callback(err, null);
                }
                var allUser = [];
                //遍历查询结果
                docs.forEach(function (doc, index) {
                    //把结果封装成Post对象
                    console.log(doc);
                     var user = new User(doc.name,doc.password,doc.sex,doc.ulog,doc.friends,doc.fans,doc.useInfo);
                    //把全部结果封装成数组
                    allUser.push(user);
                      console.log(allUser);
                })
                callback(null,allUser);
            });
        });
    });
}
// 删除所有用户
AdminUser.removeUser =function removeUser(username,callback){
    mongodb.open(function(err,db){
        if(err){
            mongodb.close();
            return callback(err);
        }
        db.collection('users',function(err,collection){
             if(err){
                mongodb.close();
                return callback(err);
            }
            collection.remove({
                "name":username
            },function(err){
                if(err){
                    callback(err);
                }
                callback(null);
            })
        })
    })
}
// 获取全部游记列表
//获取全部或指定用户的游记记录
AdminUser.getAllPosts = function getAllPosts(username, callback) {
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        //读取posts集合
        db.collection('posts', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            //查找user属性为username的游记记录，如果username为null则查找全部记录
            var query = {};
            if (username) {
                query.user = username;
            }
            //查找符合条件的记录，并按时间顺序排列
            collection.find(query).sort({time: 1}).toArray(function (err, docs) {
                mongodb.close();
                if (err) {
                    callback(err, null);
                }
                var posts = [];
                //遍历查询结果
                docs.forEach(function (doc, index) {
                    //把结果封装成Post对象
                     var post = new Post(doc.name, doc.time,doc.title,doc.tags,doc.post,doc.postImg,doc.userLogo,doc.postHead_MD5,doc.comments,doc.reprint_info,doc.pv);
                    //把全部结果封装成数组
                    posts.push(post);
                });
                callback(null, posts);
            });
        });
    });
};