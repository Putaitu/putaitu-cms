'use strict';

/**
 * A rich text editor
 *
 * @description Example:
 * <pre>
 * {
 *     "myRichText": {
 *         "label": "My rich text",
 *         "tabId": "content",
 *         "schemaId": "richText"
 *     }
 * }
 * </pre>
 *
 * @memberof HashBrown.Client.Views.Editors.FieldEditors
 */
class RichTextEditor extends HashBrown.Views.Editors.FieldEditors.FieldEditor {
    constructor(params) {
        super(params);

        // Sanity check of value
        if(typeof this.value !== 'string') {
            this.value = this.value || '';
        }

        // Make sure the string is HTML
        try {
            this.value = HashBrown.Helpers.MarkdownHelper.toHtml(this.value);
        } catch(e) {
            // Catch this silly exception that marked does sometimes
        }
        
        this.fetch();
    }
    
    /**
     * Renders the config editor
     *
     * @param {Object} config
     *
     * @returns {HTMLElement} Element
     */
    static renderConfigEditor(config) {
        return [
            _.div({class: 'editor__field'},
                _.div({class: 'editor__field__key'}, 'Disable markdown'),
                _.div({class: 'editor__field__value'},
                    new HashBrown.Views.Widgets.Input({
                        type: 'checkbox',
                        tooltip: 'Hides the markdown tab if enabled',
                        value: config.isMarkdownDisabled || false,
                        onChange: (newValue) => { config.isMarkdownDisabled = newValue; }
                    }).$element
                )
            ),
            _.div({class: 'editor__field'},
                _.div({class: 'editor__field__key'}, 'Disable HTML'),
                _.div({class: 'editor__field__value'},
                    new HashBrown.Views.Widgets.Input({
                        type: 'checkbox',
                        tooltip: 'Hides the HTML tab if enabled',
                        value: config.isMarkdownDisabled || false,
                        onChange: (newValue) => { config.isHtmlDisabled = newValue; }
                    }).$element
                )
            )
        ];
    }

    /**
     * Event: Change input
     *
     * @param {String} value
     */
    onChange(value) {
        value = value || '';

        this.value = value;

        if(this.silentChange === true) {
            this.silentChange = false;

            this.trigger('silentchange', this.value);
        
        } else {
            this.trigger('change', this.value);

        }
    }

    /**
     * Event: On click tab
     *
     * @param {String} source
     */
    onClickTab(source) {
        this.silentChange = true;

        this.activeView = source;

        this.fetch();
    }

    /**
     * Event: Click insert media
     */
    onClickInsertMedia() {
        let mediaBrowser = new HashBrown.Views.Modals.MediaBrowser();

        mediaBrowser.on('select', (id) => {
            HashBrown.Helpers.MediaHelper.getMediaById(id)
            .then((media) => {
                let html = '';

                if(media.url[0] !== '/') { media.url = '/' + media.url; }
                    
                if(media.isImage()) {
                    html = '<img alt="' + media.name + '" src="' + media.url + '">';
                } else if(media.isVideo()) {
                    html = '<video alt="' + media.name + '" src="' + media.url + '">';
                }

                let activeView = this.activeView || 'wysiwyg';

                switch(activeView) {
                    case 'wysiwyg':
                        this.wysiwyg.insertHtml(html);
                        break;
                    
                    case 'html':
                        this.html.replaceSelection(html, 'end');
                        break;
                    
                    case 'markdown':
                        this.markdown.replaceSelection(toMarkdown(html), 'end');
                        break;
                }
            })
            .catch(UI.errorModal);
        });
    }
    
    /**
     * Gets the tab content
     *
     * @returns {HTMLElement} Tab content
     */
    getTabContent() {
        return this.element.querySelector('.field-editor--rich-text__body__tab__content');
    }

    /**
     * Initialises the HTML editor
     */
    initHtmlEditor() {
        setTimeout(() => {
            // Kepp reference to editor
            this.html = CodeMirror.fromTextArea(this.getTabContent(), {
                lineNumbers: false,
                mode: {
                    name: 'xml'
                },
                viewportMargin: Infinity,
                tabSize: 4,
                indentUnit: 4,
                indentWithTabs: true,
                theme: 'default',
                value: this.value
            });

            // Change event
            this.html.on('change', () => {
                this.onChange(this.html.getDoc().getValue());
            });

            // Set value initially
            this.silentChange = true;
            this.html.getDoc().setValue(this.value);
        }, 1);
    }
    
    /**
     * Initialises the markdown editor
     */
    initMarkdownEditor() {
        setTimeout(() => {
            // Keep reference to editor
            this.markdown = CodeMirror.fromTextArea(this.getTabContent(), {
                lineNumbers: false,
                mode: {
                    name: 'markdown'
                },
                viewportMargin: Infinity,
                tabSize: 4,
                indentUnit: 4,
                indentWithTabs: true,
                theme: 'default',
                value: toMarkdown(this.value)
            });

            // Change event
            this.markdown.on('change', () => {
                this.onChange(HashBrown.Helpers.MarkdownHelper.toHtml(this.markdown.getDoc().getValue()));
            });

            // Set value initially
            this.silentChange = true;
            this.markdown.getDoc().setValue(toMarkdown(this.value));
        }, 1);
    }

