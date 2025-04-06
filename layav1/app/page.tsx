import React from 'react';
import './globals.css';

const HomePage = () => {
  return (
    <div className="grid-container">
      <div className="grid-item custom-box small-box">
        <h4 className="box-title small-title">Music Settings</h4>
        <div className="form-group">
          <label htmlFor="thalam">Thalam:</label>
          <select id="thalam" className="form-control small-control">
            <option>Adi</option>
            <option>Rupaka</option>
            <option>Mishra</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="gathi">Gathi:</label>
          <select id="gathi" className="form-control small-control">
            {[...Array(9).keys()].map((num) => (
              <option key={num + 1} value={num + 1}>
                {num + 1}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="bpm">BPM:</label>
          <select id="bpm" className="form-control small-control">
            {[...Array(271).keys()].map((num) => (
              <option key={num + 30} value={num + 30}>
                {num + 30}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid-item">2</div>
      <div className="grid-item">3</div>
      <div className="grid-item">4</div>
      <div className="grid-item">5</div>
      <div className="grid-item">6</div>
      <div className="footer">Footer Content</div>
    </div>
  );
};

export default HomePage;
