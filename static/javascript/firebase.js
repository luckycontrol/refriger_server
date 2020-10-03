const firebaseApp = firebase.initializeApp({
    apiKey: "AIzaSyBRs_V38h0ywkPL1Lp9meB7Go-KXyrxFBY",
    authDomain: "refriger-management-project.firebaseapp.com",
    databaseURL: "https://refriger-management-project.firebaseio.com",
    projectId: "refriger-management-project",
    storageBucket: "refriger-management-project.appspot.com",
    messagingSenderId: "314572240368",
    appId: "1:314572240368:web:61a6602c44e2e2706c5935",
    measurementId: "G-9J5QBZKTVZ"
});

const db = firebaseApp.firestore();
const auth = firebaseApp.auth();
const storage = firebaseApp.storage();