import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import styles from '../styles/payments.module.css';
import { ReactComponent as MpesaLogo } from '../../assets/mpesa-logo-cropped.svg';
import { ReactComponent as AirtelLogo } from '../../assets/airtel.svg';
import { ReactComponent as CreditCard } from '../../assets/credit-card.svg';
import { ReactComponent as AddIcon } from '../../assets/add.svg';
import { ReactComponent as RemoveIcon } from '../../assets/remove.svg';

import { exchangeRatesApi, mpesaApi } from '../../api/api';


const DEFAULT_DURATION = 1; // Default duration in months
const REFERENCE_CURRENCY = 'USD'; // Default currency

const Payments = () => {
    const location = useLocation();
    const plan = location.state?.plan;
    const [duration, setDuration] = useState(DEFAULT_DURATION);
    const [refCurrency, setRefCurrency] = useState(REFERENCE_CURRENCY);
    const [selectedCurrency, setSelectedCurrency] = useState(REFERENCE_CURRENCY);
    const [planPrice, setPlanPrice] = useState(plan?.price || 0);
    const [exchangeRates, setExchangeRates] = useState({});
    const [isCardActive, setIscardActive] = useState(true);
    const [isMpesaActive, setIsMpesaActive] = useState(false);
    const [isAirtelActive, setIsAirtelActive] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState('');


    useEffect(() => {
        const fetchExchangeRates = async () => {
            try {
                const response = await exchangeRatesApi.get('/');
                const rates = response.data;
                setExchangeRates(rates);
            } catch (error) {
                console.error('Error fetching exchange rates:', error);
            }
        };

        fetchExchangeRates();
    }, [])

    function increaseDuration(){
        setDuration(prevDuration => prevDuration + 1);
    }

    function decreaseDuration(){
        setDuration(prevDuration => {
            if (prevDuration > 1) {
                return prevDuration - 1;
            }
            return prevDuration;
        });
    }

    function handlePaymentMethodChange(method) {
        setIscardActive(method === 'creditCard');
        setIsMpesaActive(method === 'mpesa');
        setIsAirtelActive(method === 'airtel');
    }

    function handleCardChange() {
        handlePaymentMethodChange('creditCard');
    }

    function handleMpesaChange() {
        handlePaymentMethodChange('mpesa');
    }

    function handleAirtelChange() {
        handlePaymentMethodChange('airtel');
    }


    function handlePaymentMethodClick(method) {
        if (method === 'creditCard') {
            handleCardChange();
            setSelectedCurrency(REFERENCE_CURRENCY);
            setPlanPrice(() => {
                const selectedCountryEntry = Object.entries(exchangeRates).find(([_, details]) => details.currencyCode === REFERENCE_CURRENCY);
                
                if (selectedCountryEntry) {
                    const selectedCountry = selectedCountryEntry[0];
                    console.log('Selected currency rate:', exchangeRates[selectedCountry].rate); 
                    return exchangeRates[selectedCountry].rate * plan.price;
                } else {
                    return plan.price;
                }
            });
        } else if (method === 'mpesa') {
            handleMpesaChange();
        } else if (method === 'airtel') {
            handleAirtelChange();
        }
    }

    async function initMpesaPayment() {


        const payload = {
            phoneNumber: '0728337139', // Replace with actual phone number
            // amount: planPrice * duration
            amount: 2
        }

        try {
            const response = await mpesaApi.post('/stk-push', payload);
            const data = response.data;

            if (data.success) {
                alert('Payment initiated successfully');
            } else {
                alert('Payment initiation failed');
            }
        } catch (error) {
            console.error('Error initiating payment:', error);
        }
    }


    return (
        <div className={styles.body}>
            <div className={styles.container}>
                <h1>Subscription plan</h1>

                <div className={styles.priceDisplay}>
                    <span>${plan.price}</span> / Month
                </div>

                <div className={styles.durationSelector}>
                
                    <button className={styles.durationButton} onClick={decreaseDuration}>
                        <RemoveIcon className={styles.icon}/>
                    </button>
                    
                    
                    { duration > 1 ?
                        <h4 className={styles.durationText}> {duration} Months </h4> :
                        <h4 className={styles.durationText}> {duration} Month </h4>
                    }
                
                
                    <button className={styles.durationButton} onClick={increaseDuration}>
                        <AddIcon className={styles.icon} />
                    </button>
                    
                </div>

                <div className={styles.totalPrice}>
                    <span>{selectedCurrency}</span>
                    <span>{ (planPrice * duration).toFixed(2) }</span>
                </div>

                <div className={styles.currencySelector}>
                    <div className={styles.currencyLabel}>
                        <span>Change currency</span>
                    </div>

                    <select 
                        className={styles.select} 
                        value={selectedCurrency} 
                        onChange={(e) => {
                            const selectedCurrencyCode = e.target.value;
                            
                            if (selectedCurrencyCode === refCurrency) {
                                setPlanPrice(plan.price);
                            }

                            setSelectedCurrency(selectedCurrencyCode);

                            // Find the matching exchange rate using the selectedCurrencyCode
                            const selectedCountryEntry = Object.entries(exchangeRates).find(([_, details]) => details.currencyCode === selectedCurrencyCode);
                            
                            if (selectedCountryEntry) {
                                const selectedCountry = selectedCountryEntry[0];
                                console.log('Selected currency rate:', exchangeRates[selectedCountry].rate); 
                                setPlanPrice(exchangeRates[selectedCountry].rate * plan.price);
                            } 
                        }}
                    >
                        <option value={refCurrency}>United States Dollar (USD)</option>
                        {
                            Object.entries(exchangeRates).map(([country, currencyDetails]) => (
                                <option key={country} value={currencyDetails.currencyCode}>
                                    {currencyDetails.currencyName} ({currencyDetails.currencyCode})
                                </option>
                            ))
                        }
                    </select>
                </div>

                <h2>Choose your payment method</h2>

                <div className={styles.paymentMethods}>
                    <div className={`${styles.paymentMethod} ${isCardActive ? styles.paymentMethodActive : ''}`} onClick={() => handlePaymentMethodClick('creditCard')}>
                        <CreditCard className={styles.creditCard} />
                        <div>Card</div>
                    </div>

                    <div className={`${styles.paymentMethod} ${isMpesaActive ? styles.paymentMethodActive : ''}`} onClick={() => handlePaymentMethodClick('mpesa')}>
                        <MpesaLogo className={styles.mpesaLogo}/>
                        <div>MPESA</div>
                    </div> 

                    <div className={`${styles.paymentMethod} ${isAirtelActive ? styles.paymentMethodActive : ''}`} onClick={() => handlePaymentMethodClick('airtel')}>
                        <AirtelLogo className={styles.airtelLogo}/>
                        <div>Airtel</div>
                    </div>
                </div>

                
                <div className={`${styles.phoneNumberContainer} ${(isMpesaActive || isAirtelActive) ? styles.active : ''}`}>
                    <div className={styles.phoneNumberLabel}>
                        <span>Enter phone number</span>
                    </div>

                    <input 
                        type="text" 
                        placeholder="Phone Number" 
                        value={phoneNumber} 
                        onChange={(e) => setPhoneNumber(e.target.value)} 
                        className={styles.input} 
                        // disabled={!isMpesaActive}
                    />
                 
                </div>


                <button className={styles.btnPay} onClick={async () => {
                    // Handle payment logic here
                    if(isMpesaActive){
                        console.log('Payment initiated');
                        try {
                            await initMpesaPayment();
                        } catch (error) {
                            console.error('Error initiating payment:', error);
                        }
                    }
                }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                        <line x1="1" y1="10" x2="23" y2="10"></line>
                    </svg>
                    Pay Now
                </button>

                <div className={styles.secureBadge}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                    Secure Payment
                </div>

            </div>
        </div>
    );

};

export default Payments;
