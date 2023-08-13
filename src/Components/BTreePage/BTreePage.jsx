import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import "./BTreePage.css";

// libraries
import Draggable from "react-draggable";

// components
import BTreePlot from "./BTreePlot";
import BTreeInputForm from "./BTreeInputForm";
import SequenceControl from "./SequenceControl";
import TreeProperties from "./BTreeProperties";
import DisplayComponentsBar from "./DisplayComponentsBar";

// scripts
import BTree from "./BTree";
import determineKeyStringType from "../../utility/DetermineKeyType";
import generateKeys from "../../utility/GenerateKeys";
import shuffleArray from "../../utility/ArrayShuffle";
import { countNodes, countKeys, countHeight} from "../../utility/InfoFromTreeData";
import FrameSequencer from "./FrameSequencer";
import Highlight from "./Highlight";

// ---------- GLOBAL VARIABLES ----------

const INIT_BTREE_MAX_KEYS = 3;
const INIT_BTREE_NKEYS = 10;

let btree = new BTree(INIT_BTREE_MAX_KEYS, null);
let frameSequencer

//when the frameSequencer runs in automode, the Interval referance is stored in here.
let delayedFrameInterval

export default function BTreePage() {
  // ---------- STATE VARIABLES ----------

  // State for BTree Page
  // allow dragging of components windows may deactivate this, when hovering above their input fields f.e.
  const [allowDrag, setAllowDrag] = useState(true);

  // State for Tree Plot
  const [treeFrame, setTreeFrame] = useState({
    treeData: {},
    highlights: new Highlight(),
  });
  // canvas size of the page, so the tree can be rendered at the correct position
  const plotContainerRef = useRef(null);
  const [plotProps, setPlotProps] = useState({ plotWidth: 0, plotHeight: 0 });

  // State for Displaying UI Components
  const [displayUiComponents, setDisplayUiComponents] = React.useState(() => ['inputForm', 'sequenceControl']);


  // State for Tree Properties
  let maxKeys = btree.getMaxKeys()
  let nNodes =  btree.getNodes().length
  let nKeys = btree.getKeys().length
  const [treeProps, setTreeProps] = useState({
    isEmpty: btree.isEmpty(),
    height: countHeight(treeFrame.treeData),
    maxKeys: maxKeys,
    nNodes: nNodes,
    nKeys: nKeys,
    fillingDegree: nNodes*maxKeys != 0 ? nKeys / (nNodes * maxKeys) : 0,
    splits: 0,
    merges: 0,
    smallRotations: 0,
    bigRotations: 0,
  });

  //State for Sequence Control and Frame Sequencer
  const [sequencerProps, setSequencerProps] = useState({
    sequenceMode: "auto",
    sequenceSpeed: 2.0,
    sequenceSpeedModified: false,
    doForward: false,
    doBackward: false,
    hasPrevious: false,
    inSequence: false,
    keyQueue: [],
  });

  // State for InputForm
  const [formData, setFormData] = useState({
    orderInput: treeProps.maxKeys +1,
    orderWarning: "",
    keyInput: "",
    keyWarning: "",
    allowDuplicates: false,
    generateKeyAmountInput: 10,
    generateKeyOrderInput: "random",
    generateKeyTypeInput: "number",
    generateWarning: "",
    generateRangeInfo: "",
    importExportDisplay: "none",
    importExportTextAreaValue: "",
    importWarning: "",
  });
  // which keys are in the tree, after the key queue is finished,
  // input form requires this for proper input validation
  const [futureKeys, setFutureKeys] = useState(simulateFutureKeys());

  // ---------- EFFECTS ----------

  // effect for inititalizing a random tree, and clean up for unmounting the component
  useEffect(() => {
    //after the component ismounted, initialize a random tree
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

    // Reset B-Tree Balancing Count Operations
    setTreeProps(prevTreeProps => ({
      ...prevTreeProps,
      splits: 0,
      merges: 0,
      smallRotations: 0,
      bigRotations: 0,
    }));

    // Render new Tree
    simpleTreeFrameUpdate();

    //initialize a sequencer for future use
    restartFrameSequencer();

    // This is the cleanup function, runs when the component unmounts
    return () => {
      btree = new BTree(INIT_BTREE_MAX_KEYS, setTreeProps);
      frameSequencer = undefined;
    };
  }, []);

  // effect setting size of B-Tree page as state, for child components to use
  useLayoutEffect(() => {
    setPlotProps({
      plotWidth: plotContainerRef.current.offsetWidth,
      plotHeight: plotContainerRef.current.offsetHeight,
    });
  }, []);

  // effect, that operates the frameSequencer
  useEffect(() => {

    if (sequencerProps.inSequence) {
      switch (sequencerProps.sequenceMode) {
        case "instant":
          setTreeFrame(frameSequencer.getFinalFrame(sequencerProps));
          break;

        case "auto":

          let delay = 4000 - sequencerProps.sequenceSpeed * 1000;
          delayedFrameInterval = setInterval(
            () => setTreeFrame(frameSequencer.getNextFrame(sequencerProps))
          ,delay)
          break;

        case "step":
          if (sequencerProps.doForward || sequencerProps.doBackward) {
            setTreeFrame(frameSequencer.getNextFrame(sequencerProps));
          }
          break;
      }
    }

    // Cleanup on unmount/dependency change
    return () => {
      //clearTimeout(delayedFrame);
      clearInterval(delayedFrameInterval)
    };
  }, [
    // dependencies
    sequencerProps.inSequence,
    sequencerProps.sequenceMode,
    sequencerProps.doForward,
    sequencerProps.doBackward,
  ]);

  // effect, that adjusts the delayedFrameInterval, whenever the sequenceSpeed is modified
  useEffect(() => {
    if(sequencerProps.inSequence && sequencerProps.sequenceMode == "auto"){
     clearInterval(delayedFrameInterval)
     let delay = 4000 - sequencerProps.sequenceSpeed * 1000;
          delayedFrameInterval = setInterval(
            () => setTreeFrame(frameSequencer.getNextFrame(sequencerProps))
          ,delay)
    }
  }, [sequencerProps.sequenceSpeed]);

  // effect that keeps the futureKeys sequence up to date
  useEffect(() => {
    setFutureKeys(() => simulateFutureKeys());
  }, [sequencerProps.keyQueue, treeFrame]);

  // effect, that keeps treeProps state up to date
  useEffect(() => {
    // Run the update function when treeFrame changes
    simpleTreePropsUpdate();
  }, [treeFrame.treeData]);

  // ---------- FUNTIONS ----------

  // Update TreeProps
  function simpleTreePropsUpdate() {
    let maxKeys = btree.getMaxKeys()
    let nNodes =  countNodes(treeFrame.treeData)
    let nKeys = countKeys(treeFrame.treeData)
    setTreeProps((prevTreeProps) => ({
      ...prevTreeProps,
      height: countHeight(treeFrame.treeData),
      isEmpty: btree.isEmpty(),
      maxKeys: maxKeys,
      nNodes: nNodes,
      nKeys: nKeys,
      fillingDegree: nNodes*maxKeys != 0 ? nKeys / (nNodes * maxKeys) : 0,
    }));
  }

  function simpleTreeFrameUpdate() {
    setTreeFrame({
      treeData: btree.toTreeData(),
      highlights: new Highlight()
    });
  }

  function restartFrameSequencer() {
    setSequencerProps((prevProps) => ({
      ...prevProps,
      doForward: false,
      doBackward: false,
      hasPrevious: false,
      inSequence: false,
      keyQueue: [],
    }));
    frameSequencer = new FrameSequencer(btree, setSequencerProps);
  }

  function simulateFutureKeys() {
    let existingKeys = btree.getKeys();
    for (let i = 0; i < sequencerProps.keyQueue.length; i++) {
      if (sequencerProps.keyQueue[i][0] === "add") {
        existingKeys.push(sequencerProps.keyQueue[i][1]);
      }
      if (sequencerProps.keyQueue[i][0] === "remove") {
        existingKeys = existingKeys.filter(
          (item) => item !== sequencerProps.keyQueue[i][1]
        );
      }
    }
    return existingKeys;
  }

  function validateKeyAdd(keyString) {
    if (keyString == "") {
      return "empty";
    }
    // TYPE CHECK
    const keyType = determineKeyStringType(keyString);
    if (futureKeys.length > 0) {
      // just check the first Key, whole tree should match that type
      if (keyType != determineKeyStringType(futureKeys[futureKeys.length -1])) {
        return "type mismatch";
      }
    }
    if (!formData.allowDuplicates) {
      if (keyType == "number") {
        keyString = parseFloat(keyString);
      }
      if (futureKeys.includes(keyString)) {
        return "duplicate";
      }
    }
    return keyType;
  }

  function toggleUiComponentDisplay(componentName) {
    setDisplayUiComponents(prevDisplayUiComponents => {
      const displayList = [...prevDisplayUiComponents]; // Create a copy of the array
  
      const toggleIndex = displayList.indexOf(componentName);
      if (toggleIndex === -1) {
        displayList.push(componentName); // Add if not present
      } else {
        displayList.splice(toggleIndex, 1); // Remove if present
      }
  
      return displayList; // Update the state
    });
  }
  
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
        const newMaxKeys = parseInt(formData.orderInput -1, 10);

        if (isNaN(newMaxKeys) || newMaxKeys < 3) {
          setFormData((prevFormData) => ({
            ...prevFormData,
            orderWarning: "The order needs to be an integer >= 4",
          }));
        } else {
          if (newMaxKeys != btree.getMaxKeys()) {
            let existingKeys = btree.getKeys();
            btree = new BTree(newMaxKeys, setTreeProps);
            frameSequencer = new FrameSequencer(btree, setSequencerProps);

            //randomize existing key array for non sorted inputs
            existingKeys = shuffleArray(existingKeys);
            for (let i = 0; i < existingKeys.length; i++) {
              btree.add(existingKeys[i]);
            }

            // Update FormData
            setFormData((prevFormData) => ({
              ...prevFormData,
              orderWarning: "",
            }));

            // Render new Tree
            simpleTreeFrameUpdate();
          }
        }

        break;

      case "keyAdd":
        let keyString = formData.keyInput;
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
            const keyType = determineKeyStringType(keyString);
            setFormData((prevFormData) => ({
              ...prevFormData,
              keyWarning: `Key of type ${keyType} does not match tree/queue keys.`,
            }));
            break;

          case "duplicate":
            setFormData((prevFormData) => ({
              ...prevFormData,
              keyWarning: `The key ${keyString} would be duplicate.`,
            }));
            break;

          //----- SUCCESS CASES ------
          case "number":
            // Convert keyString to float if it has a float type
            keyString = parseFloat(keyString);
          // Fall through to the default case to execute the common code
          default:
            frameSequencer.addKeys([keyString]);

            // Update FormData
            setFormData((prevFormData) => ({
              ...prevFormData,
              keyInput: "",
              keyWarning: "",
              generateKeyTypeInput:
                futureKeys.length > 0
                  ? determineKeyStringType(futureKeys[futureKeys.length -1])
                  : "number",
              importExportTextAreaValue:
                prevFormData.importExportDisplay == "export" && !btree.isEmpty()
                  ? btree.export()
                  : "",
            }));
            break;
        }

        break;

      case "keyRemove":
        let key = formData.keyInput;
        let keyType = determineKeyStringType(key);

        if (keyType == "number") {
          key = parseFloat(key);
        }

        if (!futureKeys.includes(key)) {
          setFormData((prevFormData) => ({
            ...prevFormData,
            keyWarning: `Key ${key} does not exist in the tree/queue`,
          }));
        } else {
          frameSequencer.removeKeys([key]);

          // UpdateFormData
          setFormData((prevFormData) => ({
            ...prevFormData,
            generateKeyTypeInput: futureKeys.length > 0
            ? determineKeyStringType(futureKeys[futureKeys.length -1])
            : "number",
            keyInput: "",
            keyWarning: "",
            importExportTextAreaValue:
              prevFormData.importExportDisplay == "export" && !btree.isEmpty()
                ? btree.export()
                : "",
          }));
          break;
        }
        break;

      case "generateGo":

        //validate n
        let n = parseInt(formData.generateKeyAmountInput, 10);
        if (isNaN(n) || n < 1 || !Number.isInteger(n)) {
          setFormData((prevFormData) => ({
            ...prevFormData,
            generateWarning: `Input must be an integer >= 1`,
            generateRangeInfo: "",
          }));
        } else {
          let generatedKeys = [];
          let range = [];
          let keyType = "number";

          if (futureKeys.length == 0) {
            const { generatedKeys: keys, range: keyRange } = generateKeys(
              n,
              formData.generateKeyOrderInput,
              formData.generateKeyTypeInput,
              [],
              formData.allowDuplicates
            );
            generatedKeys = keys;
            range = keyRange;
          } else {
            const type = determineKeyStringType(futureKeys[futureKeys.length -1]);
            keyType = type;
            const { generatedKeys: keys, range: keyRange } = generateKeys(
              n,
              formData.generateKeyOrderInput,
              type,
              futureKeys,
              formData.allowDuplicates
            );
            generatedKeys = keys;
            range = keyRange;
          }

          frameSequencer.addKeys(generatedKeys);

          // Update FormData
          setFormData((prevFormData) => ({
            ...prevFormData,
            generateWarning: "",
            generateRangeInfo: `Generated ${n} ${keyType} keys between ${range[0]} and ${range[1]}`,
            generateKeyTypeInput:
              futureKeys.length > 0
                ? determineKeyStringType(futureKeys[futureKeys.length -1])
                : "number",
            importExportTextAreaValue:
              prevFormData.importExportDisplay == "export" && !btree.isEmpty()
                ? btree.export()
                : "",
          }));
        }
        break;

      case "reset":
        btree = new BTree(btree.getMaxKeys(), setTreeProps);
        restartFrameSequencer();

        // Update FormData
        setFormData((prevFormData) => ({
          ...prevFormData,
          keyWarning: "",
          generateWarning: "",
          orderWarning: "",
          generateRangeInfo: "",
          importWarning: "",
          importExportTextAreaValue: "",
        }));

        // Reset B-Tree Balancing Operation counts
        setTreeProps(prevTreeProps => ({
          ...prevTreeProps,
          splits: 0,
          merges: 0,
          smallRotations: 0,
          bigRotations: 0,
        }));

        // Render new Tree
        simpleTreeFrameUpdate();
        break;

      case "import":
        // Second click on import button => execute import
        if (
          formData.importExportDisplay === "import" &&
          formData.importExportTextAreaValue !== ""
        ) {
          let validImport = true;
          let newBTree;

          try {
            newBTree = btree.import(formData.importExportTextAreaValue);
          } catch (error) {
            setFormData((prevFormData) => ({
              ...prevFormData,
              importWarning: "Import data invalid",
            }));
            validImport = false;
          }

          if (validImport) {
            btree = newBTree;
            restartFrameSequencer();

            // Update FormData
            setFormData((prevFormData) => ({
              ...prevFormData,
              keyWarning: "",
              generateWarning: "",
              orderWarning: "",
              generateRangeInfo: "",
              importWarning: "",
              generateKeyTypeInput:
                futureKeys.length > 0
                  ? determineKeyStringType(futureKeys[futureKeys.length -1])
                  : "number",
            }));

            // render imported tree
            simpleTreeFrameUpdate();
          }
        }

        // first click on INPUT Button => show the input field
        else {
          setFormData((prevFormData) => ({
            ...prevFormData,
            importWarning: "",
            importExportDisplay: "import",
            importExportTextAreaValue: "",
          }));
        }
        break;

      case "export":
        setFormData((prevFormData) => ({
          ...prevFormData,
          importWarning: "",
          importExportDisplay: "export",
          importExportTextAreaValue: btree.isEmpty() ? "" : btree.export(),
        }));
        break;

      case "closeImportExportArea":
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
          generateRangeInfo: "",
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

  const highlights = new Highlight();

  // ---------- JSX ----------

  return (
    <div className="btree-page-container">

      {/* TOGGLE DISPLAY BAR */}
      <DisplayComponentsBar
        displayUiComponents={displayUiComponents}
        setDisplayUiComponents={setDisplayUiComponents}
      />

      {/* INPUT FORM WINDOW */}
      <Draggable
        bounds="parent" // Set bounds to the calculated boundaries of the plot container
        disabled={!allowDrag}
      >
        <div className="btree-input-form-container">
        {displayUiComponents.includes("inputForm") &&
          <BTreeInputForm
            formData={formData}
            treeProps={treeProps}
            futureKeys={futureKeys}
            onInputChange={handleInputChange}
            onButtonClick={handleInputButtonClick}
            setAllowDrag={setAllowDrag}
            toggleUiComponentDisplay={toggleUiComponentDisplay}
          />
        }
        </div>
        
      </Draggable>
      

      {/* SEQUENCE CONTROL WINDOW */}
      <Draggable
        bounds="parent" // Set bounds to the calculated boundaries of the plot container
        disabled={!allowDrag}
      >
        <div className="btree-sequence-control-container">
        {displayUiComponents.includes("sequenceControl") &&
          <SequenceControl
            sequencerProps={sequencerProps}
            setSequencerProps={setSequencerProps}
            setAllowDrag={setAllowDrag}
            toggleUiComponentDisplay={toggleUiComponentDisplay}

          />
        }
        </div>
      </Draggable>

      {/* TREE PROPERTIES WINDOW */}
      <Draggable
        bounds="parent" // Set bounds to the calculated boundaries of the plot container
      >
        <div className="btree-tree-properties-container">
        {displayUiComponents.includes("treeProperties") &&
          <TreeProperties
            treeProps={treeProps}
            toggleUiComponentDisplay={toggleUiComponentDisplay}
          />
        }
        </div>
      </Draggable>

      {/* BTREE PLOT */}
      <div className="btree-plot-container" ref={plotContainerRef}>
        {!btree.isEmpty() > 0 && (
          <BTreePlot
            treeData={treeFrame.treeData}
            highlights={treeFrame.highlights}
            plotProps={plotProps}
          />
        )}
      </div>
    </div>
  );
}
