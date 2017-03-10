let options = {
    src: "./src",
    dist: "."
};

module.exports = function(grunt) {
    
    grunt.initConfig({
        copy: {
            main: {
                expand: true,
                cwd: options.src,
                src: ["*.html", "*.json"],
                dest: options.dist
            }
        },
        ts: {
            default: {
                src: options.src + "/library.ts",
                out: options.dist + "/library.js"
                //watch: ".",
            },
            options: {
                declaration: false,
                sourceMap: false,
                target: "es6"
            }
        }
    });

    grunt.loadNpmTasks('grunt-ts');
    grunt.loadNpmTasks('grunt-contrib-copy');

    grunt.registerTask("default", ["copy", "ts"]);

};