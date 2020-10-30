import ChemTAS from "../src/js/ChemTAS";

describe("ChemTAS", () => {
    class MockNavButtonElement {
        constructor(id) {
            this.focus = jest.fn();
            this.setAttribute = jest.fn();
            this.id = id;
            this.className = "";
            this.addEventListener = jest.fn(this.addEvent.bind(this));
            this.events = {};
        }

        addEvent(eventName, handler) {
            this.events[eventName] = jest.fn(handler);
        }
    }

    class MockLogoMarkContainer {
        constructor() {
            this.events = {};
            this.addEventListener = jest.fn(this.addEvent.bind(this));
            this.setAttribute = jest.fn();
        }

        addEvent(eventName, handler) {
            this.events[eventName] = jest.fn(handler);
        }
    }

    class Bodymovin {
        constructor() {
            this.events = {};
            this.playSegments = jest.fn();
            this.addEventListener = jest.fn(this.addEvent.bind(this));
            this.removeEventListener = jest.fn(this.removeEvent.bind(this));
        }

        addEvent(eventName, handler) {
            this.events[eventName] = handler;
        }

        removeEvent(eventName) {
            delete this.events[eventName];
        }

        clearAllEvents() {
            this.events = {};
        }
    }

    class MockArticle {
        constructor(id) {
            this.id = id + "-article";
            this.className = "";
            this.attributes = {};
            this.setAttribute = jest.fn(this.setAttribute.bind(this));
        }

        setAttribute(attribute, value) {
            this.attributes[attribute] = value;
        }
    }

    const articles = [new MockArticle("democritus"), new MockArticle("dalton"), new MockArticle("thomson")];

    const navButtons = [new MockNavButtonElement("democritus-node"), new MockNavButtonElement("dalton-node"), new MockNavButtonElement("thomson-node")];

    const navContents = {
        setAttribute: jest.fn(),
    };

    const logoMarkContainers = [new MockLogoMarkContainer(), new MockLogoMarkContainer(), new MockLogoMarkContainer()];

    const mockNav = {
        querySelectorAll: jest.fn((selector) => {
            switch (selector) {
                case ".timeline-node":
                    return navButtons;
            }
        }),
        querySelector: jest.fn((selector) => {
            switch (selector) {
                case "#nav-contents":
                    return navContents;
            }
        }),
    };

    const mockAnimationContainer = {
        className: "hidden",
        children: [{ innerHTML: "" }],
    };

    const mockOnboarding = {
        className: "hidden",
    };

    document.getElementsByTagName = jest.fn((selector) => {
        switch (selector) {
            case "nav":
                return [mockNav];
            case "article":
                return articles;
        }
    });

    document.getElementsByClassName = jest.fn((selector) => {
        switch (selector) {
            case "logo-mark-container":
                return logoMarkContainers;
            case "timeline-node":
                return navButtons;
        }
    });

    document.getElementById = jest.fn((selector) => {
        switch (selector) {
            case "MockId-container":
                return mockAnimationContainer;
            case "onboarding":
                return mockOnboarding;
        }
    });

    const bodymovinInstance = new Bodymovin();

    global.bodymovin = {};
    bodymovin.loadAnimation = jest.fn((container, renderer, loop, autoplay, animationData) => {
        return bodymovinInstance;
    });

    const chemTAS = new ChemTAS("none", "MockId", "MockJson");

    // Assert on initial state
    it("Properly assigns local state on initialization", () => {
        expect(chemTAS.activeScientist).toEqual("none");
    });

    it("Handles a scientist button being clicked, moving forward in time", () => {
        const forwardScientist = {
            getAttribute: jest.fn(() => "thomson"),
        };
        chemTAS.handleScientistButton(forwardScientist);

        // New chemtas.activeScientist assigned based on forwardScientist.getAttribute
        expect(chemTAS.activeScientist).toEqual("thomson");
        expect(forwardScientist.getAttribute).toHaveBeenCalledTimes(1);

        // Changes the animation background color and header text when a new scientist is shown in the animation
        // Starts with democritus, transition to other scientists tested later
        expect(mockAnimationContainer.className).toEqual("democritus-animation");
        expect(mockAnimationContainer.children[0].innerHTML).toEqual("Democritus");

        // Appropriate nav button is marked as active
        expect(navButtons[0].className).toEqual("");
        expect(navButtons[1].className).toEqual("");
        expect(navButtons[2].className).toEqual(" timeline-node-selected");

        // All articles are hidden
        for (let i = 0; i < articles.length; i++) {
            expect(articles[i]).className = "article-hidden";
            expect(articles[i].setAttribute).toHaveBeenCalledTimes(1);
            expect(articles[i].setAttribute).toHaveBeenLastCalledWith("aria-hidden", "true");
        }

        // Animation object is shown
        expect(mockOnboarding.className).toEqual("hidden");
        expect(mockAnimationContainer.className).toEqual("democritus-animation");

        // Animation is played
        expect(bodymovinInstance.playSegments).toHaveBeenCalledTimes(1);
        expect(bodymovinInstance.playSegments).toHaveBeenLastCalledWith([0, 110], true);
    });

    it("Handles animation scientist transitions moving forward", () => {
        chemTAS.handleScientistTransition("dalton");
        expect(mockAnimationContainer.className).toEqual("dalton-animation");
        expect(mockAnimationContainer.children[0].innerHTML).toEqual("Dalton");

        chemTAS.handleScientistTransition("thomson");
        expect(mockAnimationContainer.className).toEqual("thomson-animation");
        expect(mockAnimationContainer.children[0].innerHTML).toEqual("Thomson");
    });

    it("Handles a scientist button being clicked, moving backward in time", () => {
        jest.clearAllMocks();

        const forwardScientist = {
            getAttribute: jest.fn(() => "democritus"),
        };
        chemTAS.handleScientistButton(forwardScientist);

        // New chemtas.activeScientist assigned based on forwardScientist.getAttribute
        expect(chemTAS.activeScientist).toEqual("democritus");
        expect(forwardScientist.getAttribute).toHaveBeenCalledTimes(1);

        // Changes the animation background color and header text when a new scientist is shown in the animation
        // Starts with democritus, transition to other scientists tested later
        expect(mockAnimationContainer.className).toEqual("thomson-animation");
        expect(mockAnimationContainer.children[0].innerHTML).toEqual("Thomson");

        // Appropriate nav button is marked as active
        expect(navButtons[0].className).toEqual(" timeline-node-selected");
        expect(navButtons[1].className).toEqual("");
        expect(navButtons[2].className).toEqual("");

        // All articles are hidden
        for (let i = 0; i < articles.length; i++) {
            expect(articles[i]).className = "article-hidden";
            expect(articles[i].setAttribute).toHaveBeenCalledTimes(1);
            expect(articles[i].setAttribute).toHaveBeenLastCalledWith("aria-hidden", "true");
        }

        // Animation object is shown
        expect(mockOnboarding.className).toEqual("hidden");
        expect(mockAnimationContainer.className).toEqual("thomson-animation");

        // Animation is played
        expect(bodymovinInstance.playSegments).toHaveBeenCalledTimes(1);
        expect(bodymovinInstance.playSegments).toHaveBeenLastCalledWith([110, 20], true);
    });

    it("Handles animation scientist transitions moving backward", () => {
        chemTAS.handleScientistTransition("democritus");
        expect(mockAnimationContainer.className).toEqual("democritus-animation");
        expect(mockAnimationContainer.children[0].innerHTML).toEqual("Democritus");

        chemTAS.handleScientistTransition("dalton");
        expect(mockAnimationContainer.className).toEqual("dalton-animation");
        expect(mockAnimationContainer.children[0].innerHTML).toEqual("Dalton");
    });
});
