import AtomAnimation from "../src/js/AtomAnimation";
import Bodymovin from "./MockBodymovin";
import mockGetElement from "./mockGetElement";

describe("AtomAnimation", () => {
    const bodymovinInstance = new Bodymovin();

    global.bodymovin = {};
    bodymovin.loadAnimation = jest.fn(() => {
        return bodymovinInstance;
    });

    document.getElementById = mockGetElement({
        MockId: "MockElement",
    });

    const atomAnimation = new AtomAnimation("MockId", "MockJson");

    afterAll(() => {
        document.getElementById = () => {};

        delete global.bodymovin;
    });

    it("Calls loadAnimation properly on initialization", () => {
        expect(bodymovin.loadAnimation).toHaveBeenCalledTimes(1);
        expect(bodymovin.loadAnimation).toHaveBeenCalledWith({
            container: "MockElement",
            renderer: "svg",
            loop: false,
            autoplay: false,
            animationData: "MockJson",
        });
    });

    it("Determines the next scientist in the order, until the end of the animation is reached", () => {
        const scientistOrder = atomAnimation.scientistOrder;

        expect(atomAnimation.getNextScientist(scientistOrder[0])).toEqual(scientistOrder[1]);
        expect(atomAnimation.getNextScientist(scientistOrder[1])).toEqual(scientistOrder[2]);
        expect(atomAnimation.getNextScientist(scientistOrder[scientistOrder.length - 1])).toEqual(false);
    });

    it("Determines the previous scientist in the order, until the start of the animation is reached", () => {
        const scientistOrder = atomAnimation.scientistOrder;

        expect(atomAnimation.getPrevScientist(scientistOrder[scientistOrder.length - 1])).toEqual(scientistOrder[scientistOrder.length - 2]);
        expect(atomAnimation.getPrevScientist(scientistOrder[scientistOrder.length - 2])).toEqual(scientistOrder[scientistOrder.length - 3]);
        expect(atomAnimation.getPrevScientist(scientistOrder[0])).toEqual(false);
    });

    it("Does not play any segments or add event listeners if scientistFrom or scientistTo are not from the scientistOrder", () => {
        const invalidStart = atomAnimation.playFrom(
            "MockArgument",
            atomAnimation.scientistOrder[1],
            () => {},
            () => {}
        );
        expect(invalidStart).toEqual(false);
        expect(bodymovinInstance.playSegments).not.toHaveBeenCalled();
        expect(bodymovinInstance.addEventListener).not.toHaveBeenCalled();
        expect(bodymovinInstance.removeEventListener).not.toHaveBeenCalled();

        const invalidEnd = atomAnimation.playFrom(
            atomAnimation.scientistOrder[0],
            "MockArgument",
            () => {},
            () => {}
        );
        expect(invalidEnd).toEqual(false);
        expect(bodymovinInstance.playSegments).not.toHaveBeenCalled();
        expect(bodymovinInstance.addEventListener).not.toHaveBeenCalled();
        expect(bodymovinInstance.removeEventListener).not.toHaveBeenCalled();
    });

    it("Calls bodymovin.playSegments with the proper start and end frames based on input", () => {
        // Starting and ending with the same scientist
        const sameScientist = atomAnimation.playFrom(
            atomAnimation.scientistOrder[1],
            atomAnimation.scientistOrder[1],
            () => {},
            () => {}
        );
        const sameScientistFrameData = atomAnimation.scientistFrames[atomAnimation.scientistOrder[1]];
        expect(sameScientist).toEqual(true);
        expect(bodymovinInstance.playSegments).toHaveBeenLastCalledWith([sameScientistFrameData[0], sameScientistFrameData[1]], true);

        // Starting from scratch and ending with the a scientist
        const scratchScientist = atomAnimation.playFrom(
            "none",
            atomAnimation.scientistOrder[1],
            () => {},
            () => {}
        );
        const scratchScientistFrameData = atomAnimation.scientistFrames[atomAnimation.scientistOrder[1]];
        expect(scratchScientist).toEqual(true);
        expect(bodymovinInstance.playSegments).toHaveBeenLastCalledWith([0, scratchScientistFrameData[1]], true);

        // Different scientists, moving forward in time
        const forwardScientist = atomAnimation.playFrom(
            atomAnimation.scientistOrder[0],
            atomAnimation.scientistOrder[1],
            () => {},
            () => {}
        );
        const forwardScientistStart = atomAnimation.scientistFrames[atomAnimation.scientistOrder[0]];
        const forwardScientistEnd = atomAnimation.scientistFrames[atomAnimation.scientistOrder[1]];
        expect(forwardScientist).toEqual(true);
        expect(bodymovinInstance.playSegments).toHaveBeenLastCalledWith([forwardScientistStart[1], forwardScientistEnd[1]], true);

        // Different scientists, moving backwards in time
        const backwardScientist = atomAnimation.playFrom(
            atomAnimation.scientistOrder[1],
            atomAnimation.scientistOrder[0],
            () => {},
            () => {}
        );
        const backwardScientistStart = atomAnimation.scientistFrames[atomAnimation.scientistOrder[1]];
        const backwardScientistEnd = atomAnimation.scientistFrames[atomAnimation.scientistOrder[0]];
        expect(backwardScientist).toEqual(true);
        expect(bodymovinInstance.playSegments).toHaveBeenLastCalledWith([backwardScientistStart[1], backwardScientistEnd[1]], true);

        jest.clearAllMocks();
        bodymovinInstance.clearAllEvents();
    });

    it("Binds event listeners to the bodymovin object based on callbacks", () => {
        // Different scientists, moving forward in time
        const callback = jest.fn();
        const transitionScientistCallback = jest.fn();
        const segment = atomAnimation.playFrom(atomAnimation.scientistOrder[0], atomAnimation.scientistOrder[1], callback, transitionScientistCallback);

        expect(segment).toEqual(true);
        expect(bodymovinInstance.removeEventListener).toHaveBeenCalledTimes(2);

        expect(bodymovinInstance.removeEventListener).toHaveBeenCalledWith("enterFrame", expect.anything());
        expect(bodymovinInstance.removeEventListener).toHaveBeenCalledWith("complete", expect.anything());

        expect(bodymovinInstance.addEventListener).toHaveBeenCalledTimes(2);

        expect(bodymovinInstance.addEventListener).toHaveBeenCalledWith("enterFrame", expect.anything());
        expect(bodymovinInstance.addEventListener).toHaveBeenCalledWith("complete", expect.anything());

        // complete event handler
        atomAnimation.playing = atomAnimation.scientistOrder[0];
        bodymovinInstance.events["complete"]();
        expect(atomAnimation.playing).toEqual(false);
        expect(callback).toHaveBeenCalledTimes(1);

        // enterFrame event handler. Checked more in next test
        const oringalFunction = atomAnimation.handleEnterFrame;
        atomAnimation.handleEnterFrame = jest.fn(atomAnimation.handleEnterFrame);
        expect(transitionScientistCallback).toHaveBeenCalledTimes(1);
        bodymovinInstance.events["enterFrame"]("MockEvent");
        expect(atomAnimation.handleEnterFrame).toHaveBeenCalledTimes(1);

        atomAnimation.handleEnterFrame = oringalFunction;
        jest.clearAllMocks();
        bodymovinInstance.clearAllEvents();
    });

    it("Determines if a new scientist is being played on each frame", () => {
        // Moving forward in time. From democritus to dalton in this test
        // Moving from frame 20 to frame 41, where at frame 40 democritus switches to dalton
        const newSegment = jest.fn();

        atomAnimation.playing = "democritus";
        atomAnimation.lastStartFrame = 20;
        atomAnimation.handleEnterFrame({ direction: 1, currentTime: 19 }, newSegment);
        expect(newSegment).toHaveBeenCalledTimes(0);
        atomAnimation.handleEnterFrame({ direction: 1, currentTime: 21 }, newSegment);
        expect(newSegment).toHaveBeenCalledTimes(1);
        expect(newSegment).toHaveBeenCalledWith("dalton");

        newSegment.mockClear();

        // Moving forward in time. From democritus to dalton in this test
        // Moving from frame 20 to frame 41, where at frame 40 democritus switches to dalton

        // In the library:
        // direction is -1 when playing backwards
        // totalTime is the total number of frames in the animation (41 here beacuse it includes start and end frames)
        // currentTime counts backwards from totalTime to 0

        atomAnimation.playing = "dalton";
        atomAnimation.lastStartFrame = 60;
        atomAnimation.handleEnterFrame({ direction: -1, currentTime: 22, totalTime: 41 }, newSegment);
        expect(newSegment).toHaveBeenCalledTimes(0);
        atomAnimation.handleEnterFrame({ direction: -1, currentTime: 19, totalTime: 41 }, newSegment);
        expect(newSegment).toHaveBeenCalledTimes(1);
        expect(newSegment).toHaveBeenCalledWith("democritus");
    });
});
