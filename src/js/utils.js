export default {
    collectionBind: function (collection, listenerType, func) {
        for (let i = 0; i < collection.length; i++) {
            collection[i].addEventListener(listenerType, function (event) {
                return func(event, this);
            });
        }
    },
};
