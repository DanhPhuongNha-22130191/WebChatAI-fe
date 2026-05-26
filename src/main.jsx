import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/theme.css'
import App from './app/App.jsx'
import { SocketProvider } from './app/providers/SocketProvider.jsx';
import { ApiProvider } from './app/providers/ApiProvider.jsx';
import { Provider } from 'react-redux';
import { store } from './app/store';


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <SocketProvider>
        <ApiProvider>
          <App />
        </ApiProvider>
      </SocketProvider>
    </Provider>
  </StrictMode>,
)
