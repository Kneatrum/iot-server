import SleepingLine from './components/charts/SleepingLine';
import Bar from './components/charts/Bar';
import ActionChart from './components/charts/ActionChart';
import FitHeader from './components/FitHeader';
import SleepSummary from './components/charts/SleepSummary';
import HeartChart from './components/charts/HeartChart';
import {NightSleepCard, AvgHeartRate, AvgOxygenSaturation, Steps} from './components/Cards';
import { ApiProvider } from './context/ApiContext';

const App = () => {

  return (
    <ApiProvider>
        <div className="bg-dark text-light min-vh-100 d-flex flex-column">
            <FitHeader />
            <div className='container' style={{ paddingBottom: '20px' }}>
                <div className='row'>
                    <div className='col-md-3'><NightSleepCard title="Night Sleep" /></div>
                    <div className='col-md-3'><AvgHeartRate title="Avg Heart Rate" /></div>
                    <div className='col-md-3'><AvgOxygenSaturation title="Oxygen Saturation (Sp02)" /></div>
                    <div className='col-md-3'><Steps title="Steps" /></div>
                </div>
            </div>
            
            <div className="container">
                <div className="row">
                    <div className="col-md-3">
                        <ActionChart />
                    </div>


                    <div className="col-md-9">
                        <div class='row'>

                            <div className='col-md-8'>
                                <SleepingLine />
                            </div>

                            <div className='col-md-4'>
                                <SleepSummary />
                            </div>

                        </div>

                        <div class='row'>

                            <div className='col-8'>
                                <HeartChart />
                            </div>

                            <div className='col-4'>
                                <Bar />
                            </div>

                        </div>
                    </div>

                </div>
                
            </div>
        </div>
    </ApiProvider>
  );
}

export default App;