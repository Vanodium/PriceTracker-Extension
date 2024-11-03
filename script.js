// chrome.storage.sync.clear()

// export { userHash }

const apiLink = "http://127.0.0.1:8989"

chrome.storage.sync.get(["TOKEN"], (token) => {
    let userHash = token["TOKEN"]
    if (userHash == undefined) {
        console.log("Did not find TOKEN")

        changeVisibility("flex", "oauth-layout");
        changeVisibility("none", "trackers-layout");

        document.getElementById("auth-button").addEventListener("click", sendAuthRequest);
    } else {
        console.log("Found token", userHash)

        changeVisibility("flex", "trackers-layout");
        changeVisibility("none", "oauth-layout");

        getTrackers(userHash);
        document.getElementById("add-button-block").addEventListener("click", () => {addTrackerRequest(userHash)});
    }
});

function changeVisibility(status, blockId="", blockClass="") {
    if (blockId != "") {
        document.getElementById(blockId).style.display = status
    } else {
        document.getElementsByClassName(blockClass)[0].style.display = status
    }
}

function sendAuthRequest() {
    fetch(`${apiLink}/auth/oauth`, { 
        method: 'GET'
    })
    .then(function(response) { return response.json(); })
    .then(function(json) {
        {chrome.storage.sync.set({"TOKEN": json["data"]})};
    });
}

function getTrackers(userHash) {
    let params = new URLSearchParams({"UserHash": userHash});

    fetch(`${apiLink}/trackers?${params.toString()}`, {method: "GET"})
    .then(response => {
        if (!response.ok) {
            throw new Error("Could not get the trackers " + response.statusText);
        }
        return response.json()
    })
    .then(data => {
        displayTrackers(userHash, data["data"])
    })
}

function displayTrackers(userHash, trackers) {
    const trackersContainer = document.getElementById("trackers-list");
    if (trackers == null) {
        changeVisibility("none", "", "trackers")
        return
    }
    changeVisibility("flex", "", "trackers")
    for (i = 0; i < trackers.length; i++) {
        let trackerId
        let link
        trackerId = trackers[i][0]
        link = trackers[i][1]
        trackersContainer.insertAdjacentHTML("beforeend", `<li id="tracker ${trackerId}"><a target=_blank href=${link}>${link}</a><button id="delete ${trackerId}">delete</button></li>`);
        document.getElementById(`delete ${trackerId}`).addEventListener("click", () => {deleteTrackerRequest(userHash, trackerId)});
    }
}

function deleteTrackerRequest(userHash, trackerId) {
    let params = new URLSearchParams({"UserHash": userHash, "TrackerId":trackerId});

    fetch(`${apiLink}/trackers?${params.toString()}`, {method: "DELETE"})
    .then(response => {
        if (!response.ok) {
            throw new Error("Could not get the token " + response.statusText);
        }
        console.log("Deleted tracker")
        document.getElementById(`tracker ${trackerId}`).remove()
    })
}

function addTrackerRequest(token) {
    var url
    var selector
    chrome.storage.sync.get(["URL"], function(link) {
        url = link["URL"]
        chrome.storage.sync.get(["SELECTOR"], function(s) {
            selector = s["SELECTOR"]
            let params = new URLSearchParams({"UserHash": token, "Url":url, "XPath": selector});
            console.log(token, url, selector);
            fetch(`${apiLink}/trackers?${params.toString()}`, {method: "POST"})
            .then(response => {
                if (!response.ok) {
                    throw new Error("Could not get the token " + response.statusText);
                }
                console.log("Added tracker")
                // document.getElementById(`tracker ${trackerId}`).remove()
            })
        });
    });
}
