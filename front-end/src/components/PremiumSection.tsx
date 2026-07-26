import React from "react";

interface PremiumSectionProps {
  onGoPremium: () => void;
}

const PremiumSection: React.FC<PremiumSectionProps> = ({ onGoPremium }) => {
  return (
    <section className="premium-section">
      <div className="premium-card">
        <h3 className="premium-text">Unlock Premium Features</h3>

        <div className="membership-plans">
          
          <div className="plan-card starter">
            <div>
              <h4>Starter</h4>
              <p>Unlimited Requests until you get <strong>4 New Matches</strong></p>
              <p>Receive Unlimited Requests (60 days)</p>
            </div>
            <div className="price-tag">₹299</div>
          </div>

          <div className="plan-card premier">
            <div>
              <h4>Premier</h4>
              <p>Unlimited Requests until you get <strong>8 New Matches</strong></p>
              <p>Receive Unlimited Requests (6 Months)</p>
            </div>
            <div className="price-tag">₹499</div>
          </div>

          <div className="plan-card special">
            <div>
              <h4>Special</h4>
              <p>Unlimited Requests until you get <strong>20 New Matches</strong></p>
              <p>Receive Unlimited Requests (12 Months)</p>
            </div>
            <div className="price-tag">₹999</div>
          </div>

        </div>

        <button className="premium-button" onClick={onGoPremium}>
          Go Premium
        </button>
      </div>
    </section>
  );
};

export default PremiumSection;
