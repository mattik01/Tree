import {useState} from 'react';
import './App.css';
import BTreePage from './Components/BTreePage/BTreePage';
import Navbar from './Components/Navbar';
import InfoPage from './Components/InfoPage/InfoPage';

function App() {
  const [selectedSegment, setSelectedSegment] = useState('B-Tree');

  const handleSegmentClick = (segment) => {
    setSelectedSegment(segment);
  };

  // Render the appropriate component based on the selected segment
  const renderPage = () => {
    switch (selectedSegment) {
      case 'B-Tree':
        return <BTreePage/>;

      case 'Info':
        return <InfoPage/>;

      default:
        return null;
    }
  };

  return (
    <div>
      <Navbar selectedSegment={selectedSegment} onSegmentClick={handleSegmentClick} />
      <div className="page-container">
                {renderPage()}
      </div>
    </div>
  );
}

export default App;
