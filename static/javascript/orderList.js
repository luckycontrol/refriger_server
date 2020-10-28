let table = document.getElementById('orderListTable')
let db = firebase.firestore();

setOrderList();

function setOrderList() {
    db.collection('Purchase').get().then(query => {
        query.forEach(doc => {
            let orderArr = [];
            orderArr = doc.data()['orderArr'];
    
            for(let index=0; index<orderArr.length; index++) {

            retrnFood(orderArr[index]).then(data => {
                insertTableRow(orderArr[index], data[0], data[1]);
            });
        }});
    });
}

async function retrnOrderArr() {

    let result = [];

    let promise = new Promise((resolve, reject) => {
        db.collection('Purchase').onSnapshot(querySnapshot => {
            result = [];
            querySnapshot.forEach(doc => {
                result.push(doc.data()['orderArr']);
            });

            resolve(true);
      });
    })

    if (await promise) {

        for (let index=0; index<result.length; index++) {
            if (result[index].length < 1) {
                result.splice(index, 1);
            }
        }

        return result;
    }
}

// Purchase에서 Food 반환
async function retrnFood(id) {
    let order = id.split('-');
    let orderId = order[0];
    let orderEmail = order[1];

    let food = new Promise((resolve, reject) => {
        db.doc(`Purchase/${orderEmail}/${orderId}/Food`)
          .get()
          .then(doc => {
              let foodNames = []
              foodNames = doc.data()['foodNames'];
              let foodCounts = []
              foodCounts = doc.data()['foodCounts'];
              let foodCategory = []
              foodCategory = doc.data()['foodCategory'];

              resolve({
                  'foodNames': foodNames,
                  'foodCounts': foodCounts,
                  'foodCategory': foodCategory
              });
          });
    });

    let orderInfo = new Promise((resolve, reject) => {
        db.doc(`Purchase/${orderEmail}/${orderId}/orderInfo`)
          .get()
          .then(doc => {
              let address = doc.data()['address'];
              let hp = doc.data()['hp'];
              let name = doc.data()['name'];

              resolve({
                  'address': address,
                  'hp': hp,
                  'name': name
              });
          });
    });

    let foodData = await food;
    let orderInfoData = await orderInfo;

    return [foodData, orderInfoData];
}

// 테이블에 값들 넣어주기
function insertTableRow(id, foodData, userData) {

    let row = table.insertRow(1);
    row.insertCell(0).innerHTML = userData['name'];
    row.insertCell(1).innerHTML = userData['hp'];
    row.insertCell(2).innerHTML = userData['address'];
    row.insertCell(3).innerHTML = foodData['foodNames'].join('<br>');
    
    let qrCell = document.createElement('div');
    qrCell.setAttribute('id', id);
    row.insertCell(4).appendChild(qrCell);
    makeQRCode(id);

    let ready = document.createElement('button');
    ready.innerHTML = "배송준비완료";
    ready.setAttribute('id', id);
    ready.addEventListener('click', event => {
        orderIsReady(event.target.id);
    });
    row.insertCell(5).appendChild(ready);

    let refund = document.createElement('button');
    refund.innerHTML = "환불";
    refund.setAttribute('id', id);
    refund.addEventListener('click', event => {
        refundOrder(event.target.id);
    });
    row.insertCell(6).appendChild(refund);
}

/* Delivered에 주문 넣기 */
function setDelivered(id, foodData, orderData) {
    let order = id.split('-');
    let orderId = order[0];
    let orderEmail = order[1];

    db.doc(`Delivered/${orderEmail}/${orderId}/Food`).set({
        foodNames: foodData['foodNames'],
        foodCounts: foodData['foodCounts'],
        foodCategory: foodData['foodCategory']
        }, { merge: true }
    );

    db.doc(`Delivered/${orderEmail}/${orderId}/orderInfo`)
      .set({
          address: orderData['address'],
          hp: orderData['hp'],
          name: orderData['name']
    }, { merge: true });
}

/* 배송준비완료 함수 */
function orderIsReady(id) {
    let order = id.split('-');
    let orderId = order[0];
    let orderEmail = order[1];

    retrnFood(id).then(data => {
        let foodData = data[0];
        let orderData = data[1];

        setDelivered(id, foodData, orderData)
    }).then(() => {
        db.doc(`Purchase/${orderEmail}/${orderId}/Food`).delete();
        db.doc(`Purchase/${orderEmail}/${orderId}/orderInfo`).delete();

        getOrderArrFromPurchase(id).then(orderArr => {
            let order = id.split('-');
            let orderId = order[0];
            let orderEmail = order[1];

            for(let index=0; index<orderArr.length; index++) {
                if(orderArr[index] == order.join('-')) {
                    orderArr.splice(index, 1);
                    break;
                }
            }

            db.doc(`Purchase/${orderEmail}`).set({
                orderArr: orderArr
            }, { merge: true });
        });

        getOrderArrFromDelivered(id).then(orderArr => {
            let order = id.split('-');
            let orderId = order[0];
            let orderEmail = order[1];
    
            if (orderArr === 'none') {
                db.doc(`Delivered/${orderEmail}`).set({
                    orderArr: [id]
                }, { merge: true });
            } else {
                orderArr.push(id);
                db.doc(`Delivered/${orderEmail}`).set({
                    orderArr: orderArr
                }, { merge: true });
            }
        });
    }).then(setTimeout(() => printQRCode(id), 1500));
}

/* 환불 함수 */
function refundOrder(id) {

    getOrderArrFromPurchase(id).then(orderArr => {
        let order = id.split('-');
        let orderId = order[0];
        let orderEmail = order[1];

        for(let index=0; index<orderArr.length; index++) {
            if(orderArr[index] == order.join('-')) {
                orderArr.splice(index, 1);
                break;
            }
        }

        db.doc(`Purchase/${orderEmail}`)
        .set({
            orderArr: orderArr
        }, { merge: true });
    }).then(setTimeout(() => window.location.reload(), 1500));
}

/* orderArr 가져오기 */
async function getOrderArrFromPurchase(id) {
    let order = id.split('-');
    let orderEmail = order[1];

    let _orderArr = new Promise((resolve, reject) => {
        db.doc(`Purchase/${orderEmail}`)
          .get()
          .then(doc => {
              resolve(doc.data()['orderArr']);
          })
    })

    return await _orderArr;
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

function printQRCode(id) {
    initTable = document.body.innerHTML;

    document.body.innerHTML = ""
    document.write("<div id=print_qr_code>");
    document.write("</div>")
    makePrintQRCode(id);

    window.print();
    window.onafterprint = afterPrint();
}

function afterPrint() {
    document.body.innerHTML = initTable;
    window.location.reload();
}

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

function makePrintQRCode(id) {
    new QRCode("print_qr_code", {
        text: id,
        width: 128,
        height: 128,
        colorDark: '#120136',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.L
    });
}