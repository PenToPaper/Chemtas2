import Nav from "./Nav";
import AtomAnimation from "./AtomAnimation";

// Full application state managing class
export default class ChemTAS {
    constructor(activeScientist, animationElementId, json) {
        // Static

        // Delay for how long an animation stays on its last frame before article begins to show
        this.delay = 333;

        // Binding functions
        this.handleScientistButton = this.handleScientistButton.bind(this);

        // Assigned on construction
        this.atomAnimation = new AtomAnimation(animationElementId, json);
        this.nav = new Nav(document.getElementsByTagName("nav")[0], this.handleScientistButton);

        // Dynamic
        this.activeScientist = activeScientist;
        this.miniNavLockTimeout = null;
    }

    // Handles a sidebar control button selection
    handleScientistButton(element) {
        const prevActiveScientist = this.activeScientist.slice();
        this.activeScientist = element.getAttribute("data-article");

        this.changeActiveScientist(this.activeScientist);
        this.hideAllArticles();
        this.showAnimation();
        this.atomAnimation.playFrom(prevActiveScientist, this.activeScientist, this.handleAnimationDone.bind(this), this.handleScientistTransition.bind(this));
    }

    // Locks the nav from transitioning when animation is playing
    handleNavLock() {
        const nav = document.getElementsByTagName("nav");
        if (nav.length === 0) {
            return false;
        }
        nav[0].className = "animation-locked";
        this.miniNavLockTimeout = setTimeout(this.handleNavUnlock.bind(this), 500);
    }

    // Unlocks the nav, called after 500ms of not resizing window
    handleNavUnlock() {
        const nav = document.getElementsByTagName("nav");
        if (nav.length === 0) {
            return false;
        }
        nav[0].className = "";
    }

    // Handles a point in the animation where a scientist's model transitions into another scientists's model.
    // Changes animation background color
    // Changes animation header text
    handleScientistTransition(newScientist) {
        const animation = document.getElementById(this.atomAnimation.elementId + "-container");
        animation.className = newScientist + "-animation";
        const newScientistLabel = newScientist.charAt(0).toUpperCase() + newScientist.slice(1);
        animation.children[0].innerHTML = newScientistLabel;
    }

    // Shows the animation html object
    showAnimation() {
        const onboarding = document.getElementById("onboarding");
        onboarding.className = "hidden";
        const animation = document.getElementById(this.atomAnimation.elementId + "-container");
        animation.className = this.activeScientist + "-animation";
    }

    // Changes the active scientist in the sidebar, making the circle filled with the appropriate color
    changeActiveScientist(activeScientist) {
        const sidebarNodes = document.getElementsByClassName("timeline-node");
        for (let i = 0; i < sidebarNodes.length; i++) {
            sidebarNodes[i].className = sidebarNodes[i].className.replace(/\s?timeline-node-selected\s?/, "");
            if (sidebarNodes[i].id == activeScientist + "-node") {
                sidebarNodes[i].className = sidebarNodes[i].className + " timeline-node-selected";
            }
        }
    }

    // Makes the activeScientist article visible. DOES NOT HIDE OTHER ARTICLES. SEE this.hideAllArticles
    changeActiveArticle(activeScientist) {
        const articles = document.getElementsByTagName("article");
        for (let i = 0; i < articles.length; i++) {
            if (articles[i].id == activeScientist + "-article") {
                articles[i].className = "";
                articles[i].setAttribute("aria-hidden", "false");
            }
        }
    }

    // Hides all articles
    hideAllArticles() {
        const articles = document.getElementsByTagName("article");
        for (let i = 0; i < articles.length; i++) {
            articles[i].className = "article-hidden";
            articles[i].setAttribute("aria-hidden", "true");
        }
    }

    // Hides the animation, does not remove color as animation happens
    hideAnimation() {
        const animation = document.getElementById(this.atomAnimation.elementId + "-container");
        const newClassName = animation.className.replace(" hidden", "");
        animation.className = newClassName + " hidden";
    }

    // Event handler for animation complete, cleans up (shows active article + hides animation)
    // Uses this.delay static variable to delay the clean up
    handleAnimationDone() {
        setTimeout(
            (() => {
                this.changeActiveArticle(this.activeScientist);
                this.hideAnimation();
            }).bind(this),
            this.delay
        );
    }

    // Init, shows the animation, initializes this.atomAnimation, binds event handlers
    init() {
        window.addEventListener("resize", this.handleNavLock.bind(this));
    }
}
