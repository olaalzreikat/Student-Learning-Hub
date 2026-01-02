import { useState, useEffect } from 'react';
import { videosData, quizzesData, problemsData, guidesData } from '../data/resourcesData';
import { classesData } from '../data/classesData';
import { lessonsData } from '../data/lessonsData';
import { getProgress, markAsComplete, addActivity, checkAndAwardAchievements } from '../utils/localStorage';
import { useNavigate } from 'react-router-dom';
import ClassModal from '../components/ClassModal';
import './Resources.css';

function Resources() {
    const [activeFilter, setActiveFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedClass, setSelectedClass] = useState(null);
    const [classProgress, setClassProgress] = useState({});
    const [videoFilter, setVideoFilter] = useState('all');
    const [guideFilter, setGuideFilter] = useState('all');
    const [showAllVideos, setShowAllVideos] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    
    const navigate = useNavigate();
    
    // Get fresh progress data
    const progress = getProgress();

    useEffect(() => {
        calculateAllClassProgress();
        
        const handleStorageChange = () => {
            calculateAllClassProgress();
        };
        
        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('focus', handleStorageChange);
        
        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('focus', handleStorageChange);
        };
    }, [refreshTrigger]);

    const calculateAllClassProgress = () => {
        const progress = getProgress();
        const progressMap = {};

        classesData.forEach(classItem => {
            const allLessonIds = classItem.units.flatMap(unit => 
                unit.lessons.map(lesson => lesson.id)
            );

            const completedCount = allLessonIds.filter(lessonId => 
                progress.completedLessons?.includes(lessonId)
            ).length;

            const totalLessons = allLessonIds.length;
            const percentage = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

            progressMap[classItem.id] = {
                completed: completedCount,
                total: totalLessons,
                percentage: percentage,
                started: completedCount > 0
            };
        });

        setClassProgress(progressMap);
    };

    // Enhanced completion check functions
    const isVideoCompleted = (videoId) => {
        return progress.completedVideos?.includes(videoId) || false;
    };

    const isQuizCompleted = (quizId) => {
        return progress.completedQuizzes?.includes(quizId) || false;
    };

    const isProblemCompleted = (problemId) => {
        return progress.completedProblems?.includes(problemId) || false;
    };

    const isGuideDownloaded = (guideId) => {
        return progress.completedGuides?.includes(guideId) || false;
    };

    const handleClassClick = (classItem) => {
        setSelectedClass(classItem);
    };

    const handleModalClose = () => {
        setSelectedClass(null);
        setRefreshTrigger(prev => prev + 1);
    };

    const handleLessonStart = (lesson) => {
        const fullLesson = lessonsData.find(l => l.id === lesson.id);
        
        if (fullLesson) {
            localStorage.setItem('currentLesson', JSON.stringify(fullLesson));
        } else {
            // Fallback lesson data
            const fallbackLessonData = {
                id: lesson.id,
                title: lesson.title,
                description: lesson.description || `Learn about ${lesson.title}`,
                topic: selectedClass?.subject || 'mathematics',
                difficulty: selectedClass?.level?.toLowerCase() || 'intermediate',
                duration: lesson.duration,
                content: {
                    introduction: lesson.description || `Welcome to ${lesson.title}. In this lesson, you'll master essential concepts.`,
                    keyPoints: [
                        `Understanding ${lesson.title.toLowerCase()}`,
                        "Step-by-step problem solving techniques",
                        "Common applications and examples",
                        "Practice exercises to build mastery"
                    ],
                    examples: [
                        { 
                            problem: `Example problem for ${lesson.title}`, 
                            solution: "Step-by-step solution with explanation",
                            steps: [
                                "Identify the problem",
                                "Apply the appropriate method",
                                "Solve step by step",
                                "Verify the solution"
                            ]
                        },
                        { 
                            problem: `Practice problem for ${lesson.title}`, 
                            solution: "Detailed walkthrough of the solution",
                            steps: [
                                "Read the problem carefully",
                                "Choose your approach",
                                "Work through each step",
                                "Check your answer"
                            ]
                        }
                    ],
                    realWorldApplications: [
                        {
                            title: "Real-World Application",
                            example: `This concept applies to many practical situations in everyday life and various careers.`
                        }
                    ]
                }
            };
            
            localStorage.setItem('currentLesson', JSON.stringify(fallbackLessonData));
        }
        
        window.open('/lesson', '_blank');
        
        // Refresh progress after lesson window is opened
        setTimeout(() => {
            setRefreshTrigger(prev => prev + 1);
        }, 1000);
    };

    const handleVideoClick = (video) => {
        localStorage.setItem('currentVideo', JSON.stringify(video));
        window.open('/video', '_blank');
    };

    const handleQuizClick = (quiz) => {
        localStorage.setItem('currentQuiz', JSON.stringify(quiz));
        window.open('/quiz', '_blank');
    };

    const handleProblemClick = (problemSet) => {
        localStorage.setItem('currentProblemSet', JSON.stringify(problemSet));
        window.open('/problems', '_blank');
    };

    const handleGuideDownload = (guide) => {
        // Mark as completed immediately
        markAsComplete(guide.id, 'guide', guide.title, guide.topic);
        
        // Add activity
        addActivity('guide', guide.title, guide.topic);
        
        // Check achievements
        checkAndAwardAchievements();
        
        // Generate PDF
downloadFile(guide);        
        // Refresh UI
        setRefreshTrigger(prev => prev + 1);
    };

