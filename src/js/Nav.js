import NavButton from "./NavButton";
import utils from "./utils";

// Object for entire navbar
export default class Nav {
    constructor(onActiveChange, element) {
        // Callback for when the user clicks or uses keyboard to change the active article
        this.onActiveChangeCallback = onActiveChange;
        // DOM Element reference
        this.element = element;
        // Array of NavButton objects
        this.articleButtons = [];
        // Tracks if the mini nav isopen
        this.miniNavOpen = false;

        this.onButtonKeyDown = this.onButtonKeyDown.bind(this);
        this.onButtonClick = this.onButtonClick.bind(this);
        this.onWindowWidth = this.onWindowWidth.bind(this);
        this.onActiveChange = this.onActiveChange.bind(this);
        this.handleMiniNavOpen = this.handleMiniNavOpen.bind(this);

        // Populate this.articleButtons with NavButton objects
        var buttonElements = element.querySelectorAll(".timeline-node");

        for (var i = 0; i < buttonElements.length; i++) {
            this.articleButtons.push(new NavButton(buttonElements[i], i, this.onButtonKeyDown, this.onButtonClick));
        }

        // Bind window width event handler
        this.onWindowWidth();
        window.addEventListener("resize", this.onWindowWidth);

        // Bind mini nav toggle button
        utils.collectionBind(document.getElementsByClassName("logo-mark-container"), "click", this.handleMiniNavOpen);
    }

    // When the active article changes. Element represents the button that was selected
    onActiveChange(element) {
        this.onActiveChangeCallback(element);
        this.miniNavOpen = false;
        this.handleMiniNavOpenUpdate();
        this.navButtonAria(element.getAttribute("data-article"));
    }

    // Changes timeline node buttons from aria-expanded = "false" to aria-expanded = "true" to reflect the article currently visible
    navButtonAria(article) {
        var nodes = document.getElementsByClassName("timeline-node");
        for (var i = 0; i < nodes.length; i++) {
            nodes[i].setAttribute("aria-expanded", "false");
        }

        document.getElementById(article + "-node").setAttribute("aria-expanded", "true");
    }

    // Updates local mini nav state, and calls function to update DOM
    handleMiniNavOpen() {
        this.miniNavOpen = !this.miniNavOpen;
        this.handleMiniNavOpenUpdate();
    }

    // Updates the mini nav class in the dom. Called after this.miniNavOpen is updated
    handleMiniNavOpenUpdate() {
        var body = document.getElementsByTagName("body");
        if (body.length === 0) {
            return false;
        }

        // Make sure timeline nodes are tabbable if the menu is open
        var timelineNodes = document.getElementsByClassName("timeline-node");
        for (var i = 0; i < timelineNodes.length; i++) {
            timelineNodes[i].setAttribute("tabindex", this.miniNavOpen ? "0" : "-1");
        }

        body[0].className = this.miniNavOpen ? "mini-nav-open" : "";

        this.element.getElementsByClassName("logo-mark-container")[0].setAttribute("aria-expanded", this.miniNavOpen);
        // if isCollapsedMenu is true and the mini nav is closed, output true
        // if isCollapsedMenu is true and the mini nav is open, output false
        // if isCollapsedMenu is false, output false
        document.getElementById("nav-contents").setAttribute("aria-hidden", window.innerWidth <= 1200 && !this.miniNavOpen ? "true" : "false");
    }

    // Handler for adjusting DOM based on window width.
    // Changes tabIndex on buttons, mini nav state, and aria properties of nav
    onWindowWidth() {
        var isCollapsedMenu = window.innerWidth <= 1200;

        for (var i = 0; i < this.articleButtons.length; i++) {
            this.articleButtons[i].tabIndex(!isCollapsedMenu);
        }

        if (!isCollapsedMenu) {
            this.miniNavOpen = false;
            document.getElementsByTagName("body")[0].className = "";
        }

        // if isCollapsedMenu is true and the mini nav is closed, output true
        // if isCollapsedMenu is true and the mini nav is open, output false
        // if isCollapsedMenu is false, output false
        document.getElementById("nav-contents").setAttribute("aria-hidden", isCollapsedMenu && !this.miniNavOpen ? "true" : "false");
    }

    // Handles a nav button's key down event firing
    onButtonKeyDown(event, index) {
        var stopFlag = false;
        switch (event.keyCode) {
            // 32 = space
            // 13 = enter
            case 32:
            case 13:
                this.onActiveChange(event.target);
                stopFlag = true;
                break;
            // 39 = arrow right
            // 40 = arrow down
            case 39:
            case 40:
                this.focusNext(index);
                stopFlag = true;
                break;
            // 37 = arrow left
            // 38 = arrow up
            case 37:
            case 38:
                this.focusPrev(index);
                stopFlag = true;
                break;
            // 35 = end
            case 35:
                this.focusLast();
                stopFlag = true;
                break;
            // 36 = home
            case 36:
                this.focusFirst();
                stopFlag = true;
                break;
        }
        if (stopFlag) {
            event.preventDefault();
            event.stopPropagation();
        }
    }

    // Handles when a NavButton's onClick event fires
    onButtonClick(event, element) {
        this.onActiveChange(event.target.closest(".timeline-node"));
    }

    // Focuses the nth NavButton
    focus(n) {
        this.articleButtons[n].focus();
    }

    // Focuses the next NavButton
    focusNext(n) {
        this.focus(n + 1 >= this.articleButtons.length ? 0 : n + 1);
    }

    // Focuses the prev NavButton
    focusPrev(n) {
        this.focus(n - 1 < 0 ? this.articleButtons.length - 1 : n - 1);
    }

    // Focuses the first NavButton
    focusFirst() {
        this.focus(0);
    }

    // Focuses the last NavButton
    focusLast() {
        this.focus(this.articleButtons.length - 1);
    }
}
