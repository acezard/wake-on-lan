import React, { useCallback, useEffect, useState } from 'react';
import config from './config';

const App: React.FC = () => {
    const [statuses, setStatuses] = useState<{ [key: string]: boolean | undefined }>({});
    const [loading, setLoading] = useState<boolean>(false);
    const [notification, setNotification] = useState<string | null>(null);

    // Fetch status of a specific PC
    const fetchStatus = useCallback(async (pcName: string) => {
        try {
            const response = await fetch(`${config.API_BASE_URL}/status?name=${pcName}`);
            const data = await response.json();
            setStatuses((prevStatuses) => ({
                ...prevStatuses,
                [pcName]: data.online,
            }));
        } catch (error) {
            console.error(`Failed to fetch status for ${pcName}:`, error);
        }
    }, []);

    // Refresh statuses for all PCs
    const refreshStatuses = useCallback(async () => {
        setLoading(true);
        await Promise.all(Object.keys(statuses).map(fetchStatus));
        setLoading(false);
    }, [fetchStatus, statuses]);

    // Send a wake-on-LAN request for a specific PC
    const wakePC = async (pcName: string) => {
        try {
            setNotification(`Sending Wake-on-LAN packet to ${pcName}...`);
            const response = await fetch(`${config.API_BASE_URL}/wake?name=${pcName}`);
            const data = await response.json();
            showNotification(data.message);

            // Automatically refresh the status after waking
            setNotification(`Refreshing status for ${pcName}...`);
            await fetchStatus(pcName);
        } catch (error) {
            console.error(`Failed to wake and unlock ${pcName}'s PC:`, error);
            showNotification(`Failed to wake and unlock ${pcName}'s PC.`);
        }
    };

    // Show a notification
    const showNotification = (message: string) => {
        setNotification(message);
        setTimeout(() => setNotification(null), 3000);
    };

    // Fetch the list of PCs on load
    useEffect(() => {
        const fetchPCNames = async () => {
            try {
                const response = await fetch(`${config.API_BASE_URL}/pcs`);
                const pcNames = await response.json();
                const initialStatuses = pcNames.reduce((acc: any, name: string) => {
                    acc[name] = undefined; // Initialize statuses as undefined
                    return acc;
                }, {});
                setStatuses(initialStatuses);
            } catch (error) {
                console.error('Failed to fetch PC names:', error);
            }
        };

        fetchPCNames(); // Initial fetch
    }, []);

    // Periodically refresh statuses
    useEffect(() => {
        const interval = setInterval(refreshStatuses, 30000);
        return () => clearInterval(interval); // Cleanup on unmount
    }, [refreshStatuses]);

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
                {Object.keys(statuses).map((pcName) => (
                    <div key={pcName} style={styles.pcStatus}>
                        <strong>{pcName}'s PC:</strong>{' '}
                        <span style={statuses[pcName] ? styles.online : styles.offline}>
                            {statuses[pcName] === undefined ? 'Loading...' : statuses[pcName] ? 'Online' : 'Offline'}
                        </span>
                        <button
                            style={styles.button}
                            onClick={() => wakePC(pcName)}
                            disabled={loading} // Disable button while loading
                        >
                            {loading ? 'Processing...' : `Wake ${pcName}'s PC`}
                        </button>
                    </div>
                ))}
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
