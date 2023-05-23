import LaunchType from "./LaunchType.js";
import Vector from "./Vector.js";

export default class Game {
    static SIDE_WEIGHT = 100;
    static EXISTS = 0.1;
    static SHIP_SPACE = true;
    static HIT_FALLOFF = 0.05;
    static board = [];
    static totalShipProbs = [];
    static probs = [];
    static ships = "54332".split("").map(Number);
    static size = new Vector(10, 10);
    static resetBoard() {
        Game.board = new Array(Game.size.x);
        for (let i = 0; i < Game.size.y; i++) {
            let arr = new Array(Game.size.y);
            arr.fill(LaunchType.UNKOWN);
            Game.board[i] = arr;
        }
    }
    static init() {
        Game.resetBoard();
    }

    static get(i, j) {
        return Game.board[j][i];
    }

    static set(i, j, value) {
        return Game.board[j][i] = value;
    }

    static shipRay(x, y, dx, dy, length) {
        let og = length;
        let ev = 0;
        let hit = 1;
        while (true) {
            length--;
            if (length == 0)
                break;
            x += dx;
            y += dy;
            if (x < 0 || x >= Game.size.x || y < 0 || y >= Game.size.y)
                break;
            if (Game.get(x, y) == LaunchType.HIT)
                hit += Game.HIT_FALLOFF * length;
            if (Game.get(x, y) == LaunchType.MISS)
                break;
        }
        if (hit > 1)
            return Game.EXISTS + hit - 1;
        if (length == 0)
            return Game.EXISTS;
        return 0;
    }

    static allShips(x, y, length) {
        let total = 0;
        total += Game.shipRay(x, y, 0, 1, length);
        total += Game.shipRay(x, y, 1, 0, length);
        total += Game.shipRay(x, y, 0, -1, length);
        total += Game.shipRay(x, y, -1, 0, length);
        return total;
    }

    static calcProbs() {
        Game.totalShipProbs = new Array(Game.ships.length);
        Game.totalShipProbs.fill(0);
        Game.probs = new Array(Game.size.x);
        for (let i = 0; i < Game.size.y; i++) {
            let arr = new Array(Game.size.y);
            for (let j = 0; j < Game.size.x; j++) {
                arr[j] = new Array(Game.ships.length);
                arr[j].fill(0);
            }
            Game.probs[i] = arr;
        }

        for (let i = 0; i < Game.size.y; i++) {
            for (let j = 0; j < Game.size.x; j++) {
                Game.calcProb(i, j);
            }
        }

        console.log(Game.probs);
    }
    

    static getProb(x, y) {
        [x, y] = [x, y].map(Number);
        let CVK = {
            values: [],
            weights: [],
            add: function(value, weight = 1) {
                CVK.values.push(value);
                CVK.weights.push(weight);
            },
            compile: function() {
                let out = 0;
                let total = 0;
                for (let i in CVK.values) {
                    out += CVK.values[i] * CVK.weights[i];
                    total += CVK.weights[i];
                }
                return (out / total) * (Game.get(x, y) == LaunchType.UNKOWN);
            }
        }
        let dx = x - (Game.size.x/2 - 1);
        if (x > (Game.size.x/2 - 1))
            dx = x - Game.size.x/2;
        let dy = y -  (Game.size.y/2 - 1);
        if (y >(Game.size.y/2 - 1))
            dy = y - Game.size.y/2;
        let distCorner = new Vector(dx, dy).length() / new Vector(4, 4).length();
        CVK.add(distCorner, (Game.ships.length / 10) * Game.SIDE_WEIGHT / 2500);
        for (let i in Game.ships) {
            if (Game.totalShipProbs[i] == 0)
                continue;
            CVK.add(Game.probs[x][y][i] / Game.totalShipProbs[i]);
        }
        return CVK.compile();
    }

    static calcProb(x, y) {
        for (let i in Game.ships) {
            Game.totalShipProbs[i] += 
            Game.probs[x][y][i] = Game.allShips(x, y, Game.ships[i]);
        }
    }
}