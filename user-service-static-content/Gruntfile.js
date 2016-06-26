module.exports = function(grunt) {
  function target(path) {
    return 'target/release/userService/web/static/' + path;
  }

  function prepareSkeleton() {
    grunt.file.mkdir(target('js'));
    grunt.file.mkdir(target('tmp/js'));
  }

  var browserifyFiles = {};
  browserifyFiles[target('js/app.js')] = [target('tmp/js/main.js')];

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    watch: {
      scripts: {
        files: ['js/**/*.*', 'css/**/*.css', 'root/**/*.*'],
        tasks: ['copy', 'react', 'browserify']
      }
    },

    copy: {
      main: {
        files: [
          {
            cwd: 'root',
            src: '**',
            dest: target(''),
            expand: true
          },
          {
            cwd: 'node_modules/bootstrap/dist',
            src: '**',
            dest: target('libs/bootstrap'),
            expand: true
          },
          {
            cwd: 'css',
            src: '**',
            dest: target('css'),
            expand: true
          },
          {
            cwd: 'js',                    // source js dir
            src: ['**', '!**/*.jsx'],     // copy all files and subfolders to the temporary dor, except for jsx
            dest: target('tmp/js'),       // destination folder, used by browserify
            expand: true                  // required when using cwd
          }
        ]
      }
    },

    react: {
      dynamic_mappings: {
        files: [
          {
            expand: true,
            cwd: 'js/view',
            src: ['**/*.jsx'],
            dest: target('tmp/js/view'),
            ext: '.js'
          }
        ]
      }
    },

    browserify: {
      dist: {
        files: browserifyFiles
      }
    },

    uglify: {
      options: {
        banner: '/*! Generated app.js <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        src: target('js/app.js'),
        dest: target('js/app.min.js')
      }
    }
  });

  // Load plugins
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-react');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  prepareSkeleton();

  // Helper task for moving app.min.js to app.js
  grunt.registerTask('clean-tmp', 'Clean up temp files', function () {
    grunt.file.delete(target('tmp'));
  });

  // Default task that generates development build
  grunt.registerTask('default', [
    'copy', 'react', 'browserify', 'clean-tmp'
  ]);

  // Helper task for moving app.min.js to app.js
  grunt.registerTask('uglify-fix-app', 'Rename app.min.js to app.js', function () {
    grunt.file.copy(target('js/app.min.js'), target('js/app.js'));
    grunt.file.delete(target('js/app.min.js'));
  });

  // Release task that generates production build
  grunt.registerTask('dist', [
    'default', 'uglify', 'uglify-fix-app'
  ]);



  grunt.registerTask('clean', 'Recursively cleans build folder', function () {
    grunt.file.delete(target(''));
  });
};
