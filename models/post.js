2//获取游记和保存游记
var mongodb = require('./db');
//Post构造函数，用于创建对象
function Post(username, post, time) {
    this.user = username;//用户名
    this.post = post;//发布内容
    if (time) {
        this.time = time;//发布时间
    }
    else {
        var now=new Date();
        this.time =now.getFullYear()+"/"+(now.getMonth()+1)+"/"+now.getDate()+" "+now.getHours()+":"+now.getSeconds();
    }
}
//输出Post对象
module.exports = Post;
//对象方法：保存新发布的游记到数据库
Post.prototype.save = function save(callback) {
    //存入MongoDB数据库
    var post = {//游记发布的基本信息
        user: this.user,
        post: this.post,
        title:this.potitle,
        time: this.time
    };
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        //读取posts集合，即数据库表
        db.collection('posts', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            //为user属性添加索引
            collection.ensureIndex('user');
            //把发布的游记信息post写入posts表中
            collection.insert(post, {safe: true}, function (err, post) {
                mongodb.close();
                callback(err, post);
            });
        });
    });
};
//获取全部或指定用户的游记记录
Post.get = function get(username, callback) {
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
                    var post = new Post(doc.user, doc.post, doc.time);
                    //把全部结果封装成数组
                    posts.push(post);
                });
                callback(null, posts);
            });
        });
    });
};


//一次获取十篇文章
Post.getTen = function(username, page, callback) {
  //打开数据库
  mongodb.open(function (err, db) {
    if (err) {
      return callback(err);
    }
    //读取 posts 集合
    db.collection('posts', function (err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }
      var query = {};
      if (username) {
        query.name = username;
      }
      //使用 count 返回特定查询的文档数 total
      collection.count(query, function (err, total) {
        //根据 query 对象查询，并跳过前 (page-1)*2个结果，返回之后的 2个结果
        collection.find(query, {
          skip: (page - 1)*1,
          limit: 1
        }).sort({
          time: -1
        }).toArray(function (err, docs) {
          mongodb.close();
          if (err) {
            return callback(err);
          }
           var posts = [];
                //遍历查询结果
                docs.forEach(function (doc, index) {
                    //把结果封装成Post对象
                    var post = new Post(doc.user, doc.post, doc.time);
                    //把全部结果封装成数组
                    posts.push(post);
                });
                callback(null, posts);
            });
      });
    });
  });
};


//获取一篇文章,用户搜索时调用
Post.getOne = function(name, day, title, callback) {
  //打开数据库
  mongodb.open(function (err, db) {
    if (err) {
      return callback(err);
    }
    //读取 posts 集合
    db.collection('posts', function (err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }
      //根据用户名、发表日期及文章名进行查询
      collection.findOne({
        "name": name,
        "time.day": day,
        "title": title
      }, function (err, doc) {
        if (err) {
          mongodb.close();
          return callback(err);
        }
        if (doc) {
          //每访问 1 次，pv 值增加 1
          collection.update({
            "name": name,
            "time.day": day,
            "title": title
          }, {
            $inc: {"pv": 1}
          }, function (err) {
            mongodb.close();
            if (err) {
              return callback(err);
            }
          });
          //解析 markdown 为 html
          doc.post = markdown.toHTML(doc.post);
          doc.comments.forEach(function (comment) {
            comment.content = markdown.toHTML(comment.content);
          });
          callback(null, doc);//返回查询的一篇文章
        }
      });
    });
  });
};