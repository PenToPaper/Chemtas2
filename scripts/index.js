// onload
document.addEventListener("DOMContentLoaded", function(event) {
    var chemTAS = new ChemTAS("none", "atom-evolution", "../assets/atomevolution.json");
    chemTAS.init();
});

// Helper function for binding a collection of HTMLElements to an event handler
function collectionBind(collection, listenerType, func) {
    for (var i = 0; i < collection.length; i++) {
        collection[i].addEventListener(listenerType, function(event) {
            return func(event, this);
        });
    }
}

// Object for individual nav buttons
// Binds event handlers, tracks its index, and provides a focus method
class NavButton {
    constructor(element, index, onKeyDown, onClick) {
        this.element = element;
        this.index = index;
    
        this.onKeyDown = (function(event) {
            onKeyDown(event, this.index)
        }).bind(this);

        this.onClick = (function(event) {
            onClick(event, this.index)
        }).bind(this);

        this.focus = this.focus.bind(this);
    
        element.addEventListener("keydown", function(event) {
            return onKeyDown(event, index);
        })
        element.addEventListener("click", function(event) {
            return onClick(event, index);
        })
    }

    focus() {
        return this.element.focus();
    }
}

// Object for entire navbar
class Nav {
    constructor(onActiveChange, element) {
        this.onActiveChange = onActiveChange;
        this.element = element;
        this.articleButtons = [];
    
        this.onButtonKeyDown = this.onButtonKeyDown.bind(this);
        this.onButtonClick = this.onButtonClick.bind(this);
    
        // Populate this.articleButtons with NavButton objects
        var buttonElements = element.querySelectorAll(".timeline-node");
        for (var i = 0; i < buttonElements.length; i++) {
           this.articleButtons.push(new NavButton(buttonElements[i], i, this.onButtonKeyDown, this.onButtonClick))
        }
    }

    onButtonKeyDown(event, index) {
        var stopFlag = false;
        switch(event.keyCode) {
            // 32 = space
            // 13 = enter
            case 32:
            case 13:
                this.onActiveChange(event.target);
                stopFlag = true
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

    onButtonClick(event, element) {
        this.onActiveChange(event.target.closest(".timeline-node"));
    }

    focus(n) {
        this.articleButtons[n].focus();
    }

    focusNext(n) {
        this.focus(n + 1 >= this.articleButtons.length ? 0 : n + 1);
    }

    focusPrev(n) {
        this.focus(n - 1 < 0 ? this.articleButtons.length - 1 : n - 1);
    }

    focusFirst() {
        this.focus(0);
    }

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
            schrodinger: [280, 319]
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
            path: this.jsonLocation
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
        var onComplete = function() {
            this.playing = false;
            callback();
        }.bind(this);

        var onEnterFrame = function(event) {
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
    };

    // Helper function for finding last scientist based on argument. Does not assume this.playing Returns false if there is no last scientist.
    getLastScientist(scientistName) {
        var currentScientistIndex = this.scientistOrder.indexOf(scientistName);
        // Checks if we've gone below an index of 0
        if (currentScientistIndex - 1 < 0) {
            return false;
        }
        var lastScientistIndex = currentScientistIndex - 1;
        return this.scientistOrder[lastScientistIndex];
    };

    // Helper function for finding next scientist based on argument. Does not assume this.playing. Returns false if there is no next scientist.
    getNextScientist(scientistName) {
        var currentScientistIndex = this.scientistOrder.indexOf(this.playing);
        // Checks if we've exceeded the # of scientists in the list
        if (currentScientistIndex < 0 || currentScientistIndex + 1 >= this.scientistOrder.length) {
            return false;
        }
        var nextScientistIndex = currentScientistIndex + 1;
        return this.scientistOrder[nextScientistIndex];
    };

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
    };
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
        this.nav = new Nav(this.handleScientistButton, document.getElementsByTagName("nav")[0])

        // Dynamic
        this.activeScientist = activeScientist;
        this.miniNavOpen = false;
        this.miniNavLockTimeout = null;
    }

    // Handles a sidebar control button selection
    handleScientistButton(element) {
        var prevActiveScientist = this.activeScientist.slice();
        this.activeScientist = element.getAttribute("data-article");

        this.miniNavOpen = false;
        this.handleMiniNavOpenUpdate();

        this.changeActiveScientist(this.activeScientist);
        this.hideAllArticles();
        this.showAnimation();
        this.navButtonAria();
        this.atomAnimation.playFrom(prevActiveScientist, this.activeScientist, this.handleAnimationDone.bind(this), this.handleScientistTransition.bind(this));
    };

