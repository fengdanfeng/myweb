$(function(){

 $('#imgfile').on('change',function(){
        // 判断上传文件类型
        var objFile = $('#imgfile').val();
        var objType = objFile.substring(objFile.lastIndexOf(".")).toLowerCase();
        var formData = new FormData(document.forms.namedItem("picForm"));
        console.log(formData);
        if(!(objType == '.jpg'||objType == '.png'))
        {
            alert("请上传jpg、png类型图片");
            return false;
        }else{
          console.log('aaa');
            $.ajax({
                type : 'post',
                url : '/uploadUserLogo',
                data: formData , 
                processData:false,
                async:false,
                cache: false,  
                contentType: false, 
                success:function(re){
                    re.imgSrc = re.imgSrc.replace('public','');
                    re.imgSrc = re.imgSrc.replace(/\\/g,'\/');
                    $(".ulogo").html('<img src="'+ re.imgSrc +'"/><input type="text" style="display:none;" name="ulog" value="'+re.imgSrc+'"/>');
                },
                error:function(re){
                    console.log(re);
                }
            });    
        }
    });
$("#setForm1").validator({
    rules: {
      double: [/^(\d+\.\d+)|\d+$/, "请输入整数或小数"],
      image: function(element, params) {
        var files;
        files = !!element.files ? element.files : [];
        return /^image/.test(files[0].type);
      }
    },
    
    fields: {
      "username": {
        rule: 'required;length[~10];',
        tip: "十个字以内"
      },
      "userInfo": {
        rule: "required;length[~20];",
        tip: "二十个字以内"
      },
      "ulogo": {
        rule: "image;"
      }
    },

    valid:function(form){
        var formData;
        formData = $("#setForm1").serialize();
        $.post('/set',formData,function(d){
            if(d.code===0){
              alert("保存成功");
            }
            else{
              alert("提交失败");
            }
        })
       }
  });
$("#submit1").on('click', function(e) {
    var me = this;
    var formData1;
        formData1 = $("#setForm1").serialize();
     $('#setForm1').trigger('validator');
         $.ajax({
            url: "/setForm1",
            type: "POST",
            data: formData1,
            dataType: 'json',
            success: function(d){
              if (d.code===0){
                alert("保存成功");
                return location.reload();
                } else {
                  alert("提交失败")
                }
              }
        });
  })

  $("#submit2").on('click',function(e){
        var me = this;
        var formChangepwd = $("#formChangepwd").serialize();
        console.log(formChangepwd);
        $.ajax({
              url:"/changePwd",
              type:"post",
              data:formChangepwd,
              dataType:'json',
              success:function(d){
                if (d.code===0) {
                  alert("修改密码成功")
                }else{
                  alert('修改失败');
                }
              }
        })

  })


})
