module.exports = function(grunt){

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        uglify: {
            all: {
                files: {
                    'jquery.onepage-scroll.min.js': 'jquery.onepage-scroll.js'
                },
                options: {
                    sourceMap: function(filepath) {
                        // path to save .map file
                        return filepath + '.map';
                    },
                    sourceMappingURL: function(filepath) {
                        // path to .map in js file
                        return require('path').basename(filepath) + '.map';
                    }
                }
            }
        },
        cssmin: {
            minify: {
                files: {
                    'onepage-scroll.min.css': 'onepage-scroll.css'
                }
            }
        },
        copy: {
            all: {
                src: ['jquery.onepage-scroll.js', 'onepage-scroll.css'],
                dest: 'Demo/'
            }
        },
        watch: {
            all: {
                files: ['jquery.onepage-scroll.js', 'onepage-scroll.css'],
                tasks: 'copy'
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('default', ['uglify', 'cssmin', 'copy']);

};
