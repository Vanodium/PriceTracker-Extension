// import { userHash } from "script.js"
const apiLink = "http://127.0.0.1:8989"

document.addEventListener("click",
    function(e) {
        if (e.shiftKey) {
            let selector = getSelector(document.elementFromPoint(e.clientX, e.clientY))
            setTracker(selector);
        }
    }, false
)

function getSelector(element) {
    let block = element.nodeName;
    element.classList.forEach(cl => block += '.' + cl);
    if (element.id) block += '#' + element.id;
        
    if (!element.id && element.parentElement) {
        let result = getSelector(element.parentElement);
        result.push(block);
        return result;
    }
    return [block];
}

function setTracker(selector) {
    let url = window.location.href
    chrome.storage.sync.set({"URL": url})
    chrome.storage.sync.set({"SELECTOR": selector.join(' ')})
    console.log(selector.join(" "))
}
