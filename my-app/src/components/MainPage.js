import React from 'react';
import { useNavigate } from 'react-router-dom';

function MainPage() {
  const navigate = useNavigate();

    return (
        <div className="main-page">
          <div className="left-panel">
            <img src="/SOLZ.png" alt="Logo" className="logo" />
            <div className="button-group-main">
              <button onClick={() => navigate('/login')}>Login</button>
              <button onClick={() => navigate('/signup')}>Sign Up</button>
            </div>
          </div>
          
          <div className="right-panel">
            <p>
            By logging data or importing data through our easy to use app, we use AI to give you an accurate medical assessment on your wellbeing.
            </p>
          </div>
        </div>
      );
}

export default MainPage;
