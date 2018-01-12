
let reducedDanceList = ['Salsa', 'Lindy Hop', 'Hip Hop'];  // Dance List

let map = {};
let marker = {};
let infoWindow = {}



function initialize() {
    let mapOptions = {
        zoom: 15,
        center: new google.maps.LatLng(1.286055, 103.8510605),
        mapTypeControl: false,
        disableDefaultUI: true
    };


    map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
}


/*  Adds an observable value for each entity in reducedDanceList
*
*/

let Dancestyle = function (dancestyle) {
    let self = this;
    self.dancestyle = dancestyle;
    self.visible = ko.observable(true);
}

/* Venue object that holds related info
*
*/

let Venue = function(venue, weather) {
    let self = this;

    self.place = venue.place;
    self.description = venue.notes;
    self.dancestyle = venue.dancestyle;
    self.is_visible = false;

    self.coordinates = { lat: 0, lng: 0};
    self.coordinates.lat = venue.lat;
    self.coordinates.lng = venue.lng;
    self.img_url = venue.pic;
    self.url = venue.url;
    self.weatherIcon = weather.weatherIcon;

    self.weatherText = weather.weatherText;
    let img_size = '100x100';


    self.marker = new google.maps.Marker({
        position: self.coordinates,
        title: self.name
    });

    // Html to create the infowindow which will present some useful info about the venue

    contentString = '<div class="container-fluid info">'+
    '<div class="row img-rating-header-row">'+
    '<div class="col-sm-4">'+
    '<img class="mainImg" src="'+self.img_url+'" height="100" width="100">'+
    '</div>'+
    '<div class="col-sm-8">'+
    '<h3 class="firstHeading"><a href="'+self.url+'">'+self.place+'</a></h3>'+
    '</div>'+
    '</div>'+
    '<div class="row content-row">'+
    '<div class="col-sm-12">'+
    '<p>'+self.description+'</p>'+
    '<p>Forecast for next Event</p>'+
    '</div>'+
    '</div>'+
    '<div class="row weather-row">'+
    '<div class="col-sm-4">'+
    '<img src="'+self.weatherIcon+'">'+
    '</div>'+
    '<div class="col-sm-8">'+
    '<p>'+self.weatherText+'</p>'+
    '</div>'+
    '</div>'+
    '<div class="row homepage-url-row">'+
    '<div class="col-sm-12"><a href="'+self.url+'">Venue link</a></div>'+
    '</div>'+
    '<div>';


    // Google Maps Infowindow is created

    self.infoWindow = new google.maps.InfoWindow({
        content: contentString
    });
};


let ViewModel = function() {
    let self = this;

    self.venueList = ko.observableArray([]);
    self.danceList = ko.observableArray([]);

    self.hasFiltered = ko.observable(false);
    self.windowOpen = ko.observable(false);

    // DanceList

    reducedDanceList.forEach(function(name) {
        self.danceList.push(new Dancestyle(name));
    });

    // Gather dancestyles that are visible

    self.visibleDanceStyle = ko.computed(function(){
        let visibleList = {};
        self.danceList().forEach(function ( dancestyle ){
            visibleList[dancestyle.dancestyle] = dancestyle.visible();
        });

        return visibleList
    });

    //    Run AJAX calls to learn the weather for the event
    //    Builds the Venue and Dancestyle models

    venue_list.forEach(function ( restObj ){
        let api_url = 'http://api.wunderground.com/api/83e4eaf81392612c/forecast10day/q/Singapore/Singapore.json';

        $.ajax({
            url: api_url,
            data: {format: 'json'},
            dataType: 'json'
        }).done(function(data){

            let d = new Date();
            let weather_data = data.forecast.txt_forecast;
            let text;
            let dif = 0;

            if(d.getDay()<=restObj.day){
                dif = restObj.day - d.getDay();
            }
            if(d.getDay()>restObj.day){
                dif = restObj.day - d.getDay() + 7;
            }

            // console.log(weather_data.forecastday[dif*2].fcttext_metric);    Debug
            let weather = {
                weatherText: weather_data.forecastday[dif*2].fcttext_metric,
                weatherIcon: weather_data.forecastday[dif*2].icon_url
            };

            // console.log(weather);    Debug
            self.venueList.push(new Venue(restObj, weather));

        }).fail(function(){
            self.errorMessage('Wunderground API Failed');
        });

    });


    // Check (and closes) if another window was previously called.
    self.closeWindows = function() {
        if (self.windowOpen()) {
            self.windowOpen().close();
            self.windowOpen(false);
        }
    }

    //
    // https://developers.google.com/maps/documentation/javascript/examples/marker-animations

    self.toggleMarker = function(venue) {
        if (self.windowOpen() !== venue.infoWindow) {
            self.closeWindows();
            venue.marker.setAnimation(3);
            venue.infoWindow.open(map, venue.marker);
            self.windowOpen(venue.infoWindow);
        } else {
            self.closeWindows();
        }
    };

    // Filters Venues for the selected dance style
    // Is called every time a different dance style is selected

    self.getMarkers = ko.computed(function() {
        return self.venueList().filter(function (venue) {
            if (self.visibleDanceStyle()[venue.dancestyle]) {
                if (venue.is_visible == false) {
                    venue.marker.setMap(map);
                    venue.marker.setAnimation(google.maps.Animation.DROP);

                    // prevents constant stacking of event listeners.
                    google.maps.event.clearInstanceListeners(venue.marker);
                    venue.marker.addListener( 'click', function(){
                        self.toggleMarker(venue);
                    });
                }
                venue.is_visible = true;

                return true;

            } else {
                venue.marker.setMap(null);
                venue.is_visible = false;

                return false;
            }
        });
    }, self);



    // select dancestyle

    self.selectDancestyle = function(dancestyle) {
        self.closeWindows();
        self.clearAll();
        dancestyle.visible(true);
    }

    // clears any choice

    self.clearAll = function() {
        self.danceList().forEach(function (dancestyle) {
            // console.log('it is cleared');   debug
            dancestyle.visible(false);
        });

        self.hasFiltered(true);
    };

    // Shows all the dance styles, any filtering is cancelled

    self.showAll = function() {
        self.closeWindows();
        self.danceList().forEach(function (dancestyle) {
            dancestyle.visible(true);
        });

        self.hasFiltered(false);
    };

};


let viewM = new ViewModel();


ko.applyBindings(viewM);
