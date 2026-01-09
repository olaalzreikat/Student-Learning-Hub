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
    return (
        <div style={{ padding: '100px 20px', textAlign: 'center' }}>
            <h1>Schedule Page</h1>
            <p>Schedule your tutoring sessions</p>
        </div>
    );
}

export default Schedule;
