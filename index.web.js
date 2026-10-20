import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

const style = document.createElement('style');
style.textContent = `
  html, body, #root {
    width: 100% !important;
    height: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
    overflow: hidden !important;
    display: flex !important;
    flex-direction: column !important;
    background-color: #0F172A;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  }
  #root > div {
    display: flex !important;
    flex-direction: column !important;
    flex: 1 1 0% !important;
    width: 100% !important;
    height: 100% !important;
    overflow: hidden !important;
  }
  * {
    box-sizing: border-box;
    user-select: none;
  }
  input, textarea {
    user-select: text;
  }
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  ::-webkit-scrollbar-track {
    background: #1E293B;
  }
  ::-webkit-scrollbar-thumb {
    background: #475569;
    border-radius: 4px;
  }
  ::-webkit-scrollbar-thumb:hover {
    background: #64748B;
  }
`;
document.head.appendChild(style);

AppRegistry.registerComponent(appName, () => App);
AppRegistry.runApplication(appName, {
  rootTag: document.getElementById('root'),
});
