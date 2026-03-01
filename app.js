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
// Matches (Admin can change odds here)
const matches = [
  { id: 1, name: "Team A vs Team B", odds: 2 }, 
  { id: 2, name: "Team C vs Team D", odds: 1.5 }
];

// -----------------------------
// Register user
window.register = async function() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  if (!email || !password) {
    alert("Please enter email and password");
    return;
  }

  try {
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    const user = userCredential.user;

    await db.collection("users").doc(user.uid).set({ coins: 0 });

    alert("User registered! Coins will be assigned by admin.");
    document.getElementById("balance").innerText = "Coins: 0";
  } catch (error) {
    alert("Error: " + error.message);
  }
}

// -----------------------------
// Login user
window.login = async function() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  if (!email || !password) {
    alert("Please enter email and password");
    return;
  }

  try {
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    const user = userCredential.user;

    const docSnap = await db.collection("users").doc(user.uid).get();
    const coins = docSnap.exists ? docSnap.data().coins : 0;

    document.getElementById("balance").innerText = "Coins: " + coins;

    // Show dashboard
    document.getElementById("dashboard").style.display = "block";

    // Load matches
    loadMatches(user.uid);
  } catch (error) {
    alert("Error: " + error.message);
  }
}

// -----------------------------
// Load Matches and Betting
function loadMatches(userId) {
  const container = document.getElementById("matches");
  container.innerHTML = "";

  matches.forEach(match => {
    const div = document.createElement("div");
    div.className = "match";
    div.innerHTML = `
      <h3>${match.name}</h3>
      <p>Odds: ${match.odds}x</p>
      <input type="number" id="bet-${match.id}" placeholder="Enter coins to bet">
      <button onclick="placeBet(${match.id}, '${userId}')">Place Bet</button>
    `;
    container.appendChild(div);
  });
}

// -----------------------------
// Place Bet Function
async function placeBet(matchId, userId) {
  const input = document.getElementById(`bet-${matchId}`);
  let betAmount = parseFloat(input.value);

  if (isNaN(betAmount) || betAmount <= 0) {
    alert("Enter a valid bet amount");
    return;
  }

  // Fetch current balance
  const userDoc = await db.collection("users").doc(userId).get();
  let coins = userDoc.data().coins;

  if (betAmount > coins) {
    alert("Not enough coins");
    return;
  }

  // For demo: Random outcome
  const match = matches.find(m => m.id === matchId);
  const win = Math.random() < 0.5; // 50% chance win

  if (win) {
    coins += betAmount * match.odds;
    alert(`You won! New balance: ${coins}`);
  } else {
    coins -= betAmount;
    alert(`You lost! New balance: ${coins}`);
  }

  // Update Firestore
  await db.collection("users").doc(userId).update({ coins });

  // Update balance on page
  document.getElementById("balance").innerText = "Coins: " + coins;
}

