import './UiComponent.css'
import DraggableIcon from "/draggable-icon.svg";
import Draggable from 'react-draggable';

const UiComponent = ({ title, children}) => {
  return (
    <div className='ui-component'>
      {/* DRAG ICON SEGMENT */}
      <div className="draggable-icon-container">
        <h4>{title}</h4>
        <img src={DraggableIcon} className="draggable-icon" draggable={false} />
      </div>
      {children}
    </div>
  );
};

export default UiComponent;
