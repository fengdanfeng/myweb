$(function(){
	 $('#imgfile').on('change',function(){
        // 判断上传文件类型
        var objFile = $('#imgfile').val();
        var objType = objFile.substring(objFile.lastIndexOf(".")).toLowerCase();
        var formData = new FormData();
             formData.append('imgfile',document.getElementById("imgfile").files[0]);
        if(!(objType == '.jpg'||objType == '.png'))
        {
            alert("请上传jpg、png类型图片");
            return false;
        }else{
            $.ajax({
                type : 'post',
                url : '/uploadUserImgPre',
                data: formData ,
                processData:false,
                async:false,
                contentType: false,
                success:function(re){
                    re.imgSrc = re.imgSrc.replace('public','');
                    re.imgSrc = re.imgSrc.replace(/\\/g,'\/');
                    $('#imgPic').attr('src',re.imgSrc);
                },
                error:function(re){
                    console.log(re);
                }
            });    
        }
    });
});
