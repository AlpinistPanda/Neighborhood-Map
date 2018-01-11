
let reducedDanceList = ['Salsa', 'Lindy Hop', 'Hip Hop'];  // Dance List



// collapsible dide bar

$(document).ready(function () {

    $('#sidebarCollapse').on('click', function () {
        $('#sidebar').toggleClass('active');
    });

});



var Dancestyle = function (dancestyle) {
    var self = this;
    self.dancestyle = dancestyle;
    self.visible = ko.observable(true);
}


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


    // Check (and closes) if another window was previously called.
    self.closeWindows = function() {
        if (self.windowOpen()) {
            self.windowOpen().close();
            self.windowOpen(false);
        }
    }

    // select dancestyle



self.selectDancestyle = function( dancestyle ) {
    self.closeWindows();
    console.log("Dancestyle selected");
    self.clearAll();
    dancestyle.visible(true);
}

self.clearAll = function() {
    self.danceList().forEach(function (dancestyle) {
        console.log('it is cleared');
        dancestyle.visible( false );
    });

    self.hasFiltered(true);
};


};


let viewM = new ViewModel();


ko.applyBindings(viewM);
