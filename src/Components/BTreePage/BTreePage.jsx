
import React, { useState } from 'react';

import './BTreePage.css';
import BTree from './BTree';

import BTreePlot from './BTreePlot';
import BTreeInputForm from './BTreeInputForm';

let btree = new BTree(4);


export default function BTreePage() {

  function determineKeyStringType(keyString) {

    keyString = String(keyString)
    //Key Type String
    if (keyString.startsWith('"') && keyString.endsWith('"')) {
      return "string";
    }
    //Key Type Number
    if (!isNaN(parseFloat(keyString))) {
      return "float";
    }
    //anything else just use as string aswell
    return "string";
  }
  
  function validateKeyAdd(keyString){
    if(keyString == ""){
      return "empty"
    }

    // TYPE CHECK
    const keyType = determineKeyStringType(keyString)
    if(!btree.isEmpty()){
      // just check the first Key, whole tree should match that type
      if(keyType != determineKeyStringType(btree._root._keys[0])){
        return "type mismatch"
      }
    }

    if (!formData.allowDuplicates){
       if(keyType == "float"){
        keyString = parseFloat(keyString)
       }
       if(btree.contains(keyString)){
       }
    }
    return keyType
  }


  const [treeData, setTreeData] = useState({})
  
  //These always need to be up to date, they are relevant for rendering mostly
  const [treeProps, setTreeProps] = useState({
    treeDepth: 0,
    order: 3,
  })

  //---State and Eventhandlers for the BTree Input Form--------------------
  const [formData, setFormData] = useState({
    bTreeOrder: treeProps.order,
    keyValue: "",
    generateKeyAmount: 10,
    generateKeyOrder: 'random',
    allowDuplicates: false,
    KeyWarning: ""
  });
  
  const handleInputChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: type === "checkbox" ? checked : value
    }));
  };
  
  const handleInputButtonClick = (action) => {
    switch (action) {
      case "orderSet":
        console.log('Set button clicked!');
        break;

      case "keyAdd":
        let keyString = formData.keyValue
        const type = validateKeyAdd(keyString)
        
        switch (type) {

          //------ ERROR CASES -------
          case "empty":
            setFormData((prevFormData) => ({
              ...prevFormData,
              KeyWarning: "Cannot insert empty"
            }));
            break;

          case "type mismatch":
          const treeType = determineKeyStringType(btree._root._keys[0])
          const keyType = determineKeyStringType(keyString)
            setFormData((prevFormData) => ({
              ...prevFormData,
              KeyWarning: `The tree contains ${treeType == "float" ? "number" : "string"} keys, but ${keyType} was given.`
            }));
            break;

          case "duplicate":
            setFormData((prevFormData) => ({
              ...prevFormData,
              KeyWarning: `The key ${keyString} already exists in the tree n  `
            }));
            break;


          //----- SUCCESS CASES ------
          case "float":
            // Convert keyString to float if it has a float type
            keyString = parseFloat(keyString);
            // Fall through to the default case to execute the common code
          default:
            const keyLength = keyString.length;
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
              keyValue: "",
              KeyWarning: ""
            }));
            break;
        }
        
        break;

      case "keyRemove":
        console.log('Remove key button clicked!');
        break;

      case "generateGo":
        console.log('GO button clicked!');
        break;

      case "reset":
        console.log('reset button clicked!');
        break;

      case "import":
        console.log('Imprt button clicked!');
        break;

      case "export":
        console.log('Export button clicked!');
        break;

      default:
        break;
    }
  };
  

  return (
    <div className='btree-container'>
      <div className="btree-input-form-container">
        <BTreeInputForm 
          formData={formData} 
          onInputChange={handleInputChange} 
          onButtonClick={handleInputButtonClick} />
      </div>
      <div className="btree-plot-container">
        {Object.keys(treeData).length > 0 && (
          <BTreePlot treeData={treeData} treeProps={treeProps} />
        )}
      </div>
    </div>
  );
}
