'use strict';

module.exports = (_, model, state) =>

_.div({class: 'resource-editor resource-editor--content-editor'},
    _.include(require('./inc/header')),
    _.div({class: 'resource-editor__body', name: 'body'},
        state.name === 'error' ? [
            _.div({class: 'widget widget--message centered warn'},
                state.message
            )
        
        ] : state.tab === 'overview' ? [
            _.div({class: 'resource-editor__welcome'},
                _.h1('Content'),
                _.p('Click any item in the panel to edit it.'),
                _.p('Use the context menu (right click or the ', _.span({class: 'fa fa-ellipsis-v'}), ' button) to perform other actions.'),
                _.div({class: 'widget-group'},
                    _.button({class: 'widget widget--button', onclick: _.onClickNew, title: 'Create new content'}, 'New content'),
                    _.button({class: 'widget widget--button', onclick: _.onClickStartTour, title: 'Start a tour of the UI'}, 'Quick tour')
                )
            )

        ] : [
            _.each(state.fields, (key, field) =>
                field.element
            )
        ]
    ),
    _.include(require('./inc/footer'))
)
