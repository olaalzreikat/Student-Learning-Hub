import { useState, useEffect } from "react";
import {
  videosData,
  quizzesData,
  problemsData,
  guidesData,
} from "../data/resourcesData";
import { classesData } from "../data/classesData";
import { tutorsData } from "../data/tutorsData";
import { groupSessionData } from "../data/groupSessionData";
import { lessonsData } from "../data/lessonsData";
import {
  getProgress,
  markAsComplete,
  addActivity,
  checkAndAwardAchievements,
} from "../utils/localStorage";
import { useNavigate } from "react-router-dom";
import TutorModal from "../components/TutorModal";
import "./Resources.css";
import "./Schedule.css";

function Schedule() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClass, setSelectedClass] = useState(null);
  const [classProgress, setClassProgress] = useState({});
  const [videoFilter, setVideoFilter] = useState("all");
  const [guideFilter, setGuideFilter] = useState("all");
  const [showAllVideos, setShowAllVideos] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [joinedSessions, setJoinedSessions] = useState([]);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [sessionCounts, setSessionCounts] = useState({});

  const navigate = useNavigate();

  const progress = getProgress();

  useEffect(() => {
    // Load joined sessions from localStorage
    const savedAgenda = localStorage.getItem('agendaItems');
    if (savedAgenda) {
      const agendaItems = JSON.parse(savedAgenda);
      const groupSessionIds = agendaItems
        .filter(item => item.type === 'group')
        .map(item => item.groupId);
      setJoinedSessions(groupSessionIds);
    }

    // Load session counts from localStorage
    const savedCounts = localStorage.getItem('groupSessionCounts');
    if (savedCounts) {
      setSessionCounts(JSON.parse(savedCounts));
    } else {
      // Initialize counts from groupSessionData
      const initialCounts = {};
      groupSessionData.forEach(session => {
        initialCounts[session.id] = session.currentSize;
      });
      setSessionCounts(initialCounts);
      localStorage.setItem('groupSessionCounts', JSON.stringify(initialCounts));
    }
  }, [refreshTrigger]);

  const showNotificationMessage = (message) => {
    setNotificationMessage(message);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  const handleClassClick = (classItem) => {
    setSelectedClass(classItem);
  };

  const handleModalClose = () => {
    setSelectedClass(null);
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleLessonStart = (lesson) => {
    const fullLesson = lessonsData.find((l) => l.id === lesson.id);

    if (fullLesson) {
      localStorage.setItem("currentLesson", JSON.stringify(fullLesson));
    } else {
      // Fallback lesson data
      const fallbackLessonData = {
        id: lesson.id,
        title: lesson.title,
        description: lesson.description || `Learn about ${lesson.title}`,
        topic: selectedClass?.subject || "mathematics",
        difficulty: selectedClass?.level?.toLowerCase() || "intermediate",
        duration: lesson.duration,
        content: {
          introduction:
            lesson.description ||
            `Welcome to ${lesson.title}. In this lesson, you'll master essential concepts.`,
          keyPoints: [
            `Understanding ${lesson.title.toLowerCase()}`,
            "Step-by-step problem solving techniques",
            "Common applications and examples",
            "Practice exercises to build mastery",
          ],
          examples: [
            {
              problem: `Example problem for ${lesson.title}`,
              solution: "Step-by-step solution with explanation",
              steps: [
                "Identify the problem",
                "Apply the appropriate method",
                "Solve step by step",
                "Verify the solution",
              ],
            },
            {
              problem: `Practice problem for ${lesson.title}`,
              solution: "Detailed walkthrough of the solution",
              steps: [
                "Read the problem carefully",
                "Choose your approach",
                "Work through each step",
                "Check your answer",
              ],
            },
          ],
        },
      };

      localStorage.setItem("currentLesson", JSON.stringify(fallbackLessonData));
    }

    window.open("/lesson", "_blank");

    // Refresh progress after lesson window is opened
    setTimeout(() => {
      setRefreshTrigger((prev) => prev + 1);
    }, 1000);
  };

  const handleJoinGroupSession = (group) => {
    // Check if already joined
    if (joinedSessions.includes(group.id)) {
      showNotificationMessage(' You have already joined this session!');
      return;
    }

    // Get current count for this session
    const currentCount = sessionCounts[group.id] || group.currentSize;

    // Check if session is full
    if (currentCount >= group.totalSize) {
      showNotificationMessage(' This session is full!');
      return;
    }

    // Get existing agenda items
    const savedAgenda = localStorage.getItem('agendaItems');
    const agendaItems = savedAgenda ? JSON.parse(savedAgenda) : [];
    
    // Create session item from group data
    const sessionItem = {
      title: `${group.subject} with ${group.title}`,
      subject: group.topic.charAt(0).toUpperCase() + group.topic.slice(1),
      date: group.date,
      time: group.time,
      type: 'group',
      groupId: group.id,
      instructor: group.instructor || group.title
    };
    
    // Add to agenda and sort by date/time
    const updatedAgenda = [...agendaItems, sessionItem].sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}`);
      const dateB = new Date(`${b.date}T${b.time}`);
      return dateA - dateB;
    });
    
    localStorage.setItem('agendaItems', JSON.stringify(updatedAgenda));
    
    // Update joined sessions state
    setJoinedSessions([...joinedSessions, group.id]);
    
    // Increment session count
    const updatedCounts = {
      ...sessionCounts,
      [group.id]: currentCount + 1
    };
    setSessionCounts(updatedCounts);
    localStorage.setItem('groupSessionCounts', JSON.stringify(updatedCounts));
    
    // Show success message
    showNotificationMessage(` Successfully joined "${group.subject}" with ${group.title}!`);
    
    // Trigger refresh
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleCancelGroupSession = (group) => {
    // Get existing agenda items
    const savedAgenda = localStorage.getItem('agendaItems');
    const agendaItems = savedAgenda ? JSON.parse(savedAgenda) : [];
    
    // Remove the session
    const updatedAgenda = agendaItems.filter(item => 
      !(item.type === 'group' && item.groupId === group.id)
    );
    
    localStorage.setItem('agendaItems', JSON.stringify(updatedAgenda));
    
    // Update joined sessions state
    setJoinedSessions(joinedSessions.filter(id => id !== group.id));
    
    // Decrement session count
    const currentCount = sessionCounts[group.id] || group.currentSize;
    const updatedCounts = {
      ...sessionCounts,
      [group.id]: Math.max(0, currentCount - 1) // Don't go below 0
    };
    setSessionCounts(updatedCounts);
    localStorage.setItem('groupSessionCounts', JSON.stringify(updatedCounts));
    
    // Show message
    showNotificationMessage(` Cancelled "${group.subject}" session with ${group.title}`);
    
    // Trigger refresh
    setRefreshTrigger((prev) => prev + 1);
  };

  // Filter functions
  const getFilteredData = () => {
    let tutors = tutorsData;
    let groupSessions = groupSessionData;
    let videos = videosData;
    let quizzes = quizzesData;
    let problems = problemsData;
    let guides = guidesData;

    // Apply category filter
    if (activeFilter !== "all") {
      tutors = tutors.filter((t) => t.topic.toLowerCase() === activeFilter);
      videos = videos.filter(
        (v) => v.topic && v.topic.toLowerCase() === activeFilter
      );
      quizzes = quizzes.filter((q) => q.topic.toLowerCase() === activeFilter);
      problems = problems.filter((p) => p.topic.toLowerCase() === activeFilter);
      guides = guides.filter((g) => g.topic.toLowerCase() === activeFilter);
      groupSessions = groupSessions.filter((g)=>g.topic.toLowerCase() === activeFilter);
    }

    // Apply video class filter
    if (videoFilter !== "all") {
      videos = videos.filter((v) => v.class === videoFilter);
    }

    // Apply guide topic filter
    if (guideFilter !== "all") {
      groupSessions = groupSessions.filter((g) => g.topic.toLowerCase() === guideFilter);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      tutors = tutors.filter((t) => t.topic.toLowerCase().includes(query));
      groupSessions = groupSessions.filter((g) => 
        g.title.toLowerCase().includes(query) || 
        g.subject.toLowerCase().includes(query)
      );
    }

    return { tutors, groupSessions };
  };

  const filtered = getFilteredData();
  const hasResults = filtered.tutors.length > 0 || filtered.groupSessions.length > 0;

  return (
    <div className="resources-page">
      {/* Notification */}
      {showNotification && (
        <div className="notification">
          {notificationMessage}
        </div>
      )}

      {/* Hero Section */}
      <div className="schedule-hero">
        <div className="hero-content">
          <div className="hero-text">
            <h1>Scheduling Page</h1>
            <p>Schedule your tutoring and group study sessions</p>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="resources-container">
        {/* Filter Bar */}
        <div className="category-filter-bar">
          <div className="category-buttons">
            <button
              className={`category-btn ${
                activeFilter === "all" ? "active" : ""
              }`}
              onClick={() => setActiveFilter("all")}
            >
              All
            </button>
            <button
              className={`category-btn ${
                activeFilter === "algebra" ? "active" : ""
              }`}
              onClick={() => setActiveFilter("algebra")}
            >
              Algebra
            </button>
            <button
              className={`category-btn ${
                activeFilter === "geometry" ? "active" : ""
              }`}
              onClick={() => setActiveFilter("geometry")}
            >
              Geometry
            </button>
            <button
              className={`category-btn ${
                activeFilter === "calculus" ? "active" : ""
              }`}
              onClick={() => setActiveFilter("calculus")}
            >
              Calculus
            </button>
            <button
              className={`category-btn ${
                activeFilter === "statistics" ? "active" : ""
              }`}
              onClick={() => setActiveFilter("statistics")}
            >
              Statistics
            </button>
            <button
              className={`category-btn ${
                activeFilter === "trigonometry" ? "active" : ""
              }`}
              onClick={() => setActiveFilter("trigonometry")}
            >
              Trigonometry
            </button>
          </div>

          <div className="search-box">
            <input
              type="text"
              className="search-input"
              placeholder="Search sessions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* No Results */}
        {!hasResults && (
          <div className="no-resources">
            No sessions found. Try adjusting your filters.
          </div>
        )}

        {/* TUTORS SECTION */}
        {filtered.tutors.length > 0 && (
          <div className="resource-section">
            <div className="section-header">
              <h2>Tutors</h2>
            </div>
            <div className="classes-grid">
              {filtered.tutors.map((classItem) => {
                const tutorYear = classItem.year;
                const tutorLesson = classItem.subject;

                return (
                  <div
                    key={classItem.id}
                    className="lesson-card"
                    onClick={() => handleClassClick(classItem)}
                  >
                    <div className="lesson-background"></div>
                    <div className="class-card-content">
                      <div>
                        <h3 className="lesson-title">{classItem.title}</h3>
                        <div className="class-info">
                          <p className="class-stats">
                            Year {tutorYear} • {tutorLesson} Lessons
                          </p>
                        </div>
                        <button className="book-btn">
                          Book Now
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* GROUP SESSIONS SECTION */}
        {filtered.groupSessions.length > 0 && (
          <div className="resource-section">
            <div className="section-header">
              <h2>Group Study Sessions</h2>
              <select 
                className="guide-filter-dropdown"
                value={guideFilter}
                onChange={(e) => setGuideFilter(e.target.value)}
              >
                <option value="all">All classes</option>
                <option value="algebra">Algebra</option>
                <option value="geometry">Geometry</option>
                <option value="calculus">Calculus</option>
                <option value="statistics">Statistics</option>
                <option value="trigonometry">Trigonometry</option>
              </select>
            </div>
            <div className="downloads-grid">
              {filtered.groupSessions.map((group) => {
                const isJoined = joinedSessions.includes(group.id);
                const currentCount = sessionCounts[group.id] !== undefined 
                  ? sessionCounts[group.id] 
                  : group.currentSize;
                const isFull = currentCount >= group.totalSize;
                
                return (
                  <div key={group.id} className="download-card">
                    <div className="download-content">
                      <h4 className="group-title">
                        <span className="group-title-background">{group.title}</span>
                      </h4>
                      <h5 className="download-title">{group.subject}</h5>
                      <p className="download-description">{group.description}</p>
                      <div className="group-meta">
                        <span className="group-separator">
                          👥 {currentCount} / {group.totalSize} students
                        </span>
                      </div>
                    </div>
                    {isJoined ? (
                      <button 
                        className="download-btn cancel-status"
                        onClick={() => handleCancelGroupSession(group)}
                      >
                        Cancel Registration
                      </button>
                    ) : (
                      <button 
                        className={`download-btn ${isFull ? 'disabled-btn' : 'join-status'}`}
                        onClick={() => handleJoinGroupSession(group)}
                        disabled={isFull}
                      >
                        {isFull ? 'Session Full' : 'Join Session'}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Class Modal */}
      {selectedClass && (
        <TutorModal
          tutorsData={selectedClass}
          onClose={handleModalClose}
          onLessonStart={handleLessonStart}
        />
      )}
    </div>
  );
}

export default Schedule;