class PomodoroTimer {
    constructor() {
        this.workDuration = 25 * 60;
        this.shortBreakDuration = 5 * 60;
        this.longBreakDuration = 15 * 60;
        this.timeRemaining = this.workDuration;
        this.isRunning = false;
        this.isWorkSession = true;
        this.completedPomodoros = 0;
        this.intervalId = null;
        this.totalTime = this.workDuration;

        this.initializeElements();
        this.attachEventListeners();
        this.updateDisplay();
    }

    initializeElements() {
        this.timerDisplay = document.getElementById('timer');
        this.sessionTypeDisplay = document.getElementById('session-type');
        this.startBtn = document.getElementById('startBtn');
        this.pauseBtn = document.getElementById('pauseBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.skipBtn = document.getElementById('skipBtn');
        this.completedCountDisplay = document.getElementById('completedCount');
        this.workDurationInput = document.getElementById('workDuration');
        this.shortBreakInput = document.getElementById('shortBreak');
        this.longBreakInput = document.getElementById('longBreak');
        this.progressCircle = document.querySelector('.progress-ring-circle');
        this.timerContent = document.querySelector('.timer-content');
        this.themeToggle = document.getElementById('themeToggle');
        
        // Initialize progress circle
        this.circumference = 2 * Math.PI * 130;
        this.progressCircle.style.strokeDasharray = `${this.circumference} ${this.circumference}`;
        this.progressCircle.style.strokeDashoffset = this.circumference;
        
        // Load saved theme
        this.loadTheme();
    }

    attachEventListeners() {
        this.startBtn.addEventListener('click', () => this.start());
        this.pauseBtn.addEventListener('click', () => this.pause());
        this.resetBtn.addEventListener('click', () => this.reset());
        this.skipBtn.addEventListener('click', () => this.skip());
        this.themeToggle.addEventListener('click', () => this.toggleTheme());

        this.workDurationInput.addEventListener('change', (e) => {
            this.workDuration = e.target.value * 60;
            if (!this.isRunning && this.isWorkSession) {
                this.timeRemaining = this.workDuration;
                this.updateDisplay();
            }
        });

        this.shortBreakInput.addEventListener('change', (e) => {
            this.shortBreakDuration = e.target.value * 60;
        });

        this.longBreakInput.addEventListener('change', (e) => {
            this.longBreakDuration = e.target.value * 60;
        });
    }

    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.startBtn.disabled = true;
            this.pauseBtn.disabled = false;
            this.timerDisplay.classList.add('running');
            this.setProgressColor(this.isWorkSession ? '#60a5fa' : '#10b981');
            
            this.intervalId = setInterval(() => {
                this.timeRemaining--;
                this.updateDisplay();

                if (this.timeRemaining <= 0) {
                    this.timerComplete();
                }
            }, 1000);
        }
    }

    pause() {
        this.isRunning = false;
        this.startBtn.disabled = false;
        this.pauseBtn.disabled = true;
        this.timerDisplay.classList.remove('running');
        clearInterval(this.intervalId);
    }

    reset() {
        this.pause();
        this.timeRemaining = this.isWorkSession ? this.workDuration : this.getBreakDuration();
        this.updateDisplay();
    }

    skip() {
        this.pause();
        this.switchSession();
    }

    timerComplete() {
        this.pause();
        
        if (this.isWorkSession) {
            this.completedPomodoros++;
            this.updateCompletedCount();
            this.showNotification('Work session complete! Time for a break.');
        } else {
            this.showNotification('Break complete! Ready for work?');
        }

        this.switchSession();
    }

    switchSession() {
        this.isWorkSession = !this.isWorkSession;
        this.totalTime = this.isWorkSession ? this.workDuration : this.getBreakDuration();
        this.timeRemaining = this.totalTime;
        this.setProgressColor(this.isWorkSession ? '#60a5fa' : '#10b981');
        this.updateDisplay();
    }

    getBreakDuration() {
        return this.completedPomodoros % 4 === 0 && this.completedPomodoros !== 0
            ? this.longBreakDuration
            : this.shortBreakDuration;
    }

    updateDisplay() {
        const minutes = Math.floor(this.timeRemaining / 60);
        const seconds = this.timeRemaining % 60;
        this.timerDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        
        const sessionType = this.isWorkSession ? 'Work Session' : 'Break Time';
        this.sessionTypeDisplay.textContent = sessionType;
        
        document.title = `${this.timerDisplay.textContent} - ${sessionType}`;
        
        // Update circular progress
        this.updateProgress();
    }

    updateProgress() {
        const progress = this.timeRemaining / this.totalTime;
        const offset = this.circumference - (progress * this.circumference);
        this.progressCircle.style.strokeDashoffset = offset;
    }

    setProgressColor(color) {
        this.progressCircle.style.stroke = color;
        this.timerDisplay.style.color = color;
        this.progressCircle.style.filter = color === '#60a5fa' 
            ? 'drop-shadow(0 0 15px rgba(96, 165, 250, 0.6))'
            : 'drop-shadow(0 0 15px rgba(16, 185, 129, 0.6))';
    }

    updateCompletedCount() {
        this.completedCountDisplay.textContent = this.completedPomodoros;
    }

    showNotification(message) {
        this.playSound();
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Pomodoro Timer', { 
                body: message,
                icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%2360a5fa"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>'
            });
        } else {
            this.showToast(message);
        }
    }

    playSound() {
        // Create a simple beep sound using Web Audio API
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(this.isWorkSession ? 800 : 600, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
    }

    showToast(message) {
        // Create toast notification if browser notifications aren't available
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(16, 185, 129, 0.9);
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            font-weight: 500;
            z-index: 1000;
            animation: slideUpToast 0.3s ease-out;
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideDownToast 0.3s ease-out';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    toggleTheme() {
        const body = document.body;
        const isLightTheme = body.classList.toggle('light-theme');
        
        // Save theme preference
        localStorage.setItem('theme', isLightTheme ? 'light' : 'dark');
        
        // Update progress circle colors for current theme
        if (this.isRunning) {
            this.setProgressColor(this.isWorkSession ? '#3b82f6' : '#10b981');
        } else {
            this.setProgressColor(this.isWorkSession ? '#60a5fa' : '#10b981');
        }
    }

    loadTheme() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'light') {
            document.body.classList.add('light-theme');
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const timer = new PomodoroTimer();

    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
});
