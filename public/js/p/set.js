$(function(){
  $("#img").change(function() {
    var files, reader;
    files = !!this.files ? this.files : [];
    if (/^image/.test(files[0].type)) {
      reader = new FileReader();
      reader.readAsDataURL(files[0]);
      return reader.onloadend = function() {
        $(".ulogo").html('<img src="'+ this.result +'" alt="" />');
      };
    }
  });
  $("#setForm1").validator({
    stopOnError: false,
    timely: true,
    rules: {
      double: [/^(\d+\.\d+)|\d+$/, "请输入整数或小数"],
      image: function(element, params) {
        var files;
        files = !!element.files ? element.files : [];
        return /^image/.test(files[0].type);
      }
    },
    fields: {
      "uname": {
        rule: "required;length[~10];",
        tip: "十个字以内"
      },
      "introduction": {
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
    e.preventDefault();
    formData = $("#setForm1").serialize();
    if ($("#setForm1").isValid()) {
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