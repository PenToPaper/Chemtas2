import Nav from "../src/js/Nav";
import MockElement from "./MockElement";
import mockGetElement from "./mockGetElement";

describe("Nav", () => {
    const navButtons = [new MockElement("democritus-node"), new MockElement("dalton-node"), new MockElement("thomson-node")];
    const logoMarkContainers = [new MockElement(""), new MockElement(""), new MockElement("")];
    const navContents = new MockElement("");

    const body = new MockElement("");
    body.className = "MockClass";

    const element = new MockElement("");
    element.querySelectorAll = mockGetElement({
        ".timeline-node": navButtons,
    });
    element.querySelector = mockGetElement({
        "#nav-contents": navContents,
    });
    element.getElementsByClassName = mockGetElement({
        "logo-mark-container": logoMarkContainers,
    });

    document.getElementsByClassName = mockGetElement({
        "logo-mark-container": logoMarkContainers,
    });

    document.getElementsByTagName = mockGetElement({
        body: [body],
    });

    window.addEventListener = jest.fn();

    const onActiveChange = jest.fn();

    const nav = new Nav(element, onActiveChange);

    afterAll(() => {
        document.getElementsByTagName = () => {};
        document.getElementsByClassName = () => {};
        window.addEventListener = () => {};
    });

    it("Binds onWindowWidth on init", () => {
        expect(window.addEventListener).toHaveBeenLastCalledWith("resize", nav.onWindowWidth);
    });

    it("Binds NavButton keydown", () => {
        // Nav found all 3 buttons
        expect(nav.articleButtons).toHaveLength(3);

        // Nav binds keydown on all 3 buttons
        expect(Object.keys(navButtons[0].events)).toEqual(expect.arrayContaining(["keydown"]));
        expect(Object.keys(navButtons[1].events)).toEqual(expect.arrayContaining(["keydown"]));
        expect(Object.keys(navButtons[2].events)).toEqual(expect.arrayContaining(["keydown"]));
    });

    it("Handles arrow right + arrow down keydown events", () => {
        // Moves focus from 0 to 1
        const arrowRightEvent = { keyCode: 39, preventDefault: jest.fn(), stopPropagation: jest.fn() };
        navButtons[0].events["keydown"](arrowRightEvent);
        expect(navButtons[1].focus).toHaveBeenCalled();
        expect(arrowRightEvent.preventDefault).toHaveBeenCalled();
        expect(arrowRightEvent.stopPropagation).toHaveBeenCalled();

        // Moves focus from 0 to 1 again. Shouldn't be possible in prod, but handles it
        navButtons[0].events["keydown"](arrowRightEvent);
        expect(navButtons[1].focus).toHaveBeenCalledTimes(2);
        expect(arrowRightEvent.preventDefault).toHaveBeenCalledTimes(2);
        expect(arrowRightEvent.stopPropagation).toHaveBeenCalledTimes(2);

        // Moves focus from 1 to 2
        const arrowDownEvent = { keyCode: 40, preventDefault: jest.fn(), stopPropagation: jest.fn() };
        navButtons[1].events["keydown"](arrowDownEvent);
        expect(navButtons[2].focus).toHaveBeenCalled();
        expect(arrowDownEvent.preventDefault).toHaveBeenCalled();
        expect(arrowDownEvent.stopPropagation).toHaveBeenCalled();

        // Moves focus from 1 to 2 again. Shouldn't be possible in prod, but handles it
        navButtons[1].events["keydown"](arrowDownEvent);
        expect(navButtons[2].focus).toHaveBeenCalledTimes(2);
        expect(arrowDownEvent.preventDefault).toHaveBeenCalledTimes(2);
        expect(arrowDownEvent.stopPropagation).toHaveBeenCalledTimes(2);

        jest.clearAllMocks();
    });

    it("Handles arrow left + arrow up keydown events", () => {
        // Moves focus from 2 to 1
        const arrowLeftEvent = { keyCode: 37, preventDefault: jest.fn(), stopPropagation: jest.fn() };
        navButtons[2].events["keydown"](arrowLeftEvent);
        expect(navButtons[1].focus).toHaveBeenCalled();
        expect(arrowLeftEvent.preventDefault).toHaveBeenCalled();
        expect(arrowLeftEvent.stopPropagation).toHaveBeenCalled();

        // Moves focus from 2 to 1 again. Shouldn't be possible in prod, but handles it
        navButtons[2].events["keydown"](arrowLeftEvent);
        expect(navButtons[1].focus).toHaveBeenCalledTimes(2);
        expect(arrowLeftEvent.preventDefault).toHaveBeenCalledTimes(2);
        expect(arrowLeftEvent.stopPropagation).toHaveBeenCalledTimes(2);

        // Moves focus from 1 to 0
        const arrowUpEvent = { keyCode: 38, preventDefault: jest.fn(), stopPropagation: jest.fn() };
        navButtons[1].events["keydown"](arrowUpEvent);
        expect(navButtons[0].focus).toHaveBeenCalled();
        expect(arrowUpEvent.preventDefault).toHaveBeenCalled();
        expect(arrowUpEvent.stopPropagation).toHaveBeenCalled();

        // Moves focus from 1 to 0 again. Shouldn't be possible in prod, but handles it
        navButtons[1].events["keydown"](arrowUpEvent);
        expect(navButtons[0].focus).toHaveBeenCalledTimes(2);
        expect(arrowUpEvent.preventDefault).toHaveBeenCalledTimes(2);
        expect(arrowUpEvent.stopPropagation).toHaveBeenCalledTimes(2);

        jest.clearAllMocks();
    });

    it("Handles end + home keydown events", () => {
        // Moves focus from 0 to 2
        const endEvent = { keyCode: 35, preventDefault: jest.fn(), stopPropagation: jest.fn() };
        navButtons[0].events["keydown"](endEvent);
        expect(navButtons[2].focus).toHaveBeenCalled();
        expect(endEvent.preventDefault).toHaveBeenCalled();
        expect(endEvent.stopPropagation).toHaveBeenCalled();

        // Moves focus from 0 to 2 again. Shouldn't be possible in prod, but handles it
        navButtons[0].events["keydown"](endEvent);
        expect(navButtons[2].focus).toHaveBeenCalledTimes(2);
        expect(endEvent.preventDefault).toHaveBeenCalledTimes(2);
        expect(endEvent.stopPropagation).toHaveBeenCalledTimes(2);

        // Moves focus from 2 to 0
        const homeEvent = { keyCode: 36, preventDefault: jest.fn(), stopPropagation: jest.fn() };
        navButtons[2].events["keydown"](homeEvent);
        expect(navButtons[0].focus).toHaveBeenCalled();
        expect(homeEvent.preventDefault).toHaveBeenCalled();
        expect(homeEvent.stopPropagation).toHaveBeenCalled();

        // Moves focus from 2 to 0 again. Shouldn't be possible in prod, but handles it
        navButtons[2].events["keydown"](homeEvent);
        expect(navButtons[0].focus).toHaveBeenCalledTimes(2);
        expect(homeEvent.preventDefault).toHaveBeenCalledTimes(2);
        expect(homeEvent.stopPropagation).toHaveBeenCalledTimes(2);

        jest.clearAllMocks();
    });

    it("Handles enter + space keydown events", () => {
        const spaceElement = { getAttribute: jest.fn(() => "democritus") };
        const spaceEvent = { keyCode: 32, preventDefault: jest.fn(), stopPropagation: jest.fn(), target: spaceElement };
        nav.miniNavOpen = true;
        navButtons[0].events["keydown"](spaceEvent);
        expect(onActiveChange).toHaveBeenCalledWith(spaceElement);
        expect(nav.miniNavOpen).toEqual(false);
        expect(spaceElement.getAttribute).toHaveBeenCalled();
        expect(spaceEvent.preventDefault).toHaveBeenCalled();
        expect(spaceEvent.stopPropagation).toHaveBeenCalled();

        const enterElement = { getAttribute: jest.fn(() => "democritus") };
        const enterEvent = { keyCode: 13, preventDefault: jest.fn(), stopPropagation: jest.fn(), target: enterElement };
        nav.miniNavOpen = true;
        navButtons[0].events["keydown"](enterEvent);
        expect(onActiveChange).toHaveBeenCalledWith(enterElement);
        expect(nav.miniNavOpen).toEqual(false);
        expect(enterElement.getAttribute).toHaveBeenCalled();
        expect(enterEvent.preventDefault).toHaveBeenCalled();
        expect(enterEvent.stopPropagation).toHaveBeenCalled();

        jest.clearAllMocks();
    });

    it("Handles click events", () => {
        const nearestNode = { getAttribute: () => {} };
        const target = {
            closest: jest.fn(() => nearestNode),
        };
        navButtons[0].events["click"]({ target });
        expect(onActiveChange).toHaveBeenCalledWith(nearestNode);

        jest.clearAllMocks();
    });

    it("Updates aria-expanded in DOM for the currently active article's button", () => {
        const spaceElement = { getAttribute: jest.fn(() => "democritus") };
        const spaceEvent = { keyCode: 32, preventDefault: jest.fn(), stopPropagation: jest.fn(), target: spaceElement };
        navButtons[0].events["keydown"](spaceEvent);

        expect(navButtons[0].setAttribute).toHaveBeenLastCalledWith("aria-expanded", "true");
        expect(navButtons[1].setAttribute).toHaveBeenLastCalledWith("aria-expanded", "false");
        expect(navButtons[2].setAttribute).toHaveBeenLastCalledWith("aria-expanded", "false");

        const nearestNode = { getAttribute: jest.fn(() => "dalton") };
        const target = {
            closest: jest.fn(() => nearestNode),
        };
        navButtons[1].events["click"]({ target });
        expect(navButtons[0].setAttribute).toHaveBeenLastCalledWith("aria-expanded", "false");
        expect(navButtons[1].setAttribute).toHaveBeenLastCalledWith("aria-expanded", "true");
        expect(navButtons[2].setAttribute).toHaveBeenLastCalledWith("aria-expanded", "false");

        jest.clearAllMocks();
    });

    it("Binds click handler to all logo-mark-containers in document", () => {
        logoMarkContainers[0].events["click"]();
        expect(nav.miniNavOpen).toEqual(true);

        logoMarkContainers[1].events["click"]();
        expect(nav.miniNavOpen).toEqual(false);

        logoMarkContainers[2].events["click"]();
        expect(nav.miniNavOpen).toEqual(true);

        nav.handleMiniNavOpen();
        expect(nav.miniNavOpen).toEqual(false);

        jest.clearAllMocks();
    });

    it("Updates tabIndex, local state, and aria roles when mini nav toggled", () => {
        window.innerWidth = 100;
        nav.handleMiniNavOpen();

        // Local state
        expect(nav.miniNavOpen).toEqual(true);
        // Nav menu opened, tab index should be 0 to put elements in tab order
        expect(navButtons[0].setAttribute).toHaveBeenCalledWith("tabindex", "0");
        expect(navButtons[1].setAttribute).toHaveBeenCalledWith("tabindex", "0");
        expect(navButtons[2].setAttribute).toHaveBeenCalledWith("tabindex", "0");

        // Gives body proper class
        expect(body.className).toEqual("mini-nav-open");

        // Aria properties
        for (let i = 0; i < logoMarkContainers.length; i++) {
            expect(logoMarkContainers[i].setAttribute).toHaveBeenLastCalledWith("aria-expanded", "true");
        }
        expect(navContents.setAttribute).toHaveBeenCalledWith("aria-hidden", "false");

        jest.clearAllMocks();

        nav.handleMiniNavOpen();

        // Local state
        expect(nav.miniNavOpen).toEqual(false);
        // Nav menu opened, tab index should be 0 to put elements in tab order
        expect(navButtons[0].setAttribute).toHaveBeenCalledWith("tabindex", "-1");
        expect(navButtons[1].setAttribute).toHaveBeenCalledWith("tabindex", "-1");
        expect(navButtons[2].setAttribute).toHaveBeenCalledWith("tabindex", "-1");

        // Gives body proper class
        expect(body.className).toEqual("");

        // Aria properties
        for (let i = 0; i < logoMarkContainers.length; i++) {
            expect(logoMarkContainers[i].setAttribute).toHaveBeenLastCalledWith("aria-expanded", "false");
        }
        expect(navContents.setAttribute).toHaveBeenCalledWith("aria-hidden", "true");

        jest.clearAllMocks();

        // If the menu is not mini at all, set aria-hidden to false
        window.innerWidth = 1500;
        nav.handleMiniNavOpenUpdate();
        expect(navContents.setAttribute).toHaveBeenCalledWith("aria-hidden", "false");
        navContents.setAttribute.mockClear();

        // If the menu is mini and the mini nav is closed, ser aria-hidden to true
        window.innerWidth = 200;
        nav.handleMiniNavOpenUpdate();
        expect(navContents.setAttribute).toHaveBeenCalledWith("aria-hidden", "true");
        navContents.setAttribute.mockClear();

        // If the menu is mini and the mini nav is open, ser aria-hidden to false
        window.innerWidth = 200;
        nav.miniNavOpen = true;
        nav.handleMiniNavOpenUpdate();
        expect(navContents.setAttribute).toHaveBeenCalledWith("aria-hidden", "false");
        navContents.setAttribute.mockClear();

        // Cleanup
        nav.handleMiniNavOpen();

        jest.clearAllMocks();
    });

    it("Updates tabIndex of buttons, body styling, and aria on window resize", () => {
        // If the menu is mini and closed
        window.innerWidth = 200;
        nav.miniNavOpen = false;
        body.className = "MockClass";
        nav.onWindowWidth();

        // tabIndex is set to -1 while mini nav is closed
        for (let i = 0; i < navButtons.length; i++) {
            expect(navButtons[i].setAttribute).toHaveBeenLastCalledWith("tabindex", "-1");
        }

        // Body class is unaffected
        expect(body.className).toEqual("MockClass");

        // Nav contents are marked as hidden
        expect(navContents.setAttribute).toHaveBeenLastCalledWith("aria-hidden", "true");

        jest.clearAllMocks();

        // ************************************************
        // If the menu is mini and open
        window.innerWidth = 200;
        nav.miniNavOpen = true;
        body.className = "MockClass";
        nav.onWindowWidth();

        // tabIndex is set to 0 while mini nav is open
        for (let i = 0; i < navButtons.length; i++) {
            expect(navButtons[i].setAttribute).toHaveBeenLastCalledWith("tabindex", "0");
        }

        // Body class is unaffected
        expect(body.className).toEqual("MockClass");

        // Nav contents are marked as visible
        expect(navContents.setAttribute).toHaveBeenLastCalledWith("aria-hidden", "false");

        jest.clearAllMocks();

        // ************************************************
        // If the menu is large
        window.innerWidth = 2000;
        nav.miniNavOpen = true;
        body.className = "MockClass";
        nav.onWindowWidth();

        // tabIndex is set to 0
        for (let i = 0; i < navButtons.length; i++) {
            expect(navButtons[i].setAttribute).toHaveBeenLastCalledWith("tabindex", "0");
        }

        // Body class is removed
        expect(body.className).toEqual("");

        // Internal miniNavOpen is updated
        expect(nav.miniNavOpen).toEqual(false);

        // Nav contents are marked as visible
        expect(navContents.setAttribute).toHaveBeenLastCalledWith("aria-hidden", "false");
    });
});
