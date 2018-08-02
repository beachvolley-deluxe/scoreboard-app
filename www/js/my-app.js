var app = new Framework7();
var $$ = Dom7;

$$(document).on('deviceready', function() {
    var apiResponse = function(data) {
        setsHome.setValue(data.home.sets);
        pointsHome.setValue(data.home.points);
        setsAway.setValue(data.away.sets);
        pointsAway.setValue(data.away.points);
    };

    var api = function() {
        if (arguments.length > 0 && arguments.home && arguments.away) {
            var data = arguments[0];
        } else {
            var data = {
                secret: secret,
                home: {
                    points: pointsHome.value,
                    sets: setsHome.value
                },
                away: {
                    points: pointsAway.value,
                    sets: setsAway.value
                }
            };
        }
        data.secret = app.form.getFormData('secret-form').secret || null;
        app.request.postJSON('https://scoreboard.beachvolleydeluxe.be/api', data, function(response, status) {
            // Success callback
            //apiResponse(response);
        }, function(xhr, status) {
            app.dialog.alert('An error occured trying to save the scores.', 'Failure');
        })
    };

    // Steppers
    var setsHome = app.stepper.create({ el: '#sets-home', on: { change: api }});
    var setsAway = app.stepper.create({ el: '#sets-away', on: { change: api }});
    var pointsHome = app.stepper.create({ el: '#points-home', on: { change: api }});
    var pointsAway = app.stepper.create({ el: '#points-away', on: { change: api }});

    // Reset button
    $$('#reset').on('click', function(e) {
        api({
            home: {
                points: 0,
                sets: 0
            },
            away: {
                points: 0,
                sets: 0
            }

        });
        setsHome.setValue(0);
        setsAway.setValue(0);
        pointsHome.setValue(0);
        pointsAway.setValue(0);
    });

    // Quit button
    $$('#quit').on('click', function(e) {
        if (navigator.app) {
            navigator.app.exitApp();
        } else if (navigator.device) {
            navigator.device.exitApp();
        } else {
            window.close();
        }
    });

    // Secret storage
    $$('#secret').on('change', function(e) {
        app.form.storeFormData('secret-form', app.form.convertToData('#secret-form'));
    });
    app.form.fillFromData('#secret-form', app.form.getFormData('secret-form'));

    // Load current scores on app start
    var preload = app.dialog.preloader('Bezig met laden...');
    app.request.json('https://scoreboard.beachvolleydeluxe.be/api', function(response, status) {
        // Success callback
        apiResponse(response);
        preload.close();
    }, function(xhr, status) {
        preload.close();
        app.dialog.alert('An error occured trying to load the scores.', 'Failure');
    });

    // Stop screen from going idle
    var keepAwake = function() {
        window.plugins.insomnia.keepAwake();
    };
    var allowSleep = function() {
        window.plugins.insomnia.allowSleepAgain();
    }
    $$(document).on('deviceready resume', keepAwake).on('pause', allowSleep);
});