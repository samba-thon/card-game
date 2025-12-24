// ============================================
// CARD CLASS
// ============================================
class Card {
  constructor(suit, value) {
    this.suit = suit;
    this.value = value;
    this.numValue = this.getNumValue();
  }

  getNumValue() {
    const valueMap = {
      2: 2,
      3: 3,
      4: 4,
      5: 5,
      6: 6,
      7: 7,
      8: 8,
      9: 9,
      10: 10,
      J: 11,
      Q: 12,
      K: 13,
      A: 14,
    };
    return valueMap[this.value];
  }
}

// ============================================
// DECK CLASS
// ============================================
class Deck {
  constructor() {
    this.cards = [];
    this.suits = ["♠", "♥", "♦", "♣"];
    this.values = [
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "10",
      "J",
      "Q",
      "K",
      "A",
    ];
    this.createDeck();
    this.shuffle();
  }

  createDeck() {
    for (let suit of this.suits) {
      for (let value of this.values) {
        this.cards.push(new Card(suit, value));
      }
    }
  }

  shuffle() {
    // Fisher-Yates shuffle algorithm
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
  }

  drawCard() {
    return this.cards.shift();
  }

  addCards(cards) {
    this.cards.push(...cards);
  }

  cardsRemaining() {
    return this.cards.length;
  }
}

// ============================================
// GAME CLASS
// ============================================
class Game {
  constructor() {
    this.playerDeck = null;
    this.computerDeck = null;
    this.playerHand = [];
    this.computerHand = [];
    this.round = 0;
    this.gameOver = false;
    this.winner = null;
    this.initialize();
  }

  initialize() {
    // Create one shuffled deck and split between players
    const fullDeck = new Deck();

    this.playerDeck = new Deck();
    this.playerDeck.cards = fullDeck.cards.slice(0, 26);

    this.computerDeck = new Deck();
    this.computerDeck.cards = fullDeck.cards.slice(26, 52);

    this.playerHand = [];
    this.computerHand = [];
    this.round = 0;
    this.gameOver = false;
    this.winner = null;
  }

  reset() {
    this.initialize();
  }
}

// ============================================
// GAME LOGIC FUNCTIONS
// ============================================

// Compare two cards and return winner (1 = player, 2 = computer, 0 = tie)
function compareCards(playerCard, computerCard) {
  if (playerCard.numValue > computerCard.numValue) {
    return 1;
  } else if (computerCard.numValue > playerCard.numValue) {
    return 2;
  } else {
    return 0; // Tie - War!
  }
}

// War resolution - each side draws 3 face-down cards + 1 face-up
function resolveWar(playerCards, computerCards) {
  // Check if both players have enough cards for war
  if (
    game.playerDeck.cardsRemaining() < 4 ||
    game.computerDeck.cardsRemaining() < 4
  ) {
    return null; // Not enough cards for war, game ends
  }

  // Each draws 3 face-down cards
  for (let i = 0; i < 3; i++) {
    playerCards.push(game.playerDeck.drawCard());
    computerCards.push(game.computerDeck.drawCard());
  }

  // Each draws 1 face-up card
  const playerWarCard = game.playerDeck.drawCard();
  const computerWarCard = game.computerDeck.drawCard();

  playerCards.push(playerWarCard);
  computerCards.push(computerWarCard);

  // Compare war cards
  const warResult = compareCards(playerWarCard, computerWarCard);

  return {
    result: warResult,
    playerCards: playerCards,
    computerCards: computerCards,
  };
}

// Check win condition
function checkWinCondition() {
  if (game.playerDeck.cardsRemaining() === 52) {
    return 1; // Player wins
  } else if (game.computerDeck.cardsRemaining() === 52) {
    return 2; // Computer wins
  } else if (game.playerDeck.cardsRemaining() === 0) {
    return 2; // Computer wins (player out of cards)
  } else if (game.computerDeck.cardsRemaining() === 0) {
    return 1; // Player wins (computer out of cards)
  }
  return null; // Game continues
}

// Play one round
function playRound() {
  if (game.gameOver) return null;

  let playerCards = [];
  let computerCards = [];
  let result = null;

  // Draw initial cards
  const playerCard = game.playerDeck.drawCard();
  const computerCard = game.computerDeck.drawCard();

  if (!playerCard || !computerCard) {
    // Not enough cards
    const winner = checkWinCondition();
    game.gameOver = true;
    game.winner = winner;
    return { status: "gameOver", winner: winner };
  }

  playerCards.push(playerCard);
  computerCards.push(computerCard);

  // Compare initial cards
  result = compareCards(playerCard, computerCard);

  // Handle tie (War)
  if (result === 0) {
    const warResult = resolveWar(playerCards, computerCards);
    if (warResult === null) {
      // Not enough cards for war
      const winner = checkWinCondition();
      game.gameOver = true;
      game.winner = winner;
      return { status: "gameOver", winner: winner };
    }
    result = warResult.result;
    playerCards = warResult.playerCards;
    computerCards = warResult.computerCards;
  }

  // Award cards to winner
  if (result === 1) {
    game.playerDeck.addCards(playerCards);
    game.playerDeck.addCards(computerCards);
  } else if (result === 2) {
    game.computerDeck.addCards(playerCards);
    game.computerDeck.addCards(computerCards);
  }

  game.round++;

  // Check for win condition after round
  const winner = checkWinCondition();
  if (winner !== null) {
    game.gameOver = true;
    game.winner = winner;
    return {
      status: "gameOver",
      winner: winner,
      playerCard: playerCard,
      computerCard: computerCard,
      roundWinner: result,
    };
  }

  return {
    status: "continue",
    playerCard: playerCard,
    computerCard: computerCard,
    roundWinner: result,
    playerCardsRemaining: game.playerDeck.cardsRemaining(),
    computerCardsRemaining: game.computerDeck.cardsRemaining(),
  };
}

