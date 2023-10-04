export const isSafari = () => {
    return (
        navigator.userAgent.indexOf("Safari") > -1 &&
        navigator.userAgent.indexOf("Chrome") === -1
    )
}

export const isFirefox = () => {
    return navigator.userAgent.toLowerCase().indexOf("firefox") > -1
}

export const accessLocalStorage = () => {
    try {
        return typeof localStorage !== "undefined"
    } catch (e) {
        return false
    }
}

// 区别 mac 上的 ctrl 和 meta
export const isCtrl = (event: KeyboardEvent) => {
    if (navigator.platform.toUpperCase().indexOf("MAC") >= 0) {
        // mac
        if (event.metaKey && !event.ctrlKey) {
            return true
        }
        return false
    } else {
        if (!event.metaKey && event.ctrlKey) {
            return true
        }
        return false
    }
}

export const isChrome = () => {
    return (
        /Chrome/.test(navigator.userAgent) &&
        /Google Inc/.test(navigator.vendor)
    )
}
