# myweb
用户user
      email_MD5 = md5.update(this.email.toLowerCase()).digest('hex'),//哈希加密
      head = "localhost/" + email_MD5 + "?s=";//顶部url更改
表字段
name;
password;
sex;
logo;
email;
head;
方法：
save 存储用户信息
get登录时读取用户信息

游记post
表字段
name
head
time
title
tags
post
Comments//数组对象
reprint_info//{对象}
Pv
方法：
save //存储文章
getTen //一次获取十篇文章
getOne //一次获取一篇文章
edit//返回原始发表的内容 数组格式）
Update //更新一篇文章及其相关信息
remove//删除一篇文章
getArchive//返回所有文章存档信息
getTags//返回所有标签
getTag//返回含有特定标签的所有文章
search//返回通过标题关键字查询的所有文章信息
reprint//转载一篇文章

评论Comment
表字段
name 
day
title 
comment
方法
save//通过用户名、时间及标题查找文档，并把一条留言对象添加到该文档的 comments 数组里






