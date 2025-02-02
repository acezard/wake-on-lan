export const styles = (notification: string | null) => ({
  container: {
    textAlign: "center" as const,
    marginTop: "50px",
    fontFamily: "Arial, sans-serif",
  },
  header: {
    fontSize: "32px",
    color: "#333",
  },
  pcStatus: {
    fontSize: "18px",
    margin: "10px 0",
  },
  online: {
    color: "green",
  },
  offline: {
    color: "red",
  },
  buttonContainer: {
    marginTop: "20px",
  },
  button: {
    margin: "10px",
    padding: "10px 20px",
    fontSize: "16px",
    border: "1px solid #ccc",
    borderRadius: "5px",
    cursor: "pointer",
  },
  refreshButton: {
    marginTop: "20px",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
  },
  notification: {
    margin: "20px auto",
    padding: "10px 20px",
    maxWidth: "400px",
    backgroundColor: "#f8f9fa",
    border: "1px solid #ccc",
    borderRadius: "5px",
    fontSize: "14px",
    color: "#333",
    boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
    opacity: notification ? 1 : 0,
    transition: "opacity 0.3s ease-in-out",
  },
});
