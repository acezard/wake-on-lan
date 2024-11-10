import React, { useEffect, useState } from 'react';

const App: React.FC = () => {
    const [statuses, setStatuses] = useState<{ [key: string]: boolean }>({});
    const [loading, setLoading] = useState<boolean>(false);
    const [notification, setNotification] = useState<string | null>(null);

    const fetchStatus = async (pcName: string) => {
        try {
            const response = await fetch(`http://localhost:8080/status?name=${pcName}`);
            const data = await response.json();
            setStatuses((prevStatuses) => ({
                ...prevStatuses,
                [pcName]: data.online,
            }));
        } catch (error) {
            console.error(`Failed to fetch status for ${pcName}:`, error);
        }
    };

    const refreshStatuses = async () => {
        setLoading(true);
        await Promise.all(['antonin', 'anthony'].map(fetchStatus));
        setLoading(false);
    };

    const wakePC = async (pcName: string) => {
        try {
            const response = await fetch(`http://localhost:8080/wake?name=${pcName}`);
            const data = await response.json();
            showNotification(data.message); // Use notification instead of alert
        } catch (error) {
            showNotification(`Failed to wake ${pcName}'s PC.`);
        }
    };

    const showNotification = (message: string) => {
        setNotification(message);
        setTimeout(() => setNotification(null), 3000); // Clear after 3 seconds
    };

    useEffect(() => {
        refreshStatuses(); // Initial fetch on load
        const interval = setInterval(refreshStatuses, 30000); // Refresh every 30 seconds
        return () => clearInterval(interval); // Cleanup on unmount
    }, []);

    // Inline styles for simplicity
    const styles = {
        container: {
            textAlign: 'center' as const,
            marginTop: '50px',
            fontFamily: 'Arial, sans-serif',
        },
        header: {
            fontSize: '32px',
            color: '#333',
        },
        pcStatus: {
            fontSize: '18px',
            margin: '10px 0',
        },
        online: {
            color: 'green',
        },
        offline: {
            color: 'red',
        },
        buttonContainer: {
            marginTop: '20px',
        },
        button: {
            margin: '10px',
            padding: '10px 20px',
            fontSize: '16px',
            border: '1px solid #ccc',
            borderRadius: '5px',
            cursor: 'pointer',
        },
        refreshButton: {
            marginTop: '20px',
            backgroundColor: '#007bff',
            color: '#fff',
            border: 'none',
        },
        notification: {
            margin: '20px auto',
            padding: '10px 20px',
            maxWidth: '400px',
            backgroundColor: '#f8f9fa',
            border: '1px solid #ccc',
            borderRadius: '5px',
            fontSize: '14px',
            color: '#333',
            boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
            opacity: notification ? 1 : 0,
            transition: 'opacity 0.3s ease-in-out',
        },
    };

    return (
        <div style={styles.container}>
            <h1 style={styles.header}>Wake-on-LAN</h1>
            <div>
                <div style={styles.pcStatus}>
                    <strong>Antonin's PC:</strong>{' '}
                    <span style={statuses.antonin ? styles.online : styles.offline}>
                        {statuses.antonin === undefined ? 'Loading...' : statuses.antonin ? 'Online' : 'Offline'}
                    </span>
                </div>
                <div style={styles.pcStatus}>
                    <strong>Anthony's PC:</strong>{' '}
                    <span style={statuses.anthony ? styles.online : styles.offline}>
                        {statuses.anthony === undefined ? 'Loading...' : statuses.anthony ? 'Online' : 'Offline'}
                    </span>
                </div>
            </div>
            <div style={styles.buttonContainer}>
                <button style={styles.button} onClick={() => wakePC('antonin')}>
                    Wake Antonin's PC
                </button>
                <button style={styles.button} onClick={() => wakePC('anthony')}>
                    Wake Anthony's PC
                </button>
            </div>
            <button
                style={{ ...styles.button, ...styles.refreshButton }}
                onClick={refreshStatuses}
                disabled={loading}
            >
                {loading ? 'Refreshing...' : 'Refresh Status'}
            </button>
            {notification && <div style={styles.notification}>{notification}</div>}
        </div>
    );
};

export default App;
