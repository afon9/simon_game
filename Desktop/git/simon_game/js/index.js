var colors = ["red", "yellow", "green", "blue"];
var sounds = {
	red_sound: new Audio(
		"https://res.cloudinary.com/kurt-johnson/video/upload/v1491432845/simon1_ppd3st.mp3"
	),
	green_sound: new Audio(
		"https://res.cloudinary.com/kurt-johnson/video/upload/v1491432845/simon2_gzcr2p.mp3"
	),
	yellow_sound: new Audio(
		"https://res.cloudinary.com/kurt-johnson/video/upload/v1491432845/simon3_pokitr.mp3"
	),
	blue_sound: new Audio(
		"https://res.cloudinary.com/kurt-johnson/video/upload/v1491432845/simon4_zqumyi.mp3"
	),
	error_sound: new Audio(
		"https://res.cloudinary.com/kurt-johnson/video/upload/v1491432844/simon_buzz_ufziqo.mp3"
	)
};
var timeout;
var interval;

const Display = {
	showBoard: function() {
		$(".container").fadeIn(500);
	},
	btnLightOn: function(button) {
		$("#" + button).addClass("clicked-" + button);
	},
	btnLightOff: function(button) {
		$("#" + button).removeClass("clicked-" + button);
	},
	animate: function() {
		let anim = function(index) {
			setTimeout(function() {
				Display.btnLightOn(Game.state.order[index]);
				Sound.playSound(Game.state.order[index]);
			}, Game.state.currentTempo * index);
			setTimeout(function() {
				Display.btnLightOff(Game.state.order[index]);
				Sound.stopSound();
				if (index === Game.state.order.length - 1) {
					Game.changeStatus(Game.state.statusList.playerTurn);
					Game.enabled();
				}
			}, Game.state.currentTempo * index + 350);
		};
		for (var j = 0; j < Game.state.order.length; j++) {
			anim(j);
		}
	},
	fail: function() {
		$(".text").html("--");
		colors.forEach(function(color) {
			Display.btnLightOn(color);
		});
		setTimeout(function() {
			$(".text").html(Game.state.order.length);
			colors.forEach(function(color) {
				Display.btnLightOff(color);
			});
		}, 1000);
	},
	win: function() {
		colors.forEach(function(element, i) {
			setTimeout(function() {
				Display.btnLightOn(element);
			}, 300 * i);
			setTimeout(function() {
				Display.btnLightOff(element);
			}, 300 * i + 300);
		});
	},
	updateStep: function() {
		$(".text").html(Game.state.order.length);
	},
	updateStatus: function() {
		$(".status").html(Game.state.status);
	}
};
const Sound = {
	playSound: function(entry) {
		switch (entry) {
			case "red":
				sounds.red_sound.play();
				break;
			case "green":
				sounds.green_sound.play();
				break;
			case "yellow":
				sounds.yellow_sound.play();
				break;
			case "blue":
				sounds.blue_sound.play();
				break;
		}
	},
	stopSound: function() {
		colors.forEach(function(color) {
			sounds[color + "_sound"].pause();
			sounds[color + "_sound"].currentTime = 0;
		});
	},
	playErrorSound: function() {
		sounds.error_sound.play();
	}
};
const Game = {
	state: {
		statusList: {
			//statuses renamed to simon (except win case), since I found status update feature too distracting
			off: "simon",
			cpuTurn: "simon",
			playerTurn: "simon",
			win: "victory"
		},
		playerCurrentStep: 0,
		order: [],
		status: "simon",
		mode: "easy",
		currentTimeout: null, //needed for reset function
		currentTempo: null ////needed for reset function
	},
	settings: {
		timeout: 4000, //timer restarts after every button push at each step
		decrementTimeout: 500,
		tempo: 1300, // animation speed
		decrementTempo: 300,
		winStep: 20,
		accelerateSteps: [5, 9, 13] //default 5 9 13
	},
	reset: function() {
		$(".simon").stop();
		Sound.stopSound();
		clearInterval(interval);
		clearTimeout(timeout);
		Game.state.playerCurrentStep = 0;
		Game.state.order = [];
		Game.state.currentTimeout = Game.settings.timeout;
		Game.state.currentTempo = Game.settings.tempo;
		setTimeout(function() {
			Game.simonTurn();
		}, 1000);
	},
	simonTurn: function() {
		Game.changeStatus(Game.state.statusList.cpuTurn);
		Game.disabled();
		Game.adjustSpeed();
		Game.addColor();
	},
	playerTurn: function(entry) {
		clearTimeout(timeout);
		console.log(Game.state.order);

		//action if entry was wrong
		if (entry !== Game.state.order[Game.state.playerCurrentStep]) {
			Game.playerTurnFail();
			return;

			//action if entry is ok and it is the last color of the current step
		} else if (Game.state.playerCurrentStep === Game.state.order.length - 1) {
			// action if win
			if (Game.state.order.length === Game.settings.winStep) {
				Game.disabled();
				interval = setInterval(function() {
					Display.win();
					Game.changeStatus(Game.state.statusList.win);
				}, 300);
				return;
			} //if last color on this turn but not a win yet
			Game.state.playerCurrentStep = 0;
			Game.simonTurn();
			return;
		}

		//action if entry is ok but is not the last one, set the timer
		Game.state.playerCurrentStep++;
		Game.timer();
	},
	playerTurnFail: function() {
		Game.disabled();
		Game.state.playerCurrentStep = 0;
		Sound.playErrorSound();
		Display.fail();
		//reset game in strict mode
		if (Game.state.mode === "strict") {
			Game.reset();
			return;
		}
		//otherwise repeat sequance on the same step
		setTimeout(function() {
			Game.changeStatus(Game.state.statusList.cpuTurn);
			Display.animate();
		}, 2000);
	},
	addColor: function() {
		let color = colors[Math.floor(Math.random() * colors.length)];
		Game.state.order.push(color);
		Display.updateStep();
		setTimeout(function() {
			Display.animate();
		}, 1000);
	},
	timer: function() {
		timeout = setTimeout(function() {
			Game.playerTurnFail();
		}, Game.state.currentTimeout);
	},
	changeStatus: function(status) {
		Game.state.status = status;
		Display.updateStatus();
	},
	adjustSpeed: function() {
		if (
			Game.settings.accelerateSteps.indexOf(Game.state.order.length + 1) !== -1
		) {
			Game.state.currentTimeout =
				Game.state.currentTimeout - Game.settings.decrementTimeout;
			Game.state.currentTempo =
				Game.state.currentTempo - Game.settings.decrementTempo;
			//console.log("Tempo:" + Game.state.currentTempo + "; Timeout:" + Game.state.currentTimeout);
		}
	},
	disabled: function() {
		$(".simon").addClass("disabled");
	},
	enabled: function() {
		$(".simon").removeClass("disabled");
	},
	initializeGame: function() {
		Game.disabled();
		Display.showBoard();
		$(".start").on("click", function() {
			Game.reset();
		});
		$(".simon").on("click", function() {
			let entry = $(this).attr("id");
			Game.playerTurn(entry);
		});
		$(".simon").mousedown(function() {
			let entry = $(this).attr("id");
			Sound.playSound(entry);
		});
		$(".simon").mouseup(function() {
			let entry = $(this).attr("id");
			Sound.stopSound();
		});
		$(".strict").on("click", function() {
			Game.state.mode = Game.state.mode === "easy" ? "strict" : "easy";
			$(".strict").html(Game.state.mode);
		});
	}
};

$(document).ready(function() {
	Game.initializeGame();
});