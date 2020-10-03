let table = document.getElementById('orderListTable')
let db = firebase.firestore();

db.collection('Purchase').onSnapshot((querySnapshot) => {
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

            db.doc(`Purchase/${orderEmail}/${orderId}/Food`)
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
                  db.doc(`Purchase/${orderEmail}/${orderId}/orderInfo`)
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

                        let ready = document.createElement('Button');
                        ready.innerHTML = '배송준비완료';
                        ready.setAttribute('id', order.join('-'));
                        ready.addEventListener('click', (event) => {
                            orderIsReady(event.target.id);
                        });
                        row.insertCell(4).appendChild(ready);

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

function test(id, callback) {
    let order = id.split('-');
    let orderId = order[0];
    let orderEmail = order[1];

    console.log(testCallback(orderId, orderEmail));
}

/* 배송준비완료 함수 */
function orderIsReady(id) {
    // id를 번호 - 이메일 로 나눈다.
    let order = id.split('-');
    let orderId = order[0];
    let orderEmail = order[1];

    // Purchase에서 Food, orderInfo, orderArr를 가져온다.
    let foodNames, foodCounts, foodCategory;
    let name, hp, address;

    db.doc(`Purchase/${orderEmail}/${orderId}/Food`)
      .get()
      .then((doc) => {
        foodNames = doc.data()['foodNames'];
        foodCounts = doc.data()['foodCounts'];
        foodCategory = doc.data()['foodCategory'];

        db.doc(`Purchase/${orderEmail}/${orderId}/Food`).delete();
      })
      .then(() => {
        db.doc(`Purchase/${orderEmail}/${orderId}/orderInfo`)
          .get()
          .then((doc) => {
              name = doc.data()['name'];
              hp = doc.data()['hp'];
              address = doc.data()['address'];

              db.doc(`Purchase/${orderEmail}/${orderId}/orderInfo`).delete();
          })
          .then(() => {
              db.collection('Delivered').doc(orderEmail)
                .get()
                .then(doc => {
                    // Delivered에 이메일이 있는지 확인
                    // 이메일이 있으면 orderArr을 가져온 후 선택한 주문을 넣고, Food, orderInfo를 넣는다.
                    if (doc.exists) {
                        db.doc(`Delivered/${orderEmail}`)
                          .get()
                          .then(doc => {
                              let orderArr = doc.data()['orderArr'];
                              orderArr.push(order.join('-'));

                              db.doc(`Delivered/${orderEmail}/${orderId}/Food`)
                                .set({
                                    foodNames: foodNames,
                                    foodCounts: foodCounts,
                                    foodCategory: foodCategory
                                });
                            
                              db.doc(`Delivered/${orderEmail}/${orderId}/orderInfo`)
                                .set({
                                    name: name,
                                    hp: hp,
                                    address: address
                                });

                              db.doc(`Delivered/${orderEmail}`)
                                .set({
                                    orderArr: orderArr
                                });
                          })
                    } else {
                        let orderArr = []
                        orderArr.push(order.join('-'));

                        db.doc(`Delivered/${orderEmail}/${orderId}/Food`)
                          .set({
                                foodNames: foodNames,
                                foodCounts: foodCounts,
                                foodCategory: foodCategory
                          });
                            
                        db.doc(`Delivered/${orderEmail}/${orderId}/orderInfo`)
                          .set({
                                name: name,
                                hp: hp,
                                address: address
                          });

                        db.doc(`Delivered/${orderEmail}`)
                          .set({
                                orderArr: orderArr
                          }, { merge: true });
                    }
                })
          })
          .then(() => {
              let orderArr = []
    
              db.doc(`Purchase/${orderEmail}`)
                .get()
                .then(doc => {
                    orderArr = doc.data()['orderArr'];
                    for (let index=0; index<orderArr.length; index++) {
                        if (orderArr[index] === order.join('-')) {
                            orderArr.splice(index, 1);
                            break;
                        }
                    }
                })
                .then(() => {
                    db.doc(`Purchase/${orderEmail}`)
                      .set({
                          orderArr: orderArr
                      }, { merge: true});
                });
          });
       });
}

/* 환불 함수 */
function refundOrder(id) {
    let order = id.split('-');
    let orderId = order[0];
    let orderEmail = order[1];

    // 선택한 주문을 Purchase에서 지운다.
    // Purchase에서 orderArr을 가져오고 선택한 주문을 지운 후 다시 넣는다.
    db.doc(`Purchase/${orderEmail}/${orderId}/Food`).delete();
    db.doc(`Purchase/${orderEmail}/${orderId}/orderInfo`).delete();

    db.doc(`Purchase/${orderEmail}`)
      .get()
      .then(doc => {
          let orderArr = doc.data()['orderArr'];

          for (let index=0; index<orderArr.length; index++) {
              if (orderArr[index] === order.join('-')) {
                  orderArr.splice(index, 1);
                  break;
              }
          }

          db.doc(`Purchase/${orderEmail}`)
            .set({
                orderArr: orderArr
            }, { merge: true })
      })
}