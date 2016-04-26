var df = {
    compress: function(source_img_obj, quality, output_format){  
        var mime_type = "image/jpeg";
        if(output_format!=undefined && output_format=="png"){
           mime_type = "image/png";
        }
             
       var cvs = document.createElement('canvas');
       //naturalWidth真实图片的宽度
      cvs.width = source_img_obj.naturalWidth;
      cvs.height = source_img_obj.naturalHeight;
      var ctx = cvs.getContext("2d").drawImage(source_img_obj, 0, 0);
      var newImageData = cvs.toDataURL(mime_type, quality/100);
      var result_image_obj = new Image();
      result_image_obj.src = newImageData;
      return result_image_obj;
   }
}
 function handleFileSelect (evt) {
  var files = evt.target.files;
  for (var i = 0, f; f = files[i]; i++) {
     // Only process image files.
     if (!f.type.match('image.*')) {
       continue;
     }
    var prvbox = document.getElementById('prvid');
     var reader = new FileReader();
     reader.onload = (function(theFile) {
       return function(e) {
          var i = document.getElementById("test");
          i.src = e.target.result;     
          var quality =  50;
          i.src = df.compress(i,quality).src;
          i.style.display = "block";
            var input = document.createElement("input");
            input.name = 'postImg';
            input.type = 'hidden';
            input.value = e.target.result;
            input.style = 'display:none';
            prvbox.appendChild(input);
       };
    })(f);
    // Read in the image file as a data URL.
    reader.readAsDataURL(f);
    }
  }
 document.getElementById('fileImg').addEventListener('change', handleFileSelect, false);

// function saveLocalstorage(){
$("#saveLocal").on('click',function(){
       var postForm = $('#mPostForm').serialize();
            alert("正在缓存请稍后。。");
            var createPost= JSON.stringify($("#mPostForm").serializeObject());
            // 将json格式的数据存到缓存
           localStorage.setItem("createPost"+Date.now(),createPost);
            alert("存入便签成功");
           window.location.href='/m/postPosts';
})
 
// }
// 遍历表单，将所有input提出出来，转换成json格式
$.fn.serializeObject = function()    
{    
   var o = {};    
   var a = this.serializeArray();    
   $.each(a, function() {    
       if (o[this.name]) {    
           if (!o[this.name].push) {    
               o[this.name] = [o[this.name]];    
           }    
           o[this.name].push(this.value || '');    
       } else {    
           o[this.name] = this.value || '';    
       }    
   });    
   return o;    
};  