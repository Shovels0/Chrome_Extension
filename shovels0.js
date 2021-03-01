function cook() {  //쿠키 차단 함수
    let btn = document.getElementById('third_cookie')
    btn.addEventListener('click',function(){
        localStorage.setItem("third_cookie",  btn.checked);	
        if(btn.checked){
          alert("제3자 쿠키 차단");
          chrome.privacy.websites.thirdPartyCookiesAllowed.get({}, function (details) {
            chrome.privacy.websites.thirdPartyCookiesAllowed.set({
                value: false
            });
        })
  
        }else{
            alert("제3자 쿠키 허용");
            chrome.privacy.websites.thirdPartyCookiesAllowed.get({}, function (details) {
                chrome.privacy.websites.thirdPartyCookiesAllowed.set({
                    value: true
                });
            })
        }
    })  
    let checked = JSON.parse(localStorage.getItem("third_cookie"));
    document.getElementById("third_cookie").checked = checked;
  }
  
  function pop() { //팝업 차단 함수
  
    const btn = document.getElementById('popup_block');
    btn.addEventListener('change',function (e) {
        localStorage.setItem("popup_block",  btn.checked);
        if(btn.checked){
            //팝업을 차단합니다.
            chrome.contentSettings.popups.set({
                primaryPattern: "<all_urls>",
                setting: 'block'
            }, function () {
                alert('팝업 차단합니다.');
            })
        }else{
            //팝업을 허용합니다.
            chrome.contentSettings.popups.set({
                primaryPattern: "<all_urls>",
                setting: 'allow'
            }, function () {
                alert('팝업을 허용합니다.');
            })
        }
    })
    let checked = JSON.parse(localStorage.getItem("popup_block"));
    document.getElementById("popup_block").checked = checked;
  }
  
  
  function script_check(){    //자바스크립트 차단 함수
    let btn = document.getElementById('js_block')
    btn.addEventListener('click',function(){
        localStorage.setItem("js_block", btn.checked);
        if(btn.checked){
          alert("자바스크립트를 차단합니다.");
          chrome.contentSettings['javascript'].set({
            primaryPattern: '<all_urls>',
            setting: 'block'
  
        });
  
        }else{
            alert("자바스크립트를 허용합니다.");
            chrome.contentSettings['javascript'].set({
              primaryPattern: '<all_urls>',
              setting: 'allow'
        });
        }
  
    })
    let checked = JSON.parse(localStorage.getItem("js_block"));
    document.getElementById("js_block").checked = checked;
  }
  
  
  /*document.addEventListener('change', function(e){
  if(e.target.parentNode.className.indexOf('checkboxControl') != -1){
  
  }
  });*/
  
  
  document.addEventListener('DOMContentLoaded', function () {
    
    cook();
    pop();
    script_check();
    
  })
  
  