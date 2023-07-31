import React, { useState, useEffect, useRef, useLayoutEffect } from "react";

import "./BTreePage.css";
import BTree from "./BTree";

import Draggable from "react-draggable";
import BTreePlot from "./BTreePlot";
import BTreeInputForm from "./BTreeInputForm";
import generateKeys from "../../utility/GenerateKeys";
import shuffleArray from "../../utility/ArrayShuffle";
import { CottageSharp } from "@mui/icons-material";

const INIT_BTREE_ORDER = 3;
const INIT_BTREE_NKEYS = 10;

let btree = new BTree(INIT_BTREE_ORDER);

export default function BTreePage() {
  // init and cleanup for the btree global variable
  useEffect(() => {
    //after the component ismounted
    const { generatedKeys, keyRange } = generateKeys(
      INIT_BTREE_NKEYS,
      "random",
      "number",
      [],
      false
    );

    for (let i = 0; i < generatedKeys.length; i++) {
      btree.add(generatedKeys[i]);
    }

    // Update TreeProps
    setTreeProps((prevTreeProps) => ({
      ...prevTreeProps,
      treeDepth: btree.getDepth(),
    }));

    // Render new Tree
    setTreeData(btree.toTreeData());

    // This is the cleanup function, runs when the component unmounts
    return () => {
      btree = new BTree(INIT_BTREE_ORDER);
    };
  }, []);

  function determineKeyStringType(keyString) {
    keyString = String(keyString);
    //Key Type String
    if (keyString.startsWith('"') && keyString.endsWith('"')) {
      return "string";
    }
    //Key Type Number
    if (!isNaN(parseFloat(keyString))) {
      return "number";
    }
    //anything else just use as string aswell
    return "string";
  }

  function validateKeyAdd(keyString) {
    if (keyString == "") {
      return "empty";
    }
    // TYPE CHECK
    const keyType = determineKeyStringType(keyString);
    if (!btree.isEmpty()) {
      // just check the first Key, whole tree should match that type
      if (keyType != determineKeyStringType(btree._root._keys[0])) {
        return "type mismatch";
      }
    }
    if (!formData.allowDuplicates) {
      if (keyType == "number") {
        keyString = parseFloat(keyString);
      }
      if (btree.contains(keyString)) {
        return "duplicate";
      }
    }
    return keyType;
  }

  const [treeData, setTreeData] = useState({});

  //These should always be up to date
  const [treeProps, setTreeProps] = useState({
    treeDepth: 0,
    order: btree.getOrder(),
  });

  //---State and Eventhandlers for the BTree Input Form--------------------
  const [formData, setFormData] = useState({
    bTreeOrder: treeProps.order,
    orderWarning: "",
    treeEmpty: btree.isEmpty(),
    keyValue: "",
    generateKeyAmount: 10,
    generateKeyOrder: "random",
    generateKeyType: "number",
    allowDuplicates: false,
    keyWarning: "",
    generateWarning: "",
    generateRange: "",
    importWarning: "",
    importExportDisplay: "none",
    importExportAreaValue: "",
  });

  const handleInputChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleInputButtonClick = (action) => {
    switch (action) {
      case "orderSet":
        const newOrder = parseInt(formData.bTreeOrder, 10);

        if (isNaN(newOrder) || newOrder < 3) {
          setFormData((prevFormData) => ({
            ...prevFormData,
            treeEmpty: btree.isEmpty(),
            orderWarning: "The order needs to be an integer >= 3",
            bTreeOrder: btree.getOrder(),
          }));
        } else {
          if (newOrder != btree.getOrder()) {
            let existingKeys = btree.getKeys();
            btree = new BTree(newOrder);

            //randomize existing key array for non sorted input order
            existingKeys = shuffleArray(existingKeys);
            for (let i = 0; i < existingKeys.length; i++) {
              btree.add(existingKeys[i]);
            }
            // Update TreeProps
            setTreeProps((prevTreeProps) => ({
              ...prevTreeProps,
              treeDepth: btree.getDepth(),
              order: newOrder,
            }));

            // Render new Tree
            setTreeData(btree.toTreeData());
            setFormData((prevFormData) => ({
              ...prevFormData,
              treeEmpty: btree.isEmpty(),
              orderWarning: "",
              keyWarning: "",
              generateWarning: "",
              generateRange: "",
            }));
          }
        }

        break;

      case "keyAdd":
        let keyString = formData.keyValue;
        let type = validateKeyAdd(keyString);

        switch (type) {
          //------ ERROR CASES -------
          case "empty":
            setFormData((prevFormData) => ({
              ...prevFormData,
              keyWarning: "Cannot insert empty",
            }));
            break;

          case "type mismatch":
            const treeType = determineKeyStringType(btree._root._keys[0]);
            const keyType = determineKeyStringType(keyString);
            setFormData((prevFormData) => ({
              ...prevFormData,
              keyWarning: `The tree contains ${treeType} keys, but ${keyType} was given.`,
            }));
            break;

          case "duplicate":
            setFormData((prevFormData) => ({
              ...prevFormData,
              keyWarning: `The key ${keyString} already exists in the tree.`,
            }));
            break;

          //----- SUCCESS CASES ------
          case "number":
            // Convert keyString to float if it has a float type
            keyString = parseFloat(keyString);
          // Fall through to the default case to execute the common code
          default:
            btree.add(keyString);
            // Update TreeProps
            setTreeProps((prevTreeProps) => ({
              ...prevTreeProps,
              treeDepth: btree.getDepth(),
            }));

            // Render new Tree
            setTreeData(btree.toTreeData());
            setFormData((prevFormData) => ({
              ...prevFormData,
              treeEmpty: btree.isEmpty(),
              keyValue: "",
              keyWarning: "",
              generateWarning: "",
              generateRange: "",
              generateKeyType: determineKeyStringType(btree._root._keys[0]),
              importExportAreaValue:
                prevFormData.importExportDisplay == "export" && !btree.isEmpty()
                  ? btree.export()
                  : "",
            }));
            break;
        }

        break;

      case "keyRemove":
        let key = formData.keyValue;
        let keyType = determineKeyStringType(key);

        if (keyType == "number") {
          key = parseFloat(key);
        }

        if (!btree.contains(key)) {
          setFormData((prevFormData) => ({
            ...prevFormData,
            keyWarning: `The key ${key} does not exist in the tree`,
          }));
        } else {
          btree.remove(key);
          // Update TreeProps
          setTreeProps((prevTreeProps) => ({
            ...prevTreeProps,
            treeDepth: btree.getDepth(),
          }));

          // Render new Tree
          setTreeData(btree.toTreeData());
          setFormData((prevFormData) => ({
            ...prevFormData,
            treeEmpty: btree.isEmpty(),
            generateKeyType: determineKeyStringType(btree._root._keys[0]),
            keyValue: "",
            keyWarning: "",
            generateWarning: "",
            generateRange: "",
            importExportAreaValue:
              prevFormData.importExportDisplay == "export" && !btree.isEmpty()
                ? btree.export()
                : "",
          }));
          break;
        }

        break;

      case "generateGo":
        //validate n
        let n = parseInt(formData.generateKeyAmount, 10);
        if (isNaN(n) || n < 1 || !Number.isInteger(n)) {
          setFormData((prevFormData) => ({
            ...prevFormData,
            generateWarning: `Input must be an integer >= 1`,
            generateRange: "",
          }));
        } else {
          let generatedKeys = [];
          let range = [];
          let keyType = "number";

          if (btree.isEmpty()) {
            const { generatedKeys: keys, range: keyRange } = generateKeys(
              n,
              formData.generateKeyOrder,
              formData.generateKeyType,
              [],
              formData.allowDuplicates
            );
            generatedKeys = keys;
            range = keyRange;
          } else {
            const type = determineKeyStringType(btree._root._keys[0]);
            keyType = type;
            const existingKeys = btree.getKeys();
            const { generatedKeys: keys, range: keyRange } = generateKeys(
              n,
              formData.generateKeyOrder,
              type,
              existingKeys,
              formData.allowDuplicates
            );
            generatedKeys = keys;
            range = keyRange;
          }
          for (let i = 0; i < generatedKeys.length; i++) {
            btree.add(generatedKeys[i]);
          }

          // Update TreeProps
          setTreeProps((prevTreeProps) => ({
            ...prevTreeProps,
            treeDepth: btree.getDepth(),
          }));

          // Render new Tree
          setTreeData(btree.toTreeData());
          setFormData((prevFormData) => ({
            ...prevFormData,
            treeEmpty: btree.isEmpty(),
            generateWarning: "",
            generateKeyType: determineKeyStringType(btree._root._keys[0]),
            generateRange: `Generated ${n} ${keyType} keys between ${range[0]} and ${range[1]}`,
            importExportAreaValue:
              prevFormData.importExportDisplay == "export" && !btree.isEmpty()
                ? btree.export()
                : "",
          }));
        }
        break;

      case "reset":
        btree = new BTree(btree.getOrder());
        // Update TreeProps
        setTreeProps((prevTreeProps) => ({
          ...prevTreeProps,
          treeDepth: btree.getDepth(),
        }));

        // Render new Tree
        setTreeData(btree.toTreeData());
        setFormData((prevFormData) => ({
          ...prevFormData,
          treeEmpty: btree.isEmpty(),
          keyWarning: "",
          generateWarning: "",
          orderWarning: "",
          generateRange: "",
          importWarning: "",
          importExportAreaValue: "",
        }));
        break;

      case "import":
        // Second click on import button => execute import
        if (
          formData.importExportDisplay === "import" &&
          formData.importExportAreaValue !== ""
        ) {
          let validImport = true;
          let newBtree;
          try {
            newBtree = btree.import(formData.importExportAreaValue);
          } catch (error) {
            setFormData((prevFormData) => ({
              ...prevFormData,
              importWarning: "Import data invalid",
            }));
            validImport = false;
          }
          if (validImport) {
            btree = newBtree;
            // Update TreeProps
            setTreeProps((prevTreeProps) => ({
              ...prevTreeProps,
              treeDepth: btree.getDepth(),
              order: btree.getOrder(),
            }));

            // Render new Tree
            setTreeData(btree.toTreeData());
            setFormData((prevFormData) => ({
              ...prevFormData,
              treeEmpty: btree.isEmpty(),
              keyWarning: "",
              generateWarning: "",
              orderWarning: "",
              generateRange: "",
              importWarning: "",
            }));
          }
        }

        // first click on INPUT Buton
        else {
          setFormData((prevFormData) => ({
            ...prevFormData,
            importWarning: "",
            importExportDisplay: "import",
            importExportAreaValue: "",
          }));
        }
        break;

      case "export":
        setFormData((prevFormData) => ({
          ...prevFormData,
          importWarning: "",
          importExportDisplay: "export",
          importExportAreaValue: btree.isEmpty() ? "" : btree.export(),
        }));
        break;

      case "close":
        setFormData((prevFormData) => ({
          ...prevFormData,
          importWarning: "",
          importExportDisplay: "none",
        }));
        break;

      case "closeOrderWarning":
        setFormData((prevFormData) => ({
          ...prevFormData,
          orderWarning: "",
        }));
        break;

      case "closeKeyWarning":
        setFormData((prevFormData) => ({
          ...prevFormData,
          keyWarning: "",
        }));
        break;

      case "closeGenerateWarning":
        setFormData((prevFormData) => ({
          ...prevFormData,
          generateWarning: "",
        }));
        break;

      case "closeGenerateRange":
        setFormData((prevFormData) => ({
          ...prevFormData,
          generateRange: "",
        }));
        break;

      case "closeImportWarning":
        setFormData((prevFormData) => ({
          ...prevFormData,
          importWarning: "",
        }));
        break;

      default:
        break;
    }
  };

  // Pass Canvas Size to the plot
  const plotContainerRef = useRef(null);
  const [plotProps, setPlotProps] = useState({ plotWidth: 0, plotHeight: 0 });
  useLayoutEffect(() => {
    setPlotProps({
      plotWidth: plotContainerRef.current.offsetWidth,
      plotHeight: plotContainerRef.current.offsetHeight,
    });
  }, []);

  let highlights = {}
  if (!btree.isEmpty()) {
    // node Highlights
    highlights = {
      nodes: {
        [String(btree._root._id)]: {
          fullHighlight: true,
          nodeMessage: "finding the smallest",
          indexHighlights: [0],
          indexMessages: {
            0 : "SUPAAAAA LONG"
          }
        },
      },
      edges: {
        [String(btree._root._id) + String(btree._root._childs[0]._id)]: {
          fullHighlight: true,
          message: "",
        },
      },
    };
  }

  return (
    <div className="btree-page-container">
      <Draggable
        bounds="parent" // Set bounds to the calculated boundaries of the plot container
      >
        <div className="btree-input-form-container">
          <BTreeInputForm
            formData={formData}
            onInputChange={handleInputChange}
            onButtonClick={handleInputButtonClick}
          />
        </div>
      </Draggable>

      <div className="btree-plot-container" ref={plotContainerRef}>
        {!btree.isEmpty() > 0 && (
          <BTreePlot
            treeData={treeData}
            highlights={highlights}
            plotProps={plotProps}
          />
        )}
      </div>
    </div>
  );
}
