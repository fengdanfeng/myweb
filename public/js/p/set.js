$(function(){
  $("#img").change(function() {
    var files, reader;
    files = !!this.files ? this.files : [];
    if (/^image/.test(files[0].type)) {
      reader = new FileReader();
      reader.readAsDataURL(files[0]);
      return reader.onloadend = function() {
        $(".ulogo").html('<img src="'+ this.result +'alt="" />');
      };
    }
  });
$("#setForm1").validator({
    stopOnError: false,
    timely: 1,
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
    }
  });
$("#submit1").on('click', function(e) {
    var me = this;
    var formData;
    formData = $("#setForm1").serialize();
    if($('#setForm1').isValid()){
    console.log(formData);
      return $.ajax({
          url: "/setForm1",
          type: "POST",
          data: formData,
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
    }
  });

})