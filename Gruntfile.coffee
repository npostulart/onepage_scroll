module.exports = (grunt) ->

    grunt.initConfig
        pkg: grunt.file.readJSON 'package.json'
        coffee:
            compile:
                files:
                    "jquery.onepage-scroll.js": "jquery.onepage-scroll.coffee"
            compileWithMaps:
                options:
                    sourceMap: true
                files:
                    "jquery.onepage-scroll.js": "jquery.onepage-scroll.coffee"
        uglify:
            all:
                files:
                    'jquery.onepage-scroll.min.js': 'jquery.onepage-scroll.js'
                options:
                    preserveComments: 'some',
                    sourceMap: (filepath) ->
                        # path to save .map file
                        return "#{filepath}.map"
                    sourceMappingURL: (filepath) ->
                        # path to .map in js file
                        return require('path').basename(filepath) + '.map'
        compass:
            prod:
                options:
                    environment: 'production'
            dev:
                options:
                    environment: 'development'
        copy:
            all:
                src: ['jquery.onepage-scroll.js', 'onepage-scroll.css']
                dest: 'Demo/'
        watch:
            all:
                files: ['jquery.onepage-scroll.js', 'onepage-scroll.css']
                tasks: 'copy'

    grunt.loadNpmTasks 'grunt-contrib-coffee'
    grunt.loadNpmTasks 'grunt-contrib-uglify'
    grunt.loadNpmTasks 'grunt-contrib-compass'
    grunt.loadNpmTasks 'grunt-contrib-copy'
    grunt.loadNpmTasks 'grunt-contrib-watch'

    grunt.registerTask 'dev', ['coffee:compileWithMaps', 'compass:dev', 'copy']
    grunt.registerTask 'default', ['coffee:compile', 'uglify', 'compass:prod', 'copy']
