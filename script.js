// chrome.storage.sync.clear()
const apiLink = "http://127.0.0.1:8989";

chrome.storage.sync.get(["USERHASH"], (data) => {
    let userHash = data["USERHASH"];

    if (userHash == undefined || userHash == "") {
        changeVisibility("flex", "oauth-layout");
        changeVisibility("none", "trackers-layout");

        document.getElementById("auth-button").addEventListener("click", sendAuthRequest);
    } else {
        changeVisibility("flex", "trackers-layout");
        changeVisibility("none", "oauth-layout");

        getTrackers(userHash);
        document.getElementById("add-button-block").addEventListener("click", () => {addTracker(userHash)});
    }
});

function changeVisibility(status, blockId="", blockClass="") {
    if (blockId) {
        document.getElementById(blockId).style.display = status;
    } else {
        document.getElementsByClassName(blockClass)[0].style.display = status;
    }
}

function sendAuthRequest() {
    fetch(`${apiLink}/auth/oauth`)
    .then(function(response) { 
        return response.json(); })
    .then(function(json) {
        chrome.storage.sync.set({"USERHASH": json["data"]});
        chrome.runtime.reload();
    });
}

function getTrackers(userHash) {
    let params = new URLSearchParams({"UserHash": userHash});

    fetch(`${apiLink}/trackers?${params.toString()}`, {method: "GET"})
    .then(response => {
        if (!response.ok) {
            throw new Error("Could not get the trackers " + response.statusText);
        }
        return response.json();
    })
    .then(data => {
        displayTrackers(userHash, data["data"]);
    })
}

function displayTrackers(userHash, trackers) {
    const trackersContainer = document.getElementById("trackers-list");
    if (trackers == null) {
        changeVisibility("none", "", "trackers");
        return
    }
    changeVisibility("flex", "", "trackers")
    let trackerId
    let trackerUrl
    for (i = 0; i < trackers.length; i++) {
        trackerId = trackers[i][0];
        trackerUrl = trackers[i][1];
        trackersContainer.insertAdjacentHTML("beforeend", `<li id="tracker ${trackerId}"><a target=_blank href=${trackerUrl}>${trackerUrl}</a><button id="delete ${trackerId}">delete</button></li>`);
        document.getElementById(`delete ${trackerId}`).addEventListener("click", () => {deleteTrackerRequest(userHash, trackerId)});
    }
}

function deleteTrackerRequest(userHash, trackerId) {
    let searchParameters = new URLSearchParams({"UserHash": userHash, "TrackerId": trackerId});

    fetch(`${apiLink}/trackers?${searchParameters.toString()}`, {method: "DELETE"})
    .then(response => {
        if (!response.ok) {
            throw new Error("Could not get the token " + response.statusText);
        }
        console.log("Deleted tracker");
        refreshTrackers(userHash);
    })
}

function addTracker(userHash) {
    chrome.storage.sync.get(["TRACKERURL"], function(data) {
        let trackerUrl = data["TRACKERURL"];

        chrome.storage.sync.get(["CSSSELECTOR"], function(data) {
            cssSelector = data["CSSSELECTOR"];

            let searchParameters = new URLSearchParams({"UserHash": userHash, "TrackerUrl": trackerUrl, "CssSelector": cssSelector});
            addTrackerRequest(searchParameters);
            refreshTrackers(userHash);
        });
    });
}

function addTrackerRequest(searchParameters) {
    fetch(`${apiLink}/trackers?${searchParameters.toString()}`, {method: "POST"})
    .then(response => {
        if (!response.ok) {
            throw new Error("Could not get the token " + response.statusText);
        }
        console.log("Added tracker");
    })
}

function refreshTrackers(userHash) {
    function fade(delta) {
        let trackersBlock
        let currentOpacity
        for (i = 0; i < 10; i++) {           
            setTimeout(() => {
                trackersBlock = document.getElementById("trackers-block");
                currentOpacity = parseFloat(getComputedStyle(trackersBlock).opacity) + delta;
                trackersBlock.style.opacity = currentOpacity.toString();
            }, i * 10)                       
        }
    }
    fade(-0.1);
    setTimeout(() => {
        document.getElementById("trackers-list").innerHTML = "";
        getTrackers(userHash);
        fade(0.1);
    }, 110)
}