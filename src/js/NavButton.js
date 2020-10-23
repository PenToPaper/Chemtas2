// Object for individual nav buttons
// Binds event handlers, tracks its index, and provides a focus method
export default class NavButton {
    // element = the element object in the dom
    // index = the index of this button relative to the rest of the navbar
    // onKeyDown = fired with (event, index) on key down
    // onClick = fired with (event, index) on click
    constructor(element, index, onKeyDown, onClick) {
        this.element = element;
        this.index = index;

        this.focus = this.focus.bind(this);

        // Instead of (event), calls onKeyDown with (event, index)
        // Not entirely necessary for click handler, but could be used in the future
        element.addEventListener("keydown", function (event) {
            return onKeyDown(event, index);
        });
        element.addEventListener("click", function (event) {
            return onClick(event, index);
        });
    }

    // for parent classes
    focus() {
        return this.element.focus();
    }

    tabIndex(isTabbable) {
        return this.element.setAttribute("tabindex", isTabbable ? "0" : "-1");
    }
}
