import React from "react";

interface Match {
  id: number;
  name: string;
  age: number;
  city: string;
  imageUrl: string;
  isOnline?: boolean;
}

interface MatchCarouselProps {
  matches: Match[];
  location: string;
}

const MatchCarousel: React.FC<MatchCarouselProps> = ({ matches, location }) => {
  return (
    <section className="matches-section">
      <div className="matches-header">
        <h2 className="section-title">Suggested Matches</h2>
        <span className="location-pill">{location}</span>
      </div>

      <div className="matches-grid">
        {matches.map((user) => (
          <article key={user.id} className="match-card">
            <div
              className="match-photo"
              style={{ backgroundImage: `url(${user.imageUrl})` }}
            />
            <div className="match-info">
              <div className="match-name-row">
                <span className="match-name">{user.name}</span>
                <span className="match-age">{user.age}</span>
              </div>
              <span className="match-city">{user.city}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default MatchCarousel;
