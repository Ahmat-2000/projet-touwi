import React, { useState, useRef, useEffect } from 'react';

const CustomVideoPlayer = ({ videoRef, videoUrl, isPlaying, setIsPlaying, cropPoints }) => {

    const [progress, setProgress] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [displayProgressBar, setDisplayProgressBar] = useState(false);
    const progressBarRef = useRef(null);
    const playerRef = useRef(null);

    const formatTime = (seconds) => {
        if (!seconds) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    useEffect(() => {
        const video = videoRef.current;

        const handleTimeUpdate = () => {
            const progress = (video.currentTime / video.duration) * 100;
            setProgress(progress);
        };

        if (cropPoints.start !== null && cropPoints.end !== null) {
            reduceVideo(cropPoints.start, cropPoints.end);
        }
        else {
            console.log("No crop in CustomVideoPlayer", cropPoints);
        }

        const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);

        video.addEventListener('timeupdate', handleTimeUpdate);
        document.addEventListener('fullscreenchange', handleFullscreenChange);

        return () => {
            video.removeEventListener('timeupdate', handleTimeUpdate);
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    }, []);

    useEffect(() => {
        const video = videoRef.current;

        const handlePlay = () => setIsPlaying(true);
        const handlePause = () => setIsPlaying(false);

        video.addEventListener('play', handlePlay);
        video.addEventListener('pause', handlePause);

        return () => {
            video.removeEventListener('play', handlePlay);
            video.removeEventListener('pause', handlePause);
        };
    }, [setIsPlaying]);

    const handleProgressBarClick = (e) => {
        const progressBar = progressBarRef.current;
        const rect = progressBar.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / progressBar.offsetWidth;
        videoRef.current.currentTime = pos * videoRef.current.duration;
    };

    const togglePlayPause = () => {
        const video = videoRef.current;
        if (isPlaying) {
            video.pause();
        } else {
            video.play();
        }
    };

    const toggleMute = () => {
        videoRef.current.muted = !videoRef.current.muted;
        setIsMuted(!isMuted);
    };

    const toggleFullScreen = () => {
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            playerRef.current.requestFullscreen();
        }
    };

    const togglePiP = async () => {
        try {
            if (document.pictureInPictureElement) {
                await document.exitPictureInPicture();
            } else {
                await videoRef.current.requestPictureInPicture();
            }
        } catch (error) {
            console.error("PiP failed:", error);
        }
    };

    function reduceVideo(croppedStart, croppedEnd){

        if (croppedStart === null || croppedEnd === null) {
            alert("Cropping failed, please restart the app");
            return;
        }

        const video = videoRef.current;


        const handleTimeUpdate = () => {
            if (video.currentTime <= croppedStart) {
                video.currentTime = croppedStart;
            }
            else if (video.currentTime >= croppedEnd) {
                video.pause();
                //wait 100ms
                setTimeout(() => {
                    video.currentTime = croppedStart;
                }, 50);
            }
        };



        video.addEventListener('timeupdate', handleTimeUpdate);

        return () => {
            video.removeEventListener('timeupdate', handleTimeUpdate);
        };
        
    }

    return (
        <div
            className="relative w-full bg-black rounded-xl overflow-hidden"
            ref={playerRef}
            onMouseEnter={() => setDisplayProgressBar(true)}
            onMouseLeave={() => setDisplayProgressBar(false)}
        >
            <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                <video
                    ref={videoRef}
                    className="absolute top-0 left-0 w-full h-full object-contain"
                >
                    {videoUrl && <source src={videoUrl} type="video/webm" />}
                    Your browser does not support the video tag.
                </video>
            </div>

            <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2.5 transition-opacity duration-300 ${displayProgressBar ? 'opacity-100' : 'opacity-0'}`}>
                <div className="relative w-full mb-2.5">
                    <div
                        className="w-full h-2.5 bg-white/30 cursor-pointer rounded"
                        ref={progressBarRef}
                        onClick={handleProgressBarClick}
                    >
                        <div
                            className="h-full bg-[#297DCB] rounded transition-all duration-100"
                            style={{ width: `${progress}%` }}
                        />
                        {/* Crop indicators */}
                        {cropPoints.start !== null && (
                            <div 
                                className="absolute top-0 h-full w-0.5 bg-green-500"
                                style={{ 
                                    left: `${(cropPoints.start / videoRef.current?.duration) * 100}%`,
                                    transform: 'translateX(-50%)'
                                }}
                            >
                                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 text-xs text-green-500">
                                    Start
                                </div>
                            </div>
                        )}
                        {cropPoints.end !== null && (
                            <div 
                                className="absolute top-0 h-full w-0.5 bg-red-500"
                                style={{ 
                                    left: `${(cropPoints.end / videoRef.current?.duration) * 100}%`,
                                    transform: 'translateX(-50%)'
                                }}
                            >
                                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 text-xs text-red-500">
                                    End
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="absolute -top-6 left-0 right-0 flex justify-between text-white text-sm">
                        <span>{formatTime(videoRef.current?.currentTime || 0)}</span>
                        <span>{formatTime(videoRef.current?.duration || 0)}</span>
                    </div>
                </div>

                <div className="flex justify-between items-center">
                    <div className="flex gap-2.5">
                        <button onClick={togglePlayPause} className="text-white p-1.5 rounded-full hover:bg-white/20 transition-colors w-8 h-8 flex items-center justify-center">
                            <i className={`fas fa-${isPlaying ? 'pause' : 'play'}`} />
                        </button>
                    </div>

                    <div className="flex gap-2.5">
                        <button onClick={toggleMute} className="text-white p-1.5 rounded-full hover:bg-white/20 transition-colors w-8 h-8 flex items-center justify-center">
                            <i className={`fas fa-volume-${isMuted ? 'mute' : 'up'}`} />
                        </button>

                        <button onClick={() => setDisplayProgressBar(!displayProgressBar)} className="text-white p-1.5 rounded-full hover:bg-white/20 transition-colors w-8 h-8 flex items-center justify-center">
                            <i className="fas fa-external-link-alt" />
                        </button>

                        <button onClick={togglePiP} className="text-white p-1.5 rounded-full hover:bg-white/20 transition-colors w-8 h-8 flex items-center justify-center">
                            <i className="fas fa-external-link-alt" />
                        </button>

                        <button onClick={toggleFullScreen} className="text-white p-1.5 rounded-full hover:bg-white/20 transition-colors w-8 h-8 flex items-center justify-center">
                            <i className={`fas fa-${isFullscreen ? 'compress' : 'expand'}`} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomVideoPlayer;