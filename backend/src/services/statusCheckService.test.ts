import { isPCOnline } from "./statusCheckService";
import { exec, ExecException } from "child_process";

jest.mock("child_process", () => ({
  exec: jest.fn(),
}));

jest.mock("./statusCheckService", () => {
  const original = jest.requireActual("./statusCheckService");
  return {
    ...original,
    getLocalAddress: () => undefined,
  };
});

const mockExec = exec as jest.MockedFunction<typeof exec>;

describe("isPCOnline (ARP)", () => {
  const ip = "192.168.1.666";
  const iface = "wlan0";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Helper to simulate exec callback for both two-arg and three-arg invocations.
   */
  function simulateExec(
    err: ExecException | null,
    stdout: string,
    stderr: string
  ) {
    mockExec.mockImplementation(
      (
        cmd: string,
        optionsOrCb?: unknown,
        cb?: unknown
      ) => {
        // Determine which argument is the callback
        const callback = typeof optionsOrCb === "function"
          ? optionsOrCb as ((
              error: ExecException | null,
              stdout: string,
              stderr: string
            ) => void)
          : cb as ((
              error: ExecException | null,
              stdout: string,
              stderr: string
            ) => void);

        // Invoke callback with simulated results
        callback(err, stdout, stderr);

        // Return dummy ChildProcess
        return {
          pid: 1,
          stdin: null,
          stdout: null,
          stderr: null,
          stdio: [],
          kill() {},
          send() { return false; },
          disconnect() {},
          unref() {},
          ref() {}
        } as unknown as import("child_process").ChildProcess;
      }
    );
  }

  it("should resolve true when arping replies", async () => {
    simulateExec(
      null,
      "1 packets transmitted, 1 received, 0% packet loss\nbytes from 74:56:3c:e6:f9:c2 (\"192.168.1.666\"): index=0 time=4.593 ms",
      ""
    );

    await expect(isPCOnline(ip, iface, 3000)).resolves.toBe(true);
    expect(mockExec).toHaveBeenCalled();
  });

  it("should resolve false when arping returns an error", async () => {
    simulateExec(new Error("exec error"), "", "error output");

    await expect(isPCOnline(ip, iface, 3000)).resolves.toBe(false);
    expect(mockExec).toHaveBeenCalled();
  });

  it("should resolve false when no ARP reply in stdout", async () => {
    simulateExec(null, "0 packets transmitted, 0 received, 100% packet loss", "");

    await expect(isPCOnline(ip, iface, 3000)).resolves.toBe(false);
    expect(mockExec).toHaveBeenCalled();
  });
});
