import { useNavigate } from "react-router-dom";
import styles from "../components/FrontPage.module.css";
import { FaUserMd, FaFileMedical } from "react-icons/fa";
import heroImg from "../assets/img/pic2.jpg";

const FrontPage = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <h1 className={styles.brand}>🚑 SwastCare</h1>
        <p className={styles.tagline}>
          Emergency Medical Log & Patient System
        </p>
      </header>

      {/* Hero */}
      <section className={styles.hero}>
        {/* Left: Text + Buttons */}
        <div className={styles.heroLeft}>
          <h2>Fast. Reliable. Secure.</h2>
          <p>
            Manage emergency logs and access patient records with just a click.  
            SwastCare ensures quick response and reliable tracking for every case.
          </p>

          <div className={styles.buttonGroup}>
            <button className={styles.card} onClick={() => navigate("/patient")}>
              <FaUserMd className={styles.icon} />
              <div>
                <h3>Patient Dashboard</h3>
                <p>Access patient records, vitals, and medical history.</p>
              </div>
            </button>

            <button className={styles.card} onClick={() => navigate("/newlog")}>
              <FaFileMedical className={styles.icon} />
              <div>
                <h3>New Emergency Log</h3>
                <p>Create and send patient details instantly.</p>
              </div>
            </button>
          </div>
        </div>

        {/* Right: Image */}
        <div className={styles.heroRight}>
          <img src={heroImg} alt="Ambulance" className={styles.heroImg} />
        </div>
      </section>
<hr></hr>
      {/* Footer */}
      <footer className={styles.footer}>
        <p>© 2025 SwastCare • Built for Emergency Response 🚑</p>
      </footer>
    </div>
  );
};

export default FrontPage;
