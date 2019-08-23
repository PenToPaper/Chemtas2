//onload
document.addEventListener("DOMContentLoaded", function(event) {
    collectionBind(document.getElementsByClassName("timeline-node"), "click", onTimelineNodeClick);
    let atomAnimation = new AtomAnimation("atom-evolution", "../assets/atomevolution.json");
});

function collectionBind(collection, listenerType, func) {
    for (var i = 0; i < collection.length; i++) {
        collection[i].addEventListener(listenerType, function(event) {
            return func(event, this);
        });
    }
}

function onTimelineNodeClick(event, element) {
    var articleName = element.getAttribute("data-article");

    selectArticle(articleName + "-article");
    selectSidebarNode(articleName + "-node");
}

function selectArticle(articleName) {
    var articles = document.getElementsByTagName("article");
    for (var i = 0; i < articles.length; i++) {
        if (articles[i].id == articleName) {
            articles[i].className = "";
        } else {
            articles[i].className = "article-hidden";
        }
    }
}

function selectSidebarNode(articleName) {
    var sidebarNodes = document.getElementsByClassName("timeline-node");
    for (var i = 0; i < sidebarNodes.length; i++) {
        sidebarNodes[i].className = sidebarNodes[i].className.replace(/\s?timeline-node-selected\s?/, "");
        if (sidebarNodes[i].id == articleName) {
            sidebarNodes[i].className = sidebarNodes[i].className + " timeline-node-selected";
        }
    }
}

function AtomAnimation(elementId, jsonLocation) {
    this.elementId = elementId;
    this.jsonLocation = jsonLocation;
    this.animation = bodymovin.loadAnimation({
        container: document.getElementById(this.elementId),
        renderer: "svg",
        loop: true,
        autoplay: false,
        path: this.jsonLocation
    });
}