const downloadFile = (guide) => {
    // Create a link element
    const link = document.createElement('a');
    link.href = guide.fileUrl; // Use the file URL from your data
    link.download = guide.fileName || `${guide.title}.pdf`; // Use custom filename or generate one
    link.target = '_blank'; // Open in new tab as fallback
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Show success message
    setTimeout(() => {
        alert(` Downloaded: ${guide.title}\n\n✓ File downloaded successfully!\n✓ Progress saved to dashboard.`);
    }, 100);
};
   

    // Filter functions
    const getFilteredData = () => {
        let classes = classesData;
        let videos = videosData;
        let quizzes = quizzesData;
        let problems = problemsData;
        let guides = guidesData;

        // Apply category filter
        if (activeFilter !== 'all') {
            classes = classes.filter(c => c.subject.toLowerCase() === activeFilter);
            videos = videos.filter(v => v.topic && v.topic.toLowerCase() === activeFilter);
            quizzes = quizzes.filter(q => q.topic.toLowerCase() === activeFilter);
            problems = problems.filter(p => p.topic.toLowerCase() === activeFilter);
            guides = guides.filter(g => g.topic.toLowerCase() === activeFilter);
        }

        // Apply video class filter
        if (videoFilter !== 'all') {
            videos = videos.filter(v => v.class === videoFilter);
        }

        // Apply guide topic filter
        if (guideFilter !== 'all') {
            guides = guides.filter(g => g.topic.toLowerCase() === guideFilter);
        }

        // Apply search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            classes = classes.filter(c => c.title.toLowerCase().includes(query));
            videos = videos.filter(v => v.title.toLowerCase().includes(query));
            quizzes = quizzes.filter(q => q.title.toLowerCase().includes(query));
            problems = problems.filter(p => p.title.toLowerCase().includes(query));
            guides = guides.filter(g => g.title.toLowerCase().includes(query));
        }

        return { classes, videos, quizzes, problems, guides };
    };

    const filtered = getFilteredData();
    const hasResults = filtered.classes.length > 0 || filtered.videos.length > 0 || 
                       filtered.quizzes.length > 0 || filtered.problems.length > 0 || 
                       filtered.guides.length > 0;

    // Show only 6 videos initially, or all if showAllVideos is true
    const displayedVideos = showAllVideos ? filtered.videos : filtered.videos.slice(0, 6);

    return (
        <div className="resources-page">
            {/* Hero Section */}
            <div className="resources-hero">
                <div className="hero-content">
                    <div className="hero-text">
                        <h1>Learning Resources</h1>
                        <p>Everything you need to master mathematics</p>
                    </div>
                </div>
            </div>

            {/* Main Container */}
            <div className="resources-container">
                {/* Filter Bar */}
                <div className="category-filter-bar">
                    <div className="category-buttons">
                        <button 
                            className={`category-btn ${activeFilter === 'all' ? 'active' : ''}`}
                            onClick={() => setActiveFilter('all')}
                        >
                            All
                        </button>
                        <button 
                            className={`category-btn ${activeFilter === 'algebra' ? 'active' : ''}`}
                            onClick={() => setActiveFilter('algebra')}
                        >
                            Algebra
                        </button>
                        <button 
                            className={`category-btn ${activeFilter === 'geometry' ? 'active' : ''}`}
                            onClick={() => setActiveFilter('geometry')}
                        >
                            Geometry
                        </button>
                        <button 
                            className={`category-btn ${activeFilter === 'calculus' ? 'active' : ''}`}
                            onClick={() => setActiveFilter('calculus')}
                        >
                            Calculus
                        </button>
                        <button 
                            className={`category-btn ${activeFilter === 'statistics' ? 'active' : ''}`}
                            onClick={() => setActiveFilter('statistics')}
                        >
                            Statistics
                        </button>
                       
                    </div>

                    <div className="search-box">
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Search resources..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* No Results */}
                {!hasResults && (
                    <div className="no-resources">
                        No resources found. Try adjusting your filters.
                    </div>
                )}

                {/* CLASSES SECTION */}
                {filtered.classes.length > 0 && (
                    <div className="resource-section">
                        <div className="section-header">
                            <h2>Classes</h2>
                        </div>
                        <div className="classes-grid">
                            {filtered.classes.map((classItem) => {
                                const prog = classProgress[classItem.id] || { percentage: 0, total: 0, completed: 0, started: false };
                                const totalUnits = classItem.units.length;
                                const totalLessons = classItem.units.reduce((sum, unit) => sum + unit.lessons.length, 0);

                                return (
                                    <div key={classItem.id} className="lesson-card" onClick={() => handleClassClick(classItem)}>
                                        <div className="lesson-background"></div>
                                        <div className="class-card-content">
                                            <div>
                                                <h3 className="lesson-title">{classItem.title}</h3>
                                                <div className="class-info">
                                                    <p className="class-stats">{totalUnits} Units • {totalLessons} Lessons</p>
                                                </div>
                                            </div>
                                            <div style={{ marginTop: 'auto' }}>
                                                <div className="class-progress-container">
                                                    <div className="class-progress-bar">
                                                        <div className="class-progress-fill" style={{ width: `${prog.percentage}%` }}></div>
                                                    </div>
                                                    <span className="class-progress-text">{prog.percentage}% Complete</span>
                                                </div>
                                                <button className="class-action-btn">
                                                    {prog.started ? 'continue' : 'start'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* VIDEOS SECTION */}
                {filtered.videos.length > 0 && (
                    <div className="resource-section">
                        <div className="section-header">
                            <h2>Videos</h2>
                            <select 
                                className="video-filter-dropdown"
                                value={videoFilter}
                                onChange={(e) => setVideoFilter(e.target.value)}
                            >
                                <option value="all">All Classes</option>
                                <option value="Algebra 1">Algebra 1</option>
                                <option value="Algebra 2">Algebra 2</option>
                                <option value="Geometry">Geometry</option>
                                <option value="Trigonometry">Trigonometry</option>
                                <option value="Precalculus">Precalculus</option>
                                <option value="Calculus">Calculus</option>
                                <option value="Statistics">Statistics</option>
                            </select>
                        </div>
                        <div className="videos-grid">
                            {displayedVideos.map((video) => {
                                const isCompleted = isVideoCompleted(video.id);
                                
                                return (
                                    <div key={video.id} className="video-card" onClick={() => handleVideoClick(video)}>
                                        <div className="video-background"></div>
                                        {video.class && <div className="video-class-badge">{video.class}</div>}
                                        <div className="video-preview">
                                            {video.videoUrl ? (
                                                <iframe
                                                    src={video.videoUrl}
                                                    title={video.title}
                                                    style={{ pointerEvents: 'none' }}
                                                />
                                            ) : (
                                                <div className="play-icon"></div>
                                            )}
                                        </div>
                                        <div className="video-info">
                                            <h4 className="video-title">{video.title}</h4>
                                            <p className="video-duration"> {video.duration}</p>
                                        </div>
                                        <button className="video-watch-btn">
                                            {isCompleted ? 'watch again' : 'watch'}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                        {filtered.videos.length > 6 && (
                            <button 
                                className="show-more-btn"
                                onClick={() => setShowAllVideos(!showAllVideos)}
                            >
                                {showAllVideos ? '▲ Show Less' : `▼ Show ${filtered.videos.length - 6} More Videos`}
                            </button>
                        )}
                    </div>
                )}

                {/* QUIZZES SECTION */}
                {filtered.quizzes.length > 0 && (
                    <div className="resource-section">
                        <div className="section-header">
                            <h2>Quizzes</h2>
                        </div>
                        <div className="quizzes-grid">
                            {filtered.quizzes.map((quiz) => {
                                const isCompleted = isQuizCompleted(quiz.id);
                                
                                return (
                                    <div key={quiz.id} className="quiz-card" onClick={() => handleQuizClick(quiz)}>
                                        <div className="quiz-info">
                                            <h4 className="quiz-title">{quiz.title}</h4>
                                            <p className="quiz-description">{quiz.description}</p>
                                            <p className="quiz-duration">{quiz.questions} questions • {quiz.duration}</p>
                                        </div>
                                        <button className="start-btn" onClick={(e) => { e.stopPropagation(); handleQuizClick(quiz); }}>
                                            {isCompleted ? 'Retry' : 'Start'}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* PRACTICE PROBLEMS SECTION */}
                {filtered.problems.length > 0 && (
                    <div className="resource-section">
                        <div className="section-header">
                            <h2>Practice Problems</h2>
                        </div>
                        <div className="problems-grid">
                            {filtered.problems.map((problem) => {
                                const isCompleted = isProblemCompleted(problem.id);
                                
                                return (
                                    <div key={problem.id} className="quiz-card" onClick={() => handleProblemClick(problem)}>
                                        <div className="quiz-info">
                                            <h4 className="quiz-title">{problem.title}</h4>
                                            <p className="quiz-description">{problem.description}</p>
                                            <p className="quiz-duration">{problem.problems.length} problems • {problem.duration}</p>
                                        </div>
                                        <button className="start-btn" onClick={(e) => { e.stopPropagation(); handleProblemClick(problem); }}>
                                            {isCompleted ? 'Retry' : 'Start'}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* DOWNLOADABLE MATERIALS SECTION */}
                {filtered.guides.length > 0 && (
                    <div className="resource-section">
                        <div className="section-header">
                            <h2>Downloadable Material</h2>
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
                            {filtered.guides.map((guide) => {
                                const isDownloaded = isGuideDownloaded(guide.id);
                                
                                return (
                                    <div key={guide.id} className="download-card">
                                        <div className="download-content">
                                            <h4 className="download-title">{guide.title}</h4>
                                            <p className="download-description">{guide.description}</p>
                                            <div className="download-meta">
                                                <span>{guide.pages}</span>
                                                <span className="meta-separator">•</span>
                                                <span>{guide.size}</span>
                                            </div>
                                        </div>
                                        <button className="download-btn" onClick={(e) => { e.stopPropagation(); handleGuideDownload(guide); }}>
                                            {isDownloaded ? 'Download Again' : 'Download'}
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
                <ClassModal 
                    classData={selectedClass}
                    onClose={handleModalClose}
                    onLessonStart={handleLessonStart}
                />
            )}
        </div>
    );
}

export default Resources;