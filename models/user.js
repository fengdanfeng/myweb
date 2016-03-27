var mongodb = require('./db');//加载数据库模块

//User构造函数，用于创建对象
function User(user) {
    this.name = user.name;
    this.password = user.password;
    this.sex = user.sex;
    this.ulog = user.ulog;

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
User.change = function change(username, sex, useInfo,callback) {
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
        $set:{"sex":sex,"useInfo": useInfo}
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
                    $push:{fans:username}
                 },function(err){
                        callback(err);
                 });
            collection.update({
                    name:username
                },{
                    $push:{friends:friendsName}
                 },function(err){
                        callback(err);
                 });
        })
    });
};
            // 在用户表中找到需要关注的用户
        //     collection.findOne({name:friendsName},function(err,doc){
        //         if (err) {
        //           mongodb.close();
        //           return callback(err);
        //         }
        //         console.log("aa");
        //         // 把当前用户名存到关注好友的fans字段
        //         collection.update({
        //             name:friendsName
        //         },{
        //             $push:{fans:username}
        //          },function(err){
        //                 callback(err);
        //          });
        //     });
        //     collection.findOne({name:username},function(err,doc){
        //         if (err) {
        //           mongodb.close();
        //           return callback(err);
        //         }
        //          console.log("bb");
        //         // 把要关注的用户名存在当前登录用户的fiends(关注者)字段里
        //         collection.update({
        //             name:username
        //         },{
        //             $push:{friends:friendsName}
        //          },function(err){
        //                 callback(err);
        //          });
        //     });
        //     callback(err);
        // })

