import React, { useCallback, useEffect, useState } from "react";
import config from "./config";
import { styles } from "./styles";

const App: React.FC = () => {
  const [pcNames, setPCNames] = useState<string[]>([]);
  const [statuses, setStatuses] = useState<{
    [key: string]: boolean | undefined;
  }>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [pcLoading, setPCLoading] = useState<{ [key: string]: boolean }>({});

  const fetchStatus = useCallback(async (pcName: string) => {
    // Mark this PC as loading
    setPCLoading((prev) => ({ ...prev, [pcName]: true }));
    try {
      const response = await fetch(
        `${config.API_BASE_URL}/status?name=${pcName}`,
      );
      const data = await response.json();
      setStatuses((prevStatuses) => ({
        ...prevStatuses,
        [pcName]: data.online,
      }));
    } catch (error) {
      console.error(`Failed to fetch status for ${pcName}:`, error);
    } finally {
      // Unmark this PC as loading
      setPCLoading((prev) => ({ ...prev, [pcName]: false }));
    }
  }, []);

  const refreshStatuses = useCallback(async () => {
    setLoading(true); // This could be a global refresh indicator, if desired
    await Promise.all(pcNames.map((name) => fetchStatus(name)));
    setLoading(false);
  }, [fetchStatus, pcNames]);

  // Send a wake-on-LAN request for a specific PC
  const wakePC = async (pcName: string) => {
    try {
      setNotification(`Sending Wake-on-LAN packet to ${pcName}...`);
      const response = await fetch(
        `${config.API_BASE_URL}/wake?name=${pcName}`,
      );
      const data = await response.json();
      showNotification(data.message);

      // Automatically refresh the status after waking
      setNotification(`Refreshing status for ${pcName}...`);
      await fetchStatus(pcName);
    } catch (error) {
      console.error(`Failed to wake ${pcName}'s PC:`, error);
      showNotification(`Failed to wake ${pcName}'s PC.`);
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
        const names = await response.json();
        setPCNames(names);
        // Initialize statuses for all PC names
        const initialStatuses = names.reduce(
          (acc: { [key: string]: boolean | undefined }, name: string) => {
            acc[name] = undefined;
            return acc;
          },
          {},
        );
        setStatuses(initialStatuses);
      } catch (error) {
        console.error("Failed to fetch PC names:", error);
      }
    };

    fetchPCNames();
  }, []);

  // Once pcNames are loaded, refresh the statuses
  useEffect(() => {
    if (pcNames.length > 0) {
      refreshStatuses();
    }
  }, [pcNames, refreshStatuses]);

  const _styles = styles(notification);

  return (
    <div style={_styles.container}>
      <h1 style={_styles.header}>Wake-on-LAN</h1>
      <div>
        {pcNames.map((pcName) => (
          <div key={pcName} style={_styles.pcStatus}>
            <strong>{pcName}&apos;s PC:</strong>{" "}
            <span style={statuses[pcName] ? _styles.online : _styles.offline}>
              {statuses[pcName] === undefined
                ? "Loading..."
                : statuses[pcName]
                  ? "Online"
                  : "Offline"}
            </span>
            <button
              style={_styles.button}
              onClick={() => wakePC(pcName)}
              disabled={pcLoading[pcName]} // Disable only if this PC is processing
            >
              {pcLoading[pcName] ? "Processing..." : `Wake ${pcName}'s PC`}
            </button>
          </div>
        ))}
      </div>
      <button
        style={{ ..._styles.button, ..._styles.refreshButton }}
        onClick={refreshStatuses}
        disabled={loading} // Global refresh loading state, if desired
      >
        {loading ? "Refreshing..." : "Refresh Status"}
      </button>
      <div style={_styles.notification}>{notification}</div>
    </div>
  );
};

export default App;
