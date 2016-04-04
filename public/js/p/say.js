$(function(){
    $('#pics').on('change',function(){
            // 判断上传文件类型
            var objFile = $('#pics').val();
            var objType = objFile.substring(objFile.lastIndexOf(".")).toLowerCase();
            var formData2 = new FormData(document.forms.namedItem("postForm"));
            console.log(formData2);
            if(!(objType == '.jpg'||objType == '.png'))
            {
                alert("请上传jpg、png类型图片");
                return false;
            }else{
              console.log('aaa');
                $.ajax({
                    type : 'post',
                    url : '/uploadUserImgPre',
                    data: formData2 , 
                    processData:false,
                    async:false,
                    cache: false,  
                    contentType: false, 
                    success:function(re){
                        re.imgSrc = re.imgSrc.replace('public','');
                        re.imgSrc = re.imgSrc.replace(/\\/g,'\/');
                        // $('.upload_input').hide();
                        $(".postImg").html('<img class="upload_item" src="'+ re.imgSrc +'"/><input type="text" style="display:none;" name="postImg" value="'+re.imgSrc+'"/>');

                    },
                    error:function(re){
                        console.log(re);
                    }
                });    
            }
    })

});
