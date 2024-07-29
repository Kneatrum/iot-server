import React from 'react';
import { LittleCard } from '../Cards';
import { useContext } from 'react';
import { ApiContext } from '../../context/ApiContext';


function SleepSummary(){
    const { dashboardData } = useContext(ApiContext);

    let littleCards = [];

    if (dashboardData) {
        const states = dashboardData.sleep;
        for (let state in states) {
            if (states.hasOwnProperty(state)) {
                littleCards.push(
                    <LittleCard
                        key={state}
                        title={getTitleForState(state)} 
                        progress={states[state].percentage}
                        duration={states[state].time}
                        color={getColorForState(state)}
                    />
                );
            }
        }
    }

    function getColorForState(state) {
        switch (state) {
            case 'awake': return 'blue';
            case 'rem': return 'green';
            case 'light': return 'red';
            case 'deep': return 'purple';
            default: return 'gray';
        }
    }

    function getTitleForState(state) {
        switch (state) {
            case 'awake': return 'Awake';
            case 'rem': return 'REM Sleep';
            case 'light': return 'Light Sleep';
            case 'deep': return 'Deep Sleep';
            default: return '';
        }
    }

    return(
        <div class="card" style={{  borderRadius: '10px', height: '390px' }}>    
            <div className="card-header">
            <h5>Sleep Details</h5>
            </div>    
            <div className='container'>
            {
                dashboardData ? (
                    littleCards
                ) : (
                    <p>Loading...</p>
                )
            }
            </div>
        </div>
    )
}

export default SleepSummary;