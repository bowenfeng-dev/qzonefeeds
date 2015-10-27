
chrome.runtime.onMessage.addListener(function (msg, _, sendResponse) {
    console.log(msg);
    divEle = document.createElement('div');
    divEle.innerHTML = msg;
    feedsEle = document.getElementById('feeds');
    feedsEle.appendChild(divEle);
});
