let table = document.getElementById('PurchasedListTable');
let db = firebase.firestore();

let printDiv;
let initTable;

db.collection('Delivered').get().then(querySnapshot => {
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

                        let refund = document.createElement('Button');
                        refund.innerHTML = '환불';
                        refund.setAttribute('id', order.join('-'));
                        refund.addEventListener('click', (event) => {
                            refundOrder(event.target.id);
                        });
                        row.insertCell(4).appendChild(refund);
                    })
              })
        }
    });
});

/* 환불 함수 */
function refundOrder(id) {
    
    getOrderArrFromDelivered(id).then(orderArr => {
        let order = id.split('-');
        let orderEmail = order[1];
    
        for (let index=0; index<orderArr.length; index++) {
            if (orderArr[index] == id) {
                orderArr.splice(index, 1);
                break;
            }
        }

        if (orderArr.length > 0) {
            db.doc(`Delivered/${orderEmail}`).set({
                orderArr: orderArr
            }, { merge: true })
        } else {
            db.doc(`Delivered/${orderEmail}`).delete();
        }

        removeDeliveredFood(id);

    }).then(setTimeout(() => window.location.reload(), 1500));
}

function removeDeliveredFood(id) {
    let order = id.split('-');
    let orderId = order[0];
    let orderEmail = order[1];

    db.doc(`Delivered/${orderEmail}/${orderId}/Food`).delete();
    db.doc(`Delivered/${orderEmail}/${orderId}/orderInfo`).delete();
}

async function getOrderArrFromDelivered(id) {
    let order = id.split('-');
    let orderEmail = order[1];

    let _orderArr = new Promise((resolve, reject) => {
        db.doc(`Delivered/${orderEmail}`)
          .get()
          .then(doc => {
              if (doc.exists) {
                resolve(doc.data()['orderArr']);
              } else {
                resolve('none');
              }
          })
    })

    return await _orderArr;
}