import React from "react";
import ImportExportBar from "./ImportExportBar";
import UiComponent from "../UiComponent";
import Warning from "../Warning";
import Tooltipped from "../Tooltipped";
import determineKeyStringType from "../../utility/DetermineKeyType";

import "./BTreeInputForm.css";

function BTreeInputForm({
  formData,
  treeProps,
  futureKeys,
  onInputChange,
  onButtonClick,
  setAllowDrag,
}) {
  return (
    <UiComponent
      title={"Modify B-Tree"}
      children={
        <div>
          <form>
            {/* ORDER SEGMENT */}
            <div className="input-form-segment">
              <div className="inline-input">
                <Tooltipped
                  tooltipText="max number of children for nodes"
                  children={<label htmlFor="orderInput">tree-order (p):</label>}
                ></Tooltipped>

                <input
                  onMouseEnter={() => setAllowDrag(false)}
                  onMouseLeave={() => setAllowDrag(true)}
                  type="number"
                  id="orderInput"
                  name="orderInput"
                  value={formData.orderInput}
                  min="4"
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
              <label htmlFor="keyInput" className="inline-label">
                        key:
                      </label>
                <Tooltipped
                  children={
                    <div>
                      <input
                        onMouseEnter={() => setAllowDrag(false)}
                        onMouseLeave={() => setAllowDrag(true)}
                        type="text"
                        name="keyInput"
                        id="keyInput"
                        value={formData.keyInput}
                        onChange={onInputChange}
                        className="inline-input"
                      />
                    </div>
                  }
                  tooltipText={
                    "preferably surround keys meant as strings with quotes"
                  }
                />
              </div>
              <div className="inline-input">
                <button type="button" onClick={() => onButtonClick("keyAdd")}>
                  add
                </button>
                <button
                  type="button"
                  onClick={() => onButtonClick("keyRemove")}
                >
                  remove
                </button>
              </div>
              <Tooltipped
                children={
                  <label htmlFor="allowDuplicates" className="checkbox-label">
                    <input
                      onMouseEnter={() => setAllowDrag(false)}
                      onMouseLeave={() => setAllowDrag(true)}
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
                <label htmlFor="generateKeyAmountInput">key amount:</label>
                <input
                  onMouseEnter={() => setAllowDrag(false)}
                  onMouseLeave={() => setAllowDrag(true)}
                  type="number"
                  min="1"
                  id="generateKeyAmountInput"
                  name="generateKeyAmountInput"
                  value={formData.generateKeyAmountInput}
                  onChange={onInputChange}
                />
              </div>
              <div className="inline-input">
                <label htmlFor="generateKeyOrderInput">key order:</label>
                <select
                  name="generateKeyOrderInput"
                  id="generateKeyOrderInput"
                  value={formData.generateKeyOrderInput}
                  onChange={onInputChange}
                >
                  <option value="random">random</option>
                  <option value="asc">ascending</option>
                  <option value="desc">descending</option>
                </select>
              </div>
              <div className="inline-input">
                <label htmlFor="generateKeyTypeInput">key type:</label>
                {futureKeys.length == 0 ? (
                  <select
                    name="generateKeyTypeInput"
                    id="generateKeyTypeInput"
                    value={formData.generateKeyTypeInput}
                    onChange={onInputChange}
                  >
                    <option value="number">numbers</option>
                    <option value="string">strings</option>
                  </select>
                ) : (
                   // disabled type selector when tree/queue alreay has keys in it 
                  <Tooltipped
                    children={
                      <select
                        name="generateKeyTypeInput"
                        id="generateKeyTypeInput"
                        value={determineKeyStringType(futureKeys[futureKeys.length-1])}
                        onChange={onInputChange}
                        disabled={true}
                      >
                        <option value="number">numbers</option>
                        <option value="string">strings</option>
                      </select>
                    }
                    tooltipText={"Key type always needs to match keys in tree and qeue"}
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
              {formData.generateRangeInfo && (
                <Warning
                  message={formData.generateRangeInfo}
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
                setAllowDrag={setAllowDrag}
              />
            </div>
          </form>
        </div>
      }
    />
  );
}

export default BTreeInputForm;
