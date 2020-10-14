// onload
document.addEventListener("DOMContentLoaded", function (event) {
    var chemTAS = new ChemTAS("none", "atom-evolution", "../assets/atomevolution.json");
    chemTAS.init();
});

// Helper function for binding a collection of HTMLElements to an event handler
function collectionBind(collection, listenerType, func) {
    for (var i = 0; i < collection.length; i++) {
        collection[i].addEventListener(listenerType, function (event) {
            return func(event, this);
        });
    }
}

// Object for individual nav buttons
// Binds event handlers, tracks its index, and provides a focus method
class NavButton {
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

// Object for entire navbar
class Nav {
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
        collectionBind(document.getElementsByClassName("logo-mark-container"), "click", this.handleMiniNavOpen);
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
        document.getElementById("nav-contents").setAttribute("aria-hidden", isCollapsedMenu && !this.miniNavOpen ? "true" : "false");
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

// Wrapper object for the bodymovin animation.
class AtomAnimation {
    constructor(elementId, jsonLocation) {
        // Static

        // Binding functions
        this.handleEnterFrame = this.handleEnterFrame.bind(this);

        // Each key represents a scientist
        // Array[0] = first frame where that scientist's work is being animated in
        // Array[1] = first frame where the scientist's work animation is complete
        this.scientistFrames = {
            democritus: [0, 20],
            dalton: [40, 61],
            thomson: [80, 110],
            rutherford: [120, 180],
            bohr: [200, 260],
            schrodinger: [280, 319],
        };
        this.scientistOrder = ["democritus", "dalton", "thomson", "rutherford", "bohr", "schrodinger"];

        // Assigned on construction, not changed afterwards
        this.elementId = elementId;
        this.jsonLocation = jsonLocation;
        this.animation = bodymovin.loadAnimation({
            container: document.getElementById(this.elementId),
            renderer: "svg",
            loop: false,
            autoplay: false,
            path: this.jsonLocation,
        });

        // Dynamic
        // If animation is being played, the currently displayed model. If none being played, false
        this.playing = false;
        // The start frame number of the last animation that was played. Used to calculate current frame with Lottie/Bodymovin
        this.lastStartFrame = 0;
    }

    // Plays from one scientist in the list to another scientist in the list. Works forwards and backwards.
    // callback called on completion of the animation segment
    // transitionScientistCallback called when during an animation a model of a different scientist is animated to. Gets passed the new scientist's name
    playFrom(scientistFrom, scientistTo, callback, transitionScientistCallback) {
        // Makes sure the scientists passed are valid
        if (!this.scientistOrder.concat(["none"]).includes(scientistFrom) || !this.scientistOrder.includes(scientistTo)) {
            return false;
        }

        // Plays the segments
        if (scientistFrom === scientistTo) {
            this.animation.playSegments([this.scientistFrames[scientistFrom][0], this.scientistFrames[scientistTo][1]], true);
            this.lastStartFrame = this.scientistFrames[scientistFrom][0];
        } else if (scientistFrom === "none") {
            this.animation.playSegments([this.scientistFrames[this.scientistOrder[0]][0], this.scientistFrames[scientistTo][1]], true);
            this.lastStartFrame = 0;
            scientistFrom = this.scientistOrder[0];
        } else {
            this.animation.playSegments([this.scientistFrames[scientistFrom][1], this.scientistFrames[scientistTo][1]], true);
            this.lastStartFrame = this.scientistFrames[scientistFrom][1];
        }

        // Helper local functions for callbacks
        var onComplete = function () {
            this.playing = false;
            callback();
        }.bind(this);

        var onEnterFrame = function (event) {
            this.handleEnterFrame(event, transitionScientistCallback);
        }.bind(this);

        this.playing = scientistFrom;
        this.animation.removeEventListener("enterFrame", onEnterFrame);
        this.animation.removeEventListener("complete", onComplete);
        this.animation.addEventListener("complete", onComplete);
        if (transitionScientistCallback) {
            this.animation.addEventListener("enterFrame", onEnterFrame);
            transitionScientistCallback(this.playing);
        }
    }

    // Helper function for finding last scientist based on argument. Does not assume this.playing Returns false if there is no last scientist.
    getLastScientist(scientistName) {
        var currentScientistIndex = this.scientistOrder.indexOf(scientistName);
        // Checks if we've gone below an index of 0
        if (currentScientistIndex - 1 < 0) {
            return false;
        }
        var lastScientistIndex = currentScientistIndex - 1;
        return this.scientistOrder[lastScientistIndex];
    }

    // Helper function for finding next scientist based on argument. Does not assume this.playing. Returns false if there is no next scientist.
    getNextScientist(scientistName) {
        var currentScientistIndex = this.scientistOrder.indexOf(this.playing);
        // Checks if we've exceeded the # of scientists in the list
        if (currentScientistIndex < 0 || currentScientistIndex + 1 >= this.scientistOrder.length) {
            return false;
        }
        var nextScientistIndex = currentScientistIndex + 1;
        return this.scientistOrder[nextScientistIndex];
    }

