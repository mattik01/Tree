import * as React from "react";
import Alert from "@mui/material/Alert";
import IconButton from "@mui/material/IconButton";
import Collapse from "@mui/material/Collapse";
import CloseIcon from "@mui/icons-material/Close";

export default function Warning({ message, severity, onClose }) {
  let borderColor = ""; // Initialize borderColor variable

  // Set the border color based on the severity value
  if (severity === "error") {
    borderColor = "red";
  } else if (severity === "warning") {
    borderColor = "yellow";
  } else if (severity === "info") {
    borderColor = "blue";
  } else if (severity === "success") {
    borderColor = "green";
  }

  return (
    <Collapse in={open}>
      <Alert
        icon={false}
        severity={severity}
        action={
          <IconButton
            aria-label="close"
            color="inherit"
            size="small"
            onClick={() => {
              onClose();
            }}
          >
            <CloseIcon fontSize="inherit" />
          </IconButton>
        }
        sx={{
          mb: 0,
          padding: "0px 10px", // Updated padding value
          border: `1px solid ${borderColor}`, // Use the calculated border color
        }}
      >
        {message}
      </Alert>
    </Collapse>
  );
}
