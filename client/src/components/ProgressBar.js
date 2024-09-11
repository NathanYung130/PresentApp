import React, { useState, useEffect } from 'react';

function ProgressBar({ duration, onComplete }) {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const intervalTime = 200;
        const increment = 100 / (duration / intervalTime);
        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev + increment >= 100) {
                    clearInterval(interval);
                    onComplete(); // Notify that countdown is finished
                    return 100;
                }
                return prev + increment;
            });
        }, intervalTime);

        return () => clearInterval(interval);
    }, [duration, onComplete]);

    const radius = 45;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
        <div className="progress-circle">
            <svg width="100" height="100" viewBox="0 0 100 100">
                <circle
                    className="progress-circle-bg"
                    cx="50"
                    cy="50"
                    r={radius}
                    strokeWidth="10"
                />
                <circle
                    className="progress-circle-fill"
                    cx="50"
                    cy="50"
                    r={radius}
                    strokeWidth="10"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    transform="rotate(-90 50 50)"
                />
                <text x="50" y="50" textAnchor="middle" dy="7" fontSize="20">
                    {Math.round(progress)}%
                </text>
            </svg>
        </div>
    );
}

export default ProgressBar;