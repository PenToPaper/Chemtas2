import ChemTAS from "../src/js/ChemTAS";
import MockElement from "./MockElement";
import Bodymovin from "./MockBodymovin";
import mockGetElement from "./mockGetElement";

describe("ChemTAS", () => {
    // Mock DOM
    const articles = [new MockElement("democritus-article"), new MockElement("dalton-article"), new MockElement("thomson-article")];
    const navButtons = [new MockElement("democritus-node"), new MockElement("dalton-node"), new MockElement("thomson-node")];
    const navContents = new MockElement("");
    const logoMarkContainers = [new MockElement(""), new MockElement(""), new MockElement("")];
    const bodymovinInstance = new Bodymovin();

    const mockNav = new MockElement("");
    mockNav.querySelectorAll = mockGetElement({
        ".timeline-node": navButtons,
    });
    mockNav.querySelector = mockGetElement({
        "#nav-contents": navContents,
    });

    const mockAnimationContainer = new MockElement("");
    mockAnimationContainer.children[0] = new MockElement("");
    mockAnimationContainer.className = "hidden";

    const mockOnboarding = new MockElement("");

    // Mock environment

    document.getElementsByTagName = mockGetElement({
        nav: [mockNav],
        article: articles,
    });

    document.getElementsByClassName = mockGetElement({
        "logo-mark-container": logoMarkContainers,
        "timeline-node": navButtons,
    });

    document.getElementById = mockGetElement({
        "MockId-container": mockAnimationContainer,
        onboarding: mockOnboarding,
    });

    // Mock bodymovin

    global.bodymovin = {};
    bodymovin.loadAnimation = jest.fn(() => {
        return bodymovinInstance;
    });

    // Tested object
    const chemTAS = new ChemTAS("none", "MockId", "MockJson");

    afterAll(() => {
        document.getElementsByTagName = () => {};
        document.getElementsByClassName = () => {};
        document.getElementById = () => {};

        delete global.bodymovin;
    });

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
        expect(navButtons[2].classList.list).toEqual(["timeline-node-selected"]);

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
        expect(navButtons[0].classList.list).toEqual(["timeline-node-selected"]);
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

    it("Visually hides the animation container and shows the active article after animation playback", () => {
        jest.useFakeTimers();

        chemTAS.handleAnimationDone();

        expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), chemTAS.delay);

        expect(articles[0].className).toEqual("article-hidden");
        expect(articles[0].attributes["aria-hidden"]).toEqual("true");
        expect(articles[1].className).toEqual("article-hidden");
        expect(articles[1].attributes["aria-hidden"]).toEqual("true");
        expect(articles[2].className).toEqual("article-hidden");
        expect(articles[2].attributes["aria-hidden"]).toEqual("true");
        expect(mockAnimationContainer.classList.add).toHaveBeenCalledTimes(0);
        expect(mockAnimationContainer.classList.list).not.toEqual(expect.arrayContaining(["hidden"]));

        jest.runAllTimers();

        expect(articles[0].className).toEqual("");
        expect(articles[0].attributes["aria-hidden"]).toEqual("false");
        expect(articles[1].className).toEqual("article-hidden");
        expect(articles[1].attributes["aria-hidden"]).toEqual("true");
        expect(articles[2].className).toEqual("article-hidden");
        expect(articles[2].attributes["aria-hidden"]).toEqual("true");
        expect(mockAnimationContainer.classList.add).toHaveBeenCalledTimes(1);
        expect(mockAnimationContainer.classList.list).toEqual(expect.arrayContaining(["hidden"]));
    });
});
