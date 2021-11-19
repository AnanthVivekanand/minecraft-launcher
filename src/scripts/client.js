/*
 _  __          _          _                           _
| |/ /___  _ __| | ___   _| |    __ _ _   _ _ __   ___| |__   ___ _ __
| ' // _ \| '__| |/ / | | | |   / _` | | | | '_ \ / __| '_ \ / _ \ '__|
| . \ (_) | |  |   <| |_| | |__| (_| | |_| | | | | (__| | | |  __/ |
|_|\_\___/|_|  |_|\_\\__, |_____\__,_|\__,_|_| |_|\___|_| |_|\___|_|
                     |___/
*/

const fs = require('fs');
const { red } = require ('ansicolor')
const { Authenticator, Client} = require("kl-core");
const client = new Client();
var path = require('path');

window.onload = (e) => {
    console.log(red.underline.bright("========INSTRUCTIONS======== \n DON'T CLOSE THE INSPECT ELEMENT \n") +
		"1) expand the window so you can see the start button \n" +
		"2) Type any username, a password is not needed \n" +
		"3) Type in the version you want, ex: 1.12.2 or 1.14.4 or 1.8.9 \n" +
		"4) Click launch \n" +
		red.underline.bright("5) BE PATIENT, IT WILL TAKE A WHILE FOR EVERYTHING TO DOWNLOAD, maybe around 3-5 minutes \n")
	       );
    if(localStorage.getItem('auth')) {
        const auth = JSON.parse(localStorage.getItem('auth'));
        document.getElementById("username").value = auth.name;
        
        if (auth.min_mem) document.getElementById("min_mem").value = auth.min_mem;
        if (auth.max_mem) document.getElementById("max_mem").value = auth.max_mem;
        if (auth.version) document.getElementById("version").value = auth.version;
	else document.getElementById("version").value = "1.12.2";
        if(auth.offline) return;
        Authenticator.validate(auth.access_token, auth.client_token).then(e => {
            document.querySelector('.login > h2').innerText = `Logged in as: ${auth.name}`;
            document.getElementsByClassName('wrapper')[0].classList.add('disabled');
        }).catch(e => {
            console.warn(e)
        })
    }
};

var walk = function(dir, done) {
    var results = [];
    fs.readdir(dir, function(err, list) {
      if (err) return done(err);
      var i = 0;
      (function next() {
        var file = list[i++];
        if (!file) return done(null, results);
        file = path.resolve(dir, file);
        fs.stat(file, function(err, stat) {
          if (stat && stat.isDirectory()) {
            walk(file, function(err, res) {
              results = results.concat(res);
              next();
            });
          } else {
            results.push(file);
            next();
          }
        });
      })();
    });
  };

async function init() {
/*
    if(localStorage.getItem('auth')) {
        const auth = JSON.parse(localStorage.getItem('auth'));
        if(auth.offline) {
            await processClient(JSON.parse(localStorage.getItem('auth')));
            return;
        }
        Authenticator.validate(auth.access_token, auth.client_token).then(async e => {
            await processClient(JSON.parse(localStorage.getItem('auth')));
        }).catch(e => {
            prependError('wrongPass');
            console.warn(e)
        });
        return;
    }
*/
    const login = {
        username: document.getElementById("username").value,
        password: document.getElementById("password").value
    };

    if(!login.username) {
        prependError('missingField');
    }

    Authenticator.getAuth(login.username, login.password).then(async e => {
        if(!login.password) e.offline = true;
	e.version = document.getElementById("version").value;
    e.min_mem = document.getElementById("min_mem").value;
    e.max_mem = document.getElementById("max_mem").value;
        localStorage.setItem('auth', JSON.stringify(e));
        await processClient(e);
    }).catch(e => {
        prependError('wrongPass');
        console.warn(e);
    });
}

var jre_installation = false;

function jre() {
    console.log("INSTALLING JAVA 16. DO NOT LAUNCH.")
    const njre = require('njre')
    // or custom ones
    njre.install(16, { openjdk_impl: 'openj9' })
    .then(dir => {
        walk(dir, function(err, results) {
            if (err) throw err;
            for (x of results) {
                if (x.slice(-5) === "/java" || x.slice(-5) === "\java") {
                    jre_installation = x;
                }
            }
          });
          
	console.log("INSTALLED into " + dir);
    })
    .catch(err => {
	console.log(err);
        console.log("Some error occured, idk");
        // Handle the error
    })
}

async function processClient(e) {
    options = {
        authorization: e,
        root: require('os').homedir() + "/korky_launcher",
        version: {
            number: document.getElementById("version").value,
            type: "release"
        },
        memory: {
            max: e.max_mem,
            min: e.min_mem
        },
        overrides: {
          url: {
        meta: 'https://raw.githubusercontent.com/AnanthVivekanand/minecraft-assets-2/master/launchermeta.mojang.com',
        resource: 'https://raw.githubusercontent.com/AnanthVivekanand/minecraft-assets-2/master/resources.download.minecraft.net',
        mavenForge: 'http://files.minecraftforge.net/maven/',
        defaultRepoForge: 'https://raw.githubusercontent.com/AnanthVivekanand/minecraft-assets-2/master/launchermeta.mojang.com/',

          }
       }
    }

    if (jre_installation) {
        console.log("Setting custom Java installation.")
        options.javaPath = jre_installation
    }
    await client.launch(options).catch(e => {
        prependError('genericError', e.message)
    })
}

client.on('debug', (e) => console.log(e));
client.on('data', (e) => console.log(e));
client.on('package-extract', (e) => console.log("clientPackage extracted!"));
client.on('download', (e) => console.log(e));
client.on('progress', (e) => console.log("Downloaded " + e.type + ": " + e.task + "/" + e.total));
client.on('close', (e) => {
    document.getElementsByClassName('login')[0].classList.remove('disabled');
    document.getElementsByClassName('look')[0].style.display = "none";
});

/*
 _  __          _          _                           _
| |/ /___  _ __| | ___   _| |    __ _ _   _ _ __   ___| |__   ___ _ __
| ' // _ \| '__| |/ / | | | |   / _` | | | | '_ \ / __| '_ \ / _ \ '__|
| . \ (_) | |  |   <| |_| | |__| (_| | |_| | | | | (__| | | |  __/ |
|_|\_\___/|_|  |_|\_\\__, |_____\__,_|\__,_|_| |_|\___|_| |_|\___|_|
                     |___/
*/
