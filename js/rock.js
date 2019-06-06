class Rock {
    dotObj;
    parentObj;
    color;
    field;
    target;

    constructor(color, dotObj, parent, field) {
        this.dotObj = dotObj;
        this.color = color;
        this.field = field;
        this.parentObj = parent;
    }

    set parentObj(parent) {
        this.parentObj = parent;
    }

    set field(field) {
        this.field = field;
    }

    get field() {
        return this.field;
    }

    get parentObj() {
        return this.parentObj;
    }

    get dotObj() {
        return this.dotObj;
    }

    set dotObj(dotObj) {
        this.dotObj = dotObj;
    }

    get color() {
        return this.color;
    }

    set target(target) {
        this.target = target;
    }

    get target() {
        return this.target;
    }


}