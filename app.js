// -----------------------------
// Firebase configuration (v8 style)
// -----------------------------
const firebaseConfig = {
  apiKey: "AIzaSyCNJx1Mmyllt6W2nK85avRiyOjNPJd5aB8",
  authDomain: "virtual-betting-833.firebaseapp.com",
  projectId: "virtual-betting-833",
  storageBucket: "virtual-betting-833.firebasestorage.app",
  messagingSenderId: "495724554372",
  appId: "1:495724554372:web:362d7254dfad07df607ad1",
  measurementId: "G-35CPSG4BWD"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// -----------------------------
// Register user (NO coins given automatically)
// -----------------------------
window.register = async function() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    const user = userCredential.user;

    // Create user in Firestore with 0 coins
    await db.collection("users").doc(user.uid).set({
      coins: 0
    });

    alert("User registered successfully! Coins will be assigned by admin.");
  } catch (error) {
    alert("Error: " + error.message);
  }
}

// -----------------------------
// Login user
// -----------------------------
window.login = async function() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    const user = userCredential.user;

    // Fetch coins from Firestore
    const docSnap = await db.collection("users").doc(user.uid).get();
    const coins = docSnap.data().coins;

    document.getElementById("balance").innerText = "Coins: " + coins;
  } catch (error) {
    alert("Error: " + error.message);
  }
}

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

