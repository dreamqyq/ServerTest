btn.addEventListener('click',(e) => {
  let request = new XMLHttpRequest()
  request.open('post','/xxx')
  request.send()
  request.onreadystatechange = ()=>{
    if(request.readyState === 4){
      console.log('请求完成')
      if(request.status >= 200 && request.status < 400){
        console.log('请求成功')
        let string = request.responseText
        console.log(string)
        let obj = JSON.parse(string)
        console.log(obj.note.body)
        
      }else{
        console.log('请求失败')
      }
    }
  }
})
login.addEventListener('click',(e) => {
  window.location.href = '/login'
})
register.addEventListener('click',(e) => {
  window.location.href = '/register'
})
