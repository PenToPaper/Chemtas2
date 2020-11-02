import NavButton from "../src/js/NavButton";
import MockElement from "./MockElement";

describe("NavButton", () => {
    const element = new MockElement();
    const onKeyDown = jest.fn();
    const onClick = jest.fn();
    const navButton = new NavButton(element, 2, onKeyDown, onClick);

    it("Binds event handlers on initialization", () => {
        expect(Object.keys(element.events)).toHaveLength(2);
        expect(typeof element.events["keydown"] === "function").toEqual(true);
        expect(typeof element.events["click"] === "function").toEqual(true);

        element.events["keydown"]("MockEvent");
        expect(onKeyDown).toHaveBeenCalledWith("MockEvent", 2);

        element.events["click"]("MockEvent");
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

    it("Calls element's setAttribute method when aria-expanded method called", () => {
        navButton.ariaExpanded(true);
        expect(element.setAttribute).toHaveBeenLastCalledWith("aria-expanded", "true");

        navButton.ariaExpanded(false);
        expect(element.setAttribute).toHaveBeenLastCalledWith("aria-expanded", "false");
    });
});
