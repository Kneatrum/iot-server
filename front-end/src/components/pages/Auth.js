
// src/components/LandingPage.js

import styles from '../styles/landing.module.css'

const Auth = () => {

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div  className={styles.lineContainer}>
          <h1 className={styles.heading}>Welcome to</h1>
          <h1 className={styles.emphasized}>Dopesilicon</h1>
        </div>
        <p className={styles.subheading}>
          An IoT platform that lets you register devices, create custom dashboards, and visualize real-time data.
        </p>
        <p>
          Don't have an account? <a href="/register">Sign up</a> or <a href="/login">Log in</a>.
        </p>
        <p>Click <a href="/demo">here</a> for a demo.</p>
        <a href="https://www.svgbackgrounds.com/set/free-svg-backgrounds-and-patterns/">Free SVG Backgrounds and Patterns by SVGBackgrounds.com</a>
      </div>
    </div>
  );
};

export default Auth;

