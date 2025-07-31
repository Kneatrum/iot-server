import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/plans.module.css';



const humanizeStorage = (mb) => {
  if (mb >= 1000000) return `${mb / 1000000} TB`;
  if (mb >= 1000) return `${mb / 1000} GB`;
  return `${mb} MB`;
};


const formatUploadRate = (seconds) => {
  if (seconds >= 60) return `${seconds / 60} min`;
  return `${seconds} sec`;
};
  

const PlansPage = ({plans, activePlan, setActivePlan}) => {
  const navigate = useNavigate();


  const onClickChoosePlan = (plan) => {
    // navigate('/payments', { state: { plan } });
    setActivePlan(plan);
  }

  return (
    <div className={styles.body} id="pricing">
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
              <button
                onClick={() => onClickChoosePlan(plan)}
                className={activePlan?.id === plan.id ? styles.selectedButton : ''}
              >
                {activePlan?.id === plan.id ? 'Selected' : 'Select Plan'}
              </button>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
};

export default PlansPage;
