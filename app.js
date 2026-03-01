// Paste your Firebase config here later
const firebaseConfig = {
  apiKey: "YOUR_KEY",
  authDomain: "YOUR_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
};

const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

window.register = async function() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const userCredential = await auth.createUserWithEmailAndPassword(email, password);
  const user = userCredential.user;

  await db.collection("users").doc(user.uid).set({
    balance: 1000
  });

  alert("User registered with 1000 coins!");
}

window.login = async function() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const userCredential = await auth.signInWithEmailAndPassword(email, password);
  const user = userCredential.user;

  const docSnap = await db.collection("users").doc(user.uid).get();
  document.getElementById("balance").innerText =
    "Balance: " + docSnap.data().balance + " Coins";
}