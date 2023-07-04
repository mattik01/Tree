
import React, { useState } from 'react';

import './BTreePage.css';
import BTree from './BTree';

import BTreePlot from './BTreePlot';
import BTreeInputForm from './BTreeInputForm';

let btree = new BTree(3);

export default function BTreePage() {

  function parseKeyString(keyString){
    //TODO
  }
  
  function validateKeyAdd(){
    // TYPE CHECK
    if(!btree.isEmpty){

    }
  }


  const [treeData, setTreeData] = useState({})
  
  //These always need to be up to date, they are relevant for rendering mostly
  const [treeProps, setTreeProps] = useState({
    treeDepth: 0,
    order: 3,
    longestKeyLength: 0,
  })

  //---State and Eventhandlers for the BTree Input Form--------------------
  const [formData, setFormData] = useState({
    bTreeOrder: treeProps.order,
    keyValue: "",
    generateKeyAmount: 10,
    generateKeyOrder: 'random',
    allowDuplicates: false
  });
  
  const handleInputChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: type === "checkbox" ? checked : value
    }));
  };
  
  const handleButtonClick = (action) => {
    switch (action) {
      case "orderSet":
        console.log('Set button clicked!');
        break;

      case "keyAdd":
        validateKeyAdd()
        btree.add(formData.keyValue);
        setTreeData(btree.toTreeData());
        setFormData((prevFormData) => ({
        ...prevFormData,
        keyValue: ""
      }));
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
          onButtonClick={handleButtonClick} />
      </div>
      <div className="btree-plot-container">
        {Object.keys(treeData).length > 0 && (
          <BTreePlot treeData={treeData} treeProps={treeProps} />
        )}
      </div>
    </div>
  );
}
