import NavButton from "../src/js/NavButton";

describe("NavButton", () => {
    const eventListeners = {};
    const element = {
        addEventListener: jest.fn((eventName, callback) => {
            eventListeners[eventName] = callback;
        }),
        focus: jest.fn(),
        setAttribute: jest.fn(),
    };
    const onKeyDown = jest.fn();
    const onClick = jest.fn();
    const navButton = new NavButton(element, 2, onKeyDown, onClick);

    it("Binds event handlers on initialization", () => {
        expect(Object.keys(eventListeners)).toHaveLength(2);
        expect(typeof eventListeners["keydown"] === "function").toEqual(true);
        expect(typeof eventListeners["click"] === "function").toEqual(true);

        eventListeners["keydown"]("MockEvent");
        expect(onKeyDown).toHaveBeenCalledWith("MockEvent", 2);

        eventListeners["click"]("MockEvent");
        expect(onKeyDown).toHaveBeenCalledWith("MockEvent", 2);
    });

    it("Calls element's focus method when class focus method called", () => {
        navButton.focus();
        expect(element.focus).toHaveBeenCalled();
    });

    it("Calls element's setAttribute method when tabIndex method called", () => {
        navButton.tabIndex(true);
        expect(element.setAttribute).toHaveBeenLastCalledWith("tabindex", "0");

        navButton.tabIndex(false);
        expect(element.setAttribute).toHaveBeenLastCalledWith("tabindex", "-1");
    });
});
