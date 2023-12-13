import React from "react";
import ImportExportBar from "./ImportExportBar";
import UiComponent from "../UiComponent";
import Warning from "../Warning";
import Tooltipped from "../Tooltipped";
import determineKeyStringType from "../../utility/DetermineKeyType";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import IconButton from "@mui/material/IconButton";

import "./BTreeInputForm.css";

function BTreeInputForm({
  formData,
  futureKeys,
  onInputChange,
  onButtonClick,
  setAllowDrag,
  toggleUiComponentDisplay,
}) {
  return (
    <UiComponent
      toggleWindow={() => toggleUiComponentDisplay("inputForm")}
      title={"Modify B-Tree"}
      children={
        <div>
          <form>
            {/* ORDER SEGMENT */}
            <div className="input-form-segment">
              <div className="line">
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
                  min="3"
                  onChange={onInputChange}
                />
              </div>

              <div className="line">
                <Button
                  variant="contained"
                  size="small"
                  color="lightBlue"
                  className="input-form-button"
                  onClick={() => onButtonClick("orderSet")}
                  disableElevation
                >
                  set
                </Button>
              </div>
            </div>

            {formData.orderWarning && (
              <div className="line">
                <Warning
                  message={formData.orderWarning}
                  severity={"error"}
                  onClose={() => onButtonClick("closeOrderWarning")}
                />
              </div>
            )}

            {/* INDIVIDUAL KEY SEGMENT */}
            <div className="input-form-segment">
              <div className="line">
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
                <div className="plus-minus-buttons">
                  <IconButton
                    color="green"
                    className="icon-button"
                    variant="outlined"
                    //className="input-form-button-fixed-medium"
                    onClick={() => onButtonClick("keyAdd")}
                    disableElevation
                  >
                    <AddIcon />
                  </IconButton>
                  <IconButton
                    color="red"
                    className="icon-button"
                    variant="contained"
                    //className="input-form-button-fixed-medium"
                    onClick={() => onButtonClick("keyRemove")}
                    disableElevation
                  >
                    <RemoveIcon />
                  </IconButton>
                </div>
              </div>
              <div className="line">
                <label htmlFor="allowDuplicates" className="checkbox-label">
                  <input
                    className="input-form-checkbox"
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
              </div>
              {formData.keyWarning && (
                <div className="line">
                  <Warning
                    message={formData.keyWarning}
                    severity={"error"}
                    onClose={() => onButtonClick("closeKeyWarning")}
                  />
                </div>
              )}
            </div>

            {/* GENERATE KEY SEGMENT */}
            <div className="input-form-segment">
              <div className="line">
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
              <div className="line">
                <label htmlFor="generateKeyOrderInput">key order:</label>
                <select
                  onMouseEnter={() => setAllowDrag(false)}
                  onMouseLeave={() => setTimeout(() => setAllowDrag(true), 0)}
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
              <div className="line">
                <label htmlFor="generateKeyTypeInput">key type:</label>
                {futureKeys.length == 0 ? (
                  <select
                    onMouseEnter={() => setAllowDrag(false)}
                    onMouseLeave={() => setTimeout(() => setAllowDrag(true), 0)}
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
                        value={determineKeyStringType(
                          futureKeys[futureKeys.length - 1]
                        )}
                        onChange={onInputChange}
                        disabled={true}
                      >
                        <option value="number">numbers</option>
                        <option value="string">strings</option>
                      </select>
                    }
                    tooltipText={
                      "Key type always needs to match keys in tree and qeue"
                    }
                  />
                )}
              </div>

              <div className="line">
                <Button
                  variant="contained"
                  size="small"
                  color="grey"
                  className="input-form-button"
                  onClick={() => onButtonClick("generateGo")}
                  disableElevation
                >
                  generate keys
                </Button>
              </div>

              {formData.generateWarning && (
                <div className="line">
                  <Warning
                    message={formData.generateWarning}
                    severity={"error"}
                    onClose={() => onButtonClick("closeGenerateWarning")}
                  />
                </div>
              )}

              {formData.generateRangeInfo && (
                <div className="line">
                  <Warning
                    message={formData.generateRangeInfo}
                    severity={"success"}
                    onClose={() => onButtonClick("closeGenerateRange")}
                  />
                </div>
              )}
            </div>

            {/* IMPORT/EXPORT SEGMENT */}
            <div className="bottom-input-form-segment">
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
