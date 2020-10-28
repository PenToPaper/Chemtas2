import utils from "../src/js/utils";

describe("collectionBind", () => {
    class MockElement {
        constructor() {
            this.events = {};
            this.addEventListener.bind(this);
        }

        addEventListener(eventType, handler) {
            this.events[eventType] = handler;
        }
    }
    const handler = jest.fn();
    const collection = [new MockElement(), new MockElement(), new MockElement()];

    it("Binds an event handler for each element in a collection", () => {
        utils.collectionBind(collection, "click", handler);

        for (let i = 0; i < collection.length; i++) {
            expect(Object.keys(collection[i].events)).toHaveLength(1);
            expect(typeof collection[i].events["click"]).toEqual("function");
            collection[i].events["click"]("MockEvent");
            expect(handler).toHaveBeenCalledTimes(i + 1);
            expect(handler).toHaveBeenLastCalledWith("MockEvent");
        }
    });
});
