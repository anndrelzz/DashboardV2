let _show = null

export const toast = (msg, ok = true) => _show?.({ msg, ok })

export const setToastHandler = (fn) => { _show = fn }
