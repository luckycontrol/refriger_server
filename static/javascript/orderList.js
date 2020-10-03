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

            let foodNames;
            let foodCounts;

            db.doc(`Purchase/${orderEmail}/${orderId}/Food`)
              .get()
              .then((doc) => {
                foodNames = doc.data()['foodNames'];
                foodCounts = doc.data()['foodCounts'];
              })
              .then(() => {
                  console.log(foodNames);
              })
        }
    });
});

async function getFood(orderId, orderEmail) {
    await db.doc(`Purchase/${orderEmail}/${orderId}/Food`)
        .get()
        .then(doc => {
            let foodArr = []

            foodArr.push(doc.data()['foodNames']);
            foodArr.push(doc.data()['foodCounts']);
            foodArr.push(doc.data()['foodCategory']);

            return foodArr;
        });
}

function test(id) {
    let id_split = id.split('-');
    let email = id_split[1];
    let orderCount = id_split[0];

    db.collection('Purchase').doc(email)
      .get()
      .then(doc => {
          let orderArr = doc.data()['orderArr'];
          console.log(orderArr.length);

          for (let index=0; index<orderArr.length; index++) {
              if (orderArr[index] === id_split.join('-')) {
                  orderArr.splice(index, 1);
                  console.log(orderArr.length);
              }
          }
      })
}

/* 배송준비완료 함수 */
function orderIsReady(id) {

    /* id: 번호 - 이메일 */
    let id_split = id.split('-');
    let email = id_split[1];
    let orderCount = id_split[0];

    let name;
    let hp;
    let address;
    
    let foodNames;
    let foodCategory;
    let foodCounts;

    /* 선택한 주문의 데이터를 가져온다. */
    db.collection('Purchase').doc(email)
      .collection(orderCount).doc('Food')
      .get()
      .then(doc => {
          /* 음식이름, 갯수, 카테고리를 Delivered에 넣는다. */
          foodNames = doc.data()['foodNames'];
          foodCounts = doc.data()['foodCounts'];
          foodCategory = doc.data()['foodCategory'];

          let orderArr;

          /* orderArr을 구해서 Delivered에 넣습니다. */
          db.collection('Delivered').doc(email)
            .get()
            .then(doc => {
                /* Delivered에 사용자 이메일이 있다면, */
                if (doc.exists) {
                    console.log('있다.');
                    db.collection('Delivered').doc(email)
                      .get()
                      .then(doc => {
                          orderArr = doc.data()['orderArr'];
                        
                          /* 선택한 주문을 Delivered의 orderArr에 추가합니다. */
                          orderArr.push(id_split.join('-'));
                      })
                      .then(() => {
                          db.collection('Delivered').doc(email)
                            .set({
                                orderArr: orderArr
                            });
                      });
                } else {
                /* 이메일이 없다면 orderArr을 그냥 넣습니다. */
                    db.collection('Delivered').doc(email)
                      .set({
                          orderArr: id_split.join('-')
                      });
                }
            })

          /* 선택한 주문을 Delivered의 Food에 넣습니다. */
          db.collection('Delivered').doc(email)
          .collection(orderCount).doc('Food')
          .set({
              foodNames: foodNames,
              foodCounts: foodCounts,
              foodCategory: foodCategory
          });   
      })
      .then(() => {
          /* 주문자이름, hp, address를 가져오고 Delivered의 orderInfo에 넣는다. */
          db.collection('Purchase').doc(email)
            .collection(orderCount).doc('orderInfo')
            .get()
            .then(doc => {
                name = doc.data()['name'];
                hp = doc.data()['hp'];
                address = doc.data()['address'];

                db.collection('Delivered').doc(email)
                  .collection(orderCount).doc('orderInfo')
                  .set({
                      'name': name,
                      'hp': hp,
                      'address': address
                  });
            });
      })
      .then(() => {
          let orderArr;

          /* Purchase 에서 orderArr을 가져오고 수정해서 넣는다.*/
          db.collection('Purchase').doc(email)
            .get()
            .then(doc => {
                orderArr = doc.data()['orderArr'];
                
                for (let index=0; index<orderArr.length; index++) {
                    if (orderArr[index] === id_split.join('-')) {
                        orderArr.splice(index, 1);
                    }
                }
            })
            .then(() => {
                db.collection('Purchase').doc(email)
                  .set({
                      orderArr: orderArr
                  });
            });

          /* Purchase에서 선택한 주문을 지운다. */
          db.collection('Purchase').doc(email)
            .collection(orderCount)
            .get()
            .then(querySnapshot => {
                querySnapshot.docs[0].ref.delete();
                querySnapshot.docs[1].ref.delete();
            });
      });
}

/* 환불 함수 */
function refundOrder(id) {
    let id_split = id.split('-');
    let email = id_split[0];
    let orderCount = id_split[1];

    
}