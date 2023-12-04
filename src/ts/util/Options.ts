import { Constants } from "../constants"
import { merge } from "./merge"

export class Options {
    public options: IOptions
    private defaultOptions: IOptions

    constructor(options: IOptions) {
        this.options = options
        if (options.cdn) {
            Constants.CDN = options.cdn
        }
        this.defaultOptions = {
            rtl: false,
            after: undefined,
            cache: {
                enable: true,
            },
            cdn: Constants.CDN,
            classes: {
                preview: "",
            },
            comment: {
                enable: false,
            },
            counter: {
                enable: false,
                type: "markdown",
            },
            debugger: false,
            fullscreen: {
                index: 90,
            },
            height: "auto",
            hint: {
                delay: 200,
                emoji: {
                    "+1": "👍",
                    "-1": "👎",
                    confused: "😕",
                    eyes: "👀️",
                    heart: "❤️",
                    rocket: "🚀️",
                    smile: "😄",
                    tada: "🎉️",
                },
                emojiPath: `${Constants.CDN}/images/emoji`,
                extend: [],
                parse: true,
            },
            icon: "ant",
            lang: "zh_CN",
            mode: "ir",
            outline: {
                enable: false,
                position: "left",
            },
            placeholder: "",
            preview: {
                delay: 1000,
                hljs: Constants.HLJS_OPTIONS,
                markdown: Constants.MARKDOWN_OPTIONS,
                math: Constants.MATH_OPTIONS,
                maxWidth: 800,
                mode: "both",
                theme: {
                    ...Constants.THEME_OPTIONS,
                    path: `${Constants.CDN}/css/content-theme`,
                },
            },
            link: {
                isOpen: true,
            },
            image: {
                isPreview: true,
            },
            theme: "classic",

            toolbarConfig: {
                hide: false,
                pin: false,
            },
            typewriterMode: false,
            undoDelay: 800,
            upload: {
                extraData: {},
                fieldName: "file[]",
                filename: (name: string) => name.replace(/\W/g, ""),
                linkToImgUrl: "",
                max: 10 * 1024 * 1024,
                multiple: true,
                url: "",
                withCredentials: false,
            },
            value: "",
            width: "auto",
        }
    }

    public merge(): IOptions {
        if (this.options) {
            if (this.options.preview?.theme?.list) {
                this.defaultOptions.preview.theme.list =
                    this.options.preview.theme.list
            }
            if (this.options.hint?.emoji) {
                this.defaultOptions.hint.emoji = this.options.hint.emoji
            }
            if (this.options.comment) {
                this.defaultOptions.comment = this.options.comment
            }
            // 支持不够完善，我先注释了，后期再打开
            // if (this.options.rtl) {
            //     this.defaultOptions.rtl = this.options.rtl;
            // }
        }

        const mergedOptions = merge(this.defaultOptions, this.options)

        if (mergedOptions.cache.enable && !mergedOptions.cache.id) {
            throw new Error(
                "need options.cache.id, see https://ld246.com/article/1549638745630#options"
            )
        }

        return mergedOptions
    }
}
