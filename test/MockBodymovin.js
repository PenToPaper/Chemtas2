export default class Bodymovin {
    constructor() {
        this.events = {};
        this.playSegments = jest.fn();
        this.addEventListener = jest.fn(this.addEvent.bind(this));
        this.removeEventListener = jest.fn(this.removeEvent.bind(this));
    }

    addEvent(eventName, handler) {
        this.events[eventName] = handler;
    }

    removeEvent(eventName) {
        delete this.events[eventName];
    }

    clearAllEvents() {
        this.events = {};
    }
}
