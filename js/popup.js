/**
 * Initialize popup window's elements.
 */
window.onload = function () {
    loadI18nMessages();
    var inputField = document.getElementById("q");
    inputField.focus();
    inputField.onsearch = checkInputAndSend;
    document.getElementById("q-button").onclick = checkInputAndSend;
};

/**
 * Load localizations into browser action.
 */
function loadI18nMessages() {
    function setProperty(selector, prop, msg) {
        document.querySelector(selector)[prop] = chrome.i18n.getMessage(msg);
    }

    setProperty('#q', 'placeholder', 'searchPlaceholder');
    setProperty('#q-button', 'value', 'doSearch');
}

/**
 * Gets the user's input and sends it as a system message.
 */
function checkInputAndSend() {
    var inputValue = document.getElementById("q").value;
    if (inputValue == null || inputValue.length == 0) {
        return;
    }
    chrome.runtime.sendMessage({urlPattern: inputValue});
}