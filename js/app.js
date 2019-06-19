/*
 * [Main Logic]
 *  1. Distribute
 *      (1). Shuffle
 *      (2). Reset all properties to default
 *  2. Playing
 *      (1). Matched or not
 *
 * [Timer and Score]
 *  1. Set/Get playing time
 *  2. Set/Get score
 */

// Create a list that holds all of the cards
const iconList = ['fa-leaf', 'fa-bicycle', 'fa-diamond', 'fa-bomb', 'fa-bolt', 'fa-paper-plane-o', 'fa-cube', 'fa-anchor',
    'fa-leaf', 'fa-bicycle', 'fa-diamond', 'fa-bomb', 'fa-bolt', 'fa-paper-plane-o', 'fa-cube', 'fa-anchor'];
let cards = {}; // an array of objects, {id: int, position: int, matched: boolean, opened: boolean}

let playing = false; // a flag that makes sure some variables are initialized just once
let openedCards = []; // track current open cards. If it hits 2 but two cards are not matched, reset it to []
let matchedPairs = 0; // max = 8, using this variable to determine if all the cards are matched
let waiting = false; // user can't open new card while in waiting state (waiting = true when two cards are not matched and waiting for 'close' cards
let openCount = 0; // total open count. it's used for determining player's performance (ranking)
let moveCount = 0;

// Timer
let playTimer; // to display user's playing time
let totalTimeInSeconds = 0; // total time in seconds and will be converted to hh:mm:ss format
let hours = '00';
let minutes = '00';
let seconds = '00';


const pattern = /card\d+/; // card ids, i.e. card0 - card15
const restartElement = document.querySelector('.restart');
const deckElement = document.querySelector('.deck');
const childNodes = deckElement.querySelectorAll('.card');
const moveCountElement = document.querySelector('.moves');
const star0 = document.querySelector('#star0');
const star1 = document.querySelector('#star1');
const star2 = document.querySelector('#star2');
const timerElement = document.querySelector('.timer');
const resultModal = document.querySelector(".modal");
const replayButton = document.querySelector(".replay");
const cancelButton = document.querySelector(".cancel");

// set default values
function initialization() {
    star0.className = 'fa fa-star';
    star1.className = 'fa fa-star';
    star2.className = 'fa fa-star';

    openedCards = [];
    matchedPairs = 0;
    waiting = false;
    openCount = 0;
    moveCount = 0;
    playing = false;

    totalTimeInSeconds = 0;
    hours = 0;
    minutes = 0;
    seconds = 0;

    deckElement.addEventListener('click', openCard);
    restartElement.addEventListener('click', startGame);
    replayButton.addEventListener('click', replay);
    cancelButton.addEventListener('click', toggleModal);
}

/*
 * Display the cards on the page
 *   - shuffle the list of cards using the provided "shuffle" method below
 *   - loop through each card and create its HTML
 *   - add each card's HTML to the page
 */

// Shuffle function from http://stackoverflow.com/a/2450976
function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;

    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}

function compareTwoCards(card1, card2) {
    return cards[card1]['icon'] === cards[card2]['icon'];
}

function convertSecondsToHHMMSS(seconds) {
    hours = parseInt(totalTimeInSeconds / 3600);
    minutes = parseInt((totalTimeInSeconds - hours *3600) / 60);
    seconds = parseInt(totalTimeInSeconds - hours * 3600 - minutes * 60);
    return `${("0" + hours).slice(-2)}:${("0" + minutes).slice(-2)}:${("0" + seconds).slice(-2)}`;
}

function openCard(evt) {
    const target = evt.target;
    const selectedCardId = target.id;
    if (!waiting && pattern.test(selectedCardId)) {
        const selectedCard = cards[selectedCardId];

        if(!playing) {
            playing = true;
            // start timer
            playTimer = setInterval(function () {
                totalTimeInSeconds += 1;
                timerElement.textContent = convertSecondsToHHMMSS(totalTimeInSeconds);
            }, 1000);
        }

        // the selected card is not opened and count < 2
        if (!selectedCard['opened'] && openedCards.length < 2) {
            openCount += 1;
            moveCount = parseInt(openCount / 2);
            moveCountElement.textContent = (moveCount > 1)? moveCount + ' moves': moveCount + ' move';

            // 1 2 3 4 5 6 7 8 9 10
            // 0 0 0 0 0 0 0 0 1
            if (8 < moveCount && moveCount <=16) {
                star2.className = 'fa fa-star-half-o';
            } else if (16 < moveCount && moveCount <=24) {
                star2.className = 'fa fa-star-o';
            } else if (24 < moveCount && moveCount <=32) {
                star1.className = 'fa fa-star-half-o';
            } else if (32 < moveCount && moveCount <=40) {
                star1.className = 'fa fa-star-o';
            } else if (40 < moveCount && moveCount <=48) {
                star0.className = 'fa fa-star-half-o';
            } else if (moveCount > 48) {
                star0.className = 'fa fa-star-o';
            }

            selectedCard['opened'] = true;
            openedCards.push(target);

            target.className = 'card open show';

            const currentTargetIconElement = target.querySelector('i');
            currentTargetIconElement.className = 'fa ' + selectedCard['icon'];

            if (openedCards.length === 2) {
                // call match function
                // if not matched, reset openedCardCount to 0 and flip both cards
                if (compareTwoCards(openedCards[0].id, openedCards[1].id)) {
                    openedCards[0].className = 'card open match';
                    openedCards[1].className = 'card open match';

                    cards[openedCards[0].id]['matched'] = true;
                    cards[openedCards[1].id]['matched'] = true;
                    openedCards = [];
                    matchedPairs += 1;

                    if (matchedPairs === 8) {
                        clearInterval(playTimer);
                        toggleModal();
                    }
                } else {
                    // reset opened cards' properties
                    waiting = true;
                    setTimeout(function() {
                        openedCards[0].className = 'card';
                        openedCards[1].className = 'card';

                        cards[openedCards[0].id]['opened'] = false;
                        cards[openedCards[1].id]['opened'] = false;

                        openedCards = [];
                        waiting = false;
                    }, 1000);
                }
            }
        }
    }
}

function startGame() {

    // stop timer
    if (playTimer) {
        clearInterval(playTimer);
    }

    // reset opened cards
    var shfulledIcon = shuffle(iconList);

    // Assign an id for each card
    for (let i = 0; i< 16; i++) {
        childNodes[i].id = 'card' + i.toString();
        cards[childNodes[i].id] = {'icon': shfulledIcon[i], 'matched': false, 'opened': false};
        childNodes[i].className = 'card';
    }

    // reset move
    moveCountElement.textContent = 0;

    // reset variables to default values
    initialization();
    timerElement.textContent = convertSecondsToHHMMSS(0);
}

function generateResult() {
    const rankingResultElement = document.querySelector('.ranking-result');
    rankingResultElement.textContent = (moveCount - 1) / ;
    toggleModal();
}

// Reference: https://sabe.io/tutorials/how-to-create-modal-popup-box
function toggleModal() {
    resultModal.classList.toggle("show-modal");
}

function replay(){
    toggleModal();
    startGame();
}

startGame();
generateResult();
