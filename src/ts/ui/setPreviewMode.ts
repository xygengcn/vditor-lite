export const setPreviewMode = (mode: "both" | "editor", vditor: IVditor) => {
    if (vditor.options.preview.mode === mode) {
        return
    }
    vditor.options.preview.mode = mode

    switch (mode) {
        case "both":
            vditor.preview.element.style.display = "block"
            vditor.preview.render(vditor)

            break
        case "editor":
            vditor.preview.element.style.display = "none"
            break
        default:
            break
    }

    if (vditor.devtools) {
        vditor.devtools.renderEchart(vditor)
    }
}
