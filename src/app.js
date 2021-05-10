import { clientSeed, serverSeed, getHash, getResult } from "./betCalculator.js";

export var $storeValues = {
  betAmount: 0,
  percentageValue: 50,
  diceWinSound: "./audio/win.wav",
  winChance: 50,
  multiplier: 2,
  rollOver: 50,
  balance: 3000,
  totalBets: 0,
  profit: 0,
  bets: [],
  winLoss: [0, 0],
  betCount: 0,
  clientSeed: null,
  serverSeed: null,
  nonce: 0,
  hash: null,
};

$(document).ready(function () {
  // GENERATE SERVER AND CLIENT SEEDS
  $storeValues.serverSeed = serverSeed();
  $storeValues.clientSeed = clientSeed(30);

  // EVENT LISTENERS FOR CLIENT AND SERVER SEED BUTTONS
  $("#show-server-seed").on("click", () => {
    alert($storeValues.serverSeed);
  });
  $("#show-client-seed").on("click", () => {
    alert($storeValues.clientSeed);
  });

  // EVENT LISTENER FOR BET AMOUNT
  $("#bet-amount")
    .on("keyup", (event) => {
      $storeValues.betAmount = $("#bet-amount").val();
      $("#profit-amount").val($storeValues.betAmount * $storeValues.multiplier);
    })
    .on("change", (event) => {
      $storeValues.betAmount = $("#bet-amount").val();
      $("#profit-amount").val($storeValues.betAmount * $storeValues.multiplier);
    });

  // EVENT LISTENER FOR MULTIPLIER
  $("#multiplier-amount")
    .on("keyup", (event) => {
      $storeValues.multiplier = $("#multiplier-amount").val();
      $.handleMultiplier();
    })
    .on("change", (event) => {
      $storeValues.multiplier = $("#multiplier-amount").val();
      $.handleMultiplier();
    });

  // EVENT LISTENER FOR PERCENTAGE RANGE
  $("#percentage-range").on("change", (event) => {
    $storeValues.percentageValue = $("#percentage-range").val();
    $.handleSlider();
  });

  // EVENT LISTENER FOR THE DICE BUTTON
  $("#roll-dice-button").on("click", (event) => {
    if ($storeValues.betAmount > $storeValues.balance) {
      $("#alert").html("Balance insufficient!");
      $("#alert").slideDown();
    } else {
      if ($storeValues.multiplier > 1 && $storeValues.multiplier < 100.01) {
        if ($storeValues.betAmount > 0) {
          $("#alert").slideUp();

          event.preventDefault();
          $("#roll-dice-button").prop("disabled", true);
          $("#roll-dice-button").toggleClass("roll-dice-button-clicked");

          // PLAY DICE ROLL ANIMATION
          setTimeout(function () {
            $("#roll-dice-button").toggle();
            $("#dice-div").toggle();
          }, 350);

          // FIRE FUNCTION AFTER DICE IS ROLLED
          setTimeout(function () {
            $.handleRoll();
          }, 1800);
        } else {
          $("#alert").html("Bet amount must be above 0!");
          $("#alert").slideDown();
        }
      } else {
        $("#alert").html("Multiplier must be between 1.01 and 100.01!");
        $("#alert").slideDown();
      }
    }
  });
  $.handleDisplay();
});

// HANDLE PERCENTAGE SLIDER
$.handleSlider = function () {
  $storeValues.winChance = 100 - $storeValues.percentageValue;
  $storeValues.rollOver = $storeValues.percentageValue;
  $storeValues.multiplier = 100 / $storeValues.winChance;
  $("#win-chance-amount").val(Math.round($storeValues.winChance * 100) / 100);
  $("#roll-over-amount").val(Math.round($storeValues.rollOver * 100) / 100);
  $("#multiplier-amount").val(Math.round($storeValues.multiplier * 100) / 100);
  $("#profit-amount").val(
    ($storeValues.betAmount * $storeValues.multiplier).toFixed(2)
  );
};

// HANDLE MULTIPLIER INPUT
$.handleMultiplier = function () {
  $storeValues.winChance = 100 / $storeValues.multiplier;
  $storeValues.rollOver = 100 - $storeValues.winChance;

  if ($storeValues.multiplier > 1 && $storeValues.multiplier < 100.01) {
    $("#multiplier-amount").css("border-color", "#a9a9a9");
  } else {
    $("#multiplier-amount").css("border-color", "red");
    $("#percentage-range").val($storeValues.rollOver);
  }

  $("#win-chance-amount").val(Math.round($storeValues.winChance * 100) / 100);
  $("#roll-over-amount").val(Math.round($storeValues.rollOver * 100) / 100);
  $("#percentage-range").val($storeValues.rollOver);
  $("#profit-amount").val(
    ($storeValues.betAmount * $storeValues.multiplier).toFixed(2)
  );
  $("#alert").slideUp();
};

