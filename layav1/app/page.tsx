"use client";

import React, { useState } from 'react';
import './globals.css';

const HomePage = () => {
  const [setToThala, setSetToThala] = useState(false);

  const toggleSetToThala = () => {
    setSetToThala((prev) => !prev);
  };

  return (
    <div className="grid-container">
      <div className="grid-item custom-box small-box">
        <h4 className="box-title small-title">Music Settings</h4>
        <div className="box1-firstset">
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
          <div className="form-group">
            <label>Set to Thala:</label>
            <div
              className={`toggle-switch ${setToThala ? 'active' : ''}`}
              onClick={toggleSetToThala}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                cursor: 'pointer',
                padding: '8px 15px',
                border: '1px solid',
                borderRadius: '20px',
                backgroundColor: setToThala ? '#4CAF50' : '#ccc',
                color: '#fff',
                position: 'relative',
                width: '60px',
                height: '30px',
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  left: setToThala ? '5px' : '35px',
                  top: '5px',
                  width: '20px',
                  height: '20px',
                  backgroundColor: '#fff',
                  borderRadius: '50%',
                  transition: 'left 0.3s',
                }}
              ></span>
              <span
                style={{
                  marginLeft: setToThala ? '30px' : '5px',
                  fontSize: '12px',
                  color: setToThala ? '#fff' : '#000',
                  transition: 'margin-left 0.3s',
                }}
              >
                {setToThala ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
        </div>
        <div className="box1-secondset">
          <div className="form-group">
            <label>Speed:</label>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span>Low</span>
              <input type="range" min="1" max="100" style={{ flex: 1 }} />
              <span>High</span>
            </div>
          </div>
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
