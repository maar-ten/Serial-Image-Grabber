/**
 * Event page with a listener for urlPattern messages. When a message is received, the url patter is compiled into
 * separate urls and a new tab is opened to display the images.
 */

/**
 * The incrementor takes a start and finish parameters. After initializing the counter the increment function can be
 * called, which will return the next index and increase the index. The first index returned is equal to the start.
 * The last index is equal to the finish.
 *
 * @param {number} start
 * @param {number} finish
 * @constructor
 */
function Incrementer(start, finish) {
    var incrementer = this;
    incrementer.counter = start;
    incrementer.from = start;
    incrementer.to = finish;
}
Incrementer.prototype.increment = function () {
    return this.counter++;
};

/**
 * The formatter returns a string value of a integer value padded with leading zeroes if the amount requires it.
 *
 * @param {number} amount
 * @constructor
 */
function LeadingZeroes(amount) {
    var leadingZeroes = this;
    leadingZeroes.number = amount;
}
LeadingZeroes.prototype.format = function (value) {
    if (value.toString().length >= this.number) {
        return value;
    }
    return this.format("0" + value);
};

/**
 * The url pattern is expected to have the form of http(s)://some-website.com/img[xxx-yyy].png. That pattern is
 * decompiled into separate discrete urls and then returned as an array.
 *
 * The urls are incremented numerically from xxx to yyy. If the pattern [xxx-yyy] is of the form '012-034' the counter
 * is initialized to 12 and will count upward until is reaches 34. 34 will be the last number when next() is called on
 * the incrementer.
 *
 * The formatter will handle the padding of any leading zero's when given a particular number
 *
 * @param {string} urlPattern
 * @returns {*} an data structure with an array of urls
 */
var UrlCompiler = {};
UrlCompiler.getData = function (urlPattern) {
    var incrementer, formatter, before, after, Data;

    var RegExpPatterns = {
        protocol:     /^\s*(https?:\/\/)/i,
        series:       /(\[([0-9]*)-([0-9]*)\])/,
        urlChunks:    /^\s*(https?:\/\/.*)\[.*-.*\](.*$)/i,
        numberFormat: /\[([0-9]*)-[0-9]*\]/
    };

    Data = {
        urls: []
    };

    if (!urlPattern || !RegExpPatterns.protocol.test(urlPattern)) {
        return Data;
    }

    if (RegExpPatterns.series.test(urlPattern)) {
        var fileNameParameters = urlPattern.match(RegExpPatterns.series);
        incrementer = new Incrementer(parseInt(fileNameParameters[2]), parseInt(fileNameParameters[3]));
    }

    if (RegExpPatterns.urlChunks.test(urlPattern)) {
        var urlChunks = urlPattern.match(RegExpPatterns.urlChunks);
        before = urlChunks[1];
        after = urlChunks[2];
    }

    if (RegExpPatterns.numberFormat.test(urlPattern)) {
        formatter = new LeadingZeroes(urlPattern.match(RegExpPatterns.numberFormat)[1].length);
    }

    while (incrementer.counter <= incrementer.to) {
        Data.urls.push(before + formatter.format(incrementer.increment()) + after);
    }

    return Data;
};

/**
 * Adds a update listener to a tab that will send the data packet to the given tab when it's ready loading.
 *
 * @param tab
 * @param data
 */
function onTabUpdated(tab, data) {
    chrome.tabs.onUpdated.addListener(function (updatedTabId, changeInfo, updatedTab) {
        if (tab.id === updatedTabId && changeInfo.status === "complete") {
            chrome.tabs.sendMessage(tab.id, {data: data});
        }
    });
}

/**
 * Opens a new tab if the request contains a url pattern. The opened tab will receive the data when the tab is fully loaded.
 *
 * @param request
 * @param sender
 * @param sendResponse
 */
function processRequest(request, sender, sendResponse) {
    if (!request.urlPattern) {
        return;
    }
    chrome.tabs.create({url: chrome.extension.getURL('/html/results.html')}, function (tab) {
        onTabUpdated(tab, new UrlCompiler.getData(request.urlPattern));
    });
}

/**
 * Registers a request listener.
 */
chrome.runtime.onMessage.addListener(processRequest);