// HANDLE DICE ROLL
$.handleRoll = function () {
  console.log($storeValues.serverSeed);
  // GET FINAL HASH
  $storeValues.hash = getHash();

  // HANDLE DICE SVG AND BUTTON
  $("#roll-dice-button").prop("disabled", false);
  $("#roll-dice-button").toggleClass("roll-dice-button-clicked");
  $("#roll-dice-button").toggle();
  $("#dice-div").toggle();

  // HANDLE SOUND
  var audio = document.createElement("audio");
  var probability = getResult($storeValues.hash) / 100;
  var chance = $storeValues.winChance / 100;

  // HANDLE BETS(WIN/LOSS)
  if (chance > probability) {
    audio.src = $storeValues.diceWinSound;
    audio.play();

    $storeValues.balance +=
      $storeValues.betAmount * parseInt($storeValues.multiplier);

    let $bet = {
      amount: $storeValues.betAmount * parseInt($storeValues.multiplier),
      win: "yes",
      probability: probability,
    };

    $storeValues.totalBets += parseInt($storeValues.betAmount);
    $storeValues.profit +=
      $storeValues.betAmount * parseInt($storeValues.multiplier);
    $storeValues.winLoss[0] += 1;
    $storeValues.betCount += 1;
    $storeValues.nonce += 1;

    $storeValues.bets.push($bet);
    $.handleDisplay();
  } else {
    let $bet = {
      amount: $storeValues.betAmount,
      win: "no",
      probability: probability,
    };

    $storeValues.totalBets += parseInt($storeValues.betAmount);
    $storeValues.profit -= parseInt($storeValues.betAmount);
    $storeValues.winLoss[1] += 1;
    $storeValues.betCount += 1;
    $storeValues.balance -= $storeValues.betAmount;
    $storeValues.nonce += 1;
    $storeValues.bets.push($bet);
    $.handleDisplay();
  }
};

$.handleDisplay = function () {
  $("#bets").html("");
  $("#balance").html(`Balance: ${$storeValues.balance} €`);

  //HANDLE PAST BETS DISPLAY
  $storeValues.bets.forEach((element) => {
    if (element.win === "yes") {
      $("#bets").append(
        `<span style="color: #00FF00;" class="bets-text">+${
          element.amount
        } € (${Math.round(element.probability * 100) / 100})</span>`
      );
    } else {
      $("#bets").append(
        `<span style="color: #FA8072;" class="bets-text">-${
          element.amount
        } €  (${Math.round(element.probability * 100) / 100})</span>`
      );
    }
  });

  // DISABLE BOX OVERFLOW
  if ($storeValues.bets.length > 13) {
    $storeValues.bets = [];
  }

  // HANDLE TOTAL PROFIT DISPLAY
  if ($storeValues.profit > 0) {
    $("#total-profit").html(`Total profit: +${$storeValues.profit} €`);
    $("#total-profit").css("color", "#00FF00");
  } else if ($storeValues.profit < 0) {
    $("#total-profit").html(`Total profit: ${$storeValues.profit} €`);
    $("#total-profit").css("color", "#FA8072");
  } else if ($storeValues.profit === 0) {
    $("#total-profit").html(`Total profit: ${$storeValues.profit} €`);
    $("#total-profit").css("color", "white");
  }

  // HANDLE TOTAL SPENT DISPLAY
  $("#total-spent").html(`Total spent: ${$storeValues.totalBets} €`);

  // HANDLE WIN AND LOSS DISPLAY
  $("#win-count").html(`Win count: ${$storeValues.winLoss[0]}`);
  $("#win-count").css("color", "#00FF00");

  $("#loss-count").html(`Loss count: ${$storeValues.winLoss[1]}`);
  $("#loss-count").css("color", "#FA8072");

  // HANDLE WINN RATIO DISPLAY
  $("#win-ratio").html(
    `Win/loss ratio: ${(
      ($storeValues.winLoss[0] / $storeValues.betCount) *
      100
    ).toFixed(2)} %`
  );
};
