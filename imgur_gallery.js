var clientId = "756da99e32105c9";

var failureReasons = {
    0: "success",
    1: "invalid request",
    2: "authentication failed",
    3: "permission denied",
    4: "resource does not exist",
    5: "rate limiting",
    6: "internal error",
    7: "invalid response",
    8: "could not connect to server",
    "-1": "unknown error"
};

var failureReasonFromRequestStatus = function (status) {
    /* Status summaries taken from https://imgur.com/errorhandling. */
    switch (status) {
        case 200:
            /* The request has succeeded and there were no errors. Congrats! */
            return 0;
        case 400:
            /* This error indicates that a required parameter is missing or a
             * parameter has a value that is out of bounds or otherwise
             * incorrect. This status code is also returned when image uploads
             * fail due to images that are corrupt or do not meet the format
             * requirements. */
            return 1;
        case 401:
            /* The request requires user authentication. Either you didn't send
             * send OAuth credentials, or the ones you sent were invalid. */
            return 2;
        case 402:
            /* Forbidden. You don't have access to this action. If you're
             * getting this error, check that you haven't run out of API
             * credits or make sure you're sending the OAuth headers correctly
             * and have valid tokens/secrets. */
            return 3;
        case 404:
            /* Resource does not exist. This indicates you have requested a
             * resource that does not exist. For example, requesting an image
             * that doesn't exist. */
            return 4;
        case 429:
            /* Rate limiting. This indicates you have hit either the rate
             * limiting on the application or on the user's IP address. */
            return 5;
        case 500:
            /* Unexpected internal error. What it says. We'll strive NOT to
             * return these but your app should be prepared to see it. It
             * basically means that something is broken with the Imgur service.
             */
            return 6;
        case 0:
            /* The XMLHttpRequest failed to complete (eg. timed out). */
            return 8;
        default:
            return -1;
    }
};

var imgurAPIGetRequest = function (endpoint, successCallback, failureCallback) {
    var imgurAPIRequest = new XMLHttpRequest();
    imgurAPIRequest.open("GET", "https://api.imgur.com/3/" + endpoint, true);
    imgurAPIRequest.setRequestHeader("Authorization", "Client-ID " + clientId);

    imgurAPIRequest.onreadystatechange = function () {
        if (imgurAPIRequest.readyState != 4) return;
        var requestSuccessful = true,
            failureReason = 0,
            APIResponse;

        if (requestSuccessful && imgurAPIRequest.status != 200) {
            requestSuccessful = false;
            failureReason =
                failureReasonFromRequestStatus(imgurAPIRequest.status);
        }

        if (requestSuccessful) {
            try {
                /* TODO: IE <8.0 doesn't support JSON.parse. The API supports
                 * XML as a format, so we can use that to support these, by
                 * adding .xml to the request URL.
                 */
                APIResponse = JSON.parse(imgurAPIRequest.responseText);
                responseData = APIResponse.data;
            }
            catch (e) {
                requestSuccessful = false;
                failureReason = 7; /* Invalid response. */
            }

        }

        if (requestSuccessful) {
            successCallback(responseData);
        }
        else {
            failureCallback(failureReason);
        }
    }

    imgurAPIRequest.send();
};

var getUserAlbums = function (account, successCallback, failureCallback) {
    imgurAPIGetRequest("account/" + account + "/albums", successCallback,
            failureCallback);
};

var getUserAlbumImages = function (account, albumId, successCallback,
        failureCallback) {
    imgurAPIGetRequest("account/" + account + "/album/" + albumId + "/images",
            successCallback, failureCallback);
};
