/**
 * If the image query parameter is not empty, a request is send out to compile urls from the pattern.
 */
window.onload = function () {
    var imageQuery = getParameterByName('iq');
    if (imageQuery.length > 0) {
        chrome.runtime.sendMessage({compilePattern: imageQuery});
    }
};

/**
 * Returns the value of the query parameter or an empty string.
 *
 * @param name
 * @returns {string}
 */
function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

/**
 * Message handlers.
 *
 * @param request
 * @param sender
 * @param sendResponse
 */
function onMessageReceived(request, sender, sendResponse) {
    if (request.data) {
        appendImages(request.data);
        sendResponse({response: "data received"});
        return true;
    }
    return false;
}

/**
 * Register message handler.
 */
chrome.runtime.onMessage.addListener(onMessageReceived);

/**
 * Creates a img element for the given url.
 *
 * @param imageUrl
 * @returns {HTMLElement}
 */
function createImage(imageUrl) {
    var img = document.createElement("img");
    img.setAttribute("src", imageUrl);
    img.setAttribute("alt", imageUrl);
    return img;
}

/**
 * Appends img elements to the results element. Appending individual elements isn't very
 * efficient. Should be rewritten to appending a single block of img elements.
 *
 * @param data
 */
function appendImages(data) {
    function appendImage(image) {
        document.getElementById("results").appendChild(image);
    }

    data.urls.forEach(function (element, index, array) {
            appendImage(createImage(element));
        }
    );
}