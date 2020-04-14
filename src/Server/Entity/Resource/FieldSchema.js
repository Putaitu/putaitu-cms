'use strict';

/**
 * Schema for content fields
 *
 * @memberof HashBrown.Server.Entity.Resource
 */
class FieldSchema extends require('Common/Entity/Resource/FieldSchema') {
    /**
     * Performs a series of unit test
     *
     * @param {HashBrown.Entity.Context} context
     * @param {Function} report
     */
    static async test(context, report) {
        checkParam(context, 'context', HashBrown.Entity.Context, true);
        checkParam(report, 'report', Function, true);

        report('Create schema');
        
        let schema = await this.create(context, { name: 'Test schema', parentId: 'fieldBase' });
        
        report(`Get schema ${schema.getName()}`);
        
        schema = await this.get(context, schema.id, { withParentFields: true });

        report(`Update schema ${schema.getName()}`);
       
        schema.name += ' (updated)';
        await schema.save();
        
        report('Get all schemas');
        
        await this.list(context);

        report(`Remove schema ${schema.getName()}`);
        
        await schema.remove();
    }
}

module.exports = FieldSchema;
