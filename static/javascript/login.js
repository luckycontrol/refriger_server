let status = window.location.search.substr(1).split('=')[1];
if (status === 'false') {
    alert("관리자만 접속할 수 있습니다.");
    location.href = '/login';
}

window.addEventListener("load", () => {
    let login = document.getElementsByClassName("loginBtn");
    
    // 로그인 이벤트
    login[0].addEventListener("click", event => {
        loginEvent();
    });
});

function loginEvent() {
    let id = document.getElementById("email").value;
    let passwd = document.getElementById("password").value;

    if (id === "" || passwd === "") {
        alert("아이디 혹은 비밀번호를 입력해주세요.");
        return;
    }

    if (id.length < 4 || passwd.length < 4) {
        alert("아이디와 비밀번호 형식이 올바르지 않습니다.");
        return;
    } else {
        auth.signInWithEmailAndPassword(id, passwd).then(result => {
            // 로그인 성공
            location.href = '/login/nowLogin?id=' + uuidv4();
        }).catch(err => {
            // 로그인 실패
            console.log(err['code']);
            if (err['code'] === "auth/invalid-email") {
                alert("이메일 형식이 올바르지 않습니다.");
                return;
            }
            else if (err['code'] === "auth/user-not-found") {
                alert("존재하지 않는 계정입니다.");
                return;
            }
            else if (err['code'] === "auth/wrong-password") {
                alert("비밀번호가 올바르지 않습니다.");
                return;
            }
        });
    }
}

function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
}
