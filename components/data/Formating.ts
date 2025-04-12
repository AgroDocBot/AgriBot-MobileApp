function formatSeconds(sec: number) {

    let result: string = "";
    if(sec < 60) result = sec.toString() + " s";
    else if(sec < 3600) {
        let min = Math.floor(sec / 60);
        let secs = sec % 60;
        result = min.toString() + " m " + secs.toString() + " s";
    } else {
        let hours = sec / 3600;
        let min = Math.floor(sec % 3600 / 60);
        let secs = sec % 3600 % 60;
        result = hours.toString() + " h " + min.toString() + " m " + secs.toString() + " s";
    }

    return result;
}

function formatPercent(percent: number) {
    return Math.round((percent + Number.EPSILON) * 1000 ) / 100 + "%";
}

export { formatSeconds, formatPercent }