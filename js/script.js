// const dot = document.querySelector('.dot');
const whiteRocks = document.querySelectorAll('.dot.white');
const blackRocks = document.querySelectorAll('.dot.black');
const empties = document.querySelectorAll('.square:not(.hidden)');
const blackFin = document.querySelector('#blackFin');

let gameOn = true;
let turn = 'black';
let inTurn = false;
let movedRock;
let moveSquares = 0;
let blackScore = 0;
let whiteScore = 0;
let whiteRocksStack = [];
let blackImage = new Image();
blackImage.src = 'img/blackRock.svg';
let whiteImage = new Image();
whiteImage.src = 'img/whiteRock.svg';
let myMap = new Map();
let moveSound = new moveSoundFunc();
let playerName = '';

//INITIALIZATION
$(document).ready(function (e) {
    //init
    const whiteStack = document.querySelector('#whiteStack');
    for (let i = 0; i < 7; i++) {
        myMap.set(blackRocks[i], new Rock('black', blackRocks[i], null, '#blackStack'))
    }
    for (let i = 0; i < 7; i++) {
        myMap.set(whiteRocks[i], new Rock('white', whiteRocks[i], whiteStack, '#whiteStack'))
    }
    setText(START_GAME)
});

for (const dot of whiteRocks) {
    dot.addEventListener('dragstart', dragStart);
    dot.addEventListener('dragend', dragEnd);
    whiteRocksStack.push(dot);
}

for (const dot of blackRocks) {
    dot.addEventListener('dragstart', dragStart);
    dot.addEventListener('dragend', dragEnd);
}

for (const empty of empties) {
    empty.addEventListener('dragover', dragOver);
    empty.addEventListener('dragenter', dragEnter);
    empty.addEventListener('dragleave', dragLeave);
    empty.addEventListener('drop', dragDrop);
}

blackFin.addEventListener('dragover', dragOver);
blackFin.addEventListener('dragenter', dragEnter);
blackFin.addEventListener('dragleave', dragLeave);
blackFin.addEventListener('drop', dropEnd);


// CONTROL (DRAG&DROP)
function dragStart(ev) {

    if (this.classList.contains('white')) {
        ev.dataTransfer.setDragImage(whiteImage, 50, 50);
    } else if (this.classList.contains('black')) {

        ev.dataTransfer.setDragImage(blackImage, 50, 50);
    }
    this.className += ' hold';
    ev.dataTransfer.dropEffect = "move";
    movedRock = this;
    const obj = getObjOfDot(movedRock);
    const parent = obj.parentObj;
    if (parent != null) {
        parent.classList.add('home');
    }

    const nextSqNode = document.getElementById(getNextSquareId(obj, moveSquares));
    if (!nextSqNode) return;
    if (nextSqNode.querySelector(' *.black')) {
        nextSqNode.classList.add('unreachable');
    } else {
        nextSqNode.classList.add('target');
    }
    if (nextSqNode.classList.contains('blackFin')) {
        nextSqNode.classList.add('target');
    }
    obj.target = nextSqNode;

}


function dragEnd() {
    this.classList.remove('hold');
    let obj = myMap.get(movedRock);
    if (obj.parentObj != null) {
        obj.parentObj.classList.remove('home');
    }
    if (obj.target) {
        obj.target.classList.remove('target');
        obj.target.classList.remove('unreachable');
    }
}

function dragOver(e) {
    e.preventDefault();
}

function dragEnter(e) {
    e.preventDefault();
    this.classList.add('hovered');
}

function dragLeave() {
    this.classList.remove('hovered')
}

function dragDrop() {
    console.log('drop')
    let obj = myMap.get(movedRock);
    //put to same
    let childBlack = this.querySelector(' *.black');
    if (childBlack != null) return;
    //put to enemy
    let childWhite = this.querySelector(' *.white');
    if (childWhite != null) {
        console.log("remove white")
        kickRock(childWhite)
        // remove white
    }
    if (this.classList.contains('target')) {
        if (obj.parentObj != null) {
            obj.parentObj.classList.remove('home');
        }
        obj.parentObj = this;
        obj.field = this.id;
        this.append(movedRock);
        moveSound.play();
        if (this.classList.contains('star')) {
            pressOnStar();
            return;
        }
        if (turn = 'black') {
            endTurn();
        }
    }

}

function dropEnd() {
    console.log('drop end' + this);
    let obj = myMap.get(movedRock);
    if (this.classList.contains('target')) {
        if (obj.parentObj != null) {
            obj.parentObj.classList.remove('home');
        }
        obj.parentObj = this;
        obj.finished = true;
        movedRock.draggable = false;
        this.append(movedRock);
        blackScore++;
        endTurn();
        return;
    }
}


