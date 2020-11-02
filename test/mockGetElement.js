export default (selectors) => {
    // Selectors:
    // {
    //      "nav": return,
    //      "notNav": return,
    // }

    return jest.fn((selector) => {
        return selectors[selector];
    });
};
