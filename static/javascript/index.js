let status = window.location.search.substr(1).split('=')[1];

if (status === 'false') {
    alert('관리자만 접속할 수 있습니다.');

    location.href="/";
}