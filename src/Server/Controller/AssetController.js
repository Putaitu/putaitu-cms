'use strict';

const FileSystem = require('fs');
const OS = require('os');
const Path = require('path');
const HTTP = require('http');
const Url = require('url');

/**
 * The controller for assets
 *
 * @memberof HashBrown.Server.Controller
 */
class AssetController extends HashBrown.Controller.ControllerBase {
    /**
     * Routes
     */
    static get routes() {
        return {
            '/css/theme.css': {
                handler: this.theme
            },
            '/media/${project}/${environment}/${id}': {
                handler: this.media
            }
        };
    }

    /**
     * Checks whether this controller can handle a request
     *
     * @param {HTTP.IncomingMessage} request
     *
     * @return {Boolean} Can handle request
     */
    static canHandle(request) {
        checkParam(request, 'request', HTTP.IncomingMessage, true);
        
        let requestPath = Url.parse(request.url, true).path.split('?')[0];

        if(requestPath.length < 2) { return false; }
        
        let publicFilePath = Path.join(APP_ROOT, 'public', requestPath);
        let publicFileExists = HashBrown.Service.FileService.exists(publicFilePath);

        return publicFileExists || !!this.getRoute(request);
    }

    /**
     * Handles a request
     *
     * @param {HTTP.IncomingMessage} request
     */
    static async handle(request, response) {
        checkParam(request, 'request', HTTP.IncomingMessage, true);
       
        let requestPath = Url.parse(request.url, true).path.split('?')[0];
        let publicFilePath = Path.join(APP_ROOT, 'public', requestPath);
        let publicFileExists = HashBrown.Service.FileService.exists(publicFilePath);

        // If file exists in the /public directory, service it statically
        if(publicFileExists) {
            let content = await HashBrown.Service.FileService.read(publicFilePath);
            let type = getMIMEType(publicFilePath);
            
            return new HttpResponse(content, 200, { 'Content-Type': type });
        }

        return await super.handle(request);
    }
    
    /**
     * Serves the theme stylesheet
     */
    static async theme(request, params, body, query, user) {
        let theme = user && user.theme ? user.theme : 'default';

        let path = Path.join(APP_ROOT, 'theme', theme + '.css');
        let content = await HashBrown.Service.FileService.read(path);

        return new HttpResponse(content, 200, { 'Content-Type': 'text/css' });
    }

    /**
     * Serves binary media data
     */
    static async media(request, params, body, query, user) {
        let id = params.id;

        let settings = await HashBrown.Service.SettingsService.getSettings(params.project, params.environment);

        if(!settings || !settings.mediaConnection) {
            return new HttpResponse('Not found', 404);
        }

        let connection = await HashBrown.Entity.Resource.Connection.get(settings.mediaConnection);

        if(!connection) {
            return new HttpResponse('Not found', 404);
        }

        let media = await connection.getMedia(id);

        if(!media || !media.path) {
            return new HttpResponse('Not found', 404);
        }
        
        let data = await media.getData(params.project, media, parseInt(query.width), parseInt(query.height));
        
        if(!data) {
            return new HttpResponse('Not found', 404);
        }

        return new HttpResponse(data, 200, { 'Content-Type': media.getContentTypeHeader() });
    }
}

module.exports = AssetController;