    /**
     * Initialises the WYSIWYG editor
     */
    initWYSIWYGEditor() {
        this.wysiwyg = new (function(element, value) {
            this.element = element;
            this.value = value;

            // Hook up events
            this.events = { 'change': [] };

            this.on = (name, handler) => {
                this.events[name].push(handler);
            };

            this.trigger = (name) => {
                for(let handler of this.events[name]) {
                    handler(this.value);
                }
            };

            // Insert
            this.insertHtml = (html) => {
                let selection = window.getSelection();

                let before = this.editor.innerHTML.substring(0, selection.anchorOffset);
                let after = this.editor.innerHTML.substring(selection.anchorOffset);

                this.editor.innerHTML = before + this.toView(html) + after;

                this.value = this.toValue(this.editor.innerHTML);

                this.trigger('change', this.value);
            };

            // Parsers
            this.parserCache = {};
            
            this.toView = (html) => {
                this.parserCache = {};
                
                return html ? html.replace(/src=".*media\/([a-z0-9]+)\/([^"]+)"/g, (original, id, filename) => {
                    this.parserCache[id] = filename;
                
                    return 'src="/media/' + HashBrown.Context.projectId + '/' + HashBrown.Context.environment + '/' + id + '"';
                }) : '';
            };

            this.toValue = (html) => {
                return html ? html.replace(new RegExp('src="/media/' + HashBrown.Context.projectId + '/' + HashBrown.Context.environment + '/([a-z0-9]+)"', 'g'), (original, id) => {
                    let filename = this.parserCache[id];

                    if(!filename) { return original; }
                
                    return 'src="/media/' + id + '/' + filename + '"';
                }) : '';
            };
            
            // Init element and value
            this.element.classList.toggle('field-editor--rich-text__wysiwyg', true);

            _.append(this.element,
                this.toolbar = _.div({class: 'field-editor--rich-text__wysiwyg__toolbar widget-group'},
                    _.button({class: 'widget widget--button standard small fa fa-bold', title: 'Bold'})
                        .click(() => {
                            document.execCommand('bold');
                        }),
                    _.button({class: 'widget widget--button standard small fa fa-italic', title: 'Italic'})
                        .click(() => {
                            document.execCommand('italic');
                        }),
                    _.button({class: 'widget widget--button standard small fa fa-underline', title: 'Underline'})
                        .click(() => {
                            document.execCommand('underline');
                        }),
                    _.button({class: 'widget widget--button standard small fa fa-remove', title: 'Remove formatting'})
                        .click(() => {
                            document.execCommand('removeFormat');
                            document.execCommand('unlink');
                        })
                ),
                this.editor = _.div({class: 'field-editor--rich-text__wysiwyg__editor', contenteditable: true},
                    this.toView(value)
                ).on('input', (e) => {
                    this.value = this.toValue(this.editor.innerHTML);

                    this.trigger('change', this.value);
                })[0]
            );
        })(this.getTabContent(), this.value);

        this.wysiwyg.on('change', (newValue) => {
            this.value = newValue;
        });
    }

    /**
     * Prerender
     */
    prerender() {
        this.markdown = null;
        this.wysiwyg = null;
        this.html = null;
    }

    /** 
     * Renders this editor
     */
    template() {
        let activeView = this.activeView || 'wysiwyg';

        if((activeView === 'html' && this.config.isHtmlDisabled) || (activeView === 'markdown' && this.config.isMarkdownDisabled)) {
            activeView = 'wysiwyg';
        }

        return _.div({class: 'field-editor field-editor--rich-text', title: this.description || ''},
            _.div({class: 'field-editor--rich-text__header'},
                _.each({wysiwyg: 'Visual', markdown: 'Markdown', html: 'HTML'}, (alias, label) => {
                    if((alias === 'html' && this.config.isHtmlDisabled) || (alias === 'markdown' && this.config.isMarkdownDisabled)) { return; }

                    return _.button({class: (activeView === alias ? 'active ' : '') + 'field-editor--rich-text__header__tab'}, label)
                        .click(() => { this.onClickTab(alias); })
                }),
                _.button({class: 'field-editor--rich-text__header__add-media'},
                    'Add media'
                ).click(() => { this.onClickInsertMedia(); })
            ),
            _.div({class: 'field-editor--rich-text__body'},
                _.if(activeView === 'wysiwyg',
                    _.div({class: 'field-editor--rich-text__body__tab wysiwyg'},
                        _.div({class: 'field-editor--rich-text__body__tab__content'})
                    )
                ),
                _.if(activeView === 'markdown',
                    _.div({class: 'field-editor--rich-text__body__tab markdown'},
                        _.textarea({class: 'field-editor--rich-text__body__tab__content'})
                    )
                ),
                _.if(activeView === 'html',
                    _.div({class: 'field-editor--rich-text__body__tab html'},
                        _.textarea({class: 'field-editor--rich-text__body__tab__content'})
                    )
                )
            )
        );
    }
     
    /**
     * Post render
     */
    postrender() {
        super.postrender();
        
        let activeView = this.activeView || 'wysiwyg';
       
        switch(activeView) {
            case 'html':
                this.initHtmlEditor();
                break;

            case 'markdown':
                this.initMarkdownEditor();
                break;

            case 'wysiwyg':
                this.initWYSIWYGEditor();
                break;
        }
    }
}

module.exports = RichTextEditor;
