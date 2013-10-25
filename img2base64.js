var fs = require( 'fs' ),
    path = require( 'path' ),
    dir = process.argv[2],
    jsonName = process.argv[3] || false,
    files = [],
    fileName,
    json = {};

// VARRE DIRETORIOS E MONTA ARRAY
var readDir = function(dir, callback) {

  var results = [];

    fs.readdir(dir, function(err, list) {

        if (err) return callback(err);

        var i = 0;
        (function next() {

            var file = list[ i++ ];
            if (!file) return callback( null, results );

            file = path.join( dir, file );

            fs.stat(file, function(err, stat) {

                if (stat && stat.isDirectory()) {

                    readDir(file, function(err, res) {

                        results = results.concat( res );
                        next();

                    });

                } else {

                    var ext = path.extname( file );

                    if( ext == '.png' || ext == '.jpg' ){

                        results.push( file );

                    }

                    next();

                }

            });

        })();

    });

};

// RECEBE ARRAY E MONTA JSON, CONVERTENDO TODOS OS ARQUIVOS EM BASE64
var createJson = function( arr, callback ){

    var i = 0;
    (function next() {

        var p = arr[ i++ ];
        if ( !p ) return callback( null, j );

        j = json;
        p.split( path.sep ).forEach( function( value ){

            var ext = path.extname( value );

            if( ext ){
                
                toBase64( p, function( result ){

                    j = j || {};
                    j[ value ] = result;

                    next();

                });

            } else { 

                j[ value ] = j[ value ] || {} ;
                j = j[ value ];

            }

        });

    })();

}

// RECEBE ARRAY E GRAVA ARQUIVO POR ARQUIVO
var createFiles = function( arr, callback ){

    var i = 0, obj;
    (function next() {

        var p = arr[ i++ ];
        if ( !p ) return callback( null );

        toBase64( p, function( result ){

            fileName = path.basename(p, path.extname( p ));

            obj = { 'data': result };

            writeFile( fileName + '.js' , JSON.stringify( obj ), function(){

                next();

            });

        });

    })();

}

// GRAVA ARQUIVO
var writeFile = function( fileName, content, callback ){

    fileName = path.join( dir, fileName );

    fs.writeFile( fileName, content, function(err) {

        if(err) {

          console.log(err);

        } else {

          console.log( "file saved: " + fileName );

          if( callback )
            callback();

        }

    });

}

var toBase64 = function( file, callback ){

    fs.readFile( file, function(err, data){

        var base64 = new Buffer(data, 'binary').toString('base64');
        callback( base64 );

    });

}

readDir( dir, function(err, res){

    if ( jsonName ) {

        createJson( res, function(){

            jsonName = jsonName || 'json.js';

            json = json[ dir ]; // <--- RETIRA PASTA INICIAL DO OBJETO
            jsonStr = 'jsonData(' + JSON.stringify( json, null, 4 ) + ')';

            writeFile( jsonName, jsonStr );

        });

    } else {

        createFiles( res , function(){

            console.log( 'done' );

        });

    }

});