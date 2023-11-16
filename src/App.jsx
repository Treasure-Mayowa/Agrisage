import './App.css';
import Form from './components/Form';
import WeatherInfo from './components/WeatherInfo';

function App() {
  return (
      <div className="App">
        <header className="App-header">
          <h1 className='text-4xl'>Agrisage</h1>
          <br />
          <Form />      
          <WeatherInfo />
        </header>     
      </div>
  );
}

export default App;
