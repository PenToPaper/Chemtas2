// Wrapper object for the bodymovin animation.
export default class AtomAnimation {
    constructor(elementId, json) {
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
        this.json = json;
        this.animation = bodymovin.loadAnimation({
            container: document.getElementById(this.elementId),
            renderer: "svg",
            loop: false,
            autoplay: false,
            animationData: this.json,
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
