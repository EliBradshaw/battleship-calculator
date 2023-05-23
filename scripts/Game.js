import LaunchType from "./LaunchType.js";
import Vector from "./Vector.js";

export default class Game {
    static SIDE_WEIGHT = 100;
    static HIT_WEIGHT = 3;
    static HIT_FALLOFF = 0.5;
    static SHIP_SPACE = true;
    static board = [];
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
                hit += Game.HIT_FALLOFF;
            if (Game.get(x, y) == LaunchType.MISS)
                break;
        }
        if (hit > 1)
            return og*Game.HIT_WEIGHT*hit;
        if (length == 0)
            return og;
        return 0.1/length;
    }

    static allShips(x, y, length) {
        let total = 0;
        total += Game.shipRay(x, y, 0, 1, length);
        total += Game.shipRay(x, y, 1, 0, length);
        total += Game.shipRay(x, y, 0, -1, length);
        total += Game.shipRay(x, y, -1, 0, length);
        return total / (length * 4 * Game.HIT_WEIGHT * (1+(length-1)*Game.HIT_FALLOFF));
    }

    static calcProb(x, y) {
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
        CVK.add(distCorner, (Game.ships.length / 10) * Game.SIDE_WEIGHT / 300);
        for (let ship of Game.ships)
            CVK.add(Game.allShips(x, y, ship));
        return CVK.compile();
    }
}