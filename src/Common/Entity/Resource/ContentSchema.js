'use strict';

/**
 * Schema for content nodes
 *
 * @memberof HashBrown.Common.Entity.Resource
 */
class ContentSchema extends HashBrown.Entity.Resource.SchemaBase {
    static get type() { return 'content'; }
    
    structure() {
        super.structure();

        this.def(String, 'defaultTabId');
        this.def(Object, 'tabs', {});
        this.def(Boolean, 'allowedAtRoot', true);
        this.def(Array, 'allowedChildSchemas', []);

        this.name = 'New content schema';
    }
    
    /**
     * Instantiates a resource
     *
     * @param {Object} params
     *
     * @return {HashBrown.Entity.Resource.ContentSchema} Instance
     */
    static new(params = {}) {
        checkParam(params, 'params', Object)

        params = params || {};
    
        return new this(params);
    }

    /**
     * Adopts values into this entity
     *
     * @param {Object} params
     */
    adopt(params = {}) {
        checkParam(params, 'params', Object);

        params = JSON.parse(JSON.stringify(params || {}));
        params.config = params.config || {};

        // Adopt from old structure using "fields -> properties"
        if(params.fields) {
            let properties = params.fields.properties || {};
            delete params.fields.properties;

            for(let k in params.fields) {
                params.config[k] = params.fields[k];
            }
            
            for(let k in properties) {
                params.config[k] = properties[k];
            }
            
            delete params.fields;
        }
        
        super.adopt(params);
    }

    /**
     * Checks whether a tab is the default one
     *
     * @param {String} tabId
     *
     * @returns {Boolean} Is the tab default
     */
    isDefaultTab(tabId) {
        return (!this.defaultTabId && tabId === 'meta') || this.defaultTabId === tabId;
    }
}

module.exports = ContentSchema;
