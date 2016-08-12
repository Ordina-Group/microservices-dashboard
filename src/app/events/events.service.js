/* global angular */
(function() {
  'use strict';

  angular
    .module('microServicesGui')
    .service('msdEventsService', Service);

  Service.$inject = ['$rootScope', '$http'];
  /**
   * Responsible for managing the local event list state.
   * And managing the HTTP RESOURCE /events
   *
   * @param {any} $http
   */
  function Service($rootScope, $http) {
    var _self = this;
    var _eventsToNodeIdMap;
    var _eventList = [];
    var _indexToNodeIdMap;

    _self.getIndexMap = getIndexMap;
    _self.deleteAllEvents = deleteAllEvents;
    _self.getEventsByNodeIdMap = getEventsByNodeIdMap;
    _self.getMappedEventList = getMappedEventList;
    _self.removedEventsByNodeId = removedEventsByNodeId;
    _self.getIndexedList = getIndexedList;
    _self.getEventsByIndex = getEventsByIndex;
    _self.request = request;
    _self.getEventList = getEventList;
    _self.setEventList = setEventList;
    _self.getEventCountByNodeId = getEventCountByNodeId;
    _self.getEventsByNodeId = getEventsByNodeId;
    _self.createEventsGraph = createEventsGraph;

    // //////////////
    function deleteAllEvents() {
      $rootScope.dataLoading = true;
      return $http.delete('@@BASE_URL' + 'events').then(function() {
        setEventList([]);
        $rootScope.dataLoading = false;
        return true;
      });
    }

    function getEventsByNodeIdMap() {
      return _eventsToNodeIdMap;
    }
    function getIndexMap() {
      return _indexToNodeIdMap;
    }
    function getMappedEventList() {
      return _eventsToNodeIdMap;
    }
    function removedEventsByNodeId(nodeId) {
      clearEventsByIndex(_indexToNodeIdMap[nodeId]);
      _eventList = _eventList.filter(function(eventDetails) {
        return eventDetails.nodeId !== nodeId;
      });
    }
    function clearEventsByIndex(index) {
      var nodeEvents = _eventsToNodeIdMap[index];
      if (nodeEvents) {
        nodeEvents.events = [];
      }
    }
    function getEventsByIndex(index) {
      return _eventsToNodeIdMap[index];
    }
    function createEventsGraph(list) {
      var index = -1;
      _indexToNodeIdMap = {};
      return list.reduce(function(graph, event) {
        var result = graph.filter(function(graphElement) {
          return graphElement.nodeId === event.nodeId;
        });
        if (result.length === 1) {
          var element = result[0];
          element.events.push(event);
        } else {
          index += 1;
          var evts = [];
          evts.push(event);
          graph.push({
            index: index,
            nodeId: event.nodeId,
            events: evts
          });
          _indexToNodeIdMap[event.nodeId] = index;
        }
        return graph;
      }, []);
    }

    function getEventsByNodeId(id) {
      if (id) {
        return getEventsByIndex(_indexToNodeIdMap[id]);
      }
      return undefined;
    }

    function filterById(id) {
      return _eventList.filter(function(event) {
        return event.nodeId === id;
      });
    }
    function getEventCountByNodeId(id) {
      var count = 0;
      if (id) {
        count = filterById(id).length;
      } else {
        count = -1;
      }
      return count;
    }
    function setEventList(list) {
      _eventList = list;
      _eventsToNodeIdMap = createEventsGraph(list);
    }
    function getIndexedList() {
      return _eventsToNodeIdMap;
    }
    function getEventList() {
      return _eventList;
    }
    function request() {
      return $http
        .get('@@BASE_URL' + 'events')
        .then(function(response) {
          if (response.data) {
            setEventList(response.data);
          }
        });
    }
  }
})();
