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

const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// -----------------------------
// Admin Email
const ADMIN_EMAIL = "infoitz69@gmail.com"; // 

// -----------------------------
// Matches
let matches = [
  { id: 1, name: "Team A vs Team B", odds: 2 },
  { id: 2, name: "Team C vs Team D", odds: 1.5 },
  { id: 3, name: "Team E vs Team F", odds: 1.8 }
];

// -----------------------------
// Register
window.register = async function() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  if(!email || !password) { alert("Enter email & password"); return; }

  try {
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    const user = userCredential.user;
    await db.collection("users").doc(user.uid).set({ coins: 0, email });
    alert("Registered! Coins will be assigned by admin.");
    document.getElementById("balance").innerText = "Coins: 0";
  } catch (e) { alert("Error: "+e.message); }
}

// -----------------------------
// Login
window.login = async function() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  if(!email || !password) { alert("Enter email & password"); return; }

  try {
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    const user = userCredential.user;

    const docSnap = await db.collection("users").doc(user.uid).get();
    const coins = docSnap.exists ? docSnap.data().coins : 0;
    document.getElementById("balance").innerText = "Coins: " + coins;

    document.getElementById("dashboard").style.display = "block";

    loadMatches(user.uid);
    loadLeaderboard();

    if(email === ADMIN_EMAIL) loadAdminPanel();
  } catch (e) { alert("Error: "+e.message); }
}

// -----------------------------
// Load Matches
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
// Place Bet
async function placeBet(matchId, userId) {
  const input = document.getElementById(`bet-${matchId}`);
  const betAmount = parseFloat(input.value);
  if(isNaN(betAmount)||betAmount<=0){alert("Enter valid bet"); return;}

  const userDoc = await db.collection("users").doc(userId).get();
  let coins = userDoc.data().coins;
  if(betAmount>coins){alert("Not enough coins"); return;}

  const match = matches.find(m=>m.id===matchId);
  const win = Math.random()<0.5;
  coins += win? betAmount*match.odds : -betAmount;
  alert(win? `You won! New balance: ${coins}` : `You lost! New balance: ${coins}`);

  await db.collection("users").doc(userId).update({ coins });
  document.getElementById("balance").innerText = "Coins: "+coins;
  loadLeaderboard();
}

// -----------------------------
// Leaderboard
async function loadLeaderboard() {
  const container = document.getElementById("leaderboard");
  container.innerHTML = "<h3>Top Players:</h3>";
  const snapshot = await db.collection("users").orderBy("coins","desc").limit(5).get();
  snapshot.forEach(doc => {
    const user = doc.data();
    const div = document.createElement("div");
    div.textContent = `${user.email}: ${user.coins} coins`;
    container.appendChild(div);
  });
}

// -----------------------------
// Admin Panel
function loadAdminPanel() {
  const container = document.getElementById("admin");
  container.innerHTML = "<h3>Edit Matches and Odds (Admin)</h3>";
  matches.forEach((match,index)=>{
    const div = document.createElement("div");
    div.innerHTML = `
      <input type="text" id="match-name-${match.id}" value="${match.name}" placeholder="Match name">
      <input type="number" id="match-odds-${match.id}" value="${match.odds}" placeholder="Odds" step="0.1" min="1">
      <button onclick="updateMatch(${index}, ${match.id})">Update</button>
    `;
    container.appendChild(div);
  });
}

function updateMatch(index, matchId){
  const name = document.getElementById(`match-name-${matchId}`).value;
  const odds = parseFloat(document.getElementById(`match-odds-${matchId}`).value);
  if(!name||isNaN(odds)||odds<1){alert("Enter valid name & odds"); return;}
  matches[index].name=name;
  matches[index].odds=odds;
  alert("Match updated!");
  loadMatches(auth.currentUser.uid);
}



