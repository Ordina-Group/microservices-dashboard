/* global angular, _ */
(function() {
  'use strict';
  angular
    .module('microServicesGui')
    .factory('NodeService', NodeService);
  /** @ngInject */
  function NodeService(
    // services
    $http, $rootScope, GraphService,

    // constants
    UI_LANE, MS_LANE, RESOURCE_LANE, BE_LANE,

    // events
    EVENT_NODES_CHANGED) {
    var _selectedNode;
    var factory = {
      getToLinksByNodeId: getToLinksByNodeId,
      getFromLinksByNodeId: getFromLinksByNodeId,
      setSelectedNode: setSelectedNode,
      getSelectedNode: getSelectedNode,
      getConnectedNodes: getConnectedNodes,
      getAvailableNodes: getAvailableNodes,
      updateNode: updateNode,
      addNewNode: addNewNode,
      deleteNode: deleteNode,
      getNodeType: getNodeType,
      getNewNode: getNewNode
    };

    function getConnectedNodes(linkList, node) {
      return linkList
        .reduce(function(connectedNodes, link) {
          if (link.source.id === node.id) {
            connectedNodes.push(link.target);
          } else if (link.target.id === node.id) {
            connectedNodes.push(link.source);
          }
          return connectedNodes;
        }, [node]);
    }

    function addNewNode(data) {
      var node = data.sourceNode;
      var toLinks = data.toLinks;
      if (toLinks) {
        node.linkedToNodeIds = getTargetIndices(toLinks);
      }
      if (node.id && data.isNewNode) {
        $http
          .post('@@BASE_URL' + 'node', node)
          .then(function() {
            GraphService.addNewNode(node);
            var oldLinks = GraphService.getGraph().links;
            GraphService.getGraph().links = GraphService.updateToLinks(oldLinks, data);
            $rootScope.$broadcast(EVENT_NODES_CHANGED);
          });
      }
    }

    function getFromLinksByNodeId(nodeIndex) {
      var links = GraphService.getGraph().links;
      var filterFn = selectTargetNodes(nodeIndex);
      return links.filter(filterFn);
    }

    function getToLinksByNodeId(nodeIndex) {
      var links = GraphService.getGraph().links;
      var result = links.filter(function(link) {
        return link.source.index === nodeIndex;
      });
      return result;
    }

    function setSelectedNode(node) {
      _selectedNode = node;
    }

    function getAvailableNodes(selectedNode, nodes, links) {
      var availableNodes = {};
      switch (selectedNode.lane) {
        case UI_LANE:
          _.assign(availableNodes, getResources(selectedNode, nodes, links));
          break;
        case MS_LANE:
          _.assign(
            availableNodes,
            getBackendNodes(selectedNode, nodes, links),
            getResources(selectedNode, nodes, links),
            getMsNodes(selectedNode, nodes, links)
          );
          break;
        case BE_LANE:
          break;
        case RESOURCE_LANE:
          _.assign(
            availableNodes,
            getMsNodes(selectedNode, nodes, links)
          );
          break;
        default:
          break;
      }
      return availableNodes;
    }

    function updateNode(updates) {
      if (updates.isNewNode === false) {
        updates.sourceNode.details.virtual = true;
        var preparedNode = stripUnneededProperties(updates.sourceNode);
        preparedNode.linkedToNodeIds = getTargetIndices(updates.toLinks);
        $http.post('@@BASE_URL' + 'node', preparedNode)
          .then(function() {
            var oldLinks = GraphService.getGraph().links;
            GraphService.getGraph().links = GraphService.updateToLinks(oldLinks, updates);
            $rootScope.$broadcast(EVENT_NODES_CHANGED);
          });
      }
    }

    function getTargetIndices(links) {
      return links.map(function(link) {
        return link.target.id;
      });
    }

    function deleteNode(node) {
      if (typeof node.id !== 'undefined') {
        return $http.delete('@@BASE_URL' + 'node/' + node.id).then(function() {
          var index = GraphService.findNodeIndex(node.id);
          var links = GraphService.getGraph().links;
          GraphService.removeLinkByNodeIndex(links, node.index);
          GraphService.getGraph().nodes.splice(index, 1);
          $rootScope.$broadcast(EVENT_NODES_CHANGED);
        });
      }
    }

    function getSelectedNode() {
      return _selectedNode;
    }

    function getNodeType(laneNr) {
      switch (laneNr) {
        case UI_LANE:
          return 'UI_COMPONENT';
        case RESOURCE_LANE:
          return 'RESOURCE';
        case MS_LANE:
          return 'MICROSERVICE';
        default:
          return 'OTHER';
      }
    }

    function getNewNode(type, laneNr) {
      return {
        details: {
          status: 'VIRTUAL',
          type: type,
          custom: []
        },
        lane: laneNr
      };
    }

    /* ===== Private Methods ===== */
    function selectTargetNodes(nodeIndex) {
      var index = nodeIndex;
      return function(link) {
        return link.target.index === index;
      };
    }

    // function selectSourceNodes(nodeIndex) {
    //   var index = nodeIndex;
    //   return function(link) {
    //     return link.source.index === index;
    //   };
    // }

    function getMsNodes(node, nodes, links) {
      return { microServices: filterNodesByLane(nodes, MS_LANE, links)(node) };
    }

    function getBackendNodes(node, nodes, links) {
      return { backEnd: filterNodesByLane(nodes, BE_LANE, links)(node) };
    }

    function getResources(node, nodes, links) {
      return { resources: filterNodesByLane(nodes, RESOURCE_LANE, links)(node) };
    }

    function filterNodesByLane(nodes, laneId, links) {
      return function(selectedNode) {
        return nodes.filter(function(node) {
          return (node.id !== selectedNode.id) && (node.lane === laneId);
        }).filter(function(node) {
          return isLinked(node.index, selectedNode.index, links);
        });
      };
    }

    function isLinked(nodeIndex, selectedNodeIndex, links) {
      var result = links.filter(function(link) {
        var values = _.values(link).map(function(link) {
          return link.index;
        });
        return (values.indexOf(nodeIndex) > -1) && (values.indexOf(selectedNodeIndex) > -1);
      });
      return _.isEmpty(result);
    }

    function stripUnneededProperties(node) {
      var payload = {};
      payload.details = node.details;
      payload.id = node.id;
      payload.lane = node.lane;
      payload.linkedFromNodeIds = node.linkedFromNodeIds;
      payload.linkedToNodeIds = node.linkedToNodeIds;
      return payload;
    }

    return factory;
  }
})();
