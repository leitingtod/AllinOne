// Generated by CoffeeScript 1.4.0
(function() {
  var _ref;

  this.BH = typeof BH !== "undefined" && BH !== null ? BH : {};

  BH.Workers = (_ref = BH.Workers) != null ? _ref : {};

  BH.Workers.DomainGrouper = (function() {

    function DomainGrouper() {}

    DomainGrouper.prototype.run = function(intervals) {
      var interval, _i, _len, _ref1;
      this.intervals = intervals;
      _ref1 = this.intervals;
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        interval = _ref1[_i];
        interval.visits = this.groupByDomain(interval.visits);
      }
      return this.intervals;
    };

    DomainGrouper.prototype.groupByDomain = function(visits) {
      var groupedVisits, previous, visit, _i, _len;
      groupedVisits = [];
      previous = null;
      for (_i = 0, _len = visits.length; _i < _len; _i++) {
        visit = visits[_i];
        if (groupedVisits.length === 0) {
          groupedVisits.push(visit);
          previous = visit;
        } else {
          if (this.hasSameDomain(visit, previous)) {
            if (!(groupedVisits[groupedVisits.length - 1].length != null)) {
              groupedVisits.pop();
              groupedVisits.push([previous, visit]);
            } else {
              groupedVisits[groupedVisits.length - 1].push(visit);
            }
          } else {
            groupedVisits.push(visit);
          }
        }
        previous = visit;
      }
      return groupedVisits;
    };

    DomainGrouper.prototype.hasSameDomain = function(visit1, visit2) {
      if ((visit1 != null) && (visit2 != null)) {
        if (this.extractDomain(visit1) === this.extractDomain(visit2)) {
          return true;
        }
      }
      return false;
    };

    DomainGrouper.prototype.extractDomain = function(visit) {
      var match;
      match = visit.url.match(/\/\/(.*?)\//);
      if (match === null) {
        return null;
      } else {
        return match[0];
      }
    };

    return DomainGrouper;

  })();

  self.addEventListener('message', function(e) {
    var grouper;
    grouper = new BH.Workers.DomainGrouper();
    return postMessage(grouper.run(e.data.intervals));
  });

}).call(this);
