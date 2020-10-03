let table = document.getElementById('PurchasedListTable');
let db = firebase.firestore();

db.collection('Delivered').onSnapshot((querySnapshot) => {
    /* 이메일들 ForEach */
    querySnapshot.forEach(doc => {
        /* 한 주문자가 주문한 여러 주문들 */
        let orderArr = doc.data()['orderArr']

        /* 주문: 번호 - 이메일 형식 */
        for (let index=0; index<orderArr.length; index++) {
            let order = orderArr[index].split('-');
            let orderId = order[0];
            let orderEmail = order[1];

            let foodNames, foodCounts;
            let foodTextArr = [];

            let name, hp, address;

            db.doc(`Delivered/${orderEmail}/${orderId}/Food`)
              .get()
              .then((doc) => {
                /* 식료품이름과 갯수 - 주문정보 */
                foodNames = doc.data()['foodNames'];
                foodCounts = doc.data()['foodCounts'];

                for (let i=0; i<foodNames.length; i++) {
                    foodTextArr.push(`${foodNames[i]}-${foodCounts[i]}`);
                }
              })
              .then(() => {
                  db.doc(`Delivered/${orderEmail}/${orderId}/orderInfo`)
                    .get()
                    .then((doc) => {
                        /* 이름, hp, address - 주문자정보 */
                        name = doc.data()['name'];
                        hp = doc.data()['hp'];
                        address = doc.data()['address'];
                    })
                    .then(() => {
                        let row = table.insertRow(1);
                        row.insertCell(0).innerHTML = name;
                        row.insertCell(1).innerHTML = hp;
                        row.insertCell(2).innerHTML = address;
                        row.insertCell(3).innerHTML = foodTextArr.join('<br>');

                        let qrCell = document.createElement('div');
                        qrCell.setAttribute('id', order.join('-'));
                        row.insertCell(4).appendChild(qrCell);
                        makeQRCode(order.join('-'));


                        let refund = document.createElement('Button');
                        refund.innerHTML = '환불';
                        refund.setAttribute('id', order.join('-'));
                        refund.addEventListener('click', (event) => {
                            refundOrder(event.target.id);
                        });
                        row.insertCell(5).appendChild(refund);
                    })
              })
        }
    });
});

function makeQRCode(id) {
    new QRCode(id, {
        text: id,
        width: 128,
        height: 128,
        colorDark: '#120136',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.L
    });
}

/* 환불 함수 */
function refundOrder(id) {
    let order = id.split('-');
    let orderId = order[0];
    let orderEmail = order[1];

    // 선택한 주문을 Purchase에서 지운다.
    // Purchase에서 orderArr을 가져오고 선택한 주문을 지운 후 다시 넣는다.
    db.doc(`Delivered/${orderEmail}/${orderId}/Food`).delete();
    db.doc(`Delivered/${orderEmail}/${orderId}/orderInfo`).delete();

    db.doc(`Delivered/${orderEmail}`)
      .get()
      .then(doc => {
          let orderArr = doc.data()['orderArr'];

          for (let index=0; index<orderArr.length; index++) {
              if (orderArr[index] === order.join('-')) {
                  orderArr.splice(index, 1);
                  break;
              }
          }

          if (orderArr.length === 0) {
            db.doc(`Delivered/${orderEmail}`).delete();
          } else {
            db.doc(`Delivered/${orderEmail}`)
            .set({
                orderArr: orderArr
            }, { merge: true })
          }
      })
}