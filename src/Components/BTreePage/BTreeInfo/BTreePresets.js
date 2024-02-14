/**
 * Class where B-Tree Preset, aswell as "to perform" operations can be stored.
 * The loadBTreePreset function in BTreePage.jsx for example loads these and queues the opeartions
 */
const bTreePresets = {

  insertExample: {
    importData: `{"maxKeys":4, "keyType":"number","nodeData":{"name":{"id":3,"keys":["14","25","34","68"]},"children":[{"name":{"id":1,"keys":["2","7","13"]}},{"name":{"id":4,"keys":["20","22"]}},{"name":{"id":6,"keys":["27","30","32","33"]}},{"name":{"id":5,"keys":["35","40"]}},{"name":{"id":2,"keys":["91","93"]}}]}}`,
    addKeys: [26],
    removeKeys: [],
  },
  deleteExample: {
    importData: `{"maxKeys":4, "keyType":"number","nodeData":{"name":{"id":9,"keys":["60"]},"children":[{"name":{"id":3,"keys":["15","56"]},"children":[{"name":{"id":1,"keys":["7","12"]}},{"name":{"id":5,"keys":["18","30","44"]}},{"name":{"id":4,"keys":["57","58","59"]}}]},{"name":{"id":8,"keys":["68","82"]},"children":[{"name":{"id":7,"keys":["63","66"]}},{"name":{"id":6,"keys":["69","72"]}},{"name":{"id":2,"keys":["86","88"]}}]}]}}`,
    addKeys: [],
    removeKeys: [30,60],
  },
  mergeExample: {
    importData: `{"maxKeys":4, "keyType":"number","nodeData":{"name":{"id":9,"keys":["60"]},"children":[{"name":{"id":3,"keys":["15","56"]},"children":[{"name":{"id":1,"keys":["7","12"]}},{"name":{"id":5,"keys":["18","30","44"]}},{"name":{"id":4,"keys":["57","58","59"]}}]},{"name":{"id":8,"keys":["68","82"]},"children":[{"name":{"id":7,"keys":["63","66"]}},{"name":{"id":6,"keys":["69","72"]}},{"name":{"id":2,"keys":["86","88"]}}]}]}}`,
    addKeys: [],
    removeKeys: [66],
  },
  rotationExample: {
    importData: `{"maxKeys":4,"keyType":"number","nodeData":{"name":{"id":9,"keys":["60"]},"children":[{"name":{"id":3,"keys":["15","40","56"]},"children":[{"name":{"id":1,"keys":["7","12"]}},{"name":{"id":5,"keys":["18","30", "35"]}},{"name":{"id":10,"keys":["44","45"]}},{"name":{"id":4,"keys":["57","58","59"]}}]},{"name":{"id":8,"keys":["68","80"]},"children":[{"name":{"id":7,"keys":["63","66"]}},{"name":{"id":6,"keys":["69","70"]}},{"name":{"id":2,"keys":["86","88","90"]}}]}]}}`,
    addKeys: [],
    removeKeys: [45,80],
  },
};

export default bTreePresets;
