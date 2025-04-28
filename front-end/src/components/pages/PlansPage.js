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
    <div className={styles.body}>
      <h1 className={styles.title}>Choose Your Plan</h1>
      <div className={styles.pricingContainer}>
        {plans.map(plan => (
          <div key={plan.id} className={styles.card}> 
            
            <div className={styles.cardHeader}>
              <h3>{plan.name}</h3>
              <div className={styles.price}>${plan.price}</div>
            </div>

            <div className={styles.cardBody}>
              <ul>
                <li><b>Devices:</b> {plan.deviceLimit}</li>
                <li><b>Charts:</b> {plan.chartsLimit}</li>
                <li><b>Storage:</b> {humanizeStorage(plan.storage)}</li>
                <li><b>Data Retention:</b> {plan.dataRetentionDays} days</li>
                <li><b>Max Upload Rate:</b> every {formatUploadRate(plan.uploadRate)}</li>
                <li><b>Protocols:</b> {Array.isArray(plan.protocols) ? plan.protocols.join(', ') : 'N/A'}</li>
              </ul>
            </div>

            <div className={styles.cardFooter}>
              <button onClick={() => onClickChoosePlan(plan)}   className={styles.choosePlanButton} >Select Plan</button>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
};

export default PlansPage;
