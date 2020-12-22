var express=require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var neo4j = require('neo4j-driver');
var app=express();


app.set('views',path.join(__dirname,'views'));
app.set('view engine','ejs');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));
app.use(express.static(path.join(__dirname,'public')));

var driver = neo4j.driver('bolt://localhost',neo4j.auth.basic('neo4j','test'));

var session = driver.session();
app.get('',function(req,res){
    session
    .run('MATCH(n:Movie) RETURN n ')
    .then(function(result){
        var movieArr=[];
        // result.records.forEach(function(record){
        //     console.log(record._fields[0].identity);
        // });
        result.records.forEach(function(record){
            movieArr.push({
                id: record._fields[0].identity.low,
                title: record._fields[0].properties.title,
                year: record._fields[0].properties.released.low,
                description: record._fields[0].properties.tagline
            });
            
        });
        res.render('index',{
            movies:movieArr
        });
    })
    .catch(function(err){
        console.log(err);
    });
});
//// ACTOR
app.get('/actor/:id',function(req,res){
    let id = req.params.id;
    var sentence ='MATCH(m:Movie)<-[:ACTED_IN]-(actorMovie) WHERE ID(m)='+id+' return actorMovie';
    session
    .run(sentence)
    .then(function(result){
        var actorArr=[];
        // result.records.forEach(function(record){
        //     console.log(record._fields[0].identity);
        // });
        result.records.forEach(function(record){
            console.log(record._fields[0].properties)
            actorArr.push({
                
                name: record._fields[0].properties.name
            });
            
        });
        res.render('actor',{
            actors:actorArr
        });
    })
    .catch(function(err){
        console.log(err);
    });
});
app.post('/actor/add',(req,res)=>{
    var name= req.body.name;
    var born = req.body.born;
    //"CREATE (TheMatrix:Movie {title:'"+name+"', released:"+age+", tagline:'"+tag+"'})"
    let sentence ="CREATE (p:Person {name:$nameParam, born:$ageParam}) return p.name";
    session
    .run(sentence,{nameParam:name, ageParam:born})
    .then(function(result){
        console.log('Se agrego correctamente');
        res.redirect('/');
        //res.render('/');
        //session.close();
    })
    .catch(function(err){
        console.log(err);
    });
    res.redirect('/');
});
app.get('/actorNew',function(req,res){
   
        res.render('nuevoActor'
        );
});
///// MOVIE
app.get('/movie',function(req,res){
    res.render('nuevaPelicula');
});
app.get('/movie/:id',function(req,res){
    let name = req.params.id;
    var sentence ='MATCH(p:Person {name:"'+name+'"})-[:ACTED_IN]->(actorMovie) return actorMovie';
    session
    .run(sentence)
    .then(function(result){
        var movieArr=[];
        result.records.forEach(function(record){
            movieArr.push({
                id: record._fields[0].identity.low,
                title: record._fields[0].properties.title
            });
            
        });
        res.render('movie', {movies:movieArr}
        );
    })
    .catch(function(err){
        console.log(err);
    });
});
app.get('/delete/:id',(req,res)=>{
    let id = req.params.id;
    console.log(id);
    let sentence ="MATCH (m:Movie) WHERE ID(m)="+id+"DETACH DELETE m";
    session
    .run(sentence)
    .then(function(result){
        console.log('Se elimino correctamente');
        res.redirect('/');
        //res.render('/');
        //session.close();
    })
    .catch(function(err){
        console.log(err);
    });
    res.redirect('/');
});
app.post('/movie/add',function(req,res){
    var name= req.body.name;
    var age = req.body.age;
    var tag = req.body.tag;
    //"CREATE (TheMatrix:Movie {title:'"+name+"', released:"+age+", tagline:'"+tag+"'})"
    let sentence ="CREATE (m:Movie {title:$titleParam, released:$ageParam, tagline:$tagParam}) return m.title";
    session
    .run(sentence,{titleParam:name, ageParam:age, tagParam:tag})
    .then(function(result){
        console.log('Se agrego correctamente');
        res.redirect('/');
        //res.render('/');
        //session.close();
    })
    .catch(function(err){
        console.log(err);
    });
    res.redirect('/');
    //res.render('/');
});
app.get('/movie/edit/:id',(req,res)=>{
    let id = req.params.id;
    session
    .run('MATCH(n:Movie) WHERE ID(n)='+id+' RETURN n')
    .then(function(result){
        var movieArr={};
        // result.records.forEach(function(record){
        //     console.log(record._fields[0].identity);
        // });
        result.records.forEach(function(record){
            movieArr={
                id: record._fields[0].identity.low,
                title: record._fields[0].properties.title,
                year: record._fields[0].properties.released.low,
                description: record._fields[0].properties.tagline
            };
            
        });
        res.render('editM',{
            param:movieArr
        });
    })
    .catch(function(err){
        console.log(err);
    });
});
app.post('/movie/edit',(req,res)=>{
    var name= req.body.name;
    var age = req.body.age;
    var tag = req.body.tag;
    var id = req.body.id;
    //"CREATE (TheMatrix:Movie {title:'"+name+"', released:"+age+", tagline:'"+tag+"'})"
    let sentence ='MATCH(n:Movie {title:$idParam}) SET n.title=$titleParam, n.age=$ageParam, n.tagline=$tagParam RETURN n';
    session
    .run(sentence,{titleParam:name, ageParam:age, tagParam:tag, idParam:id})
    .then(function(result){
        console.log('Se agrego correctamente');
        res.redirect('/');
        //res.render('/');
        //session.close();
    })
    .catch(function(err){
        console.log(err);
    });
    res.redirect('/');
    //res.render('/');
});
////////////
app.get('/elenco',(req,res)=>{
res.render('movie_actor');
});
app.post('/actor_movie/add',function(req,res){
    var name= req.body.name;
    var movie = req.body.movie;
    
    //"CREATE (TheMatrix:Movie {title:'"+name+"', released:"+age+", tagline:'"+tag+"'})"
    let sentence ="MATCH(p:Person {name:$nameParm}),(m:Movie{title:$titleParm}) MERGE(p)-[r:ACTED_IN]->(m) return p,m";
    session
    .run(sentence,{nameParm:name, titleParm:movie})
    .then(function(result){
        console.log('Se agrego correctamente');
        res.redirect('/');
        //res.render('/');
        //session.close();
    })
    .catch(function(err){
        console.log(err);
    });
    res.redirect('/');
    //res.render('/');
});
app.listen(3000);
console.log('Server Start on port 3000');

module.exports=app;
