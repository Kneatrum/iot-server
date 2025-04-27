import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/plans.module.css';

import { plansApi } from '../../api/api';


const humanizeStorage = (mb) => {
  if (mb >= 1000000) return `${mb / 1000000} TB`;
  if (mb >= 1000) return `${mb / 1000} GB`;
  return `${mb} MB`;
};


const formatUploadRate = (seconds) => {
  if (seconds >= 60) return `${seconds / 60} min`;
  return `${seconds} sec`;
};
  

const PlansPage = () => {
  const [plans, setPlans] = useState([]);
  const navigate = useNavigate();


  const onClickChoosePlan = (plan) => {
    navigate('/payments', { state: { plan } });
  }


  useEffect(() => {
    // Fetch plans from the API
    plansApi.get('/')
      .then(response => {
        const fetchedPlans = response.data.map(plan => ({
          id: plan.id,
          name: plan.name,
          price: plan.price,
          deviceLimit: plan.deviceLimit,
          dataRetentionDays: plan.dataRetentionDays,
          uploadRate: plan.uploadRate,
          protocols: plan.protocols,
          chartsLimit: plan.chartsLimit,
          storage: plan.storage,
        }));

        setPlans(fetchedPlans);
        console.log('Fetched plans:', fetchedPlans);
      })
      .catch(error => {
        console.error('Error fetching plans:', error);
      });
  }, []);

  return (
    <div className={styles.container}>
      {plans.map(plan => (
        <div key={plan.id} className={styles.planCard}> 
          
          <div className={styles.planCardHeader}>
            <h2>{plan.name}</h2>
            <p>${plan.price}</p>
          </div>

          <div className={styles.planCardBody}>
            <ul>
              <li><strong>Devices:</strong> {plan.deviceLimit}</li>
              <li><strong>Charts:</strong> {plan.chartsLimit}</li>
              <li><strong>Storage:</strong> {humanizeStorage(plan.storage)}</li>
              <li><strong>Data Retention:</strong> {plan.dataRetentionDays} days</li>
              <li><strong>Max Upload Rate:</strong> every {formatUploadRate(plan.uploadRate)}</li>
              <li><strong>Protocols:</strong> {Array.isArray(plan.protocols) ? plan.protocols.join(', ') : 'N/A'}</li>
            </ul>
          </div>

          <div className={styles.planCardFooter}>
            <button onClick={() => onClickChoosePlan(plan)}   className={styles.choosePlanButton} >Choose Plan</button>
          </div>

        </div>
      ))}
    </div>
  );
};

export default PlansPage;
