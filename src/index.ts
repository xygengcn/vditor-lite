import "./assets/less/index.less"
import VditorMethod from "./method"
import { VDITOR_VERSION } from "./ts/constants"
// import { DevTools } from "./ts/devtools/index"
import { Hint } from "./ts/hint/index"
import { IR } from "./ts/ir/index"
import { input as irInput } from "./ts/ir/input"
import { processAfterRender } from "./ts/ir/process"
import { getHTML } from "./ts/markdown/getHTML"
import { getMarkdown } from "./ts/markdown/getMarkdown"
import { setLute } from "./ts/markdown/setLute"
import { Outline } from "./ts/outline/index"
import { Preview } from "./ts/preview/index"
import { Resize } from "./ts/resize/index"
import { Tip } from "./ts/tip/index"
import { initUI, UIUnbindListener } from "./ts/ui/initUI"
import { setCodeTheme } from "./ts/ui/setCodeTheme"
import { setContentTheme } from "./ts/ui/setContentTheme"
import { setPreviewMode } from "./ts/ui/setPreviewMode"
import { setTheme } from "./ts/ui/setTheme"
import { Undo } from "./ts/undo/index"
import { Upload } from "./ts/upload/index"
import { addScript, addScriptSync } from "./ts/util/addScript"
import { getSelectText } from "./ts/util/getSelectText"
import { Options } from "./ts/util/Options"
import { processCodeRender } from "./ts/util/processCode"
import { getCursorPosition, getEditorRange } from "./ts/util/selection"

class Vditor extends VditorMethod {
    public readonly version: string
    public vditor: IVditor

    /**
     * @param id 要挂载 Vditor 的元素或者元素 ID。
     * @param options Vditor 参数
     */
    constructor(id: string | HTMLElement, options?: IOptions) {
        super()
        this.version = VDITOR_VERSION

        if (typeof id === "string") {
            if (!options) {
                options = {
                    cache: {
                        id: `vditor${id}`,
                    },
                }
            } else if (!options.cache) {
                options.cache = { id: `vditor${id}` }
            } else if (!options.cache.id) {
                options.cache.id = `vditor${id}`
            }
            id = document.getElementById(id)
        }

        const getOptions = new Options(options)
        const mergedOptions = getOptions.merge()

        // 支持自定义国际化
        if (!mergedOptions.i18n) {
            if (
                ![
                    "en_US",
                    "fr_FR",
                    "pt_BR",
                    "ja_JP",
                    "ko_KR",
                    "ru_RU",
                    "sv_SE",
                    "zh_CN",
                    "zh_TW",
                ].includes(mergedOptions.lang)
            ) {
                throw new Error(
                    "options.lang error, see https://ld246.com/article/1549638745630#options"
                )
            } else {
                const i18nScriptPrefix = "vditorI18nScript"
                const i18nScriptID = i18nScriptPrefix + mergedOptions.lang
                document
                    .querySelectorAll(`head script[id^="${i18nScriptPrefix}"]`)
                    .forEach((el) => {
                        if (el.id !== i18nScriptID) {
                            document.head.removeChild(el)
                        }
                    })
                addScript(
                    `${mergedOptions.cdn}/js/i18n/${mergedOptions.lang}.js`,
                    i18nScriptID
                ).then(() => {
                    this.init(id as HTMLElement, mergedOptions)
                })
            }
        } else {
            window.VditorI18n = mergedOptions.i18n
            this.init(id, mergedOptions)
        }
    }

    /** 设置主题 */
    public setTheme(
        theme: "dark" | "classic",
        contentTheme?: string,
        codeTheme?: string,
        contentThemePath?: string
    ) {
        this.vditor.options.theme = theme
        setTheme(this.vditor)
        if (contentTheme) {
            this.vditor.options.preview.theme.current = contentTheme
            setContentTheme(
                contentTheme,
                contentThemePath || this.vditor.options.preview.theme.path
            )
        }
        if (codeTheme) {
            this.vditor.options.preview.hljs.style = codeTheme
            setCodeTheme(codeTheme, this.vditor.options.cdn)
        }
    }

    /** 获取 Markdown 内容 */
    public getValue() {
        return getMarkdown(this.vditor)
    }

    /** 获取编辑器当前编辑模式 */
    public getCurrentMode() {
        return this.vditor.currentMode
    }

    /** 聚焦到编辑器 */
    public focus() {
        this.vditor.ir?.element.focus()
    }

    /** 让编辑器失焦 */
    public blur() {
        this.vditor.ir?.element.blur()
    }

    /** 禁用编辑器 */
    public disabled() {
        this.vditor[this.vditor.currentMode].element.setAttribute(
            "contenteditable",
            "false"
        )
    }

    /** 解除编辑器禁用 */
    public enable() {
        this.vditor.undo.clearStack()
        this.vditor[this.vditor.currentMode].element.setAttribute(
            "contenteditable",
            "true"
        )
    }

    /** 返回选中的字符串 */
    public getSelection() {
        return getSelectText(this.vditor.ir.element)
    }

    /** 设置预览区域内容 */
    public renderPreview(value?: string) {
        this.vditor.preview.render(this.vditor, value)
    }

    /** 获取焦点位置 */
    public getCursorPosition() {
        return getCursorPosition(this.vditor[this.vditor.currentMode].element)
    }

    /** 上传是否还在进行中 */
    public isUploading() {
        return this.vditor.upload.isUploading
    }

    /** 清除缓存 */
    public clearCache() {
        localStorage.removeItem(this.vditor.options.cache.id)
    }

    /** 禁用缓存 */
    public disabledCache() {
        this.vditor.options.cache.enable = false
    }

