import React from 'react';

function BTreeInputForm({ formData, onInputChange, onButtonClick }) {
  return (
    <form>
      <div>
        <label htmlFor="bTreeOrder">Order of Tree:</label>
        <div style={{ display: 'inline-block' }}>
          <input
            type="number"
            id="bTreeOrder"
            name="bTreeOrder"
            value={formData.bTreeOrder}
            onChange={onInputChange}
            style={{ display: 'inline-block' }}
          />
          <button type="button" onClick={() => onButtonClick("orderSet")}>set</button>
        </div>
      </div>
      <div style={{ display: 'inline-block' }}>
        <label htmlFor="keyValue" style={{ display: 'inline-block', marginRight: '5px' }}>Key:</label>
        <div style={{ display: 'inline-block' }}>
          <input type="text" name="keyValue" id="keyValue" value={formData.keyValue} onChange={onInputChange} style={{ display: 'inline-block' }} />
          <button type="button" onClick={() => onButtonClick("keyAdd")}>add</button>
          <button type="button" onClick={() => onButtonClick("keyRemove")}>remove</button>
          <label htmlFor="allowDuplicates" style={{ marginLeft: '10px' }}>
            <input
              type="checkbox"
              name="allowDuplicates"
              id="allowDuplicates"
              checked={formData.allowDuplicates}
              onChange={onInputChange}
            />
            Allow Duplicates
          </label>
        </div>
        {formData.KeyWarning && (
          <div style={{ color: 'red' }}>{formData.KeyWarning}</div>
        )}

      </div>
      <div>
        <label htmlFor="generateKeyAmount">Generate Keys:</label>
        <input
          type="text"
          id="generateKeyAmount"
          name="generateKeyAmount"
          value={formData.generateKeyAmount}
          onChange={onInputChange}
        />
        <label htmlFor="generateKeyOrder">Order:</label>
        <select name="generateKeyOrder" id="generateKeyOrder" value={formData.generateKeyOrder} onChange={onInputChange}>
          <option value="random">Random</option>
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
        <button type="button" onClick={() => onButtonClick("generateGo")}>GO</button>
      </div>
      <div>
        <button type="button" onClick={() => onButtonClick("reset")}>Reset</button>
        <button type="button" onClick={() => onButtonClick("import")}>Import</button>
        <button type="button" onClick={() => onButtonClick("export")}>Export</button>      </div>
    </form>
  );
}

export default BTreeInputForm;