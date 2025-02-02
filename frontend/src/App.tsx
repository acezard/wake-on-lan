import React, { useCallback, useEffect, useState } from "react";
import config from "./config";
import { styles } from "./styles";
import logger from "./utils/logger";

const App: React.FC = () => {
  const [pcNames, setPCNames] = useState<string[]>([]);
  const [statuses, setStatuses] = useState<{ [key: string]: boolean | undefined }>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [pcLoading, setPCLoading] = useState<{ [key: string]: boolean }>({});

  const fetchStatus = useCallback(async (pcName: string) => {
    setPCLoading((prev) => ({ ...prev, [pcName]: true })); // Mark this PC as loading
    try {
      logger.info(`Fetching status for ${pcName}...`);
      const response = await fetch(`${config.API_BASE_URL}/status?name=${pcName}`);
      
      if (!response.ok) {
        throw new Error(`Server responded with status ${response.status}`);
      }

      const data = await response.json();
      setStatuses((prevStatuses) => ({
        ...prevStatuses,
        [pcName]: data.online,
      }));
      logger.info(`Status for ${pcName}: ${data.online ? "ONLINE" : "OFFLINE"}`);
    } catch (error) {
      logger.error(`Failed to fetch status for ${pcName}`, { error });
      showNotification(`Error: Failed to fetch status for ${pcName}`);
    } finally {
      setPCLoading((prev) => ({ ...prev, [pcName]: false })); // Unmark this PC as loading
    }
  }, []);

  const refreshStatuses = useCallback(async () => {
    setLoading(true);
    logger.info("Refreshing all PC statuses...");
    await Promise.all(pcNames.map((name) => fetchStatus(name)));
    setLoading(false);
  }, [fetchStatus, pcNames]);

  const wakePC = async (pcName: string) => {
    try {
      logger.info(`Sending Wake-on-LAN request for ${pcName}...`);
      setNotification(`Sending Wake-on-LAN packet to ${pcName}...`);

      const response = await fetch(`${config.API_BASE_URL}/wake?name=${pcName}`);
      
      if (!response.ok) {
        throw new Error(`Server responded with status ${response.status}`);
      }

      const data = await response.json();
      showNotification(data.message);
      logger.info(`Wake-on-LAN successful for ${pcName}`);

      setNotification(`Refreshing status for ${pcName}...`);
      await fetchStatus(pcName);
    } catch (error) {
      logger.error(`Failed to wake ${pcName}`, { error });
      showNotification(`Failed to wake ${pcName}.`);
    }
  };

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  useEffect(() => {
    const fetchPCNames = async () => {
      try {
        logger.info("Fetching PC names...");
        logger.debug("test")
        const response = await fetch(`${config.API_BASE_URL}/pcs`);
        
        if (!response.ok) {
          throw new Error(`Server responded with status ${response.status}`);
        }

        const names = await response.json();
        setPCNames(names);
        logger.info(`Received PC names: ${names.join(", ")}`);

        const initialStatuses = names.reduce(
          (acc: { [key: string]: boolean | undefined }, name: string) => {
            acc[name] = undefined;
            return acc;
          }, {});
        setStatuses(initialStatuses);
      } catch (error) {
        logger.error("Failed to fetch PC names", { error });
        showNotification("Error: Could not fetch PC names.");
      }
    };

    fetchPCNames();
  }, []);

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
              {statuses[pcName] === undefined ? "Loading..." : statuses[pcName] ? "Online" : "Offline"}
            </span>
            <button
              style={_styles.button}
              onClick={() => wakePC(pcName)}
              disabled={pcLoading[pcName]}
            >
              {pcLoading[pcName] ? "Processing..." : `Wake ${pcName}'s PC`}
            </button>
          </div>
        ))}
      </div>
      <button
        style={{ ..._styles.button, ..._styles.refreshButton }}
        onClick={refreshStatuses}
        disabled={loading}
      >
        {loading ? "Refreshing..." : "Refresh Status"}
      </button>
      <div style={_styles.notification}>{notification}</div>
    </div>
  );
};

export default App;