    /** 启用缓存 */
    public enableCache() {
        if (!this.vditor.options.cache.id) {
            throw new Error(
                "need options.cache.id, see https://ld246.com/article/1549638745630#options"
            )
        }
        this.vditor.options.cache.enable = true
    }

    /** HTML 转 md */
    public html2md(value: string) {
        return this.vditor.lute.HTML2Md(value)
    }

    /** markdown 转 JSON 输出 */
    public exportJSON(value: string) {
        return this.vditor.lute.RenderJSON(value)
    }

    /** 获取 HTML */
    public getHTML() {
        return getHTML(this.vditor)
    }

    /** 消息提示。time 为 0 将一直显示 */
    public tip(text: string, time?: number) {
        this.vditor.tip.show(text, time)
    }

    /** 设置预览模式 */
    public setPreviewMode(mode: "both" | "editor") {
        setPreviewMode(mode, this.vditor)
    }

    /** 删除选中内容 */
    public deleteValue() {
        if (window.getSelection().isCollapsed) {
            return
        }
        document.execCommand("delete", false)
    }

    /** 更新选中内容 */
    public updateValue(value: string) {
        document.execCommand("insertHTML", false, value)
    }

    /** 在焦点处插入内容，并默认进行 Markdown 渲染 */
    public insertValue(value: string, render = true) {
        const range = getEditorRange(this.vditor)
        range.collapse(true)
        const tmpElement = document.createElement("template")
        tmpElement.innerHTML = value
        range.insertNode(tmpElement.content.cloneNode(true))
        range.collapse(false)

        // 只保留ir
        this.vditor.ir.preventInput = true
        if (render) {
            irInput(this.vditor, getSelection().getRangeAt(0), true)
        }
    }

    /** 设置编辑器内容 */
    public setValue(markdown: string, clearStack = false) {
        this.vditor.ir.element.innerHTML =
            this.vditor.lute.Md2VditorIRDOM(markdown)
        this.vditor.ir.element
            .querySelectorAll(".vditor-ir__preview[data-render='2']")
            .forEach((item: HTMLElement) => {
                processCodeRender(item, this.vditor)
            })
        processAfterRender(this.vditor, {
            enableAddUndoStack: true,
            enableHint: false,
            enableInput: false,
        })

        this.vditor.outline.render(this.vditor)

        if (!markdown) {
            this.clearCache()
        }
        if (clearStack) {
            this.clearStack()
        }
    }

    /** 清空 undo & redo 栈 */
    public clearStack() {
        this.vditor.undo.clearStack()
        this.vditor.undo.addToUndoStack(this.vditor)
    }

    /** 销毁编辑器 */
    public destroy() {
        this.vditor.element.innerHTML = this.vditor.originalInnerHTML
        this.vditor.element.classList.remove("vditor")
        this.vditor.element.removeAttribute("style")
        const iconScript = document.getElementById("vditorIconScript")
        if (iconScript) {
            iconScript.remove()
        }
        this.clearCache()

        UIUnbindListener()
    }

    private init(id: HTMLElement, mergedOptions: IOptions) {
        this.vditor = {
            currentMode: mergedOptions.mode,
            element: id,
            hint: new Hint(mergedOptions.hint.extend),
            lute: undefined,
            options: mergedOptions,
            originalInnerHTML: id.innerHTML,
            outline: new Outline(window.VditorI18n.outline),
            tip: new Tip(),
        }

        this.vditor.ir = new IR(this.vditor)

        this.vditor.undo = new Undo()

        if (mergedOptions.resize.enable) {
            this.vditor.resize = new Resize(this.vditor)
        }

        // 开发工具
        // if (this.vditor.toolbar.elements.devtools) {
        //     this.vditor.devtools = new DevTools()
        // }

        if (mergedOptions.upload.url || mergedOptions.upload.handler) {
            this.vditor.upload = new Upload()
        }

        addScript(
            mergedOptions._lutePath ||
                `${mergedOptions.cdn}/js/lute/lute.min.js`,
            "vditorLuteScript"
        ).then(() => {
            this.vditor.lute = setLute({
                autoSpace: this.vditor.options.preview.markdown.autoSpace,
                gfmAutoLink: this.vditor.options.preview.markdown.gfmAutoLink,
                codeBlockPreview:
                    this.vditor.options.preview.markdown.codeBlockPreview,
                emojiSite: this.vditor.options.hint.emojiPath,
                emojis: this.vditor.options.hint.emoji,
                fixTermTypo: this.vditor.options.preview.markdown.fixTermTypo,
                footnotes: this.vditor.options.preview.markdown.footnotes,
                headingAnchor: false,
                inlineMathDigit: this.vditor.options.preview.math.inlineDigit,
                linkBase: this.vditor.options.preview.markdown.linkBase,
                linkPrefix: this.vditor.options.preview.markdown.linkPrefix,
                listStyle: this.vditor.options.preview.markdown.listStyle,
                mark: this.vditor.options.preview.markdown.mark,
                mathBlockPreview:
                    this.vditor.options.preview.markdown.mathBlockPreview,
                paragraphBeginningSpace:
                    this.vditor.options.preview.markdown
                        .paragraphBeginningSpace,
                sanitize: this.vditor.options.preview.markdown.sanitize,
                toc: this.vditor.options.preview.markdown.toc,
            })

            this.vditor.preview = new Preview(this.vditor)

            initUI(this.vditor)

            if (mergedOptions.after) {
                mergedOptions.after()
            }
            if (mergedOptions.icon) {
                // 防止初始化 2 个编辑器时加载 2 次
                addScriptSync(
                    `${mergedOptions.cdn}/js/icons/${mergedOptions.icon}.js`,
                    "vditorIconScript"
                )
            }
        })
    }
}

export default Vditor
