export default function loadJSON(file) {
    return new Promise(function(resolve, reject) {
        let xmlHttpRequest = new XMLHttpRequest();
        xmlHttpRequest.overrideMimeType("application/json");
        xmlHttpRequest.open('GET', file, true);
        xmlHttpRequest.onreadystatechange = function () {
            if (xmlHttpRequest.readyState === 4) {
                if (xmlHttpRequest.status === 200) {
                    resolve(xmlHttpRequest.responseText);
                } else {
                    reject(xmlHttpRequest.status);
                }
            }
        };
        xmlHttpRequest.send(null);
    });
}
