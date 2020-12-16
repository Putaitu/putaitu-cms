'use strict';

module.exports = (_, model, state) =>

_.div({class: 'list-item--project'},
    _.div({class: 'list-item--project__body'},
        HashBrown.Client.context.user.isAdmin ? [
            _.popup({
                icon: 'ellipsis-v',
                role: 'item-menu',
                tooltip: `Options for ${model.getName()}`,
                options: {
                    'Settings': _.onClickSettings,
                    'Backups': _.onClickBackups,
                    'Delete': _.onClickRemove
                }
            })
        ] : null,
        _.div({class: 'list-item--project__info'},
            _.h3({class: 'list-item--project__info__name'}, model.getName()),
            _.p(model.users.length + ' user' + (model.users.length != 1 ? 's' : '')),
            _.p(model.settings.languages.length + ' language' + (model.settings.languages.length != 1 ? 's' : '') + ' (' + model.settings.languages.join(', ') + ')')
        ),
        _.div({class: 'list-item--project__environments'},
            _.each(model.environments, (i, environment) =>
                _.div({class: 'list-item--project__environment'},
                    _.a({title: `Enter "${environment}" environment`, href: '/' + model.id + '/' + environment, class: 'widget widget--button expanded'}, 
                        HashBrown.Client.context.config.system.isSingleEnvironment ? 'cms' : environment
                    ),
                    HashBrown.Client.context.user.isAdmin && model.environments.length > 1 ? [
                        _.popup({
                            icon: 'ellipsis-v',
                            role: 'item-menu',
                            tooltip: `Options for "${environment}" environment`,
                            color: 'primary',
                            options: {
                                'Delete': () => _.onClickRemoveEnvironment(environment)
                            }
                        })
                    ] : null
                )
            ),
            HashBrown.Client.context.user.isAdmin && !HashBrown.Client.context.config.system.isSingleEnvironment ? [
                _.button({onclick: _.onClickAddEnvironment, disabled: model.settings.sync.enabled === true, title: 'Add environment', class: 'widget widget--button dashed embedded expanded'},
                    _.span({class: 'fa fa-plus'}),
                    'Add environment'
                )
            ] : null
        )
    )
)
