import './App.css';

// libraries
import {useState} from 'react';

//components
import BTreePage from './Components/BTreePage/BTreePage';
import Navbar from './Navbar';
import AboutPage from './Components/AboutPage/AboutPage';

/**
 * Root component of the webpage
 */

function App() {

  // ---------- STATE ----------

  const [selectedSegment, setSelectedSegment] = useState('B-Tree');

  // ---------- FUNCTIONS -----------

  //handles clicks on the navbar, determines what page is to be rendered
  const handleSegmentClick = (segment) => {
    setSelectedSegment(segment);
  };

  // Render the appropriate component based on the selected segment
  const renderPage = () => {
    switch (selectedSegment) {
      case 'B-Tree':
        return <BTreePage/>;

      case 'About':
        return <AboutPage/>;

      default:
        return null;
    }
  };

  // ---------- JSX ----------

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
