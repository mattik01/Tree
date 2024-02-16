import "./BTreePage.css";
import "../../utilityScripts/GradientBorder.css";

// libraries
import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import Draggable from "react-draggable";
import Button from "@mui/material/Button";
import KeyboardDoubleArrowDownIcon from "@mui/icons-material/KeyboardDoubleArrowDown";
import KeyboardDoubleArrowUpIcon from "@mui/icons-material/KeyboardDoubleArrowUp";

// components
import BTreePlot from "./BTreePlot/BTreePlot";
import BTreeInputForm from "./BTreeInputForm/BTreeInputForm";
import SequenceControl from "./SequenceControl/SequenceControl";
import BTreeProperties from "./BTreeProperties/BTreeProperties";
import DisplayComponentsBar from "./DisplayComponentsBar/DisplayComponentsBar";
import BTreeInfo from "./BTreeInfo/BTreeInfo";

// scripts
import BTree from "./BTree";
import bTreePresets from "./BTreeInfo/BTreePresets";
import determineKeyStringType from "../../utilityScripts/DetermineKeyType";
import generateKeys from "../../utilityScripts/GenerateKeys";
import shuffleArray from "../../utilityScripts/ArrayShuffle";
import FrameSequencer from "./SequenceControl/FrameSequencer";
import HighlightData from "./BTreePlot/HighlightData";
import {
  countNodes,
  countKeys,
  countHeight,
} from "./BTreeProperties/InfoFromTreeData";
import {
  scrollToTop,
  scrollDownToOneScreen,
} from "../../utilityScripts/WindowScrolling";

/**
 * Central/Root Component for rendering the B-Tree Page and every Component on it.
 */

// ---------- GLOBAL VARIABLES ----------

const INIT_BTREE_MAX_KEYS = 4;
const INIT_BTREE_NKEYS = 25;

let btree = new BTree(INIT_BTREE_MAX_KEYS);
let frameSequencer;

//when the frameSequencer runs in automode, the Interval reference is stored in here.
let delayedFrameInterval;

