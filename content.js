
console.log('content.js instantiated.');

chrome.runtime.onMessage.addListener(function (msg, _, sendResponse) {
    tryExtract();
});


function tryExtract() {
    var feedsEle = $('#menu_feedlist');
    if (!feedsEle || !feedsEle.attr('class')) {
        return;
    }
    if (feedsEle.attr('class').indexOf('selected') < 0) {
        console.log('feeds is not current tab.');
        return;
    }

    scrollToEndThenExtract();
}


function scrollToEndThenExtract() {
    var feedElements = $('li.feed'),
        i = 0,
        total = feedElements.length,
        intervalId;

    intervalId = setInterval(function () {
        if (i >= total) {
            clearInterval(intervalId);
            extract();
            return;
        }
        feedElements[i].scrollIntoView();
        expandFullText(feedElements[i]);
        i += 1;
    }, 5000)
}

function expandFullText(feedEle) {
    var expandAnchor = $(feedEle).find('a.has_more_con');
    if (expandAnchor && expandAnchor.length && expandAnchor[0].text.length) {
        expandAnchor[0].click();
    }
}

function extract() {
    var feeds = extractFeeds();
    console.log(feeds);
    chrome.runtime.sendMessage(feeds.join(''));
    fetchNextPage();
}

function extractFeeds() {
    var feedElements = $('li.feed'),
        feedTemplate = _.template(
            '<div class="feed">' +
              '<div><%= date %></div>' +
              '<div><%= shareStatus %></div>' +
              '<pre><%= text %></pre>' +
              '<ul>' +
                '<% _.forEach(imgs, function (img) { %>' +
                    '<li><%= img %></li>' +
                '<% }); %>' +
              '</ul>' +
            '</div>');

    return _.map(feedElements, function (feedEle) {
        return feedTemplate({
            date: extractDate(feedEle),
            shareStatus: extractPrivateStatus(feedEle),
            text: extractFeedText(feedEle),
            imgs: extractImages(feedEle)
        });
    });
}

function extractFeedText(feedEle) {
    var textEle = $(feedEle).find('pre.content');
    if (textEle && textEle.length) {
        return textEle[0].innerHTML;
    }
    return ''
}

function extractImages(feedEle) {
    var imagesDiv = $(feedEle).find('div.img-attachments');
    if (imagesDiv && imagesDiv.length) {
        return extractImagesFromInnerHtml(imagesDiv[0].innerHTML);
    }
    return [];
}

function extractImagesFromInnerHtml(imagesDivHtml) {
    var imageElements = $(imagesDivHtml).find('img'),
        imgTemplate = _.template('<img src="<%= src %>" data-src="<%= datasrc%>">');

    return _.map(imageElements, function(img) {
        return imgTemplate({
            src: img.getAttribute('src'),
            datasrc: img.getAttribute('data-src')
        });
    });
}

function extractPrivateStatus(feedEle) {
    var lockIcon = $(feedEle).find('span.icon-lock');
    return (lockIcon && lockIcon.length) ? 'Private' : 'Public';
}

function extractDate(feedEle) {
    var date = $(feedEle).find('div.info a.goDetail').text();

    if (date.endsWith('日')) {
        return date;
    } else if (date.startsWith('昨天')) {
        return formatDate(-1);
    } else if (date.startsWith('前天')) {
        return formatDate(-2);
    } else { // Today, the date only contains time.
        return formatDate(0);
    }
}

var MILLISECONDS = 1000;
var SECONDS_PER_HOUR = 3600;
var HOURS_PER_DAY = 24;
var MILLISECONDS_PER_DAY = HOURS_PER_DAY * SECONDS_PER_HOUR * MILLISECONDS;

function formatDate(dayOffset) {
    var dateTemplate = _.template('<%= yyyy %>年<%= mm %>月<%= dd %>日'),
        date = new Date(Date.now() + dayOffset * MILLISECONDS_PER_DAY);
    return dateTemplate({
        yyyy: date.getFullYear(),
        mm: date.getMonth() + 1,
        dd: date.getDate()
    });
}

function fetchNextPage() {
    nextPageButton = $('a[id^="pager_next_"]');
    if (nextPageButton.length > 0) {
        nextPageButton[0].click();
        setTimeout(function () {
            scrollToEndThenExtract();
        }, 5000);
    }
}