    // Changes timeline node buttons from aria-expanded = "false" to aria-expanded = "true" to reflect the article currently visible
    navButtonAria() {
        var nodes = document.getElementsByClassName("timeline-node");
        for (var i = 0; i < nodes.length; i++) {
            nodes[i].setAttribute("aria-expanded", "false");
        }
        
        document.getElementById(this.activeScientist + "-node").setAttribute("aria-expanded", "true")
    }

    // Binds this.handleMiniNavOpen to the mini logo being clicked
    bindMiniNavOpen() {
        collectionBind(document.getElementsByClassName("logo-mark-container"), "click", this.handleMiniNavOpen.bind(this));
    };

    // Toggles the hidden nav menu
    handleMiniNavOpen(event, element) {
        this.miniNavOpen = !this.miniNavOpen;
        this.handleMiniNavOpenUpdate();
    };

    // Updates the mini nav class in the dom. Called after this.miniNavOpen is updated
    handleMiniNavOpenUpdate() {
        var body = document.getElementsByTagName("body");
        if (body.length === 0) {
            return false;
        }

        if (this.miniNavOpen) {
            body[0].className = "mini-nav-open";
        } else {
            body[0].className = "";
        }
    };

    // Locks the nav from transitioning when
    handleNavLock() {
        var nav = document.getElementsByTagName("nav");
        if (nav.length === 0) {
            return false;
        }
        nav[0].className = "animation-locked";
        this.miniNavLockTimeout = setTimeout(this.handleNavUnlock.bind(this), 500);
    };

    // Unlocks the nav, called after 500ms of not resizing window
    handleNavUnlock() {
        var nav = document.getElementsByTagName("nav");
        if (nav.length === 0) {
            return false;
        }
        nav[0].className = "";
    };

    // Handles a point in the animation where a scientist's model transitions into another scientists's model.
    // Changes animation background color
    // Changes animation header text
    handleScientistTransition(newScientist) {
        var animation = document.getElementById(this.atomAnimation.elementId + "-container");
        animation.className = newScientist + "-animation";
        var newScientistLabel = newScientist.charAt(0).toUpperCase() + newScientist.slice(1);
        animation.children[0].innerHTML = newScientistLabel;
    };

    // Shows the animation html object
    showAnimation() {
        var onboarding = document.getElementById("onboarding");
        onboarding.className = "hidden";
        var animation = document.getElementById(this.atomAnimation.elementId + "-container");
        animation.className = this.activeScientist + "-animation";
    };

    // Changes the active scientist in the sidebar, making the circle filled with the appropriate color
    changeActiveScientist(activeScientist) {
        var sidebarNodes = document.getElementsByClassName("timeline-node");
        for (var i = 0; i < sidebarNodes.length; i++) {
            sidebarNodes[i].className = sidebarNodes[i].className.replace(/\s?timeline-node-selected\s?/, "");
            if (sidebarNodes[i].id == activeScientist + "-node") {
                sidebarNodes[i].className = sidebarNodes[i].className + " timeline-node-selected";
            }
        }
    };

    // Makes the activeScientist article visible. DOES NOT HIDE OTHER ARTICLES. SEE this.hideAllArticles
    changeActiveArticle(activeScientist) {
        var articles = document.getElementsByTagName("article");
        for (var i = 0; i < articles.length; i++) {
            if (articles[i].id == activeScientist + "-article") {
                articles[i].className = "";
            }
        }
    };

    // Hides all articles
    hideAllArticles() {
        var articles = document.getElementsByTagName("article");
        for (var i = 0; i < articles.length; i++) {
            articles[i].className = "article-hidden";
        }
    };

    // Hides the animation, does not remove color as animation happens
    hideAnimation() {
        var animation = document.getElementById(this.atomAnimation.elementId + "-container");
        var newClassName = animation.className.replace(" hidden", "");
        animation.className = newClassName + " hidden";
    };

    // Event handler for animation complete, cleans up (shows active article + hides animation)
    // Uses this.delay static variable to delay the clean up
    handleAnimationDone() {
        setTimeout(
            function() {
                this.changeActiveArticle(this.activeScientist);
                this.hideAnimation();
            }.bind(this),
            this.delay
        );
    };

    // Init, shows the animation, initializes this.atomAnimation, binds event handlers
    init() {
        this.bindMiniNavOpen();
        window.addEventListener("resize", this.handleNavLock.bind(this));
    };
}
