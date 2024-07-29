import React from 'react';
import { useContext, useState, useEffect } from 'react';
import { ApiContext } from '../context/ApiContext';

export function LittleCard({title, progress, duration, color}){
    return (
        <div className='card' style={{ margin: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h6 style={{ paddingLeft: '10px'}}>{title}</h6>
                <p style={{ margin: '10px', fontSize: '10px', textAlign: 'right' }}>{duration}</p>
            </div>
            <div class="progress" style={{ borderRadius: '0', margin: '10px', }}>
                <div class="progress-bar" role="progressbar" style={{ width: `${progress}%`, backgroundColor: color }} aria-valuenow={progress} aria-valuemin="0" aria-valuemax="100">{progress}%</div>
            </div>
        </div>
    )
}



export function NightSleepCard({title}){
    const { dashboardData } = useContext(ApiContext);
    const [data, setData ] = useState(0);

    useEffect(() => {
        if(dashboardData){
            setData(dashboardData.nightSleep)
        }

    }, [dashboardData]);

    const formatTime = (minutes) => {
        if (minutes < 60) {
            return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
        } else {
            const hours = Math.floor(minutes / 60);
            const remainingMinutes = minutes % 60;
            if (remainingMinutes === 0) {
                return `${hours} hour${hours !== 1 ? 's' : ''}`;
            } else {
                return `${hours} hour${hours !== 1 ? 's' : ''} and ${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}`;
            }
        }
    };
    

    return(
        <div class="card" style={{  borderRadius: '10px' }}>
            <p style={{paddingLeft: '20px'}}>{title}</p>
            <div class="card-body" style={{ textAlign: 'center' }}>
                {formatTime(data)}
            </div>
        </div>
    )
}

export function AvgHeartRate({title}){
    const { dashboardData } = useContext(ApiContext);
    const [data, setData ] = useState(0);

    useEffect(() => {
        if(dashboardData){
            setData(dashboardData.avgHeartRate)
        }

    }, [dashboardData]);

    return(
        <div class="card" style={{  borderRadius: '10px' }}>
            <p style={{paddingLeft: '20px'}}>{title}</p>
            <div class="card-body" style={{ textAlign: 'center' }}>
                {data}{" bpm"}
            </div>
        </div>
    )
}


export function AvgTemperature({title}){
    const { dashboardData } = useContext(ApiContext);
    const [data, setData ] = useState(0);

    useEffect(() => {
        if(dashboardData){
            setData(dashboardData.avgTemp)
        }

    }, [dashboardData]);

    return(
        <div class="card" style={{  borderRadius: '10px' }}>
            <p style={{paddingLeft: '20px'}}>{title}</p>
            <div class="card-body" style={{ textAlign: 'center' }}>
                {data}
            </div>
        </div>
    )
}

export function Steps({title}){
    const { dashboardData } = useContext(ApiContext);
    const [data, setData ] = useState(0);

    useEffect(() => {
        if(dashboardData){
            setData(dashboardData.steps)
        }

    }, [dashboardData]);

    return(
        <div class="card" style={{  borderRadius: '10px' }}>
            <p style={{paddingLeft: '20px'}}>{title}</p>
            <div class="card-body" style={{ textAlign: 'center' }}>
                {data}
            </div>
        </div>
    )
}




