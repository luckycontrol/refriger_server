let table = document.getElementById('PurchasedListTable');
let db = firebase.firestore();

db.collection('Delivered').onSnapshot((querySnapshot) => {
    querySnapshot.forEach((doc) => {
        console.log(doc.ref);
    });
})