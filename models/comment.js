var mongodb = require('./db');

function Comment(name, day,postHead_MD5, title, comment) {
  this.name = name;
  this.day = day;
  this.postHead_MD5=postHead_MD5;
  this.title = title;
  this.comment = comment; 

}

module.exports = Comment;

//存储一条留言信息
Comment.prototype.save = function(callback) {
  var name = this.name,
      day = this.day,
      title = this.title,
      comment = this.comment;
      postHead_MD5 = this.postHead_MD5;
  //打开数据库
  mongodb.open(function (err, db) {
    if (err) {
       mongodb.close();
      return callback(err);
    }
    //读取 posts 集合
    db.collection('posts', function (err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }
    
      //通过用户名、时间及标题查找文档，并把一条留言对象添加到该文档的 comments 数组里
      collection.update({
        "postHead_MD5":postHead_MD5,
        "name": name,
        "time.day": day,
        "title": title
      }, {
        $push: {"comments": comment}
      } , function (err) {
          mongodb.close();
          if (err) {
            return callback(err);
          }
          callback(null);
      });   
    });
  });
};

Comment.remove =function(name,postHead_MD5,title,head,callback){
  
    mongodb.open(function(err,db){
      if(err){
        mongodb.close();
        return　callback(err);
      }
      db.collection("posts",function(err,collection){
        if(err){
          mongodb.close();
          return callback(err);
        } 
        
        collection.update({ 
          "postHead_MD5":postHead_MD5,
          "name": name,
          "title": title
        },{
           $pull:{
              "comments":{
                "head":head
              }
            }
        },function(err) {
              if (err) {
                mongodb.close();
                return callback(err);
              }
            callback(null);
        });      
  //   })
  })
 })
}
