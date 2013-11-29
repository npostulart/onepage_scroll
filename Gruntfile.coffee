module.exports = (grunt) ->

    grunt.initConfig
        pkg: grunt.file.readJSON 'package.json'
        coffee:
            compile:
                files:
                    "dist/jquery.onepage-scroll.js": "src/jquery.onepage-scroll.coffee"
            compileWithMaps:
                options:
                    sourceMap: true
                files:
                    "dist/jquery.onepage-scroll.js": "src/jquery.onepage-scroll.coffee"
        uglify:
            all:
                files:
                    'dist/jquery.onepage-scroll.min.js': 'dist/jquery.onepage-scroll.js'
                options:
                    preserveComments: 'some'
                    # sourceMap: (filepath) ->
                    #     # path to save .map file
                    #     return "#{filepath}.map"
                    # sourceMappingURL: (filepath) ->
                    #     # path to .map in js file
                    #     return require('path').basename(filepath) + '.map'
        compass:
            prod:
                options:
                    environment: 'production'
            dev:
                options:
                    environment: 'development'
        copy:
            all:
                expand: true
                cwd: 'dist/'
                src: ['jquery.onepage-scroll.js', 'onepage-scroll.css']
                dest: 'demo/'
        watch:
            coffee:
                files: ['src/jquery.onepage-scroll.coffee']
                tasks: 'coffee:compile'
            compass:
                files: ['src/onepage-scroll.scss']
                tasks: 'compass:dev'
            all:
                files: ['dist/jquery.onepage-scroll.js', 'dist/onepage-scroll.css']
                tasks: 'copy'

    grunt.loadNpmTasks 'grunt-contrib-coffee'
    grunt.loadNpmTasks 'grunt-contrib-uglify'
    grunt.loadNpmTasks 'grunt-contrib-compass'
    grunt.loadNpmTasks 'grunt-contrib-copy'
    grunt.loadNpmTasks 'grunt-contrib-watch'

    grunt.registerTask 'dev', ['coffee:compile', 'compass:dev', 'copy']
    grunt.registerTask 'default', ['coffee:compile', 'uglify', 'compass:prod', 'copy']
