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

  const navigate = useNavigate();

  const progress = getProgress();

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
          realWorldApplications: [
            {
              title: "Real-World Application",
              example: `This concept applies to many practical situations in everyday life and various careers.`,
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
    }

    return { tutors, groupSessions };
  };

  const filtered = getFilteredData();
  const hasResults = filtered.tutors.length > 0;

  return (
    <div className="resources-page">
      {/* Hero Section */}
      <div className="resources-hero">
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
          </div>

          <div className="search-box">
            <input
              type="text"
              className="search-input"
              placeholder="Search tutors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* No Results */}
        {!hasResults && (
          <div className="no-resources">
            No tutors found. Try adjusting your filters.
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
                {(
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
                            </select>
                        </div>
                        <div className="downloads-grid">
                            {filtered.groupSessions.map((group) => {
                                
                                return (
                                    <div key={group.id} className="download-card">
                                        <div className="download-content">
                                            <h4 className="group-title"><span className="group-title-background">{group.title}</span></h4>
                                            <h5 className="download-title">{group.subject}</h5>
                                            <p className="download-description">{group.description}</p>
                                            <div className="group-meta">
                                                <span className="group-separator">{group.currentSize} / {group.totalSize} students attending session</span>
                                            </div>
                                        </div>
                                        <button className={`download-btn`}>
                                            Join Session
                                        </button>
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
