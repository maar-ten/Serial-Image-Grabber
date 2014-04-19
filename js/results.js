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

/**
 * Creates a request handler.
 *
 * @param request
 * @param sender
 * @param sendResponse
 */
function onMessageReceived(request, sender, sendResponse) {
    appendImages(request.data);
}

/**
 * Registers a request listener.
 */
chrome.runtime.onMessage.addListener(onMessageReceived);

