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
    // Array[0] = first frame of animation with that scientist's work
    // Array[1] = last frame of animation with that scientist's work
    this.scientistFrames = {
        democritus: [0, 20],
        dalton: [40, 60],
        thomson: [80, 110],
        rutherford: [120, 180],
        bohr: [200, 260],
        schrodinger: [280, 319]
    };

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
    // TODO Implement this.playing for debugging
    this.playing = false;

    this.playFrom = function(scientistFrom, scientistTo, callback) {
        if (!(scientistFrom in this.scientistFrames) || !(scientistTo in this.scientistFrames)) {
            return false;
        }

        if (this.scientistFrames[scientistFrom][0] <= this.scientistFrames[scientistTo][0]) {
            // Moving forward in time
            this.animation.playSegments([this.scientistFrames[scientistFrom][0], this.scientistFrames[scientistTo][1]], true);
        } else {
            // Moving backwards in time
            this.animation.playSegments([this.scientistFrames[scientistFrom][1], this.scientistFrames[scientistTo][1]], true);
        }

        this.animation.removeEventListener("complete", callback);
        this.animation.addEventListener("complete", callback);
    };

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

    // Binds controls on sidebar
    this.bindScientistButtons = function() {
        collectionBind(document.getElementsByClassName("timeline-node"), "click", this.handleScientistButton.bind(this));
    };

    // Handles a sidebar control button selection
    this.handleScientistButton = function(event, element) {
        var prevActiveScientist = this.activeScientist.slice();
        this.activeScientist = element.getAttribute("data-article");

        this.changeActiveScientist(this.activeScientist);
        this.hideAllArticles();
        this.showAnimation();
        this.atomAnimation.playFrom(prevActiveScientist, this.activeScientist, this.handleAnimationDone.bind(this));
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
        animation.className = animation.className + " hidden";
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
    };
}
