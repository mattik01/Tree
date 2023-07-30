import React from "react";
import ImportExportBar from "./ImportExportBar";
import DraggableIcon from "../../../public/draggable-icon.svg";
import Warning from "../Warning";
import Tooltipped from "../Tooltipped";

import "./BTreeInputForm.css";

const orderTooltip = () => {
  return (
    <div>
      <p>This is a Tooltip</p>
    </div>
  );
};

function BTreeInputForm({ formData, onInputChange, onButtonClick }) {
  return (
    <form>
      {/* DRAG ICON SEGMENT */}
      <div className="draggable-icon-container">
        <h4>modify B-Tree:</h4>
        <img src={DraggableIcon} className="draggable-icon" />
      </div>

      {/* ORDER SEGMENT */}
      <div className="input-form-segment">
        <div className="inline-input">
          <Tooltipped
            tooltipText="max number of keys, every node may hold"
            children={<label htmlFor="bTreeOrder">tree-order (k):</label>}
          ></Tooltipped>

          <input
            type="number"
            id="bTreeOrder"
            name="bTreeOrder"
            value={formData.bTreeOrder}
            min="3"
            onChange={onInputChange}
          />
        </div>
        <button type="button" onClick={() => onButtonClick("orderSet")}>
          set
        </button>
        {formData.orderWarning && (
          <Warning
            message={formData.orderWarning}
            severity={"error"}
            onClose={() => onButtonClick("closeOrderWarning")}
          />
        )}
      </div>

      {/* INDIVIDUAL KEY SEGMENT */}
      <div className="input-form-segment">
        <div className="inline-input">
          <Tooltipped
            children={
              <div>
                <label htmlFor="keyValue" className="inline-label">
                  key:
                </label>
                <input
                  type="text"
                  name="keyValue"
                  id="keyValue"
                  value={formData.keyValue}
                  onChange={onInputChange}
                  className="inline-input"
                />
              </div>
            }
            tooltipText={
              "Its is recommended to surround keys meant as strings with quotes"
            }
          />
        </div>
        <div className="inline-input">
          <button type="button" onClick={() => onButtonClick("keyAdd")}>
            add
          </button>
          <button type="button" onClick={() => onButtonClick("keyRemove")}>
            remove
          </button>
        </div>
        <Tooltipped
          children={
            <label htmlFor="allowDuplicates" className="checkbox-label">
              <input
                type="checkbox"
                name="allowDuplicates"
                id="allowDuplicates"
                checked={formData.allowDuplicates}
                onChange={onInputChange}
              />
              Allow Duplicates
            </label>
          }
          tooltipText={"applies to the key generator aswell"}
        />
        {formData.keyWarning && (
          <Warning
            message={formData.keyWarning}
            severity={"error"}
            onClose={() => onButtonClick("closeKeyWarning")}
          />
        )}
      </div>

      {/* GENERATE KEY SEGMENT */}
      <div className="input-form-segment">
        <div className="inline-input">
          <label htmlFor="generateKeyAmount">key amount:</label>
          <input
            type="number"
            min="1"
            id="generateKeyAmount"
            name="generateKeyAmount"
            value={formData.generateKeyAmount}
            onChange={onInputChange}
          />
        </div>
        <div className="inline-input">
          <label htmlFor="generateKeyOrder">key order:</label>
          <select
            name="generateKeyOrder"
            id="generateKeyOrder"
            value={formData.generateKeyOrder}
            onChange={onInputChange}
          >
            <option value="random">random</option>
            <option value="asc">ascending</option>
            <option value="desc">descending</option>
          </select>
        </div>
        <div className="inline-input">
          <label htmlFor="generateKeyType">key type:</label>

          {formData.treeEmpty ? (
            <select
              name="generateKeyType"
              id="generateKeyType"
              value={formData.generateKeyType}
              onChange={onInputChange}
            >
              <option value="number">numbers</option>
              <option value="string">strings</option>
            </select>
          ) : (
            <Tooltipped
              children={
                <select
                  name="generateKeyType"
                  id="generateKeyType"
                  value={formData.generateKeyType}
                  onChange={onInputChange}
                  disabled="true"
                >
                  <option value="number">numbers</option>
                  <option value="string">strings</option>
                </select>
              }
              tooltipText={"Key type always needs to match existing keys"}
            />
          )}
        </div>

        <button type="button" onClick={() => onButtonClick("generateGo")}>
          generate keys
        </button>

        {formData.generateWarning && (
          <Warning
            message={formData.generateWarning}
            severity={"error"}
            onClose={() => onButtonClick("closeGenerateWarning")}
          />
        )}
        {formData.generateRange && (
          <Warning
            message={formData.generateRange}
            severity={"success"}
            onClose={() => onButtonClick("closeGenerateRange")}
          />
        )}
      </div>

      {/* IMPORT/EXPORT SEGMENT */}
      <div className="input-form-segment">
        <ImportExportBar
          formData={formData}
          onInputChange={onInputChange}
          onButtonClick={onButtonClick}
        />
      </div>
    </form>
  );
}

export default BTreeInputForm;
