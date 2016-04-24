var sys = require("sys"),
	http = require("http"),
	url = require("url"),
	path = require("path"),
	fs = require("fs");
http.createServer(function(request, response) {
	var uri = url.parse(request.url).pathname;//request里有url，根据url和当前文件夹地址组成一个filename
	var filename = path.join(process.cwd(), uri);//process.cwd()文件服务器当前文件夹，即文件地址
	path.exists(filename, function(exists) {
		if(exists) {
			f = fs.createReadStream(filename);
			f.addListener('open', function() {
				response.writeHead(200);
			});
			f.addListener('data', function(chunk) {
				response.write(chunk);
					setTimeout(function() {
						f.resume()
					}, 100);
			});
			f.addListener('error', function(err) {
					response.writeHead(500, {"Content-Type":"text/plain"});
					response.write(err + "\n");
					response.end();
			});
			f.addListener('close', function() {
					response.end();
			});
		} else {
				response.writeHead(404);
				response.end();
		}
	});
}).listen(8080);
sys.log("Server running at http://localhost:8080/");