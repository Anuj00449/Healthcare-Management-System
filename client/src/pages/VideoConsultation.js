
import React, { useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function VideoConsultation() {
  const { roomId } = useParams();
  const navigate = useNavigate();

  const meetingUrl = useMemo(() => {
    if (!roomId) return '';
    return `https://meet.jit.si/${roomId}`;
  }, [roomId]);

  useEffect(() => {
    if (!roomId) return;
    window.open(meetingUrl, '_blank', 'noopener,noreferrer');
  }, [roomId, meetingUrl]);

  return (
    <div className="container">
      <div className="card" style={{ textAlign: 'center' }}>
        <h2>Video Consultation</h2>
        <p>Your meeting room is ready.</p>

        {roomId ? (
          <>
            <p><strong>Room ID:</strong> {roomId}</p>

            <a
              href={meetingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn"
              style={{ marginTop: '12px' }}
            >
              Open Video Call
            </a>
          </>
        ) : (
          <p>Invalid room.</p>
        )}

        <button
          className="btn secondary"
          style={{ marginTop: '12px' }}
          onClick={() => navigate(-1)}
        >
          Go Back
        </button>
      </div>
    </div>
  );
}