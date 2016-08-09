/* global angular, _ */

(function() {
  'use strict';

  angular
    .module('microServicesGui')
    .factory('GraphService', GraphService);

  /** @ngInject */
  function GraphService(

    // services
    $rootScope, $http, $q,

    // constants
    REQUEST_GRAPH_DATA_SUCCESS
  ) {
    var graph = {};

    var factory = {
      evict: evict,
      countNodesByLane: countNodesByLane,
      getGraph: getGraphData,
      setGraphData: setGraphData,
      requestGraph: requestGraph,
      updateToLinks: updateToLinks,
      removeLinkByNodeIndex: removeLinkByNodeIndex,
      addLink: addLink,
      linkExists: linkExists,
      findNodeIndex: findIndex,
      addNewNode: addNewNode,
      getStates: getStates,
      getTypes: getTypes,
      getGroups: getGroups
    };
    function evict() {
      return $http.post('@@BASE_URL' + 'evictCache')
        .then(function(ok) {
          console.log('evict cache success');
        }, (function(bad) {
          console.log('evict cache failed');
        }));
    }
    function countNodesByLane(nodes) {
      return nodes.reduce(function(table, node) {
        table[node.lane]++;
        return table;
      }, [0, 0, 0, 0]);
    }

    function getGraphData() {
      return graph;
    }

    function setGraphData(graphData) {
      graph = graphData;
    }

    // TODO: optimize performance, centralize index state somewhere
    function findIndex(id) {
      for (var i = 0; i < graph.nodes.length; i++) {
        if (graph.nodes[i].id === id) {
          return i;
        }
      }
      return -1;
    }

    /**
     * Removes all links related to a particular node
     * Call this method when you delete a node
     * @param {array} links an array of links, items can be of type
     * {source: number, target:number}
     * or
     * { source: Node, target: Node }
     * @param {number} nodeIndex the array index of the node inside the graph
     * @returns a new array with all the links related to a particular node removed.
     */
    function removeLinkByNodeIndex(links, nodeIndex) {
      return links.filter(function(link) {
        if (isDefaultLinkType(link)) {
          return link.source === nodeIndex;
        }
        return link.source.index !== nodeIndex && link.target.index !== nodeIndex;
      });
    }

    function addNewNode(node) {
      var nodes = graph.nodes;

      if (!_.isEmpty(nodes)) {
        if (node && (!_.isEmpty(node))) {
          if (node.id) {
            if (isUnqiue(nodes, node.id)) {
              nodes.push(node);
            }
          }
        }
      }
    }

    function addLink(links, link) {
      var newLinks = links;
      if (links && link) {
        if (linkExists(newLinks, link.source.index, link.target.index) === false) {
          newLinks.push(link);
        }
      }
      return newLinks;
    }

    /**
     * Updates a link list with a particular node as the source
     *
     * Given a link
     * When {list} contains the link
     * When {updates} contains the link     *
     * then the link will get added to the {list}
     *
     * Given a link
     * When {list} contains the link
     * When {updates} does not contain the link
     * then the link will be removed from the {list}
     *
     * Given a link
     * When {list} does not contain the link
     * When {updates} contains the link
     * then the link will be added to the {list}
     *
     * @param {any} updates An object containing the source node, and new list of links
     *
     * var updates = {
     *  sourceNode: node,
     *  toLinks: node[],
     *  isNewNode: boolean
     * }
     *
     * @returns a new array of link objects
     */
    function updateToLinks(list, updates) {
      var newList = [];
      if (updates) {
        var newLinks = updates.toLinks;
        var sourceNode = updates.sourceNode;
        var isNewLink = createIsNewLinkFilterFn(list);
        var listWithRemovedLinks = [];
        var newLinksToAdd = [];

        listWithRemovedLinks = list
          .filter(function(link) {
            if (isNodeInLink(link, sourceNode)) {
              return true;
            }
            if (link.target.index === sourceNode.index) {
              return true;
            }
            return hasEqualLinks(link, newLinks);
          });

        newLinksToAdd = newLinks.filter(isNewLink);

        newList = newList
          .concat(listWithRemovedLinks)
          .concat(newLinksToAdd);
      }
      return newList;
    }

    function isNodeInLink(link, node) {
      return (link.source.index !== node.index) &&
        (link.target.index !== node.index);
    }

    function hasEqualLinks(link, links) {
      var isEqualLink = createIsEqualLinkFilterFn(link);
      var result = links.filter(isEqualLink);
      return result.length > 0;
    }

    function createIsEqualLinkFilterFn(link) {
      var oldLink = link;
      return function(newLink) {
        return isEqualLink(oldLink, newLink);
      };
    }

    function createIsNewLinkFilterFn(linkList) {
      var list = linkList;
      return function(link) {
        return listHasLink(list, link);
      };
    }

    function listHasLink(list, link) {
      return _.find(list, function(oldLink) {
        return isEqualLink(link, oldLink);
      }) === undefined;
    }

    function isEqualLink(linkAlpha, linkBeta) {
      return (linkAlpha.source.index === linkBeta.source.index) &&
        (linkAlpha.target.index === linkBeta.target.index);
    }

    function linkExists(links, sourceIndex, targetIndex) {
      var result = _.find(links, function(l) {
        if (!isDefaultLinkType(l)) {
          return (l.target.index === targetIndex) && (l.source.index === sourceIndex);
        }
        return (l.target === targetIndex) && (l.source === sourceIndex);
      });
      return result !== undefined;
    }

    function isDefaultLinkType(l) {
      return _.isNumber(l.source) && _.isNumber(l.target);
    }

    function isUnqiue(nodes, id) {
      var result = _.find(nodes, function(n) {
        return n.id === id;
      });
      return result === undefined;
    }

    function requestGraph() {
      $rootScope.dataLoading = true;

      return $http
        .get('@@BASE_URL' + 'graph')
        .then(function(response) {
          var graphData = response.data;
          graphData.links = assignNodeToLinks(graphData.nodes, graphData.links);
          graph = graphData;
          $rootScope.dataLoading = false;
          $rootScope.$broadcast(REQUEST_GRAPH_DATA_SUCCESS);
          return graphData;
        });
    }

    function assignNodeToLinks(nodes, links) {
      var linksWithNodes = [];
      nodes.forEach(function(node, nodeIndex) {
        linksWithNodes = links.map(function(link) {
          if (link.source === nodeIndex) {
            link.source = node;
          } else if (link.target === nodeIndex) {
            link.target = node;
          }
          return link;
        });
      });
      return linksWithNodes;
    }

    function getGroups(nodes) {
      if (nodes) {
        return nodes.reduce(function(state, val) {
          if (val) {
            if (val.details) {
              if (val.details.group) {
                var newGroup = {
                  key: val.details.group,
                  value: val.details.group
                };
                var hasGroup = state.filter(function(group) {
                  return newGroup.key === group.key;
                }).length >= 1;
                if (hasGroup === false) {
                  state.push(newGroup);
                }
              }
            }
          }
          return state;
        }, []).sort(function(a, b) {
          if (a.key < b.key) {
            return -1;
          }
          if (a.key > b.key) {
            return 1;
          }
          return 0;
        });
      }
    }

    function getStates() {
      return $q(function(resolve) {
        resolve([
          { key: 'UP', value: 'UP' },
          { key: 'DOWN', value: 'DOWN' },
          { key: 'UNKNOWN', value: 'UNKNOWN' },
          { key: 'VIRTUAL', value: 'VIRTUAL' }]);
      });
    }

    function getTypes() {
      return $q(function(resolve) {
        resolve(['RESOURCE', 'MICROSERVICE', 'DB', 'SOAP', 'REST', 'JMS', 'UI_COMPONENT']);
      });
    }
    return factory;
  }
})();