// ============================================
// UI RENDERING FUNCTIONS
// ============================================

// Create SVG card element
function createCardSVG(card, isBack = false) {
  if (isBack) {
    return `
      <svg width="120" height="170" viewBox="0 0 120 170" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="2" width="116" height="166" rx="10" ry="10"
              fill="white" stroke="black" stroke-width="2"/>
        <rect x="10" y="10" width="100" height="150" fill="none"
              stroke="black" stroke-width="2" stroke-dasharray="5,5"/>
        <text x="60" y="90" font-size="32" text-anchor="middle" 
              font-family="serif" fill="black">⚜</text>
      </svg>
    `;
  }

  // Determine suit color
  const suitColor =
    card.suit === "♥" || card.suit === "♦" ? "#E31E24" : "#000000";

  return `
    <svg width="120" height="170" viewBox="0 0 120 170" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="116" height="166" rx="10" ry="10"
            fill="white" stroke="black" stroke-width="2"/>
      <text x="12" y="28" font-size="22" font-family="serif" 
            fill="${suitColor}">${card.value}</text>
      <text x="60" y="95" font-size="48" text-anchor="middle" 
            font-family="serif" fill="${suitColor}">${card.suit}</text>
      <text x="108" y="152" font-size="22" font-family="serif" 
            fill="${suitColor}" transform="rotate(180 108 152)">${card.value}</text>
    </svg>
  `;
}

// Render card to DOM element
function renderCard(elementId, card, isBack = false) {
  const element = document.getElementById(elementId);
  if (element) {
    if (card) {
      element.innerHTML = createCardSVG(card, isBack);
      element.classList.remove("empty");
    } else {
      element.innerHTML = "";
      element.classList.add("empty");
    }
  }
}

// Update status message
function updateStatus(message) {
  const statusElement = document.getElementById('roundStatus');
  if (statusElement) {
    statusElement.innerHTML = `<p>${message}</p>`;
  }
}

// Update round info display
function updateRoundInfo() {
  const roundInfoEl = document.getElementById('roundInfo');
  if (roundInfoEl) {
    const totalCards = game.playerDeck.cardsRemaining() + game.computerDeck.cardsRemaining();
    roundInfoEl.textContent = `Round ${game.round} | Total Cards: ${totalCards}`;
  }
}

// Update game display
function updateDisplay(roundResult) {
  if (roundResult.status === "gameOver") {
    const winner =
      roundResult.winner === 1 ? "You WIN! 🎉" : "Computer WINS! 🤖";
    updateStatus(winner);
    disableDrawButton();
  } else {
    const roundWinner =
      roundResult.roundWinner === 1 ? "You win the round!" : "Computer wins!";
    updateStatus(roundWinner);
  }

  // Render cards
  if (roundResult.playerCard) {
    renderCard("playerPlayedCard", roundResult.playerCard);
  }
  if (roundResult.computerCard) {
    renderCard("computerPlayedCard", roundResult.computerCard);
  }

  // Update card counts
  updateCardCounts();
  updateRoundInfo();
}

// Disable draw button
function disableDrawButton() {
  const drawBtn = document.getElementById("drawBtn");
  if (drawBtn) {
    drawBtn.disabled = true;
  }
}

// Enable draw button
function enableDrawButton() {
  const drawBtn = document.getElementById("drawBtn");
  if (drawBtn) {
    drawBtn.disabled = false;
  }
}

// Clear played cards
function clearPlayedCards() {
  renderCard("playerPlayedCard", null);
  renderCard("computerPlayedCard", null);
}

// Update card counts display
function updateCardCounts() {
  const playerCountEl = document.getElementById("playerCount");
  const computerCountEl = document.getElementById("computerCount");

  if (playerCountEl) {
    playerCountEl.textContent = game.playerDeck.cardsRemaining();
  }
  if (computerCountEl) {
    computerCountEl.textContent = game.computerDeck.cardsRemaining();
  }
}

// Initialize UI
function initializeUI() {
  clearPlayedCards();
  updateCardCounts();
  updateRoundInfo();
  updateStatus('Click "Draw Card" to start!');
  enableDrawButton();
}

// ============================================
// EVENT HANDLERS
// ============================================

// Draw Card button handler
function handleDrawCard() {
  if (game.gameOver) return;

  const roundResult = playRound();

  if (roundResult) {
    // Add slight delay for visual effect
    setTimeout(() => {
      updateDisplay(roundResult);
    }, 300);
  }
}

// New Game button handler
function handleNewGame() {
  game.initialize();
  initializeUI();
}

// Reset button handler - clears played cards only
function handleReset() {
  clearPlayedCards();
  updateStatus('Click "Draw Card" to continue!');
  enableDrawButton();
}

// ============================================
// EVENT LISTENERS
// ============================================

document.addEventListener("DOMContentLoaded", function () {
  // Get button elements
  const drawBtn = document.getElementById("drawBtn");
  const newGameBtn = document.getElementById("newGameBtn");
  const resetBtn = document.getElementById("resetBtn");

  // Attach event listeners
  if (drawBtn) drawBtn.addEventListener("click", handleDrawCard);
  if (newGameBtn) newGameBtn.addEventListener("click", handleNewGame);
  if (resetBtn) resetBtn.addEventListener("click", handleReset);

  // Initialize UI on page load
  initializeUI();
});

// ============================================
// GAME INSTANCE
// ============================================
let game = new Game();
