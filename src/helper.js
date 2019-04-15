export function wellLooked(x) {
    if (x > 999 && x < 1000000) {
        if (Math.round(x / 100) !== Math.round(x / 1000) * 10) {
            return (x / 1000).toFixed(1) + 'K'
        } else {
            return Math.round(x / 1000) + 'K'
        }
    } else if (x > 999999) {
        if (Math.round(x / 100000) !== Math.round(x / 1000000) * 10) {
            return (x / 1000000).toFixed(1) + 'M'
        } else {
            return Math.round(x / 1000000) + 'M'
        }
    } else {
        return x;
    }
}

export function wellLookedSpaces(x) {
    let res = x.toString();
    return x < 100000 ? x : res.replace(/(\d)(?=(\d{3})+$)/g, '$1&nbsp;');
}

export function dateConvert(timestamp, format = '&d &m') {

    let monthsShort = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    let monthsFull = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    let daysShort = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    let daysFull = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    let dt = new Date(timestamp);
    let res = format;

    let o = dt.getMonth() + 1;
    o = o.toString();
    o = o.length < 2 ? '0' + o : o;
    res = res.replace('&O', o);

    let monthShort = monthsShort[dt.getMonth()];
    res = res.replace('&m', monthShort);

    let monthFull = monthsFull[dt.getMonth()];
    res = res.replace('&M', monthFull);

    let day = dt.getDate();
    res = res.replace('&d', day);

    day = day.toString();
    day = day.length < 2 ? '0' + day : day;
    res = res.replace('&D', day);

    let dayShort = daysShort[dt.getDay()];
    res = res.replace('&w', dayShort);

    let dayFull = daysFull[dt.getDay()];
    res = res.replace('&W', dayFull);

    let year = dt.getFullYear();
    res = res.replace('&Y', year);

    let minute = dt.getMinutes().toString();
    minute = minute.length < 2 ? '0' + minute : minute;
    res = res.replace('&i', minute);

    let hour = dt.getHours();
    res = res.replace('&h', hour)

    return res
}

export function dayBeginStamp(date) {
    let dt = new Date(dateConvert(date, '&Y-&O-&DT00:00:00'));
    return dt.getTime() - dt.getTimezoneOffset() * 60 * 1000;
}

export function dayEndStamp(date) {
    let dt = new Date(dateConvert(date, '&Y-&O-&DT23:59:59'));
    return dt.getTime() - dt.getTimezoneOffset() * 60 * 1000;
}
