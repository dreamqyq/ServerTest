var http = require('http')
var fs = require('fs')
var url = require('url')
var port = process.argv[2]

if(!port){
  console.log('请指定端口号好不啦？\nnode server.js 8888 这样不会吗？')
  process.exit(1)
}

// var server = http.createServer(function(request, response){
//   var parsedUrl = url.parse(request.url, true)
//   var path = request.url
//   var query = ''
//   if(path.indexOf('?') >= 0){ query = path.substring(path.indexOf('?')) }
//   var pathNoQuery = parsedUrl.pathname
//   var queryObject = parsedUrl.query
//   var method = request.method

  var server = http.createServer(function(request, response){
  var parsedUrl = url.parse(request.url, true)
  var pathWithQuery = request.url
  var queryString = ''
  if(pathWithQuery.indexOf('?') >= 0){ queryString = pathWithQuery.substring(pathWithQuery.indexOf('?')) }
  var path = parsedUrl.pathname
  var query = parsedUrl.query
  var method = request.method

  /******** 从这里开始看，上面不要看 ************/
  console.log("HTTP 路径为"+path);
  if(path === '/'){
    var string = fs.readFileSync('./index.html','utf-8')
    /************ 关于cookie **************/
    let cookies = ''
    if(request.headers.cookie){
      cookies =  request.headers.cookie.split('; ') // ['email=1@', 'a=1', 'b=2']
    }
    let hash = {}
    for(let i =0;i<cookies.length; i++){
      let parts = cookies[i].split('=')
      let key = parts[0]
      let value = parts[1]
      hash[key] = value
    }
    let email = hash.login_email
    let users = fs.readFileSync('./database/users', 'utf8')
    users = JSON.parse(users)
    let foundUser
    for(let i=0; i< users.length; i++){
      if(users[i].email === email){
        foundUser = users[i]
        break
      }
    }
    if(foundUser){
      string = string.replace('__username__', foundUser.email)
    }else{
      string = string.replace('__username__', 'N/A')
    }
    /************ 关于cookie **************/
    response.setHeader('Content-Type','text/html;charset=utf-8')
    response.write(string)
    response.end()
  }else if(path === '/style.css'){
    var string = fs.readFileSync('./style.css','utf-8')
    response.setHeader('Content-Type','text/css;charset=utf-8')
    response.write(string)
    response.end()
  }else if(path === '/main.js'){
    var string = fs.readFileSync('./main.js','utf-8')
    response.setHeader('Content-Type','text/javascript;charset=utf-8')
    response.write(string)
    response.end()
  }else if(path === '/vendor/jquery-3.3.1.min.js'){
    var string = fs.readFileSync('./vendor/jquery-3.3.1.min.js','utf-8')
    response.setHeader('Content-Type','text/javascript;charset=utf-8')
    response.write(string)
    response.end()
  }else if(path === '/register' && method === 'GET'){
    var string = fs.readFileSync('./register.html','utf-8')
    response.statusCode = 200
    response.setHeader('Content-Type','text/html;charset=utf-8')
    response.write(string)
    response.end()
  }else if(path === '/register' && method === 'POST'){
    readBody(request).then((body)=>{
      let strings = body.split('&') // ['email=1', 'password=2', 'password_confirmation=3']
      let hash = {}
      strings.forEach((string)=>{
        // string == 'email=1'
        let parts = string.split('=') // ['email', '1']
        let key = parts[0]
        let value = parts[1]
        hash[key] = decodeURIComponent(value) // hash['email'] = '1'
      })
      let {email, password, repassword} = hash
      if(email.indexOf('@') === -1){
        response.statusCode = 400
        response.setHeader('Content-Type', 'application/json;charset=utf-8')
        response.write(`{
          "errors": {
            "email": "invalid"
          }
        }`)
      }else if(password !== repassword){
        response.statusCode = 400
        response.write('password not match')
      }else{
        var users = fs.readFileSync('./database/users', 'utf8')
        try{
          users = JSON.parse(users) // []
        }catch(exception){
          users = []
        }
        let inUse = false
        for(let i=0; i<users.length; i++){
          let user = users[i]
          if(user.email === email){
            inUse = true
            break;
          }
        }
        if(inUse){
          response.statusCode = 400
          response.write('email in use')
        }else{
          users.push({email: email, password: password})
          var usersString = JSON.stringify(users)
          fs.writeFileSync('./database/users', usersString)
          response.statusCode = 200
        }
      }
      response.end()
    })
  }else if(path ==='/xxx'){
    response.setHeader('Content-Type','text/json;charset=utf-8')
    response.setHeader('Access-Control-Allow-Origin','http://enoch.com:8001')
    response.write(`
      {
        "note":{
          "to":"Enoch",
          "from":"Snow",
          "heading":"Say Hi",
          "body":"Hello Wrold"
        }
      }
    `)
    response.end()
  }else if(path === '/login' && method === 'GET'){
    var string = fs.readFileSync('./login.html','utf-8')
    response.statusCode = 200
    response.setHeader('Content-Type','text/html;charset=utf-8')
    response.write(string)
    response.end()
  }else if(path === '/login' && method === 'POST'){
     readBody(request).then((body)=>{
      let strings = body.split('&') // ['email=1', 'password=2']
      let hash = {}
      strings.forEach((string)=>{
        // string == 'email=1'
        let parts = string.split('=') // ['email', '1']
        let key = parts[0]
        let value = parts[1]
        hash[key] = decodeURIComponent(value) // hash['email'] = '1'
      })
      let {email, password} = hash
      var users = fs.readFileSync('./database/users', 'utf8')
      try{
        users = JSON.parse(users) // []
      }catch(exception){
        users = []
      }
      let found
      for(let i=0;i<users.length; i++){
        if(users[i].email === email && users[i].password === password){
          found = true
          break
        }
      }
      if(found){
        response.setHeader('Set-Cookie', `login_email=${email}`)
        response.statusCode = 200
        response.write('success')
      }else{
        response.statusCode = 401
        response.setHeader('Content-Type', 'application/json;charset=utf-8')
        response.write(`{
          "errors": "fail"
        }`)
      }
      response.end()
    })
  }else if(path === '/favicon.ico'){
    response.setHeader('Content-Type','text/text;charset=utf-8')
    response.write('哈哈哈，我是假的')
    response.end()
  }else{
    response.setHeader('Content-Type','text/html;charset=utf-8')
    response.statusCode = 404
    response.write('呜呜呜')
    response.end()
  }
  


 /******** 代码结束，下面不要看 ************/
})
function readBody(request){
  return new Promise((resolve, reject)=>{
    let body = []
    request.on('data', (chunk) => {
      body.push(chunk);
    }).on('end', () => {
      body = Buffer.concat(body).toString();
      resolve(body)
    })
  })
}
server.listen(port)
console.log('监听 ' + port + ' 成功\n请用在空中转体720度然后用电饭煲打开 http://localhost:' + port)
