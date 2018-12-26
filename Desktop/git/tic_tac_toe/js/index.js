var cells = document.getElementsByClassName('grid-item');

const Display = {
  messages: {
    draw: ["It was a draw!", "Tie!", "Not bad, not bad.."],
    humanWin: ["Hmm, how did that happen?", "Nooo Way!"],
    cpuWin: ["Yeap, I won!", "Hoooray!", "Try again!", "You can do better!", "Are you trying at all?", "Is that all you can do?", "No worries, nex time will be better"],
    humanTurn: ["Ok, your turn!", "Ok, go first now!", "Ok, after you!"],
    cpuTurn: ["Now it's my turn!", "My turn!", "Ok, where to go... One second..."]
  },
  random: function(array) {
    return array[Math.floor(Math.random() * array.length)];
  },
  showBoard: function() {
        $(".grid-container").css("visibility", "visible");
    },
  hideBoard: function() {
        $(".grid-container").css("visibility", "hidden");
    },
  showGameStarter: function() {
        $(".game-starter").fadeIn(500);
    },
  hideGameStarter: function() {
        $(".game-starter").fadeOut(500);    
    },
  showMessage: function(message) {
        $(".message").html(message);
        $(".message").fadeIn(500);
    },
  hideMessage: function() {
        $(".message").fadeOut(500);
    },
  animateWin: function(arr) {
    for (var i= 0; i < arr.length; i++) {
          cells[arr[i]].classList.add('grid-item-animate');
        }
        setTimeout(function(){
          for (var i= 0; i < arr.length; i++) {
            cells[arr[i]].classList.remove('grid-item-animate');
          }
        }, 1000);
  }
};

