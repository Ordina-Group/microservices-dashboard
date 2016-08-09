/* global angular*/

(function() {
  'use strict';

  /** @ngInject */
  function config($logProvider) {
    // enable log debug
    $logProvider.debugEnabled(true);
  }

  angular
    .module('microServicesGui')

    // lane numbers
    .constant('UI_LANE', 0)
    .constant('RESOURCE_LANE', 1)
    .constant('MS_LANE', 2)
    .constant('BE_LANE', 3)

    // modal
    .constant('createModalConfig', modalConfig)

    // events
    .constant('EVENT_SET_LANE_VISIBILITY', 'event:set:ui:lane:visibility')
    .constant('EVENT_NODES_CHANGED', 'nodesChanged')
    .constant('REQUEST_GRAPH_DATA_SUCCESS', 'New:graph:data')
    .config(config);


  function modalConfig(currentLane) {
    var modalConfig = {
      templateUrl: 'app/nodemodal/nodemodal.html',
      controller: 'NodeModalController',
      controllerAs: 'vm',
      resolve: {
        currentLane: function() {
          return currentLane;
        }
      }
    };
    return modalConfig;
  }
})();
