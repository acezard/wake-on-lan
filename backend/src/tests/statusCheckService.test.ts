import { isPCOnline } from "../services/statusCheckService";
import net from "net";

jest.mock("net");

describe("isPCOnline", () => {
  const mockSocket = {
    setTimeout: jest.fn(),
    once: jest.fn(),
    destroy: jest.fn(),
    connect: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (net.Socket as jest.Mock).mockImplementation(() => mockSocket);
  });

  it("should resolve true when connection is successful", async () => {
    const ip = "192.168.1.1";
    const netInterface = "eth0";
    const port = 3389;

    const promise = isPCOnline(ip, netInterface, port);

    mockSocket.once.mock.calls[0][1](); // Simulate 'connect' event

    const result = await promise;
    expect(result).toBe(true);
    expect(mockSocket.setTimeout).toHaveBeenCalledWith(5000);
    expect(mockSocket.connect).toHaveBeenCalledWith({ port, host: ip });
  });

  it("should resolve false when connection times out", async () => {
    const ip = "192.168.1.1";
    const netInterface = "eth0";
    const port = 3389;

    const promise = isPCOnline(ip, netInterface, port);

    mockSocket.once.mock.calls[1][1](); // Simulate 'timeout' event

    const result = await promise;
    expect(result).toBe(false);
    expect(mockSocket.setTimeout).toHaveBeenCalledWith(5000);
    expect(mockSocket.connect).toHaveBeenCalledWith({ port, host: ip });
  });

  it("should resolve false when connection fails", async () => {
    const ip = "192.168.1.1";
    const netInterface = "eth0";
    const port = 3389;

    const promise = isPCOnline(ip, netInterface, port);

    mockSocket.once.mock.calls[2][1](new Error("Connection error")); // Simulate 'error' event

    const result = await promise;
    expect(result).toBe(false);
    expect(mockSocket.setTimeout).toHaveBeenCalledWith(5000);
    expect(mockSocket.connect).toHaveBeenCalledWith({ port, host: ip });
  });
});
