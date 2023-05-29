const gulp = require('gulp');
const del = require('del');
const minHTML = require('gulp-htmlmin');
const minifyCSS = require('gulp-csso');
const concat = require('gulp-concat');
const htmlReplace = require('gulp-html-replace');
const minify = require('gulp-minify');
const eslint = require('gulp-eslint');
let babel = require('gulp-babel');


let version = new Date().getTime();
const destinationFolder= releaseFolder();

function releaseFolder() {
    var arr = __dirname.split("/");
    var fldr = arr.pop();
    arr.push(fldr + "_release");
    return arr.join("/");
}

console.log(">> Building to " , destinationFolder);


gulp.task('lint', () => {
	// ESLint ignores files with "node_modules" paths.
	// So, it's best to have gulp ignore the directory as well.
	// Also, Be sure to return the stream from the task;
	// Otherwise, the task may end before the stream has finished.
	return gulp.src(['widget/**/*.js','control/**/*.js', '!widget/**/*.min.js'])
	// eslint() attaches the lint output to the "eslint" property
	// of the file object so it can be used by other modules.
		.pipe(eslint({
			"env": {
				"browser": true,
				"es6": true
			},
			"extends": "eslint:recommended",
			"parser": "babel-eslint",
			"parserOptions": {
				"sourceType": "module"
			},
			"rules": {
				"semi": [
					"error",
					"always"
				],
				"no-console":[
					"off"
				]
			}
		}))
		// eslint.format() outputs the lint results to the console.
		// Alternatively use eslint.formatEach() (see Docs).
		.pipe(eslint.format())
		// To have the process exit with an error code (1) on
		// lint error, return the stream and pipe to failAfterError last.
		.pipe(eslint.failAfterError());
});


const cssTasks=[
    ,{name:"controlContentCSS",src:"control/content/**/*.css",dest:"/control/content"}
];

cssTasks.forEach(function(task){
    /*
     Define a task called 'css' the recursively loops through
     the widget and control folders, processes each CSS file and puts
     a processes copy in the 'build' folder
     note if the order matters you can import each css separately in the array

     */
    gulp.task(task.name, function(){
        return gulp.src(task.src,{base: '.'})

        /// minify the CSS contents
            .pipe(minifyCSS())

            ///merge
            .pipe(concat('styles.min.css'))

            /// write result to the 'build' folder
            .pipe(gulp.dest(destinationFolder + task.dest))
    });
});

const jsTasks = [
    { name: 'widgetJS', src: [
		'shared/authManager.js',
		'models/ContentModel.js',
		'repository/ContentRepository.js',
		'widget/app.js'
	], dest: '/widget' },
    {
        name: 'controlContentJS',
        src: [
            'shared/authManager.js',
            'models/ContentModel.js',
            'repository/ContentRepository.js',
            'control/content/js/content.controller.js',
            'control/content/content.js',
        ],
        dest: '/control/content',
    },
];

jsTasks.forEach(function(task){
    gulp.task(task.name, function() {
        return gulp.src(task.src,{base: '.'})


            /// merge all the JS files together. If the
            /// order matters you can pass each file to the function
            /// in an array in the order you like
			.pipe(concat('scripts.js'))
			.pipe(babel({
				presets: ['@babel/env'],
				plugins: ["@babel/plugin-proposal-class-properties"]
			}))
			.pipe(minify())
            ///output here
            .pipe(gulp.dest(destinationFolder + task.dest));

    });

});

/*
 Define a task called 'html' the recursively loops through
 the widget and control folders, processes each html file and puts
 a processes copy in the 'build' folder
 */
 gulp.task('controlHTML', function(){
    return gulp.src(['control/**/*.html'],{base: '.'})
        .pipe(htmlReplace({
			bundleSharedJSFiles:"../../widget/scripts.shared-min.js?v=" + version
            ,bundleJSFiles:"scripts-min.js?v=" + version
            ,bundleCSSFiles:"styles.min.css?v=" + version
			,bundleControlBFMinJS:"../../../../scripts/buildfire.min.js"
			//data, data access, tests and analytics
			,bundleDataJSFiles:"../../data/scripts-min.js?v=" + version
			,bundleTestsJSFiles:"../../tests/scripts-min.js?v=" + version
        }))
        .pipe(minHTML({removeComments:true,collapseWhitespace:true}))
        .pipe(gulp.dest(destinationFolder));
});

gulp.task('widgetHTML', function(){
	return gulp.src(['widget/*.html'],{base: '.'})
		.pipe(htmlReplace({
			bundleSharedJSFiles:"scripts.shared-min.js?v=" + version
			,bundleJSFiles:"scripts-min.js?v=" + version
			,bundleCSSFiles:"styles.min.css?v=" + version
			,bundleWidgetBFMinJS:"../../../scripts/buildfire.min.js"
			//data, data access and tests
			,bundleDataJSFiles:"../../data/scripts-min.js?v=" + version
			,bundleTestsJSFiles:"../../tests/scripts-min.js?v=" + version
		}))
		.pipe(minHTML({removeComments:true,collapseWhitespace:true}))
		.pipe(gulp.dest(destinationFolder));
});

gulp.task('widgetLayouts', function(){
    return gulp.src(['widget/layouts/*'],{base: '.'})
        .pipe(gulp.dest(destinationFolder));
});

gulp.task('resources', function(){
    return gulp.src(['resources/**','plugin.json'],{base: '.'})
        .pipe(gulp.dest(destinationFolder ));
});

gulp.task('clean',function(){
    return del([destinationFolder],{force: true});
});

var buildTasksToRun=['controlHTML','widgetHTML','widgetLayouts','resources'];

cssTasks.forEach(function(task){  buildTasksToRun.push(task.name)});
jsTasks.forEach(function(task){  buildTasksToRun.push(task.name)});

gulp.task('build', gulp.series('lint','clean', ...buildTasksToRun) );
