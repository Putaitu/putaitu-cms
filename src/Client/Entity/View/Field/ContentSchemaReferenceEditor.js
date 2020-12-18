'use strict';

/**
 * A field for referencing content schemas
 *
 * @memberof HashBrown.Client.Entity.View.Field
 */
class ContentSchemaReferenceEditor extends HashBrown.Entity.View.Field.FieldBase {
    /**
     * Constructor
     */
    constructor(params) {
        super(params);

        this.editorTemplate = require('template/field/editor/contentSchemaReferenceEditor');
        this.configTemplate = require('template/field/config/contentSchemaReferenceEditor');
    }

    /**
     * Fetches view data
     */
    async fetch() {
        let allSchemas = await HashBrown.Entity.Resource.ContentSchema.list() || [];

        if(this.state.name === 'config') {
            // Build schema options
            this.state.schemaOptions = {};

            for(let schema of allSchemas) {
                this.state.schemaOptions[schema.name] = schema.id;
            }

        } else {
            this.state.schemaOptions = {};

            let allowedSchemas = this.model.config.allowedSchemas || [];
        
            if(!HashBrown.Client.editor) { return; }
            if(!HashBrown.Client.editor.model) { return; }
            
            let thisContent = HashBrown.Client.editor.model;
            
            if(allowedSchemas === 'fromParent' && thisContent.parentId) {
                let parentContent = await HashBrown.Entity.Resource.Content.get(thisContent.parentId);
                let parentContentSchema = await HashBrown.Entity.Resource.ContentSchema.get(parentContent.schemaId);
           
                allowedSchemas = parentContentSchema.allowedChildSchemas || [];
            }

            if(!Array.isArray(allowedSchemas)) { allowedSchemas = []; }

            for(let schema of allSchemas) {
                if((!thisContent.parentId && schema.allowedAtRoot) || allowedSchemas.indexOf(schema.id) >= 0) {
                    this.state.schemaOptions[schema.name] = schema.id;
                }
            }
        }
    }   
    
    /**
     * Gets whether this field is small
     *
     * @return {Boolean} Is small
     */
    isSmall() {
        return true;
    }
}

module.exports = ContentSchemaReferenceEditor;
