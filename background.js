
collectorTabId = -1;

chrome.browserAction.onClicked.addListener(function() {
    createCollectorTab();
});


function createCollectorTab() {
    chrome.tabs.create({url: "collector.html", active: false}, injectCollectorScript);
}

function injectCollectorScript(tab) {
    collectorTabId = tab.id;
    startExtracting();
//    chrome.tabs.executeScript(collectorTabId, {file: "collector.js"}, startExtracting);
}

function startExtracting() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        start = true;
        lastTabId = tabs[0].id;
        chrome.tabs.sendMessage(lastTabId, "Background page started.");
    });
}

chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
    chrome.tabs.sendMessage(collectorTabId, msg);
});