function getObjOfDot(dot) {
    return myMap.get(dot)
}

function pressOnStar() {
    setText(COLOR_PRESSED_STAR);
    if (turn == 'white') {
        //automate new spin
    } else {
        setTurnBlack();
        for (const black of blackRocks) {
            black.draggable = false;
        }
        spinButton.disabled = false;
        inTurn = false;
    }
}

document.addEventListener('keydown', (event) => {
    const keyName = event.key;
    if (keyName === " ") {
        event.preventDefault();
        window.scrollTo({top: 0, behavior: 'smooth'});
        if (inTurn) return;
        spin();
    }
}, false);


//ONLINE OFFLINE
window.addEventListener("offline", () => {
    alert("internet lost");
})
window.addEventListener("online", () => {
    alert("internet connected");
})


//SPINNING
let r1 = document.querySelector('#r1');
let r2 = document.querySelector('#r2');
let r3 = document.querySelector('#r3');
let r4 = document.querySelector('#r4');

let rocks = [r1, r2, r3, r4];
let spinButton = document.getElementById("spinButton");
let turnText = document.querySelector('#turnText');


function spin() {
    if (turn == 'black') {
        inTurn = true;
        spinButton.disabled = true;
    }

    for (let i = 0; i < 4; i++) {
        rocks[i].className = 'rock' + (i + 1);
    }
    let roundSpin = Math.floor((Math.random() * 5));
    moveSquares = roundSpin;
    setText(COLOR_SPINNED_NUMBER);
    console.log("spin as " + turn + " " + roundSpin);
    if (roundSpin == 0) {
        setTimeout(() => {
            console.log("nothing")
            endTurn();
        }, 500);
        return;
    }
    let myVar;
    myVar = setInterval(() => {

        let rollPicked = getRandom(rocks, roundSpin)
        for (let i = 0; i < 4; i++) {
            rocks[i].className = 'rock' + (i + 1);
        }
        for (let i = 0; i < roundSpin; i++) {
            rollPicked[i].className = 'rock' + (i + 1) + 'Pos';
        }
    }, 60);
    setTimeout(() => {
        clearInterval(myVar);
        let rollPicked = getRandom(rocks, roundSpin)
        for (let i = 0; i < 4; i++) {
            rocks[i].className = 'rock' + (i + 1);
        }
        for (let i = 0; i < roundSpin; i++) {
            rollPicked[i].className = 'rock' + (i + 1) + 'Pos';
        }
        if (turn == 'white') playWhite(roundSpin);
        else {
            for (const black of blackRocks) {
                black.draggable = true;
            }
        }
    }, 500);
}


function getRandom(arr, n) {
    var result = new Array(n),
        len = arr.length,
        taken = new Array(len);
    while (n--) {
        var x = Math.floor(Math.random() * len);
        result[n] = arr[x in taken ? taken[x] : x];
        taken[x] = --len in taken ? taken[len] : len;
    }
    return result;
}


// NOTIFICATION TEXT
const START_GAME = "Start game by spining rocks";
const COLOR_SPINNED_NUMBER = "# have spinned ^";
const COLOR_WON = "# have won. Refresh page for another game";
const COLOR_PRESSED_STAR = "# have step to star. # spin again";
let notificationTextNode = document.querySelector('#notificationText');

function setText(text) {
    let newText = '';
    switch (text) {
        case COLOR_SPINNED_NUMBER:
            newText = COLOR_SPINNED_NUMBER.replace('#', turn.charAt(0).toUpperCase() + turn.slice(1)).replace('^', moveSquares);
            break;
        case COLOR_WON:
            newText = COLOR_WON.replace('#', turn.charAt(0).toUpperCase() + turn.slice(1));
            break;
        case COLOR_PRESSED_STAR:
            newText = COLOR_PRESSED_STAR.replaceAll('#', turn.charAt(0).toUpperCase() + turn.slice(1));
            break;
        default:
            newText = text;
            break;
    }
    notificationTextNode.innerHTML = newText;

}

// UI
function saveName() {
    playerName = document.querySelector('#nameInput').value;
    const nameSlot = document.querySelector('#nameSlot');
    nameSlot.innerHTML = '';
    nameSlot.append('Your name is ' + playerName);
}

function changeLogoBackground() {
    let svgLogo = document.querySelector('#svgLogo');
    if (svgLogo.getAttribute("fill") === "#b53137") {
        svgLogo.setAttributeNS(null, "fill", "#202020");

    } else {
        svgLogo.setAttributeNS(null, "fill", "#b53137");
    }
}

addEventListener('load', function () {
    history.pushState(null, null, null);
    addEventListener('popstate', function () {
        let stayOnPage = confirm("If you leave game in progress you will lost all data. Are you sure you want to leave?");
        if (!stayOnPage) {
            history.pushState(null, null, null);
        } else {
            history.back()
        }
    });
});