export default function BTreePage() {
  
  // ---------- STATE VARIABLES ----------

  // State for BTree Page
  // allow dragging of components windows may deactivate this, when hovering above their input fields f.e.
  const [allowDrag, setAllowDrag] = useState(true);

  // State for Tree Plot
  const [treeFrame, setTreeFrame] = useState({
    nodeData: {},
    highlightData: new HighlightData(),
    counters: {
      splits: 0,
      merges: 0,
      smallRotations: 0,
      bigRotations: 0,
    },
  });
  // canvas size of the page, so the tree can be rendered at the correct position
  const plotContainerRef = useRef(null);
  const [plotProps, setPlotProps] = useState({ plotWidth: 0, plotHeight: 0 });

  // State for Displaying UI Components
  const [displayUiComponents, setDisplayUiComponents] = React.useState(() => [
    "inputForm",
    "sequenceControl",
  ]);

  // State for Tree Properties
  let maxKeys = btree.getMaxKeys();
  let nNodes = btree.getNodes().length;
  let nKeys = btree.getKeys().length;
  const [treeProps, setTreeProps] = useState({
    isEmpty: btree.isEmpty(),
    height: countHeight(treeFrame.nodeData),
    maxKeys: maxKeys,
    nNodes: nNodes,
    nKeys: nKeys,
    fillingDegree: nNodes * maxKeys != 0 ? nKeys / (nNodes * maxKeys) : 0,
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
    orderInput: treeProps.maxKeys + 1,
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

  // input form requires this for proper input validation
  // which keys would be in the tree, after the key queue is finished, always up to date
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
    btree.resetCounters();

    // Render new Tree
    simpleTreeFrameUpdate();

    //initialize a sequencer for future use
    restartFrameSequencer();

    // This is the cleanup function, runs when the component unmounts
    return () => {
      btree = new BTree(INIT_BTREE_MAX_KEYS);
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

          //to clear existing queue and framebuffer
          restartFrameSequencer();
          break;

        case "auto":
          let delay = 4000 - sequencerProps.sequenceSpeed * 1000;
          delayedFrameInterval = setInterval(
            () => setTreeFrame(frameSequencer.getNextFrame(sequencerProps)),
            delay
          );
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
      clearInterval(delayedFrameInterval);
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
    if (sequencerProps.inSequence && sequencerProps.sequenceMode == "auto") {
      clearInterval(delayedFrameInterval);
      let delay = 4000 - sequencerProps.sequenceSpeed * 1000;
      delayedFrameInterval = setInterval(
        () => setTreeFrame(frameSequencer.getNextFrame(sequencerProps)),
        delay
      );
    }
  }, [sequencerProps.sequenceSpeed]);

  // effect that keeps the futureKeys sequence up to date
  useEffect(() => {
    let futureKeys = simulateFutureKeys();
    setFutureKeys(futureKeys);
  }, [sequencerProps.keyQueue, treeFrame]);

  // effect, that keeps treeProps state up to date
  useEffect(() => {
    // Run the update function when treeFrame changes
    simpleTreePropsUpdate();
  }, [treeFrame]);

  // effect, that keeps the export data up to date, if it is displayed
  useEffect(() => {
    setTreeProps((prevFormData) => ({
      ...prevFormData,
      importExportTextAreaValue:
        prevFormData.importExportDisplay == "export" && !btree.isEmpty()
          ? btree.export()
          : "",
    }));
  }, [treeFrame.nodeData, formData.importExportDisplay]);

  // ---------- FUNTIONS ----------

  /**
   * Update tree props based on data in treeFrame. All information is extracted from the frame and not the actual tree,
   * so that the info displayed always matched the visible frame
   */
  function simpleTreePropsUpdate() {
    let maxKeys = btree.getMaxKeys();
    let nNodes = countNodes(treeFrame.nodeData);
    let nKeys = countKeys(treeFrame.nodeData);
    setTreeProps(() => ({
      height: countHeight(treeFrame.nodeData),
      isEmpty: btree.isEmpty(),
      maxKeys: maxKeys,
      nNodes: nNodes,
      nKeys: nKeys,
      fillingDegree: nNodes * maxKeys != 0 ? nKeys / (nNodes * maxKeys) : 0,
    }));
  }

  /**
   * Update the treeFrame to the current state of the btree
   */
  function simpleTreeFrameUpdate() {
    setTreeFrame(() => ({
      nodeData: btree.toNodeData(), // update nodeData
      highlightData: new HighlightData(), // clear highlights
      counters: {
        splits: btree._splitCounter, // update counters
        merges: btree._mergeCounter,
        smallRotations: btree._smallRotationCounter,
        bigRotations: btree._bigRotationCounter,
      },
    }));
  }

  /**
   * resets the Framesequencer props, initiate a new Framesequencer, key Queue and frame buffer are both cleare
   */
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

  /**
   * Simulates keys that are in the B-Tree if the key queue is worked off
   *
   * @return { Array } Array of keys, that would be contained in the B-Tree if the key queue was worked off
   */
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

  /**
   * Toggles a component's display state. This is a function that takes a componentName and modifies the displayList,
   * so that the components visibility is toggled.
   *
   * @param componentName - The name/id of the component to toggle
   *
   * @return { Object } the modified display list
   */
  function toggleUiComponentDisplay(componentName) {
    setDisplayUiComponents((prevDisplayUiComponents) => {
      const displayList = [...prevDisplayUiComponents]; // Create a copy of the array

      const toggleIndex = displayList.indexOf(componentName);
      if (toggleIndex === -1) {
        displayList.push(componentName); // Add if not present
      } else {
        displayList.splice(toggleIndex, 1); // Remove if present
      }

      return displayList;
    });
  }

  /**
   * Loads a B-Tree preset from BTreePresets.js, is called f.e when pressing example buttons in the b-Tree info section,
   * also set sequencer back to auto mode and medium speed and scroll to the plot.
   *
   * @param preset - name/key of the preset that should be loaded
   */
  function loadBTreePreset(preset) {
    let newBTree;
    newBTree = btree.import(bTreePresets[preset].importData);
    btree = newBTree;

    //set sequencer mode on auto
    setSequencerProps((prevProps) => ({
      ...prevProps,
      sequenceMode: "auto",
      sequenceSpeed: 2.0,
    }));

    restartFrameSequencer();
    scrollToTop();

    frameSequencer.addKeys(bTreePresets[preset].addKeys);
    frameSequencer.removeKeys(bTreePresets[preset].removeKeys);

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
          ? determineKeyStringType(futureKeys[futureKeys.length - 1])
          : "number",
    }));

    // render imported tree
    simpleTreeFrameUpdate();
  }

  /**
   * Validates an input that should be added to the tree.
   *
   * @param keyString - Theinputto be added
   *
   * @return { string } type of the input as string, or an error response ("empty", "type mismatch", "duplicate")
   */
  function validateKeyAdd(keyString) {
    if (keyString == "") {
      return "empty";
    }
    // TYPE CHECK
    const keyType = determineKeyStringType(keyString);
    if (futureKeys.length > 0) {
      // just check the first Key, whole tree should match that type
      if (
        keyType != determineKeyStringType(futureKeys[futureKeys.length - 1])
      ) {
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

  // updates the state of the Formdata fields, whenever change occours.
  const handleInputFormChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // actions, that are performed when Buttons in the Input Form are clicked.
  const handleInputFormButtonClick = (action) => {
    switch (action) {
      case "orderSet":
        const newMaxKeys = parseInt(formData.orderInput - 1, 10);

        if (isNaN(newMaxKeys) || newMaxKeys < 2) {
          setFormData((prevFormData) => ({
            ...prevFormData,
            orderWarning: "The order needs to be an integer >= 3",
          }));
        } else {
          if (newMaxKeys != btree.getMaxKeys()) {
            let existingKeys = btree.getKeys();
            btree = new BTree(newMaxKeys);
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
                  ? determineKeyStringType(futureKeys[futureKeys.length - 1])
                  : "number",
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

        console.log("FUTURE KEYS " + typeof futureKeys[0]);

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
            generateKeyTypeInput:
              futureKeys.length > 0
                ? determineKeyStringType(futureKeys[futureKeys.length - 1])
                : "number",
            keyInput: "",
            keyWarning: "",
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
            const type = determineKeyStringType(
              futureKeys[futureKeys.length - 1]
            );
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
                ? determineKeyStringType(futureKeys[futureKeys.length - 1])
                : "number",
          }));
        }
        break;

      case "reset":
        btree = new BTree(btree.getMaxKeys());
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
                  ? determineKeyStringType(futureKeys[futureKeys.length - 1])
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

  const highlightData = new HighlightData();

  // ---------- JSX ----------

  return (
    <div className="btree-page-container">
      {/* TOGGLE DISPLAY BAR */}
      <DisplayComponentsBar
        displayUiComponents={displayUiComponents}
        setDisplayUiComponents={setDisplayUiComponents}
      />
      <div className="btree-canvas-container">
        {/* INPUT FORM WINDOW */}
        <Draggable
          bounds="parent" // Set bounds to the calculated boundaries of the plot container
          disabled={!allowDrag}
        >
          <div className="btree-input-form-container">
            {displayUiComponents.includes("inputForm") && (
              <BTreeInputForm
                formData={formData}
                futureKeys={futureKeys}
                onInputChange={handleInputFormChange}
                onButtonClick={handleInputFormButtonClick}
                setAllowDrag={setAllowDrag}
                toggleUiComponentDisplay={toggleUiComponentDisplay}
              />
            )}
          </div>
        </Draggable>

        {/* SEQUENCE CONTROL WINDOW */}
        <Draggable
          bounds="parent" // Set bounds to the calculated boundaries of the plot container
          disabled={!allowDrag}
        >
          <div className="btree-sequence-control-container">
            {displayUiComponents.includes("sequenceControl") && (
              <SequenceControl
                sequencerProps={sequencerProps}
                setSequencerProps={setSequencerProps}
                setAllowDrag={setAllowDrag}
                toggleUiComponentDisplay={toggleUiComponentDisplay}
              />
            )}
          </div>
        </Draggable>

        {/* TREE PROPERTIES WINDOW */}
        <Draggable
          bounds="parent" // Set bounds to the calculated boundaries of the plot container
        >
          <div className="btree-tree-properties-container">
            {displayUiComponents.includes("treeProperties") && (
              <BTreeProperties
                treeProps={treeProps}
                counters={treeFrame.counters}
                toggleUiComponentDisplay={toggleUiComponentDisplay}
              />
            )}
          </div>
        </Draggable>

        {/* BTREE PLOT */}
        <div className="btree-plot-container" ref={plotContainerRef}>
          {!btree.isEmpty() > 0 && (
            <BTreePlot
              nodeData={treeFrame.nodeData}
              highlightData={treeFrame.highlightData}
              plotProps={plotProps}
            />
          )}
        </div>

        {/* BTREE SHOW INFO BUTTON */}
        <div className="btree-show-info-button-container">
          <Button
            className="btree-info-button"
            variant="text"
            size="large"
            color="blue"
            startIcon={<KeyboardDoubleArrowDownIcon />}
            endIcon={<KeyboardDoubleArrowDownIcon />}
            onClick={() => {
              setDisplayUiComponents((prevDisplayUiComponents) => {
                const displayList = [...prevDisplayUiComponents]; // Create a copy of the array
                const toggleIndex = displayList.indexOf("treeInfo");
                if (toggleIndex === -1) {
                  displayList.push("treeInfo"); // Add if not present
                }
                return displayList; // Update the state
              });
              setTimeout(() => {
                // Zoom down one full screen height
                scrollDownToOneScreen();
              }, 100); // 100 milliseconds = 0.1 seconds
            }}
          >
            show B-Tree Info
          </Button>
        </div>

        {/* BTREE INFO */}
        <div className="btree-info-container">
          {displayUiComponents.includes("treeInfo") && (
            <div class="sides border">
              {/* BTREE HIDE INFO BUTTON */}
              <div className="btree-hide-info-button-container">
                <Button
                  className="btree-info-button"
                  variant="text"
                  size="large"
                  color="orange"
                  startIcon={<KeyboardDoubleArrowUpIcon />}
                  endIcon={<KeyboardDoubleArrowUpIcon />}
                  onClick={() => {
                    scrollToTop();

                    setTimeout(() => {
                      setDisplayUiComponents((prevDisplayUiComponents) => {
                        const displayList = [...prevDisplayUiComponents];
                        const toggleIndex = displayList.indexOf("treeInfo");
                        if (toggleIndex !== -1) {
                          displayList.splice(toggleIndex, 1);
                        }
                        return displayList;
                      });
                    }, 500); // Delay of 0.5 seconds (500 milliseconds)
                  }}
                >
                  hide B-Tree Info
                </Button>
              </div>
              <BTreeInfo loadTreePreset={loadBTreePreset} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
