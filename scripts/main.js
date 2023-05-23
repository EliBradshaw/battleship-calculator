import Game from "./Game.js";
import GUI from "./GUI.js";
import LaunchType from "./LaunchType.js";
import Vector from "./Vector.js";

Game.init();

function tryMiss(x, y) {
    if (x >= 0 && x < Game.size.x && y >= 0 && y < Game.size.y)
        Game.board[x][y] = LaunchType.MISS;
}

function clearSquare(x, y) {
    x *= 1;
    y *= 1;
    if (Game.SHIP_SPACE) {
        tryMiss(x-1, y-1);
        tryMiss(x-1, y);
        tryMiss(x-1, y+1);
        tryMiss(x, y-1);
        tryMiss(x, y);
        tryMiss(x, y+1);
        tryMiss(x+1, y-1);
        tryMiss(x+1, y);
        tryMiss(x+1, y+1);
    }
    else
        tryMiss(x, y);
}
function explore(x, y, dx, dy, f = false) {
    let l = 0;
    if (x + dx < 0 || x + dx >= Game.size.x || y + dy < 0 || y + dy >= Game.size.y)
        return 0;
    if (Game.board[x + dx][y + dy] != LaunchType.HIT) {
        if (f)
            clearSquare(x, y);
        return 0;
    }

    l++;
    l += explore(x + dx, y + dy, dx, dy, true);
    clearSquare(x, y);
    return l;
}

GUI.hookChild('div', {}, board => {
    board.id = "board";
    Game.calcProbs();
    for (let i in Game.board) {
        for (let j in Game.board[i]) {
            let d = document.createElement('div');
            d.classList.add("cell");
            d.id = `${i},${j}`;
            d.innerText = Game.board[i][j];
            d.addEventListener('click', e => {
                Game.board[i][j]++;
                Game.board[i][j] %= LaunchType.COUNT;
                GUI.draw();
            });
            let prob = Game.getProb(j, i);
            d.innerHTML = Math.round(prob * 10000) / 100;
            switch (Game.board[i][j]) {
                case LaunchType.MISS:
                    d.style.background = "white";
                    break;
                case LaunchType.HIT:
                    d.style.background = "red";
                    break;
                default:
                    d.style.background = `rgb(0, ${prob*255*2}, ${200 - prob*200})`;
            }
            board.appendChild(d);
        }
    }
});
GUI.hook(canvas => {
    let best = {
        x: -1,
        y: -1,
        value: -1
    };
    for (let i in Game.board) {
        for (let j in Game.board[i]) {
            let v = Number(document.getElementById(`${i},${j}`).innerText);
            if (v > best.value) {
                best.x = i;
                best.y = j;
                best.value = v;
            }
        }
    }
    document.getElementById(`${best.x},${best.y}`).style.background = "purple";
});

GUI.hookChild('div', {}, div => div.innerText = "Lengths of Ships Left: ");

GUI.hookChild('input', {
        'change': e => {
            e.target.value = e.target.value.replace(/[^1-9]/g, "");
            if (e.target.value == "")
                e.target.value = 1;
            Game.ships = e.target.value.split("").map(Number);
            GUI.draw();
        }
    }, 
    shps => {
        shps.value = Game.ships.join("");
        shps.style.width = "80px";
    }
);

GUI.hookChild('div', {}, div => div.innerText = "Side Weight % (if board is random set to 0): ");

GUI.hookChild('input', {
        'change': e => {
            Game.SIDE_WEIGHT = Number(e.target.value);
            GUI.draw();
        }
    }, 
    side => {
        side.type = "number";
        side.style.width = "40px";
        side.value = Game.SIDE_WEIGHT;
        side.step = 1;
    }
)

GUI.hookChild('div', {}, div => div.innerText = "Board Size: ");

GUI.hookChild('input', {
        'change': e => {
            let sid = Math.min(Math.max(Number(e.target.value), 1), 25)
            Game.size = new Vector(sid, sid);
            document.documentElement.style.setProperty('--size', sid);
            Game.init();
            GUI.draw();
        }
    }, 
    // Write a comment telling vscode that side is of type HTML input
    /** @type {(side: HTMLInputElement) => void} */
    side => {
        side.type = "number";
        side.style.width = "40px";

        side.value = Game.size.x;
        side.step = 1;
        side.min = 1;
        side.max = 25;
    }
)

GUI.hookChild('button', {
        'click': e => {
            for (let i in Game.board) {
                for (let j in Game.board[i]) {
                    if (Game.board[i][j] == LaunchType.HIT) {
                        let v = 0;
                        v += explore(i*1, j*1, -1, 0);
                        v += explore(i*1, j*1, 0, 1);
                        v += explore(i*1, j*1, 1, 0);
                        v += explore(i*1, j*1, 0, -1);
                        if (v == 0)
                            clearSquare(i, j);
                        else {
                            let found = false;
                            Game.ships = Game.ships.filter(a=>{
                                if (!found)
                                    return !(found = (a == v+1));
                                return true;
                            });
                            if (Game.ships.length == 0)
                                Game.ships = [1];
                        }
                        GUI.draw();
                        return;
                    }
                }
            }
        }
    }, 
    but => but.innerText = "Ship sunk"
);

GUI.hookChild('button', {
        'click': e => {
            Game.SHIP_SPACE = !Game.SHIP_SPACE;
            GUI.draw();
        }
    },
    ship => ship.innerText = "Ship space: " + (Game.SHIP_SPACE ? "ON" : "OFF")
);

GUI.draw();