// GAME LOGIC
function setTurnBlack() {
    turn = 'black';
    turnText.innerHTML = "BLACK";
    turnText.classList.replace('text-white', 'text-black');
}

function setTurnWhite() {
    turn = 'white'
    turnText.innerHTML = "WHITE";
    turnText.classList.replace('text-black', 'text-white');
    for (const black of blackRocks) {
        black.draggable = false;
    }
}


function getSquareFor(color, id) {

    let elementId;
    if ((id >= 0 && id < 4) || (id >= 12 && id <= 13)) {
        if (color == 'white') elementId = 'w';
        else elementId = 'b';
    } else if (id > 13) {
        if (color == 'white') return 'whiteFin';
        if (color == 'black') return 'blackFin';
    } else {
        elementId = 'c'
    }
    elementId += id;
    console.log(elementId)
    return document.getElementById(elementId);
}

//This method search where rock can go and discretely appends automaticaly rock on the path
function moveFromTo(from, to, event) {
    let path = [];
    if (from == -1) {
        from++;
    }
    console.log("from " + from + "to " + to + " do steps " + (to - from))
    const stepInterval = 300;
    let lastSquare;
    for (let i = from; i <= to; i++) {
        let nextSquare;
        if (i > 13) nextSquare = document.querySelector('#whiteFin');
        else nextSquare = getSquareFor(turn, i);
        path.push(nextSquare)
        lastSquare = nextSquare;

    }
    let myVar;
    let promise = new Promise(function (resolve, reject) {
        let nextSq
        myVar = setInterval(() => {

            if (path.length <= 0) resolve(nextSq);
            else {
                nextSq = path.shift();
                console.log('appending  to ' + nextSq.id);
                nextSq.append(movedRock);
                moveSound.play();
                myMap.get(movedRock).parentObj = nextSq;
                myMap.get(movedRock).field = nextSq.id;
                if (nextSq.id === 'whiteFin') {
                    whiteScore++;
                    removeFromWhiteAI(movedRock);
                }
            }

        }, stepInterval)

    });
    promise.then((lastParentSq) => {
        console.log('then: ' + lastSquare.id)
        if (event === 'kick') {
            let black = lastSquare.querySelector(' *.black');
            if (black != null) {
                console.log("remove black")
                kickRock(black)
                myMap.get(movedRock).parentObj = lastParentSq;
                myMap.get(movedRock).field = lastParentSq.id;
                clearInterval(myVar);
                setTurnWhite();
                spin();
                return;
            }
        } else if (event === 'star' || lastParentSq.classList.contains('star')) {
            console.log('white step on star')
            setText(COLOR_PRESSED_STAR);
            setTurnWhite();
            spin();
            return;
        }
        myMap.get(movedRock).parentObj = lastParentSq;
        myMap.get(movedRock).field = lastParentSq.id;
        clearInterval(myVar);
        endTurn();
    });
    console.log(path);
}


function endTurn() {
    console.log("ending turn as " + turn)
    changeLogoBackground();
    if (whiteScore == 7 || blackScore == 7) {
        endGame()
        return;
    }
    if (turn == 'white') {
        setTurnBlack();
        spinButton.disabled = false;
        inTurn = false;
    } else {
        setTurnWhite();
        spin();
    }
}

function endGame() {
    setText(COLOR_WON);
    gameOn = false;
    spinButton.disabled = true;
}

//This method return next square ID
function getNextSquareId(fromObj, squares) {
    let ret = '';
    if (!fromObj.parentObj) {
        if (fromObj.color == 'white') ret += 'w';
        if (fromObj.color == 'black') ret += 'b';
        ret += squares - 1;
        return ret;
    }
    const sqId = fromObj.field;
    let split = sqId.split(/(\d+)/);
    let nextIdx = parseInt(split[1]) + squares;
    if (nextIdx > 13) {
        if (fromObj.color == 'white') return 'whiteFin';
        if (fromObj.color == 'black') return 'blackFin';
    }
    switch (split[0]) {
        case 'w':
            if ((nextIdx >= 0 && nextIdx < 4) || (nextIdx <= 13 && nextIdx > 11)) {
                ret += 'w'
            } else {
                ret += 'c';
            }
            break;
        case 'b':
            if ((nextIdx >= 0 && nextIdx < 4) || (nextIdx <= 13 && nextIdx > 11)) {
                ret += 'b'
            } else {
                ret += 'c';
            }
            break;
        case 'c':
            if (nextIdx <= 13 && nextIdx > 11) {
                if (fromObj.color == 'white') ret += 'w';
                if (fromObj.color == 'black') ret += 'b';
            } else {
                ret += 'c';
            }
            break;
    }
    ret += nextIdx;
    console.log('next sq ' + ret);
    return ret;
}

