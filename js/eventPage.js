/**
 * Event page with a listener for certain messages. When a url pattern message is received, a new tab is opened to
 * display the results. When a the compile pattern is received to pattern is compiled into a set of urls and send back
 * to the requester.
 */

/**
 * Message handler.
 *
 * @param request
 * @param sender
 * @param sendResponse
 */
function onMessageReceived(request, sender, sendResponse) {
    if (request.urlPattern) {
        openResultsTab(request.urlPattern);
        sendResponse({response: "results tab was opened"});
        return true;
    }
    if (request.compilePattern) {
        compileUrlsAndSendResults(sender.tab, request.compilePattern);
        sendResponse({response: "urls were sent"});
        return true;
    }
    sendResponse({response: "no operation"});
    return false;
}

/**
 * Register message handler.
 */
chrome.runtime.onMessage.addListener(onMessageReceived);

/**
 * Opens a new tab to display the images. The url pattern is passed to the tab using a query parameter.
 *
 * @param imageQuery
 */
function openResultsTab(imageQuery) {
    chrome.tabs.create({url: chrome.extension.getURL('/html/results.html') + '?iq=' + encodeURI(imageQuery)});
}

/**
 * Compiles the urls using the pattern and sends to results back to the requesting tab.
 *
 * @param tab
 * @param pattern
 */
function compileUrlsAndSendResults(tab, pattern) {
    chrome.tabs.sendMessage(tab.id, {data: new UrlCompiler.getData(pattern)});
}

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