document.addEventListener("click", function(e) {
    if (e.shiftKey) {
        let cssSelector = getCssSelector(document.elementFromPoint(e.clientX, e.clientY))
        setLastTracker(cssSelector);
    }
    }, false
)

function getCssSelector(element) {
    let block = element.nodeName;
    element.classList.forEach(clss => block += '.' + clss);
    if (element.id) {
        block += '#' + element.id;
    } else if (element.parentElement) {
        let result = getCssSelector(element.parentElement);
        result.push(block);
        return result;
    }
    return [block];
}

function setLastTracker(cssSelector) {
    chrome.storage.sync.set({"TRACKERURL": window.location.href})
    chrome.storage.sync.set({"CSSSELECTOR": cssSelector.join(' ')})
    console.log(window.location.href, cssSelector.join(' '))
}