let whiteRockObjInGame = [];

function removeFromWhiteAI(rockObj) {
    whiteRockObjInGame.remove(rockObj);
}

function kickRock(rock) {
    if (rock.classList.contains('white')) {
        document.getElementById('whiteStack').append(rock);
        removeFromWhiteAI(rock);
        myMap.get(rock).field = '#whiteStack';
        myMap.get(rock).parentObj = document.getElementById('whiteStack');
        whiteRocksStack.push(rock);
    }
    if (rock.classList.contains('black')) {
        document.getElementById('blackStack').append(rock);
        myMap.get(rock).field = '#blackStack';
        myMap.get(rock).parentObj = null;
    }
}

//This method takes care of AI of white player
function playWhite(moveSquares) {
    if (moveSquares === 0) return;
    //AI
    let thisSquareNumber = -1;
    let nextEvent;
    if (whiteRockObjInGame.length === 0) {
        movedRock = myMap.get(whiteRocksStack.pop()).dotObj;
        whiteRockObjInGame.push(movedRock);
    } else {
        let simpleMoveObj = [];
        let starObj;
        let kickObj;
        let finObj;
        for (const rockObj of whiteRockObjInGame) {

            const nextSquareId = getNextSquareId(myMap.get(rockObj), moveSquares);
            console.log('rockObj ' + myMap.get(rockObj).field + ' next Square id ' + nextSquareId);
            const nextSquareNode = document.querySelector('#' + nextSquareId);
            let childBlack = nextSquareNode.querySelector(' *.black');
            let childWhite = nextSquareNode.querySelector(' *.white');
            if (childWhite && nextSquareId !== 'whiteFin') continue;
            if (nextSquareId === 'whiteFin') {
                //fin
                finObj = myMap.get(rockObj);
            } else if (nextSquareNode.classList.contains('star')) {
                //star
                starObj = myMap.get(rockObj);
            } else if (childBlack != null) {
                //kick
                kickObj = myMap.get(rockObj);
            } else {
                simpleMoveObj.push(myMap.get(rockObj));
            }
        }
        console.log('kick ' + kickObj + ' star ' + starObj + ' fin ' + finObj + ' simple ' + simpleMoveObj.length)
        if (kickObj) {
            console.log('kick')
            nextEvent = 'kick';
            movedRock = kickObj.dotObj;
        } else if (starObj) {
            console.log('star')
            nextEvent = 'star';
            movedRock = starObj.dotObj;
        } else if (finObj) {
            console.log('fin')
            movedRock = finObj.dotObj;
        } else {
            const nextNewSq = document.querySelector('#w' + (moveSquares - 1));
            if (Math.random() >= 0.1 && !nextNewSq.querySelector(' *.white') && whiteRocksStack.length > 0) {
                //new rock
                console.log('new rock');
                movedRock = myMap.get(whiteRocksStack.pop()).dotObj;
                whiteRockObjInGame.push(movedRock);

            } else {
                const simpleObj = simpleMoveObj.pop()
                console.log('simple ' + simpleObj)
                movedRock = simpleObj.dotObj;
            }
        }
        let thisSquareId = myMap.get(movedRock).field;
        console.log(thisSquareId)
        if (thisSquareId === '#whiteFin') thisSquareNumber = 13;
        else if (thisSquareId === '#whiteStack') thisSquareNumber = -1;
        else thisSquareNumber = parseNumFromId(thisSquareId);
    }
    console.log('moved rock ' + myMap.get(movedRock).field + ' sqNum ' + (thisSquareNumber + moveSquares))
    moveFromTo(thisSquareNumber, thisSquareNumber + moveSquares, nextEvent)

}

function parseNumFromId(id) {
    const s = id.split(/(\d+)/);
    return parseInt(s[1])
}


// SOUND
function moveSoundFunc() {
    this.sound = document.createElement("audio");
    this.sound.src = 'move.wav';
    this.sound.setAttribute("preload", "auto");
    this.sound.setAttribute("controls", "none");
    this.sound.style.display = "none";
    document.body.appendChild(this.sound);
    this.play = function () {
        this.sound.play();
    }
}


// PROTOTYPES
String.prototype.replaceAll = function (search, replacement) {
    let target = this;
    return target.split(search).join(replacement);
};

Array.prototype.remove = function () {
    var what, a = arguments, L = a.length, ax;
    while (L && this.length) {
        what = a[--L];
        while ((ax = this.indexOf(what)) !== -1) {
            this.splice(ax, 1);
        }
    }
    return this;
};