var fs = require('fs');
var https = require('https');

let app = require('express')();
let bodyParser = require('body-parser');
let sgMail = require('@sendgrid/mail');

var privateKey = fs.readFileSync('/etc/letsencrypt/live/vorlaender-lw.de/privkey.pem', 'utf8');
var certificate = fs.readFileSync('/etc/letsencrypt/live/vorlaender-lw.de/cert.pem', 'utf8');
var credentials = {
    key: privateKey,
    cert: certificate
};

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

ipAdresses = [];

app.post('/direktkontakt', function(req, res) {

    var ip = req.connection.remoteAddress;
    console.log("Nachricht von " + ip);

    if (req.body['g-recaptcha-response'] === undefined || req.body['g-recaptcha-response'] === '' || req.body['g-recaptcha-response'] === null) {
        console.log("ERROR - Captcha not solved");
        res.status(403);
        res.send("Löse das Captcha, sonst weiß ich nicht ob du ein Mensch bist!");
        return;
    }

    if (ipAdresses.includes(ip)) {
        console.log("ERROR - IP Spam block");
        res.status(403);
        res.send("Warte einen Moment bevor du eine neue Nachricht sendest");
        return;
    }

    if (req.body.message.length < 10) {
        console.log("ERROR - Nachricht zu kurz");
        res.status(403);
        res.send("Deine Nachricht war leer oder war zu kurz.");
        return;
    }

    try {
        //Sending Mail - API key must be set as system variable in terminal with 
        //echo "export SENDGRID_API_KEY='YOUR_API_KEY'" > sendgrid.env
        //echo "sendgrid.env" >> .gitignore
        //source ./sendgrid.env

        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        const msg = {
            to: 'vorlaender-lw@t-online.de',
            from: 'info@vorlaender-lw.de',
            subject: 'Vorlaender-LW Postfach: ' + req.body.subject,
            html: ("Hallo Mama, es gab eine neue Nachricht über das Kontaktforumlar auf unserer Webseite!<br><br>-------<br>Name:" + req.body.name + ",<br> " + "Mail:" + req.body.email + ",<br> " + "Betreff:" + req.body.subject + ",<br><br>Nachricht:<br> " + req.body.message + "<br>-------"),
        };
        sgMail.send(msg, (error, result) => {
            if (error) {
				console.log("Fatal Error Callback");
                res.status(500);
                res.send("Ups... Unerwarteter Serverfehler! Bitte geben geben Sie uns Bescheid, wenn dieser Fehler öfter vorkommt... Stichwort: Mail Callback Error");
            } else {
                console.log('Success\n', req.body);
                //Response
                res.status(200);
                res.send("Deine Nachricht wurde efolgreich an uns übermittelt!");
            }
        });

        // Add IP to forbidden list (remove after 5 min)
        ipAdresses.push(ip);
        setTimeout(function() {
            removeIP(ip);
        }, 1000 * 60 * 5);

    } catch (e) {
		console.log("Fatal Error Catch");
        res.status(500);
        res.send("Ups... Unerwarteter Serverfehler! Bitte geben geben Sie uns Bescheid, wenn dieser Fehler öfter vorkommt... Stichwort: Catch Block Error");
    }
});

let httpsServer = https.createServer(credentials, app);

httpsServer.listen(3000, function(err) {
    if (err) {
        throw err
    }
    console.log('Server started on port 3000')
})

function removeIP(ip) {
    console.log(ip + " is allowed to send messages again!");
    ipAdresses.splice(ipAdresses.indexOf(ip), 1);
}