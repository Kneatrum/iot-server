
// src/components/LandingPage.js

import React, { useState, useEffect, useRef } from 'react';
import LandingPageHeader from '../PageSections/landingHeader';
import HeroSection from '../PageSections/landingHero';
import Features from '../PageSections/Features';
import PlansPage from './PlansPage';
import AuthSection from '../PageSections/AuthSection';
import { plansApi } from '../../api/api';

const LandingPage = () => {

  const [loading, setLoading] = useState(true);
  // const [error, setError] = useState(null);
  const [plans, setPlans] = useState([]);
  const [activePlan, setActivePlan] = useState(null);
  const [activeTab, setActiveTab] = useState('home');
  const [authActiveTab, setAuthActiveTab] = useState('login');
  const authActiveTabRef = useRef(authActiveTab);

  const scrollToSection = (id) => {
    setActiveTab(id);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const PageSections = [
    { label: 'Home', href: '/home', onClick: () => scrollToSection('home') },
    { label: 'Features', href: '/features', onClick: () => scrollToSection('features') },
    { label: 'Pricing', href: '/pricing', onClick: () => scrollToSection('pricing') },
    { label: 'Login', href: '/login', onClick: () => scrollToSection('auth') },
    { label: 'Sign Up', href: '/signup', onClick: () => scrollToSection('auth') },
  ];

  useEffect(() => {
    authActiveTabRef.current = authActiveTab;
  }, [authActiveTab]);

  useEffect(() => {
    scrollToSection('home'); // Scroll to the home section on initial load
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
        setLoading(false);
        // console.log('Fetched plans:', fetchedPlans);
      })
      .catch(error => {
        console.error('Error fetching plans:', error);
      });
  }, []);

  useEffect(() => {
    if (plans.length > 0) {
      const freePlan = plans.find(plan => plan.name.toLowerCase().includes('free'));
      if (freePlan) {
        setActivePlan(freePlan);
        // console.log('Active Plan set to:', freePlan);
      }
    }
  }, [plans]);

  useEffect(() => {
    // Function to determine which section is in view
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight * 0.4; // 40% viewport

      // Find the section that's currently in view
      for (const section of PageSections) {
        const element = document.getElementById(section.label.toLowerCase());
        if (element) {
          const offsetTop = element.offsetTop;
          const offsetHeight = element.offsetHeight;
          
          if (
            scrollPosition >= offsetTop &&
            scrollPosition < offsetTop + offsetHeight
          ) {
            
            if (section.label.toLowerCase() === 'login' || section.label.toLowerCase() === 'signup') {
              setActiveTab(authActiveTabRef.current);
              // console.log("Here:", section.label.toLowerCase());
            } else {
              setActiveTab(section.label.toLowerCase());
              // console.log("Here:", section.label.toLowerCase());
            }

            break;
          }
        }
      }
    };
    
    // Add scroll event listener
    window.addEventListener('scroll', handleScroll);
    
    // Call once on mount to set initial active section
    handleScroll();
    
    // Cleanup
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);


  return (
    <>
      <LandingPageHeader menuItems={PageSections} activeTab={activeTab} setActiveTab={setActiveTab} authActiveTab={authActiveTab} setAuthActiveTab={setAuthActiveTab}/>
      <HeroSection/>
      <Features/>
      {
        !loading ? (
          <>
            <PlansPage plans={plans} activePlan={activePlan} setActivePlan={setActivePlan}/>
            <AuthSection activePlan={activePlan}  setActiveTab={setActiveTab} authActiveTab={authActiveTab} setAuthActiveTab={setAuthActiveTab}/>
          </>
        ) : (
          <div className="loading">Loading...</div>
        )
      }
    </>
  );
};

export default LandingPage;