    handleEnterFrame(event, callback) {
        if (event.direction === 1) {
            // Moving forward
            var nextScientist = this.getNextScientist(this.playing);

            /**
             * Based on the model:
             *
             * 0   20   40   60   80   100   110
             * Democr   DaltonD   ThomsonThomson
             * -------->
             *
             * If moving from this direction, we want this if statement to be true when the current frame passes the next scientist's first frame
             */

            if (nextScientist !== false) {
                if (this.scientistFrames[nextScientist][0] <= this.lastStartFrame + event.currentTime) {
                    this.playing = nextScientist;
                    callback(this.playing);
                }
            }
        } else {
            // Moving backward
            var lastScientist = this.getLastScientist(this.playing);

            /**
             * Based on the model:
             *
             * 0   20   40   60   80   100   110
             * Democr   DaltonD   ThomsonThomson
             *          <------
             *
             * If moving from this direction, we want this if statement to be true when the current frame passes the current scientist's first frame
             */

            if (lastScientist !== false) {
                if (this.scientistFrames[this.playing][0] >= this.lastStartFrame - event.totalTime + event.currentTime) {
                    this.playing = lastScientist;
                    callback(this.playing);
                }
            }
        }
    }
}

// Full application state managing class
class ChemTAS {
    constructor(activeScientist, animationElementId, animationPath) {
        // Static

        // Delay for how long an animation stays on its last frame before article begins to show
        this.delay = 333;

        // Binding functions
        this.handleScientistButton = this.handleScientistButton.bind(this);

        // Assigned on construction
        this.atomAnimation = new AtomAnimation(animationElementId, animationPath);
        this.nav = new Nav(this.handleScientistButton, document.getElementsByTagName("nav")[0]);

        // Dynamic
        this.activeScientist = activeScientist;
        this.miniNavLockTimeout = null;
    }

    // Handles a sidebar control button selection
    handleScientistButton(element) {
        var prevActiveScientist = this.activeScientist.slice();
        this.activeScientist = element.getAttribute("data-article");

        this.changeActiveScientist(this.activeScientist);
        this.hideAllArticles();
        this.showAnimation();
        this.atomAnimation.playFrom(prevActiveScientist, this.activeScientist, this.handleAnimationDone.bind(this), this.handleScientistTransition.bind(this));
    }

    // Locks the nav from transitioning when animation is playing
    handleNavLock() {
        var nav = document.getElementsByTagName("nav");
        if (nav.length === 0) {
            return false;
        }
        nav[0].className = "animation-locked";
        this.miniNavLockTimeout = setTimeout(this.handleNavUnlock.bind(this), 500);
    }

    // Unlocks the nav, called after 500ms of not resizing window
    handleNavUnlock() {
        var nav = document.getElementsByTagName("nav");
        if (nav.length === 0) {
            return false;
        }
        nav[0].className = "";
    }

    // Handles a point in the animation where a scientist's model transitions into another scientists's model.
    // Changes animation background color
    // Changes animation header text
    handleScientistTransition(newScientist) {
        var animation = document.getElementById(this.atomAnimation.elementId + "-container");
        animation.className = newScientist + "-animation";
        var newScientistLabel = newScientist.charAt(0).toUpperCase() + newScientist.slice(1);
        animation.children[0].innerHTML = newScientistLabel;
    }

    // Shows the animation html object
    showAnimation() {
        var onboarding = document.getElementById("onboarding");
        onboarding.className = "hidden";
        var animation = document.getElementById(this.atomAnimation.elementId + "-container");
        animation.className = this.activeScientist + "-animation";
    }

    // Changes the active scientist in the sidebar, making the circle filled with the appropriate color
    changeActiveScientist(activeScientist) {
        var sidebarNodes = document.getElementsByClassName("timeline-node");
        for (var i = 0; i < sidebarNodes.length; i++) {
            sidebarNodes[i].className = sidebarNodes[i].className.replace(/\s?timeline-node-selected\s?/, "");
            if (sidebarNodes[i].id == activeScientist + "-node") {
                sidebarNodes[i].className = sidebarNodes[i].className + " timeline-node-selected";
            }
        }
    }

    // Makes the activeScientist article visible. DOES NOT HIDE OTHER ARTICLES. SEE this.hideAllArticles
    changeActiveArticle(activeScientist) {
        var articles = document.getElementsByTagName("article");
        for (var i = 0; i < articles.length; i++) {
            if (articles[i].id == activeScientist + "-article") {
                articles[i].className = "";
                articles[i].setAttribute("aria-hidden", "false");
            }
        }
    }

    // Hides all articles
    hideAllArticles() {
        var articles = document.getElementsByTagName("article");
        for (var i = 0; i < articles.length; i++) {
            articles[i].className = "article-hidden";
            articles[i].setAttribute("aria-hidden", "true");
        }
    }

    // Hides the animation, does not remove color as animation happens
    hideAnimation() {
        var animation = document.getElementById(this.atomAnimation.elementId + "-container");
        var newClassName = animation.className.replace(" hidden", "");
        animation.className = newClassName + " hidden";
    }

    // Event handler for animation complete, cleans up (shows active article + hides animation)
    // Uses this.delay static variable to delay the clean up
    handleAnimationDone() {
        setTimeout(
            function () {
                this.changeActiveArticle(this.activeScientist);
                this.hideAnimation();
            }.bind(this),
            this.delay
        );
    }

    // Init, shows the animation, initializes this.atomAnimation, binds event handlers
    init() {
        window.addEventListener("resize", this.handleNavLock.bind(this));
    }
}
