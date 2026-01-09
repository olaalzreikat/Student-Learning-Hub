import './Home.css';
import homehero from '../assets/home-hero.jpg';
import hometutor from '../assets/home-tutor.jpg';
import { useNavigate } from 'react-router-dom';

function Home() {
    const navigate = useNavigate();
    const actionResources = () => navigate('/resources');
    const actionDashboard = () => navigate('/dashboard');
    const actionSchedule = () => navigate('/schedule');

    return (
        <div className='home-page'>
            {/*Hero Section*/}
            <div className="home-hero">
                <div className='home-hero-blue'>
                    <div className="home-hero-content">
                        <div className="home-hero-text">
                            <h1>Learning Equals Success</h1>
                            <p>Equalizer Lorem ipsum dolor sit amet consectetur adipisicing elit. Itaque, voluptatibus!</p>
                            <button className='get-started-btn' onClick={actionDashboard}>Get Started Today <span className="home-action-arrow">→</span></button>
                        </div>
                    </div>
                </div>
            </div>
            {/* */}
            <div className='home-container'>
                <h1 className='features-title'>Our Features</h1>
                <div className='features-boxes-container'>
                    
                    <div className='features-box'>
                        <h3>Student-led</h3>
                        <p>Student created learning hub designed with collaboration in mind.</p>
                    </div>
                    <div className='features-box'>
                        <h3>Tutor/Study Help</h3>
                        <p>Multiple talented student tutors with flexible schedules to help you succeed.</p>
                    </div>
                    <div className='features-box'>
                        <h3>Classes & Resources</h3>
                        <p>Utilize various materials to learn, review, and test your knowledge.</p>
                    </div>
                </div>
                <div className='courses-container'>
                    <h1>Browse our Courses</h1>
                    <p>Courses ranging from Algebra 1 to Calculus, provided with numerous learning materials to help you succeed.</p>
                    {/*Course boxes */}
                    <button className='home-action-btn' onClick={actionResources}>View All Courses</button>
                </div>
                <div className='tutors-container'>
                    <div className='tutors-right'>
                        <h1>Schedule Tutoring or Group Study Sessions</h1>
                        <p>Talented tutors are ready to help you with whatever you need.</p>
                        <button className='home-action-btn' onClick={actionSchedule}>Browse Our Tutors</button>
                    </div>
                    <img className='home-tutor-image' src={hometutor}></img>
                </div>
            </div>
        </div>
    );
}

export default Home;