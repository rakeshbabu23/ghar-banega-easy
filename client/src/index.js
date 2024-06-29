import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { ConfigProvider } from 'antd';
import store from './redux/store';
import { Provider } from 'react-redux';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Provider store={store}>
    <ConfigProvider
    theme={{
      token: {
        colorPrimary:"#F47721",
      },
    }}
    >
    <App />
    </ConfigProvider>
  </Provider>
);

reportWebVitals();
