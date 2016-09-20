'use strict';

let Pane = require('./Pane');

class SettingsPane extends Pane {
    static getRenderSettings() {
        return {
            label: 'Settings',
            route: '/settings/',
            icon: 'wrench',
            items: [
                {
                    name: 'Languages',
                    path: 'languages',
                    icon: 'flag'
                },
                {
                    name: 'Sync',
                    path: 'sync',
                    icon: 'refresh'
                }
            ]
        };
    }
}

module.exports = SettingsPane;
