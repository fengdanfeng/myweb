window.onload = function(){
	//遍历后收藏游记
	// var collections = document.getElementsByClassName('collections');
	$('.collections').on('click', function(){
			var me = this;
			var data =  this.getAttribute('data-value');
			if (me.innerHTML !="取消收藏") {
			 $.post(
			 	'/collections',
			 	{data: data},
			 	function(d){
			 		if(d.code ==0){
			 			alert('收藏成功');
			 			me.innerHTML = "取消收藏";
			 		}
			 	}
			 );
			}else{
				console.log(data);
				 $.post(
				 	'/withOutCollections',
				 	{data: data},
				 	 function(d){
				 		if(d.code ==0){
				 			alert('取消收藏成功');
				 			me.innerHTML = "收藏";
				 		}
				 	}
				 );
			}
		});
	}