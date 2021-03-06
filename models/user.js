var mongodb = require('./db');//加载数据库模块

//User构造函数，用于创建对象
function User(user) {
    this.name = user.name;
    this.password = user.password;
    this.sex = user.sex;
    this.ulog = user.ulog;
    this.friends = user.friends;
    this.fans = user.fans;
    this.useInfo = user.useInfo;
    this.fv = user.fv;
};
//输出User对象
module.exports = User;

//User对象方法：把用户信息存入Mongodb
User.prototype.save = function save(callback) {
    var user = {//用户信息
        name: this.name,
        password: this.password,
        sex:this.sex,
        ulog :this.ulog,
        friends :[],
        fans :[],
        useInfo:this.useInfo,
        fv:[],
    };

    mongodb.open(function(err, db) {
        if (err) {
            return callback(err);
        }
        //读取users集合，users相当于数据库中的表
        db.collection('users', function(err, collection) {//定义集合名称users
            if (err) {
                mongodb.close();
                return callback(err);
            }
            // 为name属性添加索引
            // collection.ensureIndex('name', {unique: true});

            //把user对象中的数据，即用户注册信息写入users集合中
            collection.insert(user, {safe: true}, function(err, user) {
                mongodb.close();
                callback(err, user);
            });
        });
    });
}
User.change = function change(username, sex, useInfo,ulog,callback) {
  //打开数据库
  mongodb.open(function (err, db) {
    if (err) {
      return callback(err);
    }
    //读取 posts 集合
    db.collection('users', function (err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }
      //更新用户内容
      collection.update({
        "name":username,
      },{
        $set:{"sex":sex,"useInfo": useInfo,"ulog":ulog}
      }, function (err) {
        mongodb.close();
          return callback(err);
      });
    });
  });
};
//User对象方法：从数据库中查找指定用户的信息
User.get = function get(username, callback) {
    mongodb.open(function(err, db) {
        if (err) {
            return callback(err);
        }
        //读取users集合
        db.collection('users', function(err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            //从users集合中查找name属性为username的记录
            collection.findOne({name: username}, function(err, doc) {
                mongodb.close();
                if (doc) {
                    //封装查询结果为User对象
                    var user = new User(doc);
                    callback(err, user);
                } else {
                    callback(err, null);
                }
            });
        });
    });
};

// 加关注
User.makeFriends =function makeFriends(username,friendsName,callback){
    mongodb.open(function(err,db){
        if(err){
            return callback(err);
        }
        db.collection('users',function(err,collection){
            if(err){
                mongodb.close();
                return callback(err);
            }
            // 把当前用户名存到关注好友的fans字段
            collection.update({
                    name:friendsName
                },{
                    $push:{'fans':username}
                 },function(err){
                        callback(err);
                 });

            collection.update({
                    name:username
                },{
                    $push:{'friends':friendsName}
                 },function(err){
                        callback(err);
                 });
        })
    });
};
/*取消关注*/
User.withoutFriends =function withoutFriends(username,friendsName,callback){
    mongodb.open(function(err,db){
        if(err){
            return callback(err);
        }
        db.collection('users',function(err,collection){
            if(err){
                mongodb.close();
                return callback(err);
            }
            // 把当前用户名存到关注好友的fans字段
            collection.update({
                    name:friendsName
                },{
                    $pull:{'fans':username}
                 },function(err){
                        mongodb.close();
                        callback(err);
                 });
                 console.log('aaa');
            collection.update({
                    name:username
                },{
                    $pull:{'friends':friendsName}
                 },function(err){
                        mongodb.close();
                        callback(err);
                 });
        })
    });
};

// 收藏游记
User.collections=function collections(username,postHead,callback){
    mongodb.open(function(err,db){
        if(err){
            mongodb.close();
            return callback(err);
        }
        db.collection('users',function(err,collection){
            if (err) {
                mongodb.close();
                return callback(err);
            }
            collection.update({name: username}, {
                    $push:{'fv':postHead}
                 },function(err,doc){
                    if(err){
                        callback(err);
                    }
                    callback(null);
                 });
        })

    })
};

// 取消收藏游记
User.withOutCollections=function withOutCollections(username,postHead,callback){
    mongodb.open(function(err,db){
        if(err){
            mongodb.close();
            return callback(err);
        }
        db.collection('users',function(err,collection){
            if (err) {
                mongodb.close();
                return callback(err);
            }
            collection.update({name: username}, {
                    $pull:{'fv':postHead}
                 },function(err,doc){
                    if(err){
                        callback(err);
                    }
                    callback(null);
                 });
        })

    })
};

// 获取粉丝
User.getFans= function getFans(username,page,callback){
    mongodb.open(function(err,db){
        if (err) {
            mongodb.close();
            return callback(err);
        }
        db.collection('users',function(err,collection){
            if (err) {
                mongodb.close();
                return callback(err);
            }
        var query={};
         if (username) {
        query.name = username;
      }
      //使用 count 返回特定查询的文档数 total
      collection.count(query, function (err, total) {
        //根据 query 对象查询，并跳过前 (page-1)*6个结果，返回之后的6个结果
        collection.find(query, {
          skip: (page - 1)*2,
          limit: 2
        }).sort({
          time: -1
        }).toArray(function (err, docs) {
          mongodb.close();
          if (err) {
            return callback(err);
          }
                //遍历查询结果
                docs.forEach(function (doc, index) {
                    //把全部结果封装成数组
                     callback(null, doc);
                });
           
            });
      });
        })
    })
};

      