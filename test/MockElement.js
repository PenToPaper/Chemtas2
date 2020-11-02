export default class MockElement {
    constructor(id) {
        this.id = id;
        this.classes = "";
        this.innerHTML = "";
        this.children = [];
        this.attributes = {};
        this.events = {};
        this.addEventListener = jest.fn(this.addEvent.bind(this));
        this.removeEventListener = jest.fn(this.removeEvent.bind(this));
        this.setAttribute = jest.fn(this.setAttribute.bind(this));
        this.removeAttribute = jest.fn(this.removeAttribute.bind(this));
        this.focus = jest.fn();
        this.classList = {
            add: jest.fn(this.addClass.bind(this)),
            remove: jest.fn(this.removeClass.bind(this)),
            list: [],
        };
    }

    set className(name) {
        this.classes = name;
        this.classList.list = name.split(" ");
    }

    get className() {
        return this.classes;
    }

    addClass(className) {
        this.classes = this.classes + " " + className;
        this.classList.list.push(className);
    }

    removeClass(className) {
        this.classes = this.classes.replace(" " + className, "");
        this.classList.list.filter((filterClass) => filterClass !== className);
    }

    addEvent(eventName, handler) {
        this.events[eventName] = jest.fn(handler);
    }

    removeEvent(eventName) {
        delete this.events[eventName];
    }

    setAttribute(attribute, value) {
        this.attributes[attribute] = value;
    }

    removeAttribute(attribute) {
        delete this.attributes[attribute];
    }
}
