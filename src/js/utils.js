export default {
    collectionBind: function (collection, listenerType, func) {
        for (var i = 0; i < collection.length; i++) {
            collection[i].addEventListener(listenerType, function (event) {
                return func(event, this);
            });
        }
    },
};
