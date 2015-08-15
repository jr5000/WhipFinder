// Maps the files so Durandal knows where to find these.
require.config({
    paths: {
        'text': '../Scripts/text',
        'durandal': '../Scripts/durandal',
        'plugins': '../Scripts/durandal/plugins',
        'transitions': '../Scripts/durandal/transitions',
        'async': '../bower_components/requirejs-plugins/src/async'
    }
});

// Durandal 2.x assumes no global libraries. It will ship expecting 
// Knockout and jQuery to be defined with requirejs. .NET 
// templates by default will set them up as standard script
// libs and then register them with require as follows: 
define('jquery', function () { return jQuery; });
define('knockout', ko);

define(['durandal/app', 'durandal/viewLocator', 'durandal/system', 'plugins/router', 'services/logger', 'services/datacontext'], boot);

function boot (app, viewLocator, system, router, logger, datacontext) {

    // Enable debug message to show in the console 
    system.debug(true);

    app.title = 'My App';

    app.configurePlugins({
        router: true,
        dialog: true
    });
    
    app.start().then(function () {
        toastr.options.positionClass = 'toast-bottom-right';
        toastr.options.backgroundpositionClass = 'toast-bottom-right';

        // When finding a viewmodel module, replace the viewmodel string 
        // with view to find it partner view.
        // [viewmodel]s/sessions --> [view]s/sessions.html
        // Defaults to viewmodels/views/views. 
        // Otherwise you can pass paths for modules, views, partials
        viewLocator.useConvention();

        ko.validation.init();

        if (datacontext.mgr.metadataStore.isEmpty()) {
            return datacontext.mgr.fetchMetadata().then(function () { app.setRoot('viewmodels/shell', 'entrance'); });
        } else {
            //Show the app by setting the root view model for our application.
            app.setRoot('viewmodels/shell', 'entrance');
        }
    });
};