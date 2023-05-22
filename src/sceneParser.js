const parse5 = require('parse5');
const fs = require("node:fs");
const minify = require('html-minifier').minify;
const { queryAll, queryOne } = require("parse5-query-domtree")

function exec(sceneFileText){
    var minifyed = minify(sceneFileText, {
        removeComments: true,
        collapseWhitespace: true
    });
    
    const htmlTree = parse5.parse(minifyed)
    const story=queryOne(htmlTree).getElementsByTagName("story");
    
}

console.dir(story, { depth: null })