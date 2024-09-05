import React, { useState, useEffect } from 'react';

function CountProgressBar({ duration, onComplete }) {
    const [progress, setProgress] = useState(0);
    useEffect(() => {
    const increment = 100 / (duration / 1000);
    const interval = setInterval(() => {
        setProgress((prev) => {
            if (prev + increment >= 100) {
              clearInterval(interval);
              onComplete(); // Notify that countdown is finished
              return 100;
            }
            return prev + increment;
          });
        }, 1000);

        return () => clearInterval(interval);
    }, [duration,]);

    return (
        <div className="progress-bar">
            <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
        </div>
    );
}

export default CountProgressBar;