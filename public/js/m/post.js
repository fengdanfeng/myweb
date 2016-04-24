	function previewImage(file, prvid) {
    /* file：file控件
     * prvid: 图片预览容器
     */
    var tip = "请上传 jpg or png or gif!"; // 设定提示信息
    var filters = {
        "jpeg"  : "/9j/4",
        "gif"   : "R0lGOD",
        "png"   : "iVBORw"
    }
    var prvbox = document.getElementById(prvid);
    prvbox.innerHTML = "";
    if (window.FileReader) { // html5方案
        for (var i=0, f; f = file.files[i]; i++) {
            var fr = new FileReader();
            fr.onload = function(e) {
                var src = e.target.result;
                if (!validateImg(src)) {
                    alert(tip)
                } else {
                    showPrvImg(src);
                }
            }
            fr.readAsDataURL(f);
        }
    } else { // 降级处理
        if ( !/\.jpg$|\.png$|\.gif$/i.test(file.value) ) {
            alert(tip);
        } else {
            showPrvImg(file.value);
        }
    }

    function validateImg(data) {
        var pos = data.indexOf(",") + 1;
        for (var e in filters) {
            if (data.indexOf(filters[e]) === pos) {
                return e;
            }
        }
        return null;
    }

    function showPrvImg(src) {
        var img = document.createElement("img");
        img.src = src;
        prvbox.appendChild(img);
        var input = document.createElement("input");
        input.name = 'postImg';
        input.value = src;
        input.style = 'display:none';
        prvbox.appendChild(input);
    }
}

function saveLocalstorage(){
    var postForm = $('#mPostForm').serialize();
    $.ajax({
        url:"/post",
        data:postForm,
        async:false,
        success:function(d){
            alert('发布成功')
        },
        error:function(){
            var createPost= JSON.stringify($("#mPostForm").serializeObject());
            // 将json格式的数据存到缓存
           localStorage.setItem("createPost"+Date.now(),createPost);
            alert("存入便签成功");
           window.location.href='/m/postPosts';
            // }
           }
    });
}
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