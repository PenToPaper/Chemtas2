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
        this.atomAnimationContainer = document.getElementById(animationElementId + "-container");
        this.articles = document.getElementsByTagName("article");
        this.onboarding = document.getElementById("onboarding");

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
        this.showAnimation(this.activeScientist);
        this.atomAnimation.playFrom(prevActiveScientist, this.activeScientist, this.handleAnimationDone.bind(this), this.handleScientistTransition.bind(this));
    }

    // Handles a point in the animation where a scientist's model transitions into another scientists's model.
    // Changes animation background color
    // Changes animation header text
    handleScientistTransition(newScientist) {
        this.atomAnimationContainer.className = newScientist + "-animation";
        const newScientistLabel = newScientist.charAt(0).toUpperCase() + newScientist.slice(1);
        this.atomAnimationContainer.children[0].innerHTML = newScientistLabel;
    }

    // Shows the animation html object
    showAnimation(activeScientist) {
        this.onboarding.className = "hidden";
        this.handleScientistTransition(activeScientist);
    }

    // Changes the active scientist in the sidebar, making the circle filled with the appropriate color
    changeActiveScientist(activeScientist) {
        const navNodes = this.nav.articleButtons;
        for (let i = 0; i < navNodes.length; i++) {
            if (navNodes[i].element.id === activeScientist + "-node") {
                navNodes[i].element.classList.add("timeline-node-selected");
            } else {
                navNodes[i].element.classList.remove("timeline-node-selected");
            }
        }
    }

    // Makes the activeScientist article visible. DOES NOT HIDE OTHER ARTICLES. SEE this.hideAllArticles
    showActiveArticle(activeScientist) {
        for (let i = 0; i < this.articles.length; i++) {
            if (this.articles[i].id === activeScientist + "-article") {
                this.articles[i].className = "";
                this.articles[i].setAttribute("aria-hidden", "false");
            }
        }
    }

    // Hides all articles
    hideAllArticles() {
        for (let i = 0; i < this.articles.length; i++) {
            this.articles[i].className = "article-hidden";
            this.articles[i].setAttribute("aria-hidden", "true");
        }
    }

    // Hides the animation, does not remove color as animation happens
    hideAnimation() {
        this.atomAnimationContainer.classList.add("hidden");
    }

    // Event handler for animation complete, cleans up (shows active article + hides animation)
    // Uses this.delay static variable to delay the clean up
    handleAnimationDone() {
        setTimeout(
            (() => {
                this.showActiveArticle(this.activeScientist);
                this.hideAnimation();
            }).bind(this),
            this.delay
        );
    }
}
