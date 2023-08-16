import React, { useState } from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";

import Warning from "../Warning";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import Button from "@mui/material/Button";

import "./ImportExportBar.css";

const ImportExportBar = ({
  formData,
  onInputChange,
  onButtonClick,
  setAllowDrag,
}) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleSnackbarClose = () => {
    setIsCopied(false);
  };

  return (
    <div className="import-export-container">
      {/* BUTTON ROW SECTION */}
      <div className="button-row">
        <Button
          variant="contained"
          size="medium"
          color="white"
          className="reset-input-form-button"
          onClick={() => onButtonClick("reset")}
          disableElevation
        >
          reset
        </Button>

        <Button
          variant="contained"
          size="medium"
          color={
            formData.importExportDisplay === "import" &&
            formData.importExportTextAreaValue !== ""
              ? "success"
              : "white"
          }
          className="import-input-form-button"
          onClick={() => onButtonClick("import")}
          disableElevation
        >
          import
        </Button>

        <Button
          variant="contained"
          size="medium"
          color="white"
          className="reset-input-form-button"
          onClick={() => onButtonClick("export")}
          disableElevation
        >
          export
        </Button>
      </div>

      {formData.importWarning && (
        <Warning
          message={formData.importWarning}
          severity={"error"}
          onClose={() => onButtonClick("closeImportWarning")}
        />
      )}

      {/* IMPORT TEXT AREA*/}
      {formData.importExportDisplay == "import" && (
        <div className="multiline-container">
          <div className="multiline-bar">
            <span className="multiline-bar-title">IMPORT</span> {/* Import label */}
            <button
              className="import-export-close-button"
              onClick={() => onButtonClick("closeImportExportArea")}
            >
              &times;
            </button>
          </div>
          <textarea
            onMouseEnter={() => setAllowDrag(false)}
            onMouseLeave={() => setAllowDrag(true)}
            className="multiline-textbox"
            id="importExportTextAreaValue"
            name="importExportTextAreaValue"
            value={formData.importExportTextAreaValue}
            onChange={onInputChange}
            placeholder="Paste tree data here"
            rows={6} // Set the initial number of rows
          />
        </div>
      )}

      {/* Export TEXT AREA */}
      {formData.importExportDisplay == "export" && (
        <div className="multiline-container">
          <div className="multiline-bar">
          <span className="multiline-bar-title">EXPORT</span>  {/* Export label */}
            <CopyToClipboard
              text={formData.importExportTextAreaValue}
              onCopy={() => setIsCopied(true)}
            >
              <Button
                  variant="contained"
                  size="small"
                  color="grey"
                  className="input-form-button"
                  disableElevation
                >
                  copy
                </Button>
            </CopyToClipboard>
            <Snackbar
              open={isCopied}
              autoHideDuration={3000}
              onClose={handleSnackbarClose}
            >
              <MuiAlert severity="info" onClose={handleSnackbarClose}>
                copied to clipboard!
              </MuiAlert>
            </Snackbar>
            <button
              className="import-export-close-button"
              onClick={() => onButtonClick("closeImportExportArea")}
            >
              &times;
            </button>
          </div>
          <textarea
            onMouseEnter={() => setAllowDrag(false)}
            onMouseLeave={() => setAllowDrag(true)}
            className="multiline-textbox"
            id="importExportTextAreaValue"
            name="importExportTextAreaValue"
            value={formData.importExportTextAreaValue}
            onChange={onInputChange}
            readOnly
            rows={6} // Set the initial number of rows
          />
        </div>
      )}
    </div>
  );
};

export default ImportExportBar;
