// onload
document.addEventListener("DOMContentLoaded", function(event) {
    var chemTAS = new ChemTAS("democritus", "atom-evolution", "../assets/atomevolution.json");
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

// Wrapper object for the bodymovin animation.
function AtomAnimation(elementId, jsonLocation) {
    // Static

    // Each key represents a scientist
    // Array[0] = first frame where that scientist's work is being animated in
    // Array[1] = first frame where the scientist's work animation is complete
    this.scientistFrames = {
        democritus: [0, 20],
        dalton: [40, 60],
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
    // The last scientist that an animation was played from. Used to calculate current frame with Lottie/Bodymovin
    this.lastScientistFrom = "democritus";

    // Plays from one scientist in the list to another scientist in the list. Works forwards and backwards.
    // callback called on completion of the animation segment
    // transitionScientistCallback called when during an animation a model of a different scientist is animated to. Gets passed the new scientist's name
    this.playFrom = function(scientistFrom, scientistTo, callback, transitionScientistCallback) {
        // Makes sure the scientists passed are valid
        if (!(scientistFrom in this.scientistFrames) || !(scientistTo in this.scientistFrames)) {
            return false;
        }

        // Plays the segments
        if (scientistFrom == scientistTo) {
            this.animation.playSegments([this.scientistFrames[scientistFrom][0], this.scientistFrames[scientistTo][1]], true);
        } else {
            this.animation.playSegments([this.scientistFrames[scientistFrom][1], this.scientistFrames[scientistTo][1]], true);
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
        this.lastScientistFrom = scientistFrom;
        this.animation.removeEventListener("enterFrame", onEnterFrame);
        this.animation.removeEventListener("complete", onComplete);
        this.animation.addEventListener("complete", onComplete);
        if (transitionScientistCallback) {
            this.animation.addEventListener("enterFrame", onEnterFrame);
            transitionScientistCallback(this.playing);
        }
    };

    this.handleEnterFrame = function(event, callback) {
        if (event.direction == 1) {
            // Moving forward
            var currentScientistIndex = this.scientistOrder.indexOf(this.playing);
            // Checks if we've exceeded the # of scientists in the list
            if (currentScientistIndex < 0 || currentScientistIndex + 1 >= this.scientistOrder.length) {
                return false;
            }
            var nextScientistIndex = currentScientistIndex + 1;

            /**
             * Based on the model:
             *
             * 0   20   40   60   80   100   110
             * Democr   DaltonD   ThomsonThomson
             * -------->
             *
             * If moving from this direction, we want this if statement to be true when the current frame passes the next scientist's first frame
             */
            if (this.scientistFrames[this.scientistOrder[nextScientistIndex]][0] <= this.scientistFrames[this.lastScientistFrom][1] + event.currentTime) {
                this.playing = this.scientistOrder[nextScientistIndex];
                callback(this.playing);
            }
        } else {
            // Moving backward
            var currentScientistIndex = this.scientistOrder.indexOf(this.playing);
            // Checks if we've gone below an index of 0
            if (currentScientistIndex - 1 < 0) {
                return false;
            }
            var lastScientistIndex = currentScientistIndex - 1;

            /**
             * Based on the model:
             *
             * 0   20   40   60   80   100   110
             * Democr   DaltonD   ThomsonThomson
             *          <------
             *
             * If moving from this direction, we want this if statement to be true when the current frame passes the current scientist's first frame
             */
            if (this.scientistFrames[this.playing][0] >= this.scientistFrames[this.lastScientistFrom][1] - event.totalTime + event.currentTime) {
                this.playing = this.scientistOrder[lastScientistIndex];
                callback(this.playing);
            }
        }
    };
    this.handleEnterFrame = this.handleEnterFrame.bind(this);

    // Init function, listens for when animation is loaded, then plays first scientist animation
    this.init = function(activeScientist, callback) {
        this.animation.addEventListener(
            "DOMLoaded",
            function() {
                this.playFrom(activeScientist, activeScientist, callback);
            }.bind(this)
        );
    };
}

// Full application state managing class
function ChemTAS(activeScientist, animationElementId, animationPath) {
    // Static

    // Delay for how long an animation stays on its last frame before article begins to show
    this.delay = 333;

    // Assigned on construction
    this.atomAnimation = new AtomAnimation(animationElementId, animationPath);

    // Dynamic
    this.activeScientist = activeScientist;
    this.miniNavOpen = false;

    // Binds controls on sidebar
    this.bindScientistButtons = function() {
        collectionBind(document.getElementsByClassName("timeline-node"), "click", this.handleScientistButton.bind(this));
    };

    // Handles a sidebar control button selection
    this.handleScientistButton = function(event, element) {
        var prevActiveScientist = this.activeScientist.slice();
        this.activeScientist = element.getAttribute("data-article");

        this.miniNavOpen = false;
        this.handleMiniNavOpenUpdate();

        this.changeActiveScientist(this.activeScientist);
        this.hideAllArticles();
        this.showAnimation();
        this.atomAnimation.playFrom(prevActiveScientist, this.activeScientist, this.handleAnimationDone.bind(this), this.handleScientistTransition.bind(this));
    };

    this.bindMiniNavOpen = function() {
        collectionBind(document.getElementsByClassName("logo-mark-container"), "click", this.handleMiniNavOpen.bind(this));
    };

    this.handleMiniNavOpen = function(event, element) {
        this.miniNavOpen = !this.miniNavOpen;
        this.handleMiniNavOpenUpdate();
    };

    this.handleMiniNavOpenUpdate = function() {
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

    // Handles a point in the animation where a scientist's model transitions into another scientists's model.
    // Changes animation background color
    // Changes animation header text
    this.handleScientistTransition = function(newScientist) {
        var animation = document.getElementById(this.atomAnimation.elementId + "-container");
        animation.className = newScientist + "-animation";
        var newScientistLabel = newScientist.charAt(0).toUpperCase() + newScientist.slice(1);
        animation.children[0].innerHTML = newScientistLabel;
    };

    // Shows the animation html object
    this.showAnimation = function() {
        var animation = document.getElementById(this.atomAnimation.elementId + "-container");
        animation.className = this.activeScientist + "-animation";
    };

    // Changes the active scientist in the sidebar, making the circle filled with the appropriate color
    this.changeActiveScientist = function(activeScientist) {
        var sidebarNodes = document.getElementsByClassName("timeline-node");
        for (var i = 0; i < sidebarNodes.length; i++) {
            sidebarNodes[i].className = sidebarNodes[i].className.replace(/\s?timeline-node-selected\s?/, "");
            if (sidebarNodes[i].id == activeScientist + "-node") {
                sidebarNodes[i].className = sidebarNodes[i].className + " timeline-node-selected";
            }
        }
    };

    // Makes the activeScientist article visible. DOES NOT HIDE OTHER ARTICLES. SEE this.hideAllArticles
    this.changeActiveArticle = function(activeScientist) {
        var articles = document.getElementsByTagName("article");
        for (var i = 0; i < articles.length; i++) {
            if (articles[i].id == activeScientist + "-article") {
                articles[i].className = "";
            }
        }
    };

    // Hides all articles
    this.hideAllArticles = function() {
        var articles = document.getElementsByTagName("article");
        for (var i = 0; i < articles.length; i++) {
            articles[i].className = "article-hidden";
        }
    };

    // Hides the animation, does not remove color as animation happens
    this.hideAnimation = function() {
        var animation = document.getElementById(this.atomAnimation.elementId + "-container");
        var newClassName = animation.className.replace(" hidden", "");
        animation.className = newClassName + " hidden";
    };

    // Event handler for animation complete, cleans up (shows active article + hides animation)
    // Uses this.delay static variable to delay the clean up
    this.handleAnimationDone = function() {
        setTimeout(
            function() {
                this.changeActiveArticle(this.activeScientist);
                this.hideAnimation();
            }.bind(this),
            this.delay
        );
    };

    // Init, shows the animation, initializes this.atomAnimation, binds event handlers
    this.init = function() {
        this.showAnimation();
        this.atomAnimation.init(this.activeScientist, this.handleAnimationDone.bind(this));
        this.bindScientistButtons();
        this.bindMiniNavOpen();
    };
}
