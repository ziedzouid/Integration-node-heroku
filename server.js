var express = require('express');
var bodyParser = require('body-parser');
var pg = require('pg');

var app = express();

app.set('port', process.env.PORT || 5000);

app.use(express.static('public'));
app.use(bodyParser.json());

app.post('/update', function(req, res) {
    pg.connect(process.env.DATABASE_URL, function (err, conn, done) {
        // watch for any connect issues
        if (err) console.log(err);
        conn.query(
            'UPDATE salesforce.Account SET Location__Latitude__s = $1, Location__Longitude__s = $2 WHERE LOWER(Name) = LOWER($3) AND LOWER(Phone) = LOWER($4) AND LOWER(Website) = LOWER($5)',
            [req.body.latitude.trim(), req.body.longitude.trim(), req.body.firstName.trim(), req.body.phone.trim(), req.body.lastName.trim()],
            function(err, result) {
                if (err != null || result.rowCount == 0) {
                  conn.query('INSERT INTO salesforce.Account (Location__Latitude__s, Location__Longitude__s, Name, Phone, Website) VALUES ($1, $2, $3, $4, $5)',
                  [req.body.latitude.trim(), req.body.longitude.trim(), req.body.firstName.trim(), req.body.phone.trim(), req.body.lastName.trim()],
                  function(err, result) {
                    done();
                    if (err) {
                        res.status(400).json({error: err.message});
                    }
                    else {
                        // this will still cause jquery to display 'Record updated!'
                        // eventhough it was inserted
                        res.json(result);
                    }
                  });
                }
                else {
                    done();
                    res.json(result);
                }
            }
        );
    });
});

app.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});
