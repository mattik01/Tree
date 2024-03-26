import BTree from '../src/Components/BTreePage/BTree.js';


describe('BTree Functionality', () => {
    test('Initializes correctly', () => {
        const btree = new BTree(3); // Initialize B-Tree of order 3 (max 2 keys per node)
        expect(btree.isEmpty()).toBe(true);
    });

    test('Adds keys correctly', () => {
        const btree = new BTree(3);
        btree.add(10);
        btree.add(20);
        expect(btree.contains(10)).toBe(true);
        expect(btree.contains(20)).toBe(true);
        expect(btree.contains(30)).toBe(false);
    });

    test('Removes keys correctly', () => {
        const btree = new BTree(3);
        btree.add(10);
        btree.add(20);
        btree.remove(10);
        expect(btree.contains(10)).toBe(false);
        expect(btree.contains(20)).toBe(true);
    });

    test('Insert + Split Structure Integrity', () => {
        var btree = new BTree(4);
        btree = btree.import(`{"maxKeys":4, "keyType":"number","nodeData":{"name":{"id":3,"keys":["14","25","34","68"]},"children":[{"name":{"id":1,"keys":["2","7","13"]}},{"name":{"id":4,"keys":["20","22"]}},{"name":{"id":6,"keys":["27","30","32","33"]}},{"name":{"id":5,"keys":["35","40"]}},{"name":{"id":2,"keys":["91","93"]}}]}}`, "number");
        btree.add(26)
        expect(btree.export()).toBe("{\"maxKeys\":4,\"keyType\":\"number\",\"nodeData\":{\"name\":{\"id\":9,\"keys\":[\"30\"]},\"children\":[{\"name\":{\"id\":3,\"keys\":[\"14\",\"25\"]},\"children\":[{\"name\":{\"id\":1,\"keys\":[\"2\",\"7\",\"13\"]}},{\"name\":{\"id\":4,\"keys\":[\"20\",\"22\"]}},{\"name\":{\"id\":6,\"keys\":[\"26\",\"27\"]}}]},{\"name\":{\"id\":8,\"keys\":[\"34\",\"68\"]},\"children\":[{\"name\":{\"id\":7,\"keys\":[\"32\",\"33\"]}},{\"name\":{\"id\":5,\"keys\":[\"35\",\"40\"]}},{\"name\":{\"id\":2,\"keys\":[\"91\",\"93\"]}}]}]}}");
    });

    test('Delete Structure Integrity ', () => {
        var btree = new BTree(4);
        btree = btree.import(`{"maxKeys":4, "keyType":"number","nodeData":{"name":{"id":9,"keys":["60"]},"children":[{"name":{"id":3,"keys":["15","56"]},"children":[{"name":{"id":1,"keys":["7","12"]}},{"name":{"id":5,"keys":["18","30","44"]}},{"name":{"id":4,"keys":["57","58","59"]}}]},{"name":{"id":8,"keys":["68","82"]},"children":[{"name":{"id":7,"keys":["63","66"]}},{"name":{"id":6,"keys":["69","72"]}},{"name":{"id":2,"keys":["86","88"]}}]}]}}`, "number");
        btree.remove(30)
        btree.remove(60)
        expect(btree.export()).toBe("{\"maxKeys\":4,\"keyType\":\"number\",\"nodeData\":{\"name\":{\"id\":9,\"keys\":[\"59\"]},\"children\":[{\"name\":{\"id\":3,\"keys\":[\"15\",\"56\"]},\"children\":[{\"name\":{\"id\":1,\"keys\":[\"7\",\"12\"]}},{\"name\":{\"id\":5,\"keys\":[\"18\",\"44\"]}},{\"name\":{\"id\":4,\"keys\":[\"57\",\"58\"]}}]},{\"name\":{\"id\":8,\"keys\":[\"68\",\"82\"]},\"children\":[{\"name\":{\"id\":7,\"keys\":[\"63\",\"66\"]}},{\"name\":{\"id\":6,\"keys\":[\"69\",\"72\"]}},{\"name\":{\"id\":2,\"keys\":[\"86\",\"88\"]}}]}]}}");
    });

    test('Merge Structure Integrity ', () => {
        var btree = new BTree(4);
        btree = btree.import(`{"maxKeys":4, "keyType":"number","nodeData":{"name":{"id":9,"keys":["60"]},"children":[{"name":{"id":3,"keys":["15","56"]},"children":[{"name":{"id":1,"keys":["7","12"]}},{"name":{"id":5,"keys":["18","30","44"]}},{"name":{"id":4,"keys":["57","58","59"]}}]},{"name":{"id":8,"keys":["68","82"]},"children":[{"name":{"id":7,"keys":["63","66"]}},{"name":{"id":6,"keys":["69","72"]}},{"name":{"id":2,"keys":["86","88"]}}]}]}}`, "number");
        btree.remove(66)
        expect(btree.export()).toBe("{\"maxKeys\":4,\"keyType\":\"number\",\"nodeData\":{\"name\":{\"id\":3,\"keys\":[\"15\",\"56\",\"60\",\"82\"]},\"children\":[{\"name\":{\"id\":1,\"keys\":[\"7\",\"12\"]}},{\"name\":{\"id\":5,\"keys\":[\"18\",\"30\",\"44\"]}},{\"name\":{\"id\":4,\"keys\":[\"57\",\"58\",\"59\"]}},{\"name\":{\"id\":7,\"keys\":[\"63\",\"68\",\"69\",\"72\"]}},{\"name\":{\"id\":2,\"keys\":[\"86\",\"88\"]}}]}}");
    });

    test('Rotation Structure Integrity ', () => {
        var btree = new BTree(4);
        btree = btree.import(`{"maxKeys":4,"keyType":"number","nodeData":{"name":{"id":9,"keys":["60"]},"children":[{"name":{"id":3,"keys":["15","40","56"]},"children":[{"name":{"id":1,"keys":["7","12"]}},{"name":{"id":5,"keys":["18","30", "35"]}},{"name":{"id":10,"keys":["44","45"]}},{"name":{"id":4,"keys":["57","58","59"]}}]},{"name":{"id":8,"keys":["68","80"]},"children":[{"name":{"id":7,"keys":["63","66"]}},{"name":{"id":6,"keys":["69","70"]}},{"name":{"id":2,"keys":["86","88","90"]}}]}]}}`, "number");
        btree.remove(66)
        expect(btree.export()).toBe("{\"maxKeys\":4,\"keyType\":\"number\",\"nodeData\":{\"name\":{\"id\":9,\"keys\":[\"56\"]},\"children\":[{\"name\":{\"id\":3,\"keys\":[\"15\",\"40\"]},\"children\":[{\"name\":{\"id\":1,\"keys\":[\"7\",\"12\"]}},{\"name\":{\"id\":5,\"keys\":[\"18\",\"30\",\"35\"]}},{\"name\":{\"id\":10,\"keys\":[\"44\",\"45\"]}}]},{\"name\":{\"id\":8,\"keys\":[\"60\",\"80\"]},\"children\":[{\"name\":{\"id\":4,\"keys\":[\"57\",\"58\",\"59\"]}},{\"name\":{\"id\":7,\"keys\":[\"63\",\"68\",\"69\",\"70\"]}},{\"name\":{\"id\":2,\"keys\":[\"86\",\"88\",\"90\"]}}]}]}}");
    });

    test('Height', () => {
        const btree = new BTree(3);
        [10, 20, 5, 15, 25, 3, 8].forEach((num) => btree.add(num));
        expect(btree.getHeight()).toBeGreaterThan(0);
        btree.remove(25);
        // Here you can assert specific structure expectations, like height or number of nodes
    });
});