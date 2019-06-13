/*
 * [Main Logic]
 *  1. Distribute
 *      (1). Shuffle
 *      (2). Reset all properties to default
 *  2. Playing
 *      (1). Matched or not
 *      (2). Flip card
 *
 * [Timer and Score]
 *  1. Set/Get playing time
 *  2. Set/Get score
 */


/*
 * class: match
 * class: open show
 */

/*
 * Create a list that holds all of your cards
 */
var openedCardCount = 0; // track current run's open card (0 means no open card, max is 2). if it hits 2 but two cards are not matched, reset it to 0
var playing = false;
var openedCards = [];
var matchedPairs = 0;
var waiting = false;
var flipCards = false;
var startTime = 0;
var endTime = 0;
var openCount = 0;
const iconList = ['fa-leaf', 'fa-bicycle', 'fa-diamond', 'fa-bomb', 'fa-bolt', 'fa-paper-plane-o', 'fa-cube', 'fa-anchor',
    'fa-leaf', 'fa-bicycle', 'fa-diamond', 'fa-bomb', 'fa-bolt', 'fa-paper-plane-o', 'fa-cube', 'fa-anchor'];
let cards = {};//[]; // an array of objects, {id: int, position: int, matched: boolean, opened: boolean}

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


/*
 * set up the event listener for a card. If a card is clicked:
 *  - display the card's symbol (put this functionality in another function that you call from this one)
 *  - add the card to a *list* of "open" cards (put this functionality in another function that you call from this one)
 *  - if the list already has another card, check to see if the two cards match
 *    + if the cards do match, lock the cards in the open position (put this functionality in another function that you call from this one)
 *    + if the cards do not match, remove the cards from the list and hide the card's symbol (put this functionality in another function that you call from this one)
 *    + increment the move counter and display it on the page (put this functionality in another function that you call from this one)
 *    + if all cards have matched, display a message with the final score (put this functionality in another function that you call from this one)
 */
const pattern = /card\d+/;
const restartElement = document.querySelector('.restart');
const deckElement = document.querySelector('.deck');
const childNodes = deckElement.querySelectorAll('.card');
const moveCountElement = document.querySelector('.moves');
const starElement = document.querySelector('.stars');
const starNodes = starElement.querySelectorAll('li');
function openCard(evt) {
    const target = evt.target;
    const selectedCardId = target.id;
    if (!waiting && pattern.test(selectedCardId)) {
        const selectedCard = cards[selectedCardId];

        if(!playing) {
            startTime = performance.now();
            playing = true;
        }

        if (!selectedCard['opened'] && openedCardCount < 2) {
            openCount += 1;
            moveCountElement.textContent = (openCount > 1)? openCount + ' moves': openCount + ' move';
            if (openCount > 16 && openCount <= 32) {
                // const elem2 = document.querySelector('#star2');
                // if (elem2) {
                //     starElement.removeChild(elem2);
                // }
                const star2 = document.querySelector('#star2');
                star2.style.display = 'none';
            } else if (openCount > 32) {
                // const elem1 = document.querySelector('#star1');
                // if (elem1) {
                //     starElement.removeChild(elem1);
                // }
                const star1 = document.querySelector('#star1');
                star1.style.display = 'none';
            }
            // this card is not opened yet

            selectedCard['opened'] = true;
            openedCards.push(target);
            openedCardCount += 1;


            target.className = 'card open show';

            const currentTargetIconElement = target.querySelector('i');
            currentTargetIconElement.className = 'fa ' + selectedCard['icon'];

            if (openedCardCount === 2) {
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
                        endTime = performance.now();
                        console.log(endTime);
                        alert('done!');
                        console.log('Playing time: ', endTime - startTime, ' Open count: ', openCount);
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
                openedCardCount = 0;
            }
        }
        // card has been opened, do nothing
    } else {
        // not a card element, do nothing
    }


}

function compareTwoCards(card1, card2) {
    return cards[card1]['icon'] === cards[card2]['icon'];
}

function resetGame() {

    openedCardCount = 0;
    openedCards = [];
    matchedPairs = 0;
    waiting = false;
    flipCards = false;
    startTime = 0;
    endTime = 0;
    openCount = 0;
    playing = false;

    // Assign an id for each card
    for (let i = 0; i< 16; i++) {
        childNodes[i].id = 'card' + i.toString();
    }


    for (let i = 0; i< 3; i++) {
        starNodes[i].id = 'star' + i.toString();
    }

    // reset star rating
    const star0 = document.querySelector('#star0');
    star0.style.display = 'inline';

    const star1 = document.querySelector('#star1');
    star1.style.display = 'inline';

    const star2 = document.querySelector('#star2');
    star2.style.display = 'inline';

    // reset moves
    moveCountElement.textContent = 0;

    // reset opened cards
    var shfulledIcon = shuffle(iconList);

    for (i = 0; i < 16; i++) {
        //cards.push({'id': 'card' + i.toString(), 'position': shfulledPosition[i], 'matched': false, 'opened': false});
        const cardId = 'card' + i.toString();
        cards[cardId] = {'icon': shfulledIcon[i], 'matched': false, 'opened': false};
        childNodes[i].className = 'card';
    }
}




resetGame();

// document.body.appendChild(deckElement);
deckElement.addEventListener('click', openCard);
restartElement.addEventListener('click', resetGame);
