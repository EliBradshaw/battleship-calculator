export default class Vector {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    length() {
        return (this.x ** 2 + this.y ** 2) ** 0.5;
    }
}