const Game = {
  board: {
    indexLayout: [0, 1, 2, 3, 4, 5, 6, 7, 8],
    current: [null, null, null, null, null, null, null, null, null],
    reset: function() {
      Game.board.current = [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null
      ];
      $('.grid-item').empty();
    },
    move: function(token, index) {
      if (Game.board.isValid(index)) {
        Game.board.current[index] = token;
        Game.board.updateBoard(token, index);
        return true;
      }
      return false;
    },
    updateBoard: function(token, index) {
      $("[value=" + CSS.escape(index) + "]").html("<span>" + token + "</span>");
    },
    isValid: function(index) {
      if (Game.board.current[index] === null) {
        return true;
      }
      return false;
    },
    isWin: function(board) {
      const winStates = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
      ];
      board = board || Game.board.current;
      // takes existing board and winning combo and confirms winner or not
      const check = function(board, loc1, loc2, loc3) {
        if (
          ![board[loc1], board[loc2], board[loc3]].includes(null) &&
          board[loc1] === board[loc2] &&
          board[loc1] === board[loc3]
        ) {
          return true;
        }
        return false;
      };

      // loop through combo list and check for the winner
      for (let i = 0; i < winStates.length; i++) {
        if (check(board, winStates[i][0], winStates[i][1], winStates[i][2])) {
          return {
            result: true,
            who: board[winStates[i][0]],
            how: winStates[i]
          };
        }
      }
      // or return false;
      return {
        result: false,
        who: null
      };
    },
    isDraw: function() {
      if (
        !Game.board.current.includes(null) &&
        Game.gameplay.state.movesLeft === 0
      ) {
        return true;
      }
      return false;
    }
  },
  gameplay: {
    state: {
      movesLeft: null,
      humanToken: null,
      cpuToken: null,
      currentPlayer: null,
      whoFirst: null,
      firstGame: true,
      win: false,
      draw: false
    },
    humanMove: function(index) {
      if (Game.board.move(Game.gameplay.state.humanToken, index)) {
        Game.gameplay.postMoveManager(index);
      }
      return false;
    },
    cpuMove: function() {
      window.setTimeout(() => {
        Game.gameplay.ai.minimax(
          Game.gameplay.state.cpuToken,
          Game.gameplay.state.humanToken
        );
        Game.gameplay.postMoveManager();
      }, 500);
    },
    postMoveManager: function(index) {
      // reduce number of available moves
      Game.gameplay.state.movesLeft--;
      // check if someone won
      let winCheck = Game.board.isWin();
      if (winCheck.result) {
        if (winCheck.who === Game.gameplay.state.humanToken) {
          Game.gameplay.postGameManager(Display.random(Display.messages.humanWin));
          return;
        }
        Display.animateWin(winCheck.how);
        Game.gameplay.postGameManager(Display.random(Display.messages.cpuWin));
        return;
      }
      // or check for the draw
      if (Game.board.isDraw()) {
        Game.gameplay.postGameManager(Display.random(Display.messages.draw));
        Display.animateWin(Game.board.indexLayout);
        return;
      }
      // otherwise swap the players
      Game.gameplay.swapActivePlayer();
      // play computer move or wait for player
      if (Game.gameplay.state.currentPlayer === "M") {
        Game.gameplay.cpuMove();
      }
    },
    swapActivePlayer: function() {
      Game.gameplay.state.currentPlayer =
        Game.gameplay.state.currentPlayer === "H" ? "M" : "H";
    },
    prepNewGame: function() {
      if (Game.gameplay.state.firstGame) {
        Game.gameplay.state.firstGame = false;
        Game.gameplay.state.whoFirst = "H";
      } else {
        Game.gameplay.state.whoFirst = Game.gameplay.state.whoFirst === "H" ? "M" : "H";
      }
      Game.board.reset();
      Game.gameplay.state.movesLeft = 9;
      Game.gameplay.state.currentPlayer = Game.gameplay.state.whoFirst;
    },
    postGameManager: function(firstMessage) {
      let secondMessage = Game.gameplay.state.whoFirst === "H" ? Display.random(Display.messages.cpuTurn) : Display.random(Display.messages.humanTurn);
      setTimeout(function(){Display.hideBoard();}, 1000);
      setTimeout(function(){Display.showMessage(firstMessage);}, 2000);
      setTimeout(function(){Display.hideMessage();}, 3500);
      setTimeout(function(){Display.showMessage(secondMessage);}, 4500);
      setTimeout(function(){Display.hideMessage();}, 6000);
      setTimeout(function() {
        Game.gameplay.prepNewGame();
        Display.showBoard();
        if (Game.gameplay.state.currentPlayer === "M") {
          Game.gameplay.cpuMove();
        }
      }, 7000);
    },
    ai: {
      minimax: function(maxMe, minMe) {
        let nextMove = null;
        // recursive minimax tree search and scoring function
        const mmRecursiveSearch = function(board, lastPlayer, depth) {
          // This function will simulate all possible variations of the game from the current state and assing scores to any winner state it discovers, passing found win states back up the tree, until the highest value move is discovered.

          // WIN STATE SCORING
          // MinMax scores a board state immediately if it's in a win state, so we don't have to go any deeper on this node. What about draws? Handled later.
          if (Game.board.isWin(board).who === maxMe) {
            // a winning board state for the machine scores 10, but the deeper it goes, the less certain we are of the value of the win, so we subtract the depth to reduce the value of the winning state.
            return 10 - depth;
          } else if (Game.board.isWin(board).who === minMe) {
            // a winning board state for a human scores -10, but the deeper it goes, the less certain we are of the value of the win, so we subtract 10 to reduce the impact of the winning state.
            return depth - 10;
          }

          // SWITCH PLAYERS
          // if this wasn't a win, then we need to make the nextplayer different from @param: lastPlayer, then we need to select the next player to simulate moves for
          let nextPlayer = lastPlayer === "X" ? "O" : "X";

          // SIMULATE MOVES
          // prepare array of all available moves and scores
          let moves = [],
            scores = [];
          // now loop through all available moves and play that move with the nextPlayer. Recursively call this function again to get a score for that board state.
          for (let i = 0; i < board.length; i++) {
            // copy our board
            let nextBoard = board.slice();
            // will only make a recursive play if there are spaces left on the board.
            if (nextBoard[i] === null) {
              nextBoard[i] = nextPlayer;
              // moves[x] will ==== scores [x]. We use this for as a basis of 'pushing' found scores up the tree.
              moves.push(i);
              scores.push(mmRecursiveSearch(nextBoard, nextPlayer, depth + 1)); // we don't know the score until all the possible moves afer it have been evaluated, so go find them!
            }
          }
          // PROCESS THE RECURSIVE RESULTS (i.e. what came back up the tree)
          // back at depth 0, actually make a move
          if (depth === 0) {
            // define the next move by choosing the maximum score from all of moves available
            nextMove = moves[scores.indexOf(Math.max.apply(null, scores))];

            // DEBUG: summarise the result of the search and where the recommended move is
            /*
                console.log("Moves were possible at: " + moves);
                console.log("Scores came out at: " + scores);
                console.log("Make your next move at: " + nextMove);
                */
          } else {
            // any other depth
            if (moves.length === 0) {
              // no more moves could be made,
              return 0; //score this game as a draw. Could shortcut this along with win evaluation, but it also works here
            }

            if (nextPlayer === maxMe) {
              // which scores do we want? depends if it's a min or max turn!
              return Math.max.apply(Math, scores); // for the max turns, pass back max scores.
            } else {
              return Math.min.apply(Math, scores); // for the min turns, pass back min scores.
            }
          }
        };
        // find our next move
        mmRecursiveSearch(Game.board.current, minMe, 0);
        // play it!
        console.log("OK, making move at: " + nextMove);
        if (Game.board.move(maxMe, nextMove)) {
          console.log(Game.board.current);
          console.log("Move successful");
        } else {
          console.log("Move failed");
        }
      }
    }
  },
  initializeGame: function() {
    Display.showGameStarter();
    //prompt to play X or O
    $(".token").click(function() {
      let humanToken = $(this).attr("value");
      Game.gameplay.state.humanToken = humanToken;
      Game.gameplay.state.cpuToken = humanToken === "X" ? "O" : "X";
      Game.gameplay.prepNewGame();
      Display.hideGameStarter();
      setTimeout(function(){Display.showBoard();}, 1000);
    });
    
    //action and board update after click
      $(".grid-item").click(function() {
        let index = $(this).attr("value");
        if (Game.gameplay.state.currentPlayer === "H") {
          Game.gameplay.humanMove(index);
          return;
        }
        Game.gameplay.cpuMove();
      });
  }
};

$(document).ready(function() {  
  Game.initializeGame();
});