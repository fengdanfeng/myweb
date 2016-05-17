//获取游记和保存游记
var mongodb = require('./db'),
    markdown = require('markdown').markdown,
    crypto = require('crypto');//加载生成MD5值依赖模块
//Post构造函数，用于创建对象
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

module.exports = Post;

//存储一篇文章及其相关信息
Post.prototype.save = function(callback) {
  var date = new Date();
  //存储各种时间格式，方便以后扩展
  var time = {
      date: date,
      year : date.getFullYear(),
      month : date.getFullYear() + "-" + (date.getMonth() + 1),
      day : date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate(),
      minute : date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + 
      date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes())
  }
  //要存入数据库的文档
  var post = {
      name: this.name,
      time: time,
      title:this.title,
      tags: this.tags,
      post: this.post,
      postImg:this.postImg,
      userLogo:this.userLogo,
      postHead_MD5:this.postHead_MD5,
      comments: [],
      reprint_info: {},
      pv: 0
  };
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
      //将文档插入 posts 集合
      collection.insert(post, {
        safe: true
      }, function (err) {
        mongodb.close();
        if (err) {
          return callback(err);//失败！返回 err
        }
        callback(null);//返回 err 为 null
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
                query.name = username;
            }
            //查找符合条件的记录，并按时间顺序排列
         //使用 count 返回特定查询的文档数 total
            collection.count(query, function (err, total) {
              //根据 query 对象查询，并跳过前 (page-1)*3个结果，返回之后的6个结果
              collection.find(query).sort({
                time: -1
              }).toArray(function (err, docs) {
                mongodb.close();
                if (err) {
                  return callback(err);
                }
                 var posts = [] ;
                      //遍历查询结果
                      docs.forEach(function (doc, index) {
                          //把结果封装成Post对象
                          var post = new Post(doc.name, doc.time,doc.title,doc.tags,doc.post,doc.postImg,doc.userLogo,doc.postHead_MD5,doc.comments,doc.reprint_info,doc.pv);
                          //把全部结果封装成数组
                          posts.push(post);
                      });
                      callback(null,total, posts);
                  });
            });
        });
    });
};

// 查找登录用户的好友游记
Post.getFriendsPost = function(friends,page,callback){
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        console.log(friends);
        //读取posts集合
        db.collection('posts', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
                var query = {};
            //查找符合条件的记录，并按时间顺序排列
         //使用 count 返回特定查询的文档数 total
            collection.count(query, function (err, total) {
              collection.find({'name':{$in:friends}}).sort({
                time: -1
              }).toArray(function (err, docs) {
                mongodb.close();
                if (err) {
                  return callback(err);
                }
                 var posts = [] ;
                      //遍历查询结果
                      docs.forEach(function (doc, index) {
                          //把结果封装成Post对象
                          var post = new Post(doc.name, doc.time,doc.title,doc.tags,doc.post,doc.postImg,doc.userLogo,doc.postHead_MD5,doc.comments,doc.reprint_info,doc.pv);
                          //把全部结果封装成数组
                          posts.push(post);
                      });
                      callback(null,total, posts);
                  });
            });
        });
    });
};

// 获取登录用户收藏的游记
Post.getCollectionPost = function(currentUserfv,page,callback){
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
                var query = {};
            //查找符合条件的记录，并按时间顺序排列
         //使用 count 返回特定查询的文档数 total
            collection.count(query, function (err, total) {
              collection.find({'postHead_MD5':{$in:currentUserfv}}).sort({
                time: -1
              }).toArray(function (err, docs) {
                mongodb.close();
                if (err) {
                  return callback(err);
                }
                 var posts = [] ;
                      //遍历查询结果
                      docs.forEach(function (doc, index) {
                          //把结果封装成Post对象
                          var post = new Post(doc.name, doc.time,doc.title,doc.tags,doc.post,doc.postImg,doc.userLogo,doc.postHead_MD5,doc.comments,doc.reprint_info,doc.pv);
                          //把全部结果封装成数组
                          posts.push(post);
                      });
                      // console.log(posts);
                      callback(null,total, posts);
                  });
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
        //根据 query 对象查询，并跳过前 (page-1)*3个结果，返回之后的6个结果
        collection.find(query, {
          skip: (page - 1)*2,
          limit: 3
        }).sort({
          time: -1
        }).toArray(function (err, docs) {
          mongodb.close();
          if (err) {
            return callback(err);
          }
           var posts = [] ;
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
  });
};


//获取一篇文章
Post.getOne = function(name, day,postHead_MD5, title, callback) {
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
        "title": title,
        "postHead_MD5":postHead_MD5
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
            "title": title,
            "postHead_MD5":postHead_MD5
          }, {
            $inc: {"pv": 1}
          }, function (err) {
            mongodb.close();
            if (err) {
              return callback(err);
            }
          });
          //解析 markdown 为 html
          // doc.post = markdown.toHTML(doc.post);
          doc.comments.forEach(function (comment) {
            comment.content = markdown.toHTML(comment.content);
          });
          callback(null, doc);//返回查询的一篇文章
        }
      });
    });
  });
};
//返回原始发表的内容
Post.edit = function(name, day, title, callback) {
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
        mongodb.close();
        if (err) {
          return callback(err);
        }
        var posts = [];
        callback(null, doc);
      });
    });
  });
};
// 编辑删除一篇游记及其相关信息
Post.remove = function(name, day,postHead_MD5, title, callback) {
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
      //查询要删除的文档
      collection.findOne({
        "postHead_MD5":postHead_MD5,
        "name": name,
        "time.day": day,
        "title": title
      }, function (err, doc) {
        if (err) {
          mongodb.close();
          return callback(err);
        }
        //如果有 reprint_from，即该文章是转载来的，先保存下来 reprint_from
        var reprint_from = "";
        if (doc.reprint_info.reprint_from) {
          reprint_from = doc.reprint_info.reprint_from;
        }
        if (reprint_from != "") {
          //更新原文章所在文档的 reprint_to
          collection.update({
            "postHead_MD5":postHead_MD5,
            "name": reprint_from.name,
            "time.day": reprint_from.day,
            "title": reprint_from.title
          }, {
            $pull: {
              "reprint_info.reprint_to": {
                "name": name,
                "day": day,
                "title": title
            }}
          }, function (err) {
            if (err) {
              mongodb.close();
              return callback(err);
            }
          });
        }

        //删除转载来的文章所在的文档
        collection.remove({
          "name": name,
          "time.day": day,
          "title": title
        }, {
          w: 1
        }, function (err) {
          mongodb.close();
          if (err) {
            return callback(err);
          }
          callback(null);
        });
      });
    });
  });
};
// 编辑更新一篇游记及其相关信息
Post.update = function(name, day, title, post, callback) {
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
      //更新文章内容
      collection.update({
        "name": name,
        "time.day": day,
        "title": title
      }, {
        $set: {post: post}
      }, function (err) {
        mongodb.close();
        if (err) {
          return callback(err);
        }
        callback(err);
      });
    });
  });
};

//返回含有特定标签的所有文章
Post.getTag = function(tag, callback) {
  mongodb.open(function (err, db) {
    if (err) {
      return callback(err);
    }
    db.collection('posts', function (err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }
      //查询所有 tags 数组内包含 tag 的文档
      //并返回只含有 name、time、title 组成的数组
      collection.find({
        "tags": tag
      }, {
        "name": 1,
        "time": 1,
        "title": 1,
        "postHead_MD5":1
      }).sort({
        time: -1
      }).toArray(function (err, docs) {
        mongodb.close();
        if (err) {
          return callback(err);
        }
        callback(null, docs);
      });
    });
  });
};

// 转载
Post.reprint = function(reprint_from, reprint_to,postHead_MD5, callback) {
  mongodb.open(function (err, db) {
    if (err) {
      return callback(err);
    }
    db.collection('posts', function (err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }
      //找到被转载的文章的原文档
      collection.findOne({
        "postHead_MD5":postHead_MD5,
        "name": reprint_from.name,
        "time.day": reprint_from.day,
        "title": reprint_from.title
      }, function (err, doc) {
        if (err) {
          mongodb.close();
          return callback(err);
        }

        var date = new Date();
        var time = {
            date: date,
            year : date.getFullYear(),
            month : date.getFullYear() + "-" + (date.getMonth() + 1),
            day : date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate(),
            minute : date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + 
            date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes())
        }

        delete doc._id;//注意要删掉原来的 _id

        // var a = date.getTime().toString();
        //  var md5 = crypto.createHash('md5'),
        //  reprintMD = md5.update(a.toLowerCase()).digest('hex');
        doc.name = reprint_to.name;
        doc.time = time;
        doc.title = (doc.title.search(/[转载]/) > -1) ? doc.title : "[转载]" + doc.title;
        doc.comments = [];
        doc.reprint_info = {"reprint_from": reprint_from};
        doc.pv = 0;

        //更新被转载的原文档的 reprint_info 内的 reprint_to
        collection.update({
          "postHead_MD5":postHead_MD5,
          "name": reprint_from.name,
          "time.day": reprint_from.day,
          "title": reprint_from.title
        }, {
          $push: {
            "reprint_info.reprint_to": {
              "name": doc.name,
              "day": time.day,
              "title": doc.title
          }}
        }, function (err) {
          if (err) {
            mongodb.close();
            return callback(err);
          }
        });

        //将转载生成的副本修改后存入数据库，并返回存储后的文档
        collection.insert(doc, {
          safe: true
        }, function (err, post) {
          mongodb.close();
          if (err) {
            return callback(err);
          }
          callback(err, post);
        });
      });
    });
  });
};

// 搜索（通过某个字段进行搜索）

Post.search = function(searchForm,callback){
    mongodb.open(function (err, db) {
        if (err) {
          return callback(err);
        }
        db.collection('posts', function (err, collection) {
          if (err) {
            mongodb.close();
            return callback(err);
          }
          var searchValue = new RegExp(''+searchForm+'');
          console.log(searchValue);
          //查询所有 tags 数组内包含 tag 的文档
          //并返回只含有 name、time、title 组成的数组
          collection.find({
            post:searchValue
          }).sort({
            time: -1
          }).toArray(function (err, docs) {
            mongodb.close();
            if (err) {
              return callback(err);
            }
            callback(null, docs);
          });
          });
     });
}
