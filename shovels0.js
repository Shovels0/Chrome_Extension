const form = document.getElementById("control-row");
const go = document.getElementById("go");
const input = document.getElementById("cookie_clear_input");
const message = document.getElementById("message");

// The async IIFE is necessary because Chrome <89 does not support top level await.
(async function initPopupWindow() {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.url) { //tab.url 현재 마지막으로 오픈한 창을 의미하는 듯.
    try {
      let url = new URL(tab.url); // Web API : 인자로 넘김url 객체 반환 (즉 let url 변수는 객체 타입)
      input.value = url.hostname; //앞에 프로토콜 제외, 포트, 파라미터 등등 제외한 호스트이름만 input.value에 넣음
    } catch {}
  }

  input.focus(); // focus 
})();



form.addEventListener("submit", handleFormSubmit);

async function handleFormSubmit(event) {
  event.preventDefault(); // 정의된 이벤트를 작동하지 못하게 하는 메소드???!!!
  // Invalid URL 메시지가 submit 해도 보이게 하기 위해서 존재함.
  clearMessage(); // input 메시지 지우는 역할.

  let url = stringToUrl(input.value);
  
  if (!url) { //url이 존재하지 않을 때! 즉, hidden값이 ture일 경우!!
    setMessage("Invalid URL"); 
    return;
  }

  let message = await deleteDomainCookies(url.hostname);
  setMessage(message);
}

function stringToUrl(input) { 
  // Start with treating the provided value as a URL
  try {
    return new URL(input);
  } catch {}
  // If that fails, try assuming the provided input is an HTTP host
  try {
    return new URL("http://" + input);
  } catch {}
  // If that fails ¯\_(ツ)_/¯
  return null;
}

async function deleteDomainCookies(domain) {
  let cookiesDeleted = 0;
  try {
    const cookies = await chrome.cookies.getAll({ domain }); // 해당 URL의 쿠키를 모두 가져온다. type은 "String"
    
    if (cookies.length === 0) { //쿠기가 존재하지 않으면 return함
      return "No cookies found";
    }

    let pending = cookies.map(deleteCookie);
    await Promise.all(pending);

    cookiesDeleted = pending.length;
  } catch (error) {
    return `Unexpected error: ${error.message}`;
  }

  return `Deleted ${cookiesDeleted} cookie(s).`;
}

function deleteCookie(cookie) { // 여기서부터시작

  // cookies 는 같은 hostname 을 가진 쿠키 객체의 배열이다.
  // map 메소드를 이용해서 첫번째 요소, 두번째 요소 순환하며 하나의 배열을 반환한다.
  // 이게 pending 이다.
  
  // Cookie deletion is largely modeled off of how deleting cookies works when using HTTP headers.
  // Specific flags on the cookie object like `secure` or `hostOnly` are not exposed for deletion
  // purposes. Instead, cookies are deleted by URL, name, and storeId. Unlike HTTP headers, though,
  // we don't have to delete cookies by setting Max-Age=0; we have a method for that ;)
  //
  // To remove cookies set with a Secure attribute, we must provide the correct protocol in the
  // details object's `url` property.

// 쿠키 삭제는 주로 HTTP 헤더를 사용할 때 쿠키 삭제가 작동하는 방식을 모델로 합니다.
// 쿠키 개체의 특정 플래그(예: 'secure' 또는 'hostOnly')는 삭제하기 위해 표시되지 않습니다.
// 목적. 대신, 쿠키는 URL, 이름 및 storeId로 삭제됩니다. 그러나 HTTP 헤더와는 달리
// Max-Age=0을 설정하여 쿠키를 삭제할 필요가 없습니다. 이 방법은 다음과 같습니다;)
//
// Secure 특성이 있는 쿠키 세트를 제거하려면 다음에서 올바른 프로토콜을 제공해야 합니다.
// 개체의 'url' 속성을 자세히 설명합니다.
// https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie#Secure

  const protocol = cookie.secure ? "https:" : "http:";  //쿠키에 secure속성이 있으면, https이고 아니면 http이다.
  
  // Note that the final URL may not be valid. The domain value for a standard cookie is prefixed
  // with a period (invalid) while cookies that are set to `cookie.hostOnly == true` do not have
  // this prefix (valid).

// 최종 URL이 올바르지 않을 수 있습니다. 표준 쿠키의 도메인 값이 접두사로 지정됩니다.
// 쿠키가 '쿠키'로 설정되어 있는 동안 주기(코너)가 있는 경우.호스트 전용 == true'에는 없음
// 이 접두사(유효함).
  // https://developer.chrome.com/docs/extensions/reference/cookies/#type-Cookie
  const cookieUrl = `${protocol}//${cookie.domain}${cookie.path}`;
                    // http://www.naver.com/login 같은 형식의 url을 cookieUrl에 넣어준다.
  return chrome.cookies.remove({
    url: cookieUrl,
    name: cookie.name,
    storeId: cookie.storeId,
  });
}

function setMessage(str) {
  message.textContent = str;
  message.hidden = false;
}

function clearMessage() {
  message.hidden = true;
  message.textContent = "";
}



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

