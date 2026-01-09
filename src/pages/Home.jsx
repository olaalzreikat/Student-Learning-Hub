import "./Home.css";
import homehero from "../assets/home-hero.jpg";
import hometutor from "../assets/home-tutor.jpg";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();
  const actionResources = () => navigate("/resources");
  const actionDashboard = () => navigate("/dashboard");
  const actionSchedule = () => navigate("/schedule");

  return (
    <div className="home-page">
      {/*Hero Section*/}
      <div className="home-hero">
        <div className="home-hero-blue">
          <div className="home-hero-content">
            <div className="home-hero-text">
              <h1>Learning Equals Success</h1>
              <p>
                Equalizer Learning Hub offers a multitude of resources to help
                you learn. Classes, quizzes, tutors, and more! Learn more to
                succeed more.
              </p>
              <button className="get-started-btn" onClick={actionResources}>
                Get Started Today <span className="home-action-arrow">→</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* */}
      <div className="home-container">
        <div className="steps-container">
          <h1>How Equalizer Works</h1>
          <p>Three simple steps to transform your math learning experience.</p>
          <div className="steps-boxes-container">
            <div className="steps-box">
              <div className="step-icon">1</div>
              <h2>Choose Your Path</h2>
              <p>
                Browse our extensive library of resources organized by topic and
                difficulty level. Select materials that perfectly match your
                current learning goals.
              </p>
            </div>
            <div className="steps-box">
              <div className="step-icon">2</div>
              <h2>Learn & Practice</h2>
              <p>
                Engage with video tutorials, take interactive quizzes, schedule
                live tutoring sessions, and more. Practice with real problems
                and get instant feedback on your progress.
              </p>
            </div>
            <div className="steps-box">
              <div className="step-icon">3</div>
              <h2>Track & Improve</h2>
              <p>
                Montior your learning journey by tracking your tasks, viewing
                detailed analyses, and recieve personalized recommendations to
                accelerate your growth.
              </p>
            </div>
          </div>
        </div>

        <div className="tutors-container">
          <div className="tutors-right">
            <h1>Schedule Tutoring or Group Study Sessions</h1>
            <p>Talented tutors are ready to help you with whatever you need.</p>
            <button className="home-action-btn" onClick={actionSchedule}>
              Browse Our Tutors
            </button>
          </div>
          <img className="home-tutor-image" src={hometutor}></img>
        </div>

        <div className="cta-container">
          <h1>Ready to Start Mastering Math?</h1>
          <p>
            Join hundreds of students already improving their grades and
            building lasting confidence in mathematics
          </p>
          <button>Get Started</button>
          <div className="cta-small">
            <p>Free for students</p>
            <p>Start learning today</